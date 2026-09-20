"""
ClarifyLaw AI — FastAPI Backend Application Entrypoint.
Provides production endpoints for document simplification, risk auditing,
grounded Q&A, and contract comparison.
"""

import os
from pathlib import Path
from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.config import ENVIRONMENT, GEMINI_MODEL
from backend.models.schemas import LEGAL_DISCLAIMER_TEXT
from backend.services.rate_limiter import rate_limiter
from backend.routers.documents import router as documents_router
from backend.routers.comparison import router as comparison_router

app = FastAPI(
    title="ClarifyLaw AI API",
    description="Production GenAI engine for plain-English legal document simplification, risk auditing, grounded Q&A, and contract comparison.",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None
)

from starlette.middleware.gzip import GZipMiddleware

# GZip Compression Middleware (compresses responses > 1000 bytes)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Explicit CORS configuration: Allow production Vercel app and local development hosts
ALLOWED_ORIGINS = [
    "https://clarifylaw-ai.vercel.app",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://clarifylaw-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Security Headers Middleware (Priority 3: Hardened Enterprise Defense)
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if not response.headers.get("Content-Security-Policy"):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://clarifylaw-ai.vercel.app https://*.vercel.app;"
        )
    return response


# Rate Limiting Middleware (Sliding Window: 60 req/min per IP)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Bypass rate limits for static assets and documentation
    if request.url.path.startswith("/api/"):
        rate_limiter.check_rate_limit(request)
    response = await call_next(request)
    return response


# Standardized HTTPException Handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Ensure all HTTP exceptions return consistent structured JSON with error and code keys."""
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail.get("error", "An error occurred"),
                "code": exc.detail.get("code", f"HTTP_{exc.status_code}"),
                "disclaimer": exc.detail.get("disclaimer", LEGAL_DISCLAIMER_TEXT)
            }
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": str(exc.detail),
            "code": f"HTTP_{exc.status_code}",
            "disclaimer": LEGAL_DISCLAIMER_TEXT
        }
    )


# Global Unexpected Exception Handler: Suppresses verbose internal traces in production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all for uncaught server errors to prevent internal traceback leakage."""
    if ENVIRONMENT == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "An unexpected error occurred while processing your request. Please try again.",
                "code": "INTERNAL_SERVER_ERROR",
                "disclaimer": LEGAL_DISCLAIMER_TEXT
            }
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": f"{exc.__class__.__name__}: {str(exc)}",
            "code": "INTERNAL_SERVER_ERROR",
            "disclaimer": LEGAL_DISCLAIMER_TEXT
        }
    )


# Health check endpoint with dynamic current UTC timestamp (strictly zero hardcoded date logic)
@app.get("/api/health")
async def health_check():
    """System health check reporting service status, active model, environment, and dynamic UTC timestamp."""
    return {
        "status": "healthy",
        "service": "ClarifyLaw AI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model": GEMINI_MODEL,
        "environment": ENVIRONMENT,
        "disclaimer": LEGAL_DISCLAIMER_TEXT
    }


# Include Document Analysis and Comparison Routers
app.include_router(documents_router)
app.include_router(comparison_router)

# Mount frontend build static files if present (for single-process production serving)
DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
