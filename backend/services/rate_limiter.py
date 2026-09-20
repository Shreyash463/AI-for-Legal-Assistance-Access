"""
In-memory sliding window rate limiter for ClarifyLaw AI.
Protects upstream Gemini API quota and prevents denial of service.
"""

import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status
from backend.models.schemas import LEGAL_DISCLAIMER_TEXT

class InMemoryRateLimiter:
    """
    Sliding-window rate limiter per client IP.
    Default: 60 requests per 60-second window.
    """
    def __init__(self, requests_per_minute: int = 60, window_seconds: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP, taking into account forwarded headers."""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "127.0.0.1"

    def check_rate_limit(self, request: Request) -> None:
        """
        Verify that the client has not exceeded their rate limit.
        Raises HTTPException 429 with structured error body if exceeded.
        """
        ip = self._get_client_ip(request)
        now = time.time()
        cutoff = now - self.window_seconds

        # Clean old entries
        self.requests[ip] = [ts for ts in self.requests[ip] if ts > cutoff]

        if len(self.requests[ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Too many requests. Please slow down to protect service quota.",
                    "code": "RATE_LIMIT_EXCEEDED",
                    "disclaimer": LEGAL_DISCLAIMER_TEXT
                }
            )

        self.requests[ip].append(now)

# Global rate limiter instance
rate_limiter = InMemoryRateLimiter(requests_per_minute=60, window_seconds=60)
