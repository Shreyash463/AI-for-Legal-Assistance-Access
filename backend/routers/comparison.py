"""
Contract Comparison Router for ClarifyLaw AI.
Provides side-by-side contract diffing, term-by-term analysis,
added/removed clause detection, and preloaded SaaS comparison sample pairs.
"""

from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, Header, HTTPException, status

from backend.models.schemas import CompareRequest, ComparisonResponse
from backend.services.parser import sanitize_text
from backend.services.gemini_service import compare_documents_with_gemini

router = APIRouter(prefix="/api/compare", tags=["Comparison"])

SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "samples"


@router.post(
    "",
    response_model=ComparisonResponse,
    summary="Compare two legal documents side-by-side",
    description="Compares Document A and Document B, evaluating term shifts, risk escalations, and newly introduced/removed clauses."
)
async def compare_documents(
    payload: CompareRequest,
    x_gemini_api_key: Optional[str] = Header(None, description="Optional client Gemini API key")
) -> ComparisonResponse:
    doc_a_clean = sanitize_text(payload.doc_a_text)
    doc_b_clean = sanitize_text(payload.doc_b_text)

    if len(doc_a_clean) < 20 or len(doc_b_clean) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Both documents must contain at least 20 characters of readable contract text.",
                "code": "COMPARISON_TEXT_TOO_SHORT"
            }
        )

    effective_key = payload.api_key or x_gemini_api_key
    result = await compare_documents_with_gemini(
        doc_a_name=payload.doc_a_name or "Document A",
        doc_a_text=doc_a_clean,
        doc_b_name=payload.doc_b_name or "Document B",
        doc_b_text=doc_b_clean,
        api_key=effective_key
    )
    return result


_CACHED_COMPARISON_PAIR: Optional[Dict[str, Any]] = None


@router.get(
    "/samples",
    summary="Get sample contract pair for instant comparison testing",
    description="Returns SaaS v1.0 and revised SaaS v2.0 for 1-click comparison testing."
)
async def get_sample_comparison_pair() -> Dict[str, Any]:
    global _CACHED_COMPARISON_PAIR
    if _CACHED_COMPARISON_PAIR is not None:
        return _CACHED_COMPARISON_PAIR

    v1_file = SAMPLES_DIR / "saas_terms_of_service_v1.txt"
    v2_file = SAMPLES_DIR / "saas_terms_of_service_v2.txt"

    if not v1_file.exists() or not v2_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "Sample comparison contracts not found on server.",
                "code": "SAMPLE_CONTRACTS_NOT_FOUND"
            }
        )

    _CACHED_COMPARISON_PAIR = {
        "doc_a": {
            "name": "CloudStack ToS v1.0 (Standard)",
            "text": v1_file.read_text(encoding="utf-8", errors="ignore")
        },
        "doc_b": {
            "name": "CloudStack ToS v2.0 (Revised - High Risk)",
            "text": v2_file.read_text(encoding="utf-8", errors="ignore")
        }
    }
    return _CACHED_COMPARISON_PAIR
