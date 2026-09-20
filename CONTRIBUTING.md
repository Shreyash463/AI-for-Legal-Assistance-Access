# Contributing to ClarifyLaw AI

Thank you for your interest in contributing to **ClarifyLaw AI**! This document outlines our development process, design philosophies, and submission guidelines.

---

## 1. Guiding Design Principles

1. **Accessibility First (WCAG 2.1 AA)**:
   - Always use semantic HTML elements (`<button>`, `<label>`, `<input>`, `<table>`). Never use generic `<div onClick>` or clickable spans without keyboard navigation support.
   - Severity and critical status must never be communicated solely by color. Always pair colors with text labels and recognizable iconography.
   - All interactive controls must support visible focus outlines (`focus-visible:ring-2 focus-visible:ring-blue-500`).

2. **Zero-Hallucination & Strict Grounding**:
   - Legal document intelligence must not speculate, assume, or invent provisions.
   - If a contract does not explicitly mention a query topic, the model must explicitly state: *"The provided document does not contain terms or information regarding this subject."* and return `grounded_in_document: false`.

3. **Mandatory Unauthorized Legal Practice (UPL) Guardrails**:
   - ClarifyLaw AI is strictly an informational and educational comprehension tool.
   - Never generate legal advice, predictions of litigation outcome, or recommendations to sue or breach contracts.
   - Always redirect advice-seeking queries to accredited local Bar Associations, Legal Aid societies, and attorney consultation checklists.

4. **Privacy & Ephemeral Storage**:
   - No user-uploaded contract or extracted clauses should ever be written to disk, database, or external persistent storage without explicit user action.
   - Ephemeral session caches must allow immediate manual purging via the `/api/documents/{doc_id}` endpoint.

---

## 2. Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Gemini API key (optional for synthetic sample contracts, required for custom live LLM analysis)

### Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Automated Testing Suite

All pull requests and modifications must pass the full 31-test suite:
```bash
pytest tests/ -v
```

The test suite covers:
- `tests/test_api_endpoints.py`: Core REST endpoints, health check, sample contracts, and comparison matrix.
- `tests/test_extended_coverage.py`: Edge cases (0-byte uploads, oversized files >10MB, corrupted PDF payloads, prompt injection neutralization, multilingual contracts, clean contracts without false positives, and full integration journeys).
- `tests/test_guardrails.py`: Legal advice detection and redirection.
- `tests/test_parser.py`: PDF text extraction, document segmentation, sanitization.
- `tests/test_schemas.py`: Pydantic data schemas and validation rules.
- `tests/test_date_safety.py`: Dynamic UTC timestamp generation and absence of hardcoded deadline comparisons.

---

## 4. Code Style & Commit Conventions

- **Python**: Follow PEP 8 guidelines. Type hints are required for all function arguments and return values. Docstrings must accompany all routers and service helpers.
- **JavaScript/React**: Use functional components with hooks. Prefer Tailwind CSS utility classes and Lucide React icons.
- **Commits**: Use Conventional Commits format (e.g. `feat: ...`, `fix: ...`, `test: ...`, `docs: ...`, `refactor: ...`).

---

## 5. Security & Responsible AI

If you discover a security vulnerability or bypass in prompt injection defenses, please open an issue or pull request with a reproducible test case in `tests/test_extended_coverage.py`.
