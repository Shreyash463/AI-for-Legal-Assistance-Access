from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# Core Legal Disclaimer constant
LEGAL_DISCLAIMER_TEXT = (
    "LEGAL INFORMATION DISCLAIMER: ClarifyLaw AI is an automated informational and educational tool, "
    "not a law firm, and does not provide legal advice or create an attorney-client relationship. "
    "Always consult a qualified, licensed legal professional before signing or taking action based on any legal document."
)


class SimplifiedSection(BaseModel):
    id: str = Field(..., description="Unique section identifier e.g. sec-1")
    title: str = Field(..., description="Section title or heading")
    original_text: str = Field(..., description="Original clause or paragraph text from document")
    plain_english: str = Field(..., description="Clear plain-English translation of obligations & rights")
    category: str = Field(
        default="General",
        description="Category: Term & Renewal, Payment, Liability, Termination, IP & Rights, Dispute Resolution, etc."
    )
    key_takeaways: List[str] = Field(default_factory=list, description="Bullet points of key terms")
    reading_level: Optional[str] = Field(default="Standard Plain English", description="Reading complexity level")


class RiskItem(BaseModel):
    id: str = Field(..., description="Unique risk identifier e.g. risk-1")
    clause_name: str = Field(..., description="Identified clause name (e.g. Automatic Renewal, Unilateral Liability)")
    section_id: str = Field(..., description="ID of the section this risk belongs to (e.g. sec-1)")
    severity: Literal["HIGH", "MEDIUM", "LOW"] = Field(
        ...,
        description="Risk severity level: HIGH (critical trap/waiver), MEDIUM (unfavorable/strict), LOW (noteworthy)"
    )
    original_quote: str = Field(..., description="Verbatim quote from the contract")
    why_it_matters: str = Field(..., description="One-line plain-English explanation of why this matters to the user")
    potential_impact: str = Field(..., description="Financial, legal, or operational impact")
    suggested_action: str = Field(..., description="Recommended clarification or negotiation alternative")


class ActionChecklist(BaseModel):
    questions_for_lawyer: List[str] = Field(default_factory=list, description="Specific questions to ask an attorney")
    red_flags_to_clarify: List[str] = Field(default_factory=list, description="Ambiguities or one-sided terms to clarify")
    recommended_next_steps: List[str] = Field(default_factory=list, description="Actionable checklist before signing")


class DocumentMetadata(BaseModel):
    filename: str
    file_type: str
    word_count: int
    character_count: int
    section_count: int
    overall_risk_score: Literal["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]
    executive_summary: str


class DocumentAnalysisResponse(BaseModel):
    document_id: str
    metadata: DocumentMetadata
    sections: List[SimplifiedSection]
    risks: List[RiskItem]
    checklist: ActionChecklist
    raw_text: str
    disclaimer: str = LEGAL_DISCLAIMER_TEXT


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Legal text to analyze")
    filename: Optional[str] = "Pasted_Document.txt"
    api_key: Optional[str] = None
    reading_level: Optional[str] = "standard"  # standard, executive, simple


class QAQueryRequest(BaseModel):
    document_id: Optional[str] = None
    document_text: Optional[str] = None
    question: str = Field(..., min_length=2, description="User question about the document")
    api_key: Optional[str] = None


class QAResponse(BaseModel):
    answer: str
    grounded_in_document: bool
    cited_sections: List[str] = Field(default_factory=list)
    direct_quotes: List[str] = Field(default_factory=list)
    confidence: Literal["High", "Partial", "Not Found in Document", "Redirected to Legal Counsel"]
    is_advice_redirection: bool = False
    redirection_message: Optional[str] = None
    disclaimer: str = LEGAL_DISCLAIMER_TEXT


class TermComparisonItem(BaseModel):
    category: str
    topic: str
    doc_a_value: str
    doc_b_value: str
    assessment: Literal[
        "Doc A more favorable",
        "Doc B more favorable",
        "Neutral / Similar",
        "Higher Risk in Doc B",
        "Higher Risk in Doc A"
    ]
    key_difference: str


class CompareRequest(BaseModel):
    doc_a_name: str = "Document A"
    doc_a_text: str = Field(..., min_length=10)
    doc_b_name: str = "Document B"
    doc_b_text: str = Field(..., min_length=10)
    api_key: Optional[str] = None


class ComparisonResponse(BaseModel):
    doc_a_title: str
    doc_b_title: str
    executive_comparison: str
    key_differences: List[TermComparisonItem]
    added_clauses_in_b: List[str] = Field(default_factory=list)
    removed_clauses_in_b: List[str] = Field(default_factory=list)
    overall_verdict: str
    disclaimer: str = LEGAL_DISCLAIMER_TEXT
