from backend.services.guardrails import check_legal_advice_query

def test_guardrails_detects_should_i_sue():
    is_advice, message = check_legal_advice_query("Should I sue my landlord for not fixing the heater?")
    assert is_advice is True
    assert message is not None
    assert "Professional Legal Consultation Recommended" in message
    assert "licensed attorney" in message

def test_guardrails_detects_representation_request():
    is_advice, message = check_legal_advice_query("Can you be my lawyer in court next Monday?")
    assert is_advice is True
    assert message is not None

def test_guardrails_detects_evasion_request():
    is_advice, message = check_legal_advice_query("How to break this contract without consequences?")
    assert is_advice is True
    assert message is not None

def test_guardrails_allows_document_comprehension_questions():
    is_advice, message = check_legal_advice_query("What does Section 4 say about cancellation?")
    assert is_advice is False
    assert message is None

    is_advice, message = check_legal_advice_query("What is the security deposit amount?")
    assert is_advice is False
    assert message is None

    is_advice, message = check_legal_advice_query("When is the monthly payment due according to this lease?")
    assert is_advice is False
    assert message is None
