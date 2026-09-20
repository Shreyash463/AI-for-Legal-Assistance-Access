import io
import re
from typing import List, Tuple
from pypdf import PdfReader
from fastapi import HTTPException
from backend.config import MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS, MAX_DOCUMENT_CHARACTERS

PROMPT_INJECTION_PATTERNS = [
    re.compile(r"\bignore\s+(?:all\s+)?(?:previous|prior)\s+instructions\b", re.IGNORECASE),
    re.compile(r"\bsystem\s+prompt\s+override\b", re.IGNORECASE),
    re.compile(r"\byou\s+are\s+now\s+in\s+dan\s+mode\b", re.IGNORECASE),
    re.compile(r"\bdisregard\s+(?:all\s+)?(?:previous|prior)\s+rules\b", re.IGNORECASE),
    re.compile(r"\bnew\s+system\s+instruction\s*:\b", re.IGNORECASE),
]


def neutralize_prompt_injections(text: str) -> str:
    """
    Detects and neutralizes prompt injection payloads embedded in untrusted contract text.
    Replaces suspicious adversarial control strings with inert defusal markers.
    """
    sanitized = text
    for pattern in PROMPT_INJECTION_PATTERNS:
        sanitized = pattern.sub("[Defused Untrusted Injection Attempt: BLOCKED_PAYLOAD]", sanitized)
    return sanitized


def sanitize_text(text: str) -> str:
    """
    Sanitize input text by:
    1. Stripping null bytes and control characters (protects parser integrity)
    2. Neutralizing prompt injection attack strings (protects LLM safety)
    3. Normalizing line breaks
    4. Capping character length to prevent denial-of-service / memory exhaustion
    """
    if not text:
        return ""
    # Strip null bytes and non-printable control characters (except newline, tab, carriage return)
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    # Neutralize prompt injection attempts
    cleaned = neutralize_prompt_injections(cleaned)
    # Normalize line breaks
    cleaned = cleaned.replace('\r\n', '\n').replace('\r', '\n')
    # Limit maximum characters to protect from denial of service
    if len(cleaned) > MAX_DOCUMENT_CHARACTERS:
        cleaned = cleaned[:MAX_DOCUMENT_CHARACTERS]
    return cleaned.strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from uploaded PDF bytes using pypdf with robust error isolation."""
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail={"error": "The uploaded file is empty (0 bytes).", "code": "EMPTY_FILE"}
        )
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        if len(reader.pages) == 0:
            raise HTTPException(
                status_code=400,
                detail={"error": "The PDF file contains zero pages.", "code": "EMPTY_PDF"}
            )
        
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(f"--- [Page {i + 1}] ---\n" + page_text.strip())
        
        full_text = "\n\n".join(extracted_pages)
        if not full_text.strip():
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Could not extract readable text from PDF. The document may be scanned images or password protected.",
                    "code": "UNREADABLE_PDF"
                }
            )
        return sanitize_text(full_text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": f"Failed to process PDF document: {str(e)}",
                "code": "CORRUPT_PDF"
            }
        )


def validate_file(filename: str, file_size: int) -> None:
    """Validate file extension, size boundary, and naming."""
    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail={"error": "The uploaded file is empty.", "code": "EMPTY_FILE"}
        )
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail={
                "error": f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
                "code": "FILE_TOO_LARGE"
            }
        )
    
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail={
                "error": f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}.",
                "code": "UNSUPPORTED_FORMAT"
            }
        )


def segment_document(text: str) -> List[Tuple[str, str, str]]:
    """
    Splits document into logical sections with (section_id, title, text).
    Handles legal headings like:
    - SECTION 1: ... / ARTICLE I: ...
    - 1. ... / 1.1 ...
    - CLAUSE 1: ...
    - Fallback to double newline paragraphs.
    """
    sanitized = sanitize_text(text)
    if not sanitized:
        return []

    # Regex to identify legal section headings
    heading_pattern = re.compile(
        r'(?m)^(?P<heading>(?:SECTION|ARTICLE|CLAUSE)\s+[0-9IVXLCDM]+[:\.\s\-].*?|'
        r'^[0-9]{1,2}\.\s+[A-Z][A-Za-z0-9\s,\-/\(\)]+|'
        r'^[0-9]{1,2}\.[0-9]{1,2}\s+[A-Z][A-Za-z0-9\s,\-/\(\)]+)'
    )

    matches = list(heading_pattern.finditer(sanitized))
    sections: List[Tuple[str, str, str]] = []

    if matches:
        # Preamble / Recitals before first heading
        if matches[0].start() > 0:
            preamble_text = sanitized[:matches[0].start()].strip()
            if preamble_text:
                sections.append(("sec-1", "Preamble & Parties", preamble_text))

        for idx, match in enumerate(matches):
            start = match.start()
            end = matches[idx + 1].start() if idx + 1 < len(matches) else len(sanitized)
            section_content = sanitized[start:end].strip()
            
            raw_title = match.group('heading').strip()
            # Clean up title
            title = raw_title.split('\n')[0].strip()
            if len(title) > 80:
                title = title[:77] + "..."
            
            sec_num = len(sections) + 1
            sections.append((f"sec-{sec_num}", title, section_content))
    else:
        # Fallback: split by double newlines into logical chunks
        chunks = [c.strip() for c in re.split(r'\n\s*\n+', sanitized) if c.strip()]
        if not chunks:
            chunks = [sanitized]
            
        current_chunk = []
        current_word_count = 0
        chunk_index = 1
        
        for p in chunks:
            p_words = len(p.split())
            if current_word_count + p_words > 250 and current_chunk:
                sec_text = "\n\n".join(current_chunk)
                first_line = sec_text.split('\n')[0].strip()
                title = first_line[:60] + ("..." if len(first_line) > 60 else "")
                sections.append((f"sec-{chunk_index}", f"Section {chunk_index}: {title}", sec_text))
                chunk_index += 1
                current_chunk = [p]
                current_word_count = p_words
            else:
                current_chunk.append(p)
                current_word_count += p_words
                
        if current_chunk:
            sec_text = "\n\n".join(current_chunk)
            first_line = sec_text.split('\n')[0].strip()
            title = first_line[:60] + ("..." if len(first_line) > 60 else "")
            sections.append((f"sec-{chunk_index}", f"Section {chunk_index}: {title}", sec_text))

    return sections
