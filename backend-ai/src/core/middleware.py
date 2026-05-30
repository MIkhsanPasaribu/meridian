"""
FastAPI middleware for the Meridian AI backend.
"""
import time
from fastapi import Request, Response
from src.core.logger import logger


async def logging_middleware(request: Request, call_next) -> Response:
    """
    Middleware that logs all incoming HTTP requests with method, path, and duration.
    """
    start_time = time.time()
    method = request.method
    path = request.url.path

    response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        "HTTP request",
        method=method,
        path=path,
        status=response.status_code,
        duration_ms=duration_ms,
    )

    return response
