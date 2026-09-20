import re
from typing import Tuple, Optional
from backend.models.schemas import LEGAL_DISCLAIMER_TEXT

# Regex patterns indicating requests for definitive legal counsel, representation, or litigation advice
LEGAL_ADVICE_PATTERNS = [
    r"\b(should I sue|can I sue|ought I to sue|file a lawsuit against)\b",
    r"\b(will I win|guarantee|chances of winning in court)\b",
    r"\b(represent me|be my lawyer|act as my attorney|legal representation)\b",
    r"\b(how to evade|how to dodge|break this contract without consequences)\b",
    r"\b(is this definitely illegal|is this crime|prosecute them)\b",
    r"\b(tell me what to do legally|give me legal advice)\b",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in LEGAL_ADVICE_PATTERNS]


def check_legal_advice_query(query: str) -> Tuple[bool, Optional[str]]:
    """
    Evaluates whether the user's question is seeking direct legal representation or
    definitive legal advice (e.g. 'should I sue them?') rather than informational analysis.
    Returns (is_advice_query, redirection_response).
    """
    clean_q = query.strip()
    for pattern in COMPILED_PATTERNS:
        if pattern.search(clean_q):
            redirection = (
                "⚠️ **Professional Legal Consultation Recommended**\n\n"
                "ClarifyLaw AI provides informational analysis and document comprehension only. "
                "Determining whether to initiate litigation (e.g., filing a lawsuit), assessing court outcomes, "
                "or crafting litigation strategy requires customized legal counsel from a licensed attorney "
                "in your specific jurisdiction.\n\n"
                "**Recommended Immediate Next Steps:**\n"
                "1. **Consult an Attorney**: Contact your local State Bar Association referral service or legal aid clinic.\n"
                "2. **Preserve Documentation**: Retain all signed agreements, notices, payment receipts, and communications.\n"
                "3. **Use the Action Checklist**: Check our 'Action Checklist' tab for suggested questions to bring directly to your legal consultation."
            )
            return True, redirection

    return False, None
