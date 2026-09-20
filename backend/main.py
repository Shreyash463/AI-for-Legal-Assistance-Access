import os
from pathlib import Path
from datetime import datetime, timezone
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.config import ENVIRONMENT, GEMINI_MODEL
from backend.models.schemas import LEGAL_DISCLAIMER_TEXT
from backend.routers.documents import router as documents_router
from backend.routers.comparison import router as comparison_router

app = FastAPI(
    title="ClarifyLaw AI API",
    description="Production GenAI engine for plain-English legal document simplification, risk auditing, grounded Q&A, and contract comparison.",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security: Global Exception Handler to suppress verbose internal stack traces in responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internal error for developers, return sanitized response to users
    if ENVIRONMENT == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "message": "An unexpected error occurred while processing your request. Please try again or check input formatting.",
                "disclaimer": LEGAL_DISCLAIMER_TEXT
            }
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": exc.__class__.__name__,
            "message": str(exc),
            "disclaimer": LEGAL_DISCLAIMER_TEXT
        }
    )


# Health check endpoint with dynamic current UTC timestamp (never hardcoded)
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ClarifyLaw AI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model": GEMINI_MODEL,
        "environment": ENVIRONMENT,
        "disclaimer": LEGAL_DISCLAIMER_TEXT
    }


# Include Routers
app.include_router(documents_router)
app.include_router(comparison_router)

# Mount frontend build static files if present (for single-process production serving)
DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
