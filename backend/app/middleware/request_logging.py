"""
Rakshak AI Intelligence Grid - Request Middleware

Logging, timing, and error handling middleware.
"""

import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and response times."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log incoming request
        logger.info(
            f"→ {request.method} {request.url.path} "
            f"[Client: {request.client.host if request.client else 'unknown'}]"
        )

        response = await call_next(request)

        # Calculate response time
        duration_ms = round((time.time() - start_time) * 1000, 2)

        logger.info(
            f"← {request.method} {request.url.path} "
            f"[Status: {response.status_code}] "
            f"[Time: {duration_ms}ms]"
        )

        # Add response time header
        response.headers["X-Response-Time-Ms"] = str(duration_ms)

        return response
