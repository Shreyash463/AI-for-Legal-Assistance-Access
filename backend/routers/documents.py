"""
Document Processing Router for ClarifyLaw AI.
Handles multi-format document uploads, raw text ingestion, section extraction,
bundled sample document retrieval, grounded Q&A, and ephemeral session deletion.
"""

import asyncio
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, status

from backend.models.schemas import (
    DocumentAnalysisResponse, QAQueryRequest, QAResponse, AnalyzeTextRequest,
    LEGAL_DISCLAIMER_TEXT
)
from backend.services.parser import validate_file, extract_text_from_pdf, sanitize_text
from backend.services.guardrails import check_legal_advice_query
from backend.services.gemini_service import (
    analyze_document_with_gemini, answer_document_question, DOCUMENT_STORE, ANALYSIS_CACHE
)

router = APIRouter(prefix="/api/documents", tags=["Documents"])

SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "samples"


@router.post(
    "/upload",
    response_model=DocumentAnalysisResponse,
    summary="Upload and simplify a legal contract",
    description="Accepts PDF, TXT, or MD documents up to 10MB. Extracts text asynchronously, segments sections with stable IDs, and audits risk clauses."
)
async def upload_document(
    file: UploadFile = File(..., description="Legal document file (.pdf, .txt, .md)"),
    reading_level: str = Form("standard", description="Reading level: standard, executive, or simple"),
    x_gemini_api_key: Optional[str] = Header(None, description="Optional per-request client Gemini API key")
) -> DocumentAnalysisResponse:
    content = await file.read()
    validate_file(file.filename, len(content))

    if file.filename.lower().endswith(".pdf"):
        # Run CPU-bound PDF decompression in a background worker thread to prevent event-loop starvation
        raw_text = await asyncio.to_thread(extract_text_from_pdf, content)
    else:
        try:
            raw_text = sanitize_text(content.decode("utf-8"))
        except UnicodeDecodeError:
            raw_text = sanitize_text(content.decode("latin-1", errors="ignore"))

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "The uploaded file contains no readable text.", "code": "EMPTY_DOCUMENT"}
        )

    analysis = await analyze_document_with_gemini(
        raw_text=raw_text,
        filename=file.filename,
        reading_level=reading_level,
        api_key=x_gemini_api_key
    )
    return analysis


@router.post(
    "/analyze-text",
    response_model=DocumentAnalysisResponse,
    summary="Analyze directly pasted contract text",
    description="Takes raw pasted legal contract text and generates section simplification, risk radar, and action checklist."
)
async def analyze_pasted_text(
    payload: AnalyzeTextRequest,
    x_gemini_api_key: Optional[str] = Header(None, description="Optional per-request client Gemini API key")
) -> DocumentAnalysisResponse:
    clean_text = sanitize_text(payload.text)
    if len(clean_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Contract text must contain at least 20 characters to analyze.",
                "code": "TEXT_TOO_SHORT"
            }
        )

    effective_key = payload.api_key or x_gemini_api_key
    analysis = await analyze_document_with_gemini(
        raw_text=clean_text,
        filename=payload.filename or "Pasted_Contract.txt",
        reading_level=payload.reading_level or "standard",
        api_key=effective_key
    )
    return analysis


@router.get(
    "/samples",
    summary="List preloaded synthetic sample contracts",
    description="Returns preloaded sample legal agreements for immediate 1-click evaluation without hunting for files."
)
async def get_sample_documents() -> Dict[str, Any]:
    samples = []
    if SAMPLES_DIR.exists():
        sample_meta = {
            "residential_lease_agreement.txt": {
                "title": "Residential Lease Agreement",
                "description": "Standard apartment lease containing aggressive auto-renewal, liquidated damages, and one-sided fee shifting.",
                "category": "Real Estate / Tenancy"
            },
            "saas_terms_of_service_v1.txt": {
                "title": "SaaS Terms of Service (v1.0)",
                "description": "Balanced enterprise SaaS terms with mutual liability caps, 30-day notice, and 99.5% uptime SLA.",
                "category": "Software & Commercial"
            },
            "saas_terms_of_service_v2.txt": {
                "title": "SaaS Terms of Service (v2.0 - Revised)",
                "description": "Aggressive revised terms with AI training licenses, $100 liability cap, and arbitration shifts.",
                "category": "Software & Commercial"
            },
            "independent_contractor_agreement.txt": {
                "title": "Independent Contractor & IP Agreement",
                "description": "Consulting agreement with 24-month restrictive non-compete covenant and unilateral IP assignments.",
                "category": "Employment & Freelance"
            }
        }
        for file in sorted(SAMPLES_DIR.glob("*.txt")):
            text = file.read_text(encoding="utf-8", errors="ignore")
            meta = sample_meta.get(file.name, {
                "title": file.stem.replace("_", " ").title(),
                "description": "Sample legal document for testing.",
                "category": "Legal"
            })
            samples.append({
                "id": file.stem,
                "filename": file.name,
                "title": meta["title"],
                "description": meta["description"],
                "category": meta["category"],
                "text": text,
                "word_count": len(text.split())
            })
    return {"samples": samples}


@router.post(
    "/qa",
    response_model=QAResponse,
    summary="Ask a grounded question about the contract",
    description="Grounded question-answering with strict clause citations. Refuses to hallucinate unmentioned facts and redirects direct legal advice requests."
)
async def ask_question(
    payload: QAQueryRequest,
    x_gemini_api_key: Optional[str] = Header(None, description="Optional per-request client Gemini API key")
) -> QAResponse:
    clean_q = payload.question.strip()
    if not clean_q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Question cannot be empty.", "code": "EMPTY_QUESTION"}
        )

    # Guardrail Check: Direct legal advice detection (e.g. 'Should I sue?')
    is_advice, redirection_msg = check_legal_advice_query(clean_q)
    if is_advice:
        return QAResponse(
            answer=redirection_msg or "Consult a licensed attorney for direct legal counsel.",
            grounded_in_document=False,
            cited_sections=[],
            direct_quotes=[],
            confidence="Redirected to Legal Counsel",
            is_advice_redirection=True,
            redirection_message=redirection_msg
        )

    # Resolve document text from payload or session stores
    doc_text = payload.document_text or ""
    if not doc_text and payload.document_id:
        if payload.document_id in DOCUMENT_STORE:
            doc_text = DOCUMENT_STORE[payload.document_id].raw_text
        else:
            # Fallback search across active cache entries
            for cached_analysis in ANALYSIS_CACHE.values():
                if cached_analysis.document_id == payload.document_id:
                    doc_text = cached_analysis.raw_text
                    break

    if not doc_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "No document content provided or session has expired. Please provide document text.",
                "code": "MISSING_DOCUMENT_CONTENT"
            }
        )

    effective_key = payload.api_key or x_gemini_api_key
    response = await answer_document_question(
        question=clean_q,
        document_text=doc_text,
        api_key=effective_key
    )
    return response


@router.delete(
    "/{doc_id}",
    summary="Purge document from ephemeral session store",
    description="Explicitly removes uploaded document from in-memory session. Enforces privacy and zero retention policy."
)
async def delete_document(doc_id: str) -> Dict[str, str]:
    if doc_id in DOCUMENT_STORE:
        del DOCUMENT_STORE[doc_id]
        return {
            "status": "success",
            "message": f"Document {doc_id} permanently erased from session memory.",
            "code": "DOCUMENT_PURGED"
        }
    return {
        "status": "not_found",
        "message": "Document ID not found in active session memory.",
        "code": "DOCUMENT_NOT_FOUND"
    }
