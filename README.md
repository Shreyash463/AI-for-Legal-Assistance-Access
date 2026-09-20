# ⚖️ ClarifyLaw AI

> **Democratizing legal literacy with plain-English contract intelligence, clause risk auditing, strictly grounded Q&A, and side-by-side contract comparison — powered by Gemini.**

🌐 **Live App:** [clarifylaw-ai.vercel.app](https://clarifylaw-ai.vercel.app)
📁 **Repository:** [github.com/Shreyash463/AI-for-Legal-Assistance-Access](https://github.com/Shreyash463/AI-for-Legal-Assistance-Access)
🏆 **Submission:** PromptWars Virtual — Exclusive Edition (Hack2Skill × Google Developers)

---

## 1. Project Overview

**ClarifyLaw AI** is a production-grade GenAI application that makes legal documents understandable to everyone — not just lawyers. Upload a contract, lease, or policy, and the app breaks it down into plain English, flags the clauses that actually matter, answers your questions using *only* what's in the document, and helps you walk into a conversation with an attorney already prepared.

It does **not** give legal advice. It gives you the clarity to ask the right questions.

---

## 2. Problem Statement

### AI for Legal Assistance & Access

> *"Legal information can often be complex, difficult to understand, and challenging to navigate without professional assistance. Build a GenAI-powered solution that makes legal information and basic legal assistance more accessible by helping users understand, compare, and navigate legal documents and information."*

**Mandatory constraint observed:** ClarifyLaw AI explicitly presents itself as an educational and informational tool — **not a law firm, not legal advice**. This is enforced through a persistent compliance notice in the UI, guardrails that redirect legal-advice-seeking questions toward professional consultation, and an explicit disclaimer in every generated output.

---

## 3. Key Features

| # | Feature | What it does |
|---|---------|---------------|
| 1 | **Plain-English Simplification** | Breaks uploaded documents into section-by-section summaries at three reading levels (Standard, Executive TL;DR, Simple/Grade 6), with click-to-trace linking back to the original clause |
| 2 | **Risk & Clause Radar** | Automatically detects and flags risky or unusual clauses — auto-renewal traps, liability waivers, penalty clauses, one-sided obligations — each tagged with a severity level (High/Medium/Low) and a plain-English explanation of why it matters |
| 3 | **Strictly Grounded Q&A** | Answers questions using *only* the uploaded document's content, with citations to the exact section. If the document doesn't cover a topic, the app says so explicitly instead of guessing |
| 4 | **Side-by-Side Comparison** | Upload or select two documents (e.g., two lease versions, ToS v1 vs v2) and get a structured breakdown of what changed, what's missing, and which version carries more risk |
| 5 | **Action Checklist & Export** | Generates a tailored checklist — questions to ask a lawyer, red flags to clarify, next steps — exportable as Markdown or print/PDF |
| 6 | **Legal Disclaimer & Safety Layer** | Persistent compliance notice throughout the app; if a user asks for direct legal advice or litigation strategy, the app redirects them toward consulting a licensed attorney instead of answering directly |

---

## 4. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **AI Model** | Google Gemini API (Gemini 3.8 Flash) | Large context window for long contracts, fast responses, strong structured-output compliance |
| **Backend** | Python 3.11+, FastAPI | Async performance, native Pydantic validation, auto-generated API docs |
| **Document Parsing** | `pypdf` + custom section segmenter | Lightweight PDF text extraction without heavy OCR dependencies |
| **Frontend** | React 18 + Vite | Fast builds, modular components, responsive state management |
| **Styling** | Tailwind CSS + Lucide Icons | Accessible, WCAG-compliant, no bulky UI dependencies |
| **Testing** | Pytest + FastAPI TestClient | Automated coverage across parsing, schema validation, guardrails, and Q&A grounding |
| **Deployment** | Vercel (frontend + serverless backend routing) | Single-domain production deployment with CI-based redeploys on push |

---

## 5. Architecture

```
                         ┌───────────────────────────────┐
                         │           Browser              │
                         │  React 18 + Tailwind CSS       │
                         │  Split-screen traceability view │
                         └───────────────┬─────────────────┘
                                         │ REST / multipart upload
                                         ▼
                         ┌───────────────────────────────┐
                         │         FastAPI Backend         │
                         │  /api/documents/upload           │
                         │  /api/documents/qa                │
                         │  /api/compare                     │
                         └──────┬───────────────┬────────────┘
                                │               │
                    ┌───────────▼──┐   ┌────────▼─────────┐
                    │ Doc Parser    │   │ Safety Guardrails │
                    │ - Size cap    │   │ - Advice-seeking   │
                    │ - Sanitize    │   │   query detection   │
                    │ - Chunking    │   │ - Attorney redirect  │
                    └───────┬───────┘   └──────────┬─────────┘
                            └───────────┬───────────┘
                                        ▼
                         ┌───────────────────────────────┐
                         │       Gemini 3.8 Flash          │
                         │  Simplification · Risk Radar    │
                         │  Grounded Q&A · Comparison       │
                         │  Checklist Generation             │
                         └───────────────────────────────┘
```

Documents are processed in-memory for the session only — no persistent storage of uploaded content.

---

## 6. Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- A Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Shreyash463/AI-for-Legal-Assistance-Access.git
cd AI-for-Legal-Assistance-Access

# 2. Configure environment variables
cp .env.example .env
# Edit .env and add your Gemini API key:
# GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-3.8-flash
# PORT=8000
# HOST=0.0.0.0

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Build the frontend
cd frontend
npm install
npm run build
cd ..

# 5. Launch the server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Open **http://localhost:8000** in your browser.

> You can also skip entering an API key in `.env` and use the in-app **Settings → API Key** option to test with your own key directly from the UI.

---

## 7. How to Test

The app ships with **4 synthetic sample legal documents** in `samples/` so anyone can test every feature immediately, with zero setup:

| Sample | Tests |
|---|---|
| Residential Lease Agreement | Auto-renewal detection, one-sided fee shifting, deposit retention terms |
| SaaS Terms of Service v1.0 | Balanced commercial contract baseline |
| SaaS Terms of Service v2.0 (Revised) | Comparison mode target — price hikes, liability cap changes, arbitration shifts |
| Independent Contractor Agreement | Non-compete clauses, IP assignment terms |

**Walkthrough:**
1. Select a sample document → click **Run Plain-English Analysis**
2. Click any simplified clause card → watch it highlight and scroll to the matching original section
3. Open **Risk & Clause Radar** → filter by severity
4. Open **Grounded Q&A** → ask an in-scope question (get a cited answer) and an out-of-scope question (get an explicit refusal, not a hallucination)
5. Switch to **Comparison Mode** → load the SaaS v1 vs v2 pair → review the diff
6. Open **Action Checklist** → export via copy, download, or print

**Run automated tests:**
```bash
pytest tests/ -v
```

---

## 8. Security & Reliability Hardening

- No hardcoded secrets anywhere in the codebase — all keys via environment variables
- Server-side file type and size validation on every upload
- Rate limiting on all API endpoints
- Explicit CORS configuration (no wildcard origins)
- Sanitized document text before it reaches the model, to reduce prompt-injection risk from malicious document content
- Structured, consistent error responses across all endpoints
- No persistent storage of uploaded documents — ephemeral, in-memory session only
- **Date-bug regression tested:** no hardcoded deadlines or static date comparisons anywhere in the app; all timestamps generated dynamically

---

## 9. Accessibility

- WCAG-compliant color contrast throughout
- Risk severity is never conveyed by color alone — every badge pairs color with an icon and a text label
- Full keyboard navigation across all interactive elements, with visible focus states
- Semantic HTML structure (`<button>`, proper heading hierarchy, landmark regions) for screen reader compatibility
- Responsive layout across desktop and mobile

---

## 10. Problem Statement Coverage

| Official use case | Where it's implemented |
|---|---|
| Simplifying complex legal documents | Plain-English Simplification (§3.1) |
| Comparing contracts, agreements, or policies | Side-by-Side Comparison (§3.4) |
| Highlighting clauses, obligations, risks, inconsistencies | Risk & Clause Radar (§3.2) |
| Answering questions based on provided legal documents | Strictly Grounded Q&A (§3.3) |
| Helping users understand options and next steps | Action Checklist (§3.5) |
| Generating summaries, checklists, actionable outputs | Simplification + Checklist (§3.1, §3.5) |
| Preparing information/questions for a legal professional | Action Checklist (§3.5) |

---

## 11. Known Limitations & Roadmap

**Current limitations:**
- Scanned/image-only PDFs (no text layer) require OCR pre-processing not yet included
- Highlights suspicious terms but doesn't verify state-specific statutory compliance
- Document length capped at ~250,000 characters to protect against memory exhaustion

**What's next with more time:**
- Multi-jurisdiction statute cross-referencing (e.g., citing specific state codes)
- One-click redline/amendment generation in `.docx` format
- Audio walkthrough via text-to-speech for accessibility
- Local bar association / legal aid directory integration

---

## 12. Compliance & Disclaimer

ClarifyLaw AI is an educational and informational tool. It is **not a law firm** and does **not provide legal advice**. Always consult a qualified, licensed attorney for legal matters specific to your situation. This principle is enforced throughout the application via a persistent UI notice and an active guardrail that redirects advice-seeking or litigation-strategy questions toward professional consultation rather than answering them directly.

---

## 13. Submission Details

- **Problem Statement:** AI for Legal Assistance & Access
- **Event:** PromptWars Virtual — Exclusive Edition
- **Repository size:** Under 10MB (build artifacts, virtual environments, and node_modules excluded via `.gitignore`)
