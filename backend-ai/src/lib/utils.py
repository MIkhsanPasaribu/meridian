"""
Shared utility functions for the Meridian AI backend.
"""
import hashlib
from datetime import datetime, timezone


def sha256_hash(content: str) -> str:
    """
    Computes the SHA-256 hash of a string.
    Used for evidence content integrity verification.
    """
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def utc_now() -> str:
    """Returns the current UTC timestamp as an ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()


def truncate_text(text: str, max_length: int = 500) -> str:
    """
    Truncates text to a maximum length with ellipsis.
    Used to limit signal content stored in the database.
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def clean_supplier_name(name: str) -> str:
    """
    Cleans a supplier name for use in search queries.
    Removes special characters that could break search syntax.
    """
    import re
    cleaned = re.sub(r'[^\w\s\-\.]', '', name)
    return cleaned.strip()
