# Integration layer
# Bright Data (data harvesting) + AI provider clients are centralized here.
from src.integrations.aimlapi_client import (
    get_aimlapi_client,
    chat_completion,
    extract_structured,
    extract_json,
)
from src.integrations.featherless_client import (
    get_featherless_client,
    featherless_completion,
    summarize_signals,
)
from src.integrations.speechmatics_client import transcribe_audio, is_configured

__all__ = [
    "get_aimlapi_client",
    "chat_completion",
    "extract_structured",
    "extract_json",
    "get_featherless_client",
    "featherless_completion",
    "summarize_signals",
    "transcribe_audio",
    "is_configured",
]
