import io
import re
from typing import List, Tuple
from pypdf import PdfReader
from fastapi import HTTPException
from backend.config import MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS, MAX_DOCUMENT_CHARACTERS

def sanitize_text(text: str) -> str:
    """Sanitize input text by stripping control characters and excessive whitespace."""
    if not text:
        return ""
    # Strip null bytes and non-printable control characters (except newline, tab, carriage return)
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    # Normalize line breaks
    cleaned = cleaned.replace('\r\n', '\n').replace('\r', '\n')
    # Limit maximum characters to protect from denial of service
    if len(cleaned) > MAX_DOCUMENT_CHARACTERS:
        cleaned = cleaned[:MAX_DOCUMENT_CHARACTERS]
    return cleaned.strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from uploaded PDF bytes using pypdf."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        if len(reader.pages) == 0:
            raise HTTPException(status_code=400, detail="The PDF file contains no pages.")
        
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(f"--- [Page {i + 1}] ---\n" + page_text.strip())
        
        full_text = "\n\n".join(extracted_pages)
        if not full_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from PDF. The document may be scanned images or password protected."
            )
        return sanitize_text(full_text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process PDF document: {str(e)}"
        )


def validate_file(filename: str, file_size: int):
    """Validate file extension and size."""
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )
    
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
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
