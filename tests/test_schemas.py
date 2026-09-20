import pytest
from pydantic import ValidationError
from backend.models.schemas import SimplifiedSection, RiskItem, ActionChecklist, DocumentMetadata

def test_simplified_section_valid():
    sec = SimplifiedSection(
        id="sec-1",
        title="Termination Clause",
        original_text="Either party may terminate...",
        plain_english="You can cancel anytime with notice.",
        category="Termination",
        key_takeaways=["Notice required"]
    )
    assert sec.id == "sec-1"
    assert sec.category == "Termination"

def test_risk_item_valid():
    risk = RiskItem(
        id="risk-1",
        clause_name="Auto-Renewal Trap",
        section_id="sec-1",
        severity="HIGH",
        original_quote="Shall renew automatically...",
        why_it_matters="Locks you in for another year without affirmative consent.",
        potential_impact="Financial liability.",
        suggested_action="Strike the clause."
    )
    assert risk.severity == "HIGH"

def test_risk_item_invalid_severity():
    with pytest.raises(ValidationError):
        RiskItem(
            id="risk-1",
            clause_name="Test",
            section_id="sec-1",
            severity="DANGEROUS",  # Invalid severity, must be HIGH, MEDIUM, or LOW
            original_quote="quote",
            why_it_matters="why",
            potential_impact="impact",
            suggested_action="action"
        )

def test_action_checklist_defaults():
    chk = ActionChecklist()
    assert isinstance(chk.questions_for_lawyer, list)
    assert isinstance(chk.red_flags_to_clarify, list)
    assert isinstance(chk.recommended_next_steps, list)
