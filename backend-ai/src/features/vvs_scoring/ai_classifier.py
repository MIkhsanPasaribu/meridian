"""
AI-powered signal enrichment — the intelligence layer of the VVS pipeline.

Uses the AI/ML API (aimlapi.com) to reason over a raw compliance signal and
extract a structured classification (category, severity, sentiment, ESG summary).
Falls back to the deterministic keyword classifier in `classifier.py` whenever
the AI/ML API is not configured or returns an unusable response, so the pipeline
degrades gracefully.

This is Meridian's "Best Use of AI/ML API" intelligence layer: reasoning +
extraction applied to live web data harvested by the Bright Data agents.
"""
from typing import Any
from src.integrations.aimlapi_client import extract_json, get_aimlapi_client
from src.features.vvs_scoring.classifier import classify_signal
from src.features.vvs_scoring.models import (
    SignalCategory,
    SignalSeverity,
)
from src.core.logger import logger

_VALID_CATEGORIES: set[str] = {
    "human_rights",
    "environment",
    "labor_conditions",
    "financial_distress",
    "leadership_change",
}

_VALID_SEVERITIES: set[str] = {"critical", "high", "medium", "low"}

_EXTRACTION_INSTRUCTION = (
    "You are an ESG supply-chain compliance analyst. Analyze the following "
    "signal about a supplier and return a JSON object with EXACTLY these keys:\n"
    '  "category": one of [human_rights, environment, labor_conditions, '
    "financial_distress, leadership_change]\n"
    '  "severity": one of [critical, high, medium, low]\n'
    '  "sentiment_score": a float from -1.0 (very negative) to 1.0 (very positive)\n'
    '  "summary": a one-sentence English summary of the compliance concern\n'
    "Base severity on concrete enforcement signals (arrests, bans, fines, "
    "confirmed forced labor = critical/high; allegations/complaints = medium; "
    "rumors/unverified = low)."
)


def _coerce_category(value: Any, fallback: str) -> str:
    """Validates the model's category against the allowed set."""
    if isinstance(value, str) and value.lower() in _VALID_CATEGORIES:
        return value.lower()
    return fallback


def _coerce_severity(value: Any, fallback: str) -> str:
    """Validates the model's severity against the allowed set."""
    if isinstance(value, str) and value.lower() in _VALID_SEVERITIES:
        return value.lower()
    return fallback


def _coerce_sentiment(value: Any) -> float:
    """Clamps the model's sentiment score into the [-1.0, 1.0] range."""
    try:
        return max(-1.0, min(1.0, float(value)))
    except (TypeError, ValueError):
        return 0.0


async def enrich_signal(signal: dict[str, Any]) -> dict[str, Any]:
    """
    Enriches a single signal with AI-reasoned classification.

    Always returns a fully classified signal: it first applies the deterministic
    keyword classifier (guaranteed category/severity), then, when the AI/ML API
    is configured, upgrades the classification with model reasoning and adds a
    sentiment score plus an ESG summary.

    Args:
        signal: A raw signal dict with at least 'title' and/or 'content'.

    Returns:
        The signal dict with 'category', 'severity', 'sentiment_score',
        'ai_summary', and 'enriched_by' fields populated.
    """
    # Deterministic baseline — guarantees valid category/severity.
    base = classify_signal(signal)

    if get_aimlapi_client() is None:
        return {**base, "enriched_by": "keyword"}

    text = f"{signal.get('title', '')}\n{signal.get('content', '')}".strip()
    if not text:
        return {**base, "enriched_by": "keyword"}

    try:
        result = await extract_json(_EXTRACTION_INSTRUCTION, text[:2000], max_tokens=512)
    except Exception as e:
        logger.warning("AI signal enrichment failed, using keyword baseline", error=str(e))
        return {**base, "enriched_by": "keyword"}

    if not result:
        return {**base, "enriched_by": "keyword"}

    return {
        **base,
        "category": _coerce_category(result.get("category"), base["category"]),
        "severity": _coerce_severity(result.get("severity"), base["severity"]),
        "sentiment_score": _coerce_sentiment(result.get("sentiment_score")),
        "ai_summary": str(result.get("summary", "")).strip(),
        "enriched_by": "aimlapi",
    }


async def enrich_signals_batch(
    signals: list[dict[str, Any]],
    *,
    concurrency: int = 5,
) -> list[dict[str, Any]]:
    """
    Enriches a batch of signals concurrently with a bounded semaphore so we do
    not overwhelm the AI/ML API rate limits.

    Args:
        signals: List of raw signal dicts.
        concurrency: Maximum number of in-flight enrichment calls.

    Returns:
        List of enriched signal dicts (order preserved).
    """
    import asyncio

    if not signals:
        return []

    semaphore = asyncio.Semaphore(max(1, concurrency))

    async def _bounded(sig: dict[str, Any]) -> dict[str, Any]:
        async with semaphore:
            return await enrich_signal(sig)

    enriched = await asyncio.gather(
        *(_bounded(s) for s in signals),
        return_exceptions=True,
    )

    out: list[dict[str, Any]] = []
    for original, result in zip(signals, enriched):
        if isinstance(result, dict):
            out.append(result)
        else:
            # On unexpected failure, fall back to the keyword classifier.
            out.append({**classify_signal(original), "enriched_by": "keyword"})

    return out
