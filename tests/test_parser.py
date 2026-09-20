import pytest
from fastapi import HTTPException
from backend.services.parser import sanitize_text, segment_document, validate_file
from backend.config import MAX_FILE_SIZE_BYTES

def test_sanitize_text_removes_null_bytes_and_control_chars():
    dirty = "Legal agreement\x00 with null \x08bytes and\r\nnewlines."
    cleaned = sanitize_text(dirty)
    assert "\x00" not in cleaned
    assert "\x08" not in cleaned
    assert "Legal agreement with null bytes and\nnewlines." in cleaned

def test_sanitize_text_handles_empty_or_none():
    assert sanitize_text("") == ""
    assert sanitize_text(None) == ""

def test_segment_document_legal_headings():
    sample_text = """
SECTION 1: PARTIES
This agreement is between Company and Contractor.

SECTION 2: PAYMENT
Payment shall be Net-30 in the amount of $5,000.

SECTION 3: TERMINATION
Either party may terminate upon 30 days notice.
"""
    sections = segment_document(sample_text)
    assert len(sections) == 3
    assert sections[0][0] == "sec-1"
    assert "SECTION 1" in sections[0][1]
    assert "Company and Contractor" in sections[0][2]
    assert sections[1][0] == "sec-2"
    assert "Net-30" in sections[1][2]
    assert sections[2][0] == "sec-3"

def test_segment_document_fallback_paragraphs():
    unstructured_text = "Paragraph one with some terms.\n\nParagraph two with more terms.\n\nParagraph three with final conditions."
    sections = segment_document(unstructured_text)
    assert len(sections) >= 1
    assert sections[0][0].startswith("sec-")

def test_validate_file_extensions():
    # Valid
    validate_file("contract.pdf", 1024)
    validate_file("terms.txt", 2048)
    validate_file("agreement.md", 512)

    # Invalid extension
    with pytest.raises(HTTPException) as exc_info:
        validate_file("malicious.exe", 1024)
    assert exc_info.value.status_code == 400

    # Exceeds max size
    with pytest.raises(HTTPException) as exc_info:
        validate_file("huge.pdf", MAX_FILE_SIZE_BYTES + 10)
    assert exc_info.value.status_code == 413
