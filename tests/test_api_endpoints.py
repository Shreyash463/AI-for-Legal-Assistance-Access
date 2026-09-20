from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "ClarifyLaw AI" in data["service"]

def test_get_sample_documents():
    res = client.get("/api/documents/samples")
    assert res.status_code == 200
    data = res.json()
    assert "samples" in data
    assert len(data["samples"]) >= 3
    sample_ids = [s["id"] for s in data["samples"]]
    assert "residential_lease_agreement" in sample_ids

def test_analyze_sample_lease_contract():
    # Fetch sample lease text
    samples_res = client.get("/api/documents/samples")
    lease = next(s for s in samples_res.json()["samples"] if s["id"] == "residential_lease_agreement")
    
    res = client.post(
        "/api/documents/analyze-text",
        json={"text": lease["text"], "filename": lease["filename"]}
    )
    assert res.status_code == 200
    analysis = res.json()
    
    # Verify traceability and structure
    assert "document_id" in analysis
    assert len(analysis["sections"]) >= 5
    # Verify each section has id, title, plain_english, original_text
    for sec in analysis["sections"]:
        assert sec["id"].startswith("sec-")
        assert len(sec["plain_english"]) > 10
        assert len(sec["original_text"]) > 10

    # Verify risk radar
    assert len(analysis["risks"]) >= 3
    risk_severities = {r["severity"] for r in analysis["risks"]}
    assert "HIGH" in risk_severities

    # Verify checklist
    assert len(analysis["checklist"]["questions_for_lawyer"]) >= 2
    assert len(analysis["checklist"]["red_flags_to_clarify"]) >= 2

def test_qa_grounded_answer():
    samples_res = client.get("/api/documents/samples")
    lease = next(s for s in samples_res.json()["samples"] if s["id"] == "residential_lease_agreement")
    
    res = client.post(
        "/api/documents/qa",
        json={
            "document_text": lease["text"],
            "question": "Can I cancel this lease early?"
        }
    )
    assert res.status_code == 200
    qa = res.json()
    assert qa["grounded_in_document"] is True
    assert "early" in qa["answer"].lower() or "terminate" in qa["answer"].lower()

def test_qa_hallucination_guard_unmentioned_topic():
    samples_res = client.get("/api/documents/samples")
    lease = next(s for s in samples_res.json()["samples"] if s["id"] == "residential_lease_agreement")
    
    res = client.post(
        "/api/documents/qa",
        json={
            "document_text": lease["text"],
            "question": "Does this document mention rocket launch licensing?"
        }
    )
    assert res.status_code == 200
    qa = res.json()
    assert qa["grounded_in_document"] is False
    assert "does not contain" in qa["answer"].lower()

def test_qa_legal_advice_guardrail_redirection():
    samples_res = client.get("/api/documents/samples")
    lease = next(s for s in samples_res.json()["samples"] if s["id"] == "residential_lease_agreement")
    
    res = client.post(
        "/api/documents/qa",
        json={
            "document_text": lease["text"],
            "question": "Should I sue them right now in court?"
        }
    )
    assert res.status_code == 200
    qa = res.json()
    assert qa["is_advice_redirection"] is True
    assert "attorney" in qa["answer"].lower() or "consultation" in qa["answer"].lower()

def test_compare_sample_contracts():
    samples_pair = client.get("/api/compare/samples")
    assert samples_pair.status_code == 200
    pair = samples_pair.json()
    
    res = client.post(
        "/api/compare",
        json={
            "doc_a_name": pair["doc_a"]["name"],
            "doc_a_text": pair["doc_a"]["text"],
            "doc_b_name": pair["doc_b"]["name"],
            "doc_b_text": pair["doc_b"]["text"]
        }
    )
    assert res.status_code == 200
    comp = res.json()
    assert len(comp["key_differences"]) >= 3
    assert len(comp["added_clauses_in_b"]) >= 1
    assert "verdict" in comp["overall_verdict"].lower() or "document b" in comp["overall_verdict"].lower() or "risk" in comp["overall_verdict"].lower()
