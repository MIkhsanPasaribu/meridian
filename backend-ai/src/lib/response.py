"""
Standard API response helpers for the Meridian AI backend.
"""
from datetime import datetime, timezone
from typing import Any


def success_response(data: Any, message: str = "Success") -> dict:
    """Creates a successful API response."""
    return {
        "success": True,
        "data": data,
        "message": message,
        "error": None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def error_response(message: str, error: str | None = None) -> dict:
    """Creates an error API response."""
    return {
        "success": False,
        "data": None,
        "message": message,
        "error": error,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
