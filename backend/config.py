import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from root directory if it exists
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Security & Upload Boundaries
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB strict limit
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".text"}
MAX_DOCUMENT_CHARACTERS = 250_000  # Cap input text to prevent memory/token overflows
