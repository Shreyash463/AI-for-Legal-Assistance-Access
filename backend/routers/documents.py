from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException

from backend.models.schemas import (
    DocumentAnalysisResponse, QAQueryRequest, QAResponse, AnalyzeTextRequest
)
from backend.services.parser import validate_file, extract_text_from_pdf, sanitize_text
from backend.services.guardrails import check_legal_advice_query
from backend.services.gemini_service import (
    analyze_document_with_gemini, answer_document_question, DOCUMENT_STORE
)

router = APIRouter(prefix="/api/documents", tags=["Documents"])

SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "samples"


@router.post("/upload", response_model=DocumentAnalysisResponse)
async def upload_document(
    file: UploadFile = File(...),
    reading_level: str = Form("standard"),
    x_gemini_api_key: Optional[str] = Header(None)
):
    """
    Upload a legal document (PDF or TXT/MD), extract and sanitize text,
    and generate traceable plain-English simplification, risk radar, and action checklist.
    """
    content = await file.read()
    validate_file(file.filename, len(content))

    if file.filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(content)
    else:
        try:
            raw_text = sanitize_text(content.decode("utf-8"))
        except UnicodeDecodeError:
            raw_text = sanitize_text(content.decode("latin-1", errors="ignore"))

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="The uploaded file contains no readable text.")

    analysis = await analyze_document_with_gemini(
        raw_text=raw_text,
        filename=file.filename,
        reading_level=reading_level,
        api_key=x_gemini_api_key
    )
    return analysis


@router.post("/analyze-text", response_model=DocumentAnalysisResponse)
async def analyze_pasted_text(
    payload: AnalyzeTextRequest,
    x_gemini_api_key: Optional[str] = Header(None)
):
    """Analyze directly pasted legal contract text."""
    clean_text = sanitize_text(payload.text)
    if len(clean_text) < 20:
        raise HTTPException(status_code=400, detail="Text is too short to analyze as a legal document.")

    effective_key = payload.api_key or x_gemini_api_key
    analysis = await analyze_document_with_gemini(
        raw_text=clean_text,
        filename=payload.filename or "Pasted_Contract.txt",
        reading_level=payload.reading_level or "standard",
        api_key=effective_key
    )
    return analysis


@router.get("/samples")
async def get_sample_documents():
    """Retrieve bundled sample legal documents for instant 1-click evaluation."""
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


@router.post("/qa", response_model=QAResponse)
async def ask_question(
    payload: QAQueryRequest,
    x_gemini_api_key: Optional[str] = Header(None)
):
    """
    Document Q&A: Strictly grounded answers citing specific clauses.
    Detects and safely redirects direct legal advice requests.
    """
    clean_q = payload.question.strip()
    if not clean_q:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

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

    # Fetch document text
    doc_text = payload.document_text or ""
    if payload.document_id and payload.document_id in DOCUMENT_STORE:
        doc_text = DOCUMENT_STORE[payload.document_id].raw_text

    if not doc_text:
        raise HTTPException(
            status_code=400,
            detail="No document content provided or session has expired. Please provide document text."
        )

    effective_key = payload.api_key or x_gemini_api_key
    response = await answer_document_question(
        question=clean_q,
        document_text=doc_text,
        api_key=effective_key
    )
    return response


@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """
    Permanently purge document from ephemeral in-memory session.
    Fulfills privacy and data retention policy.
    """
    if doc_id in DOCUMENT_STORE:
        del DOCUMENT_STORE[doc_id]
        return {"status": "success", "message": f"Document {doc_id} permanently erased from session."}
    return {"status": "not_found", "message": "Document not in active session store."}
