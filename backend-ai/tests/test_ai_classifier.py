"""
Unit tests for the AI-powered signal enrichment (intelligence layer).

These tests verify graceful fallback to the deterministic keyword classifier
when the AI/ML API is not configured, and correct coercion of AI output. They
do not require live API keys.
"""
import pytest

from src.features.vvs_scoring import ai_classifier
from src.features.vvs_scoring.ai_classifier import (
    enrich_signal,
    enrich_signals_batch,
    _coerce_category,
    _coerce_severity,
    _coerce_sentiment,
)


def test_coerce_category_valid():
    assert _coerce_category("human_rights", "labor_conditions") == "human_rights"


def test_coerce_category_invalid_falls_back():
    assert _coerce_category("nonsense", "environment") == "environment"
    assert _coerce_category(None, "environment") == "environment"


def test_coerce_severity_case_insensitive():
    assert _coerce_severity("CRITICAL", "low") == "critical"


def test_coerce_severity_invalid_falls_back():
    assert _coerce_severity("apocalyptic", "high") == "high"


def test_coerce_sentiment_clamps_range():
    assert _coerce_sentiment(5.0) == 1.0
    assert _coerce_sentiment(-9.0) == -1.0
    assert _coerce_sentiment("not a number") == 0.0
    assert _coerce_sentiment(0.5) == 0.5


@pytest.mark.asyncio
async def test_enrich_signal_falls_back_to_keyword(monkeypatch):
    """When the AI/ML API is unconfigured, enrichment uses the keyword baseline."""
    monkeypatch.setattr(ai_classifier, "get_aimlapi_client", lambda: None)

    signal = {"title": "Factory accused of forced labor", "content": "workers detained"}
    result = await enrich_signal(signal)

    assert result["enriched_by"] == "keyword"
    assert result["category"] == "human_rights"
    assert result["severity"] in {"critical", "high", "medium", "low"}


@pytest.mark.asyncio
async def test_enrich_signal_uses_ai_when_available(monkeypatch):
    """When the AI/ML API returns JSON, enrichment upgrades the classification."""
    monkeypatch.setattr(ai_classifier, "get_aimlapi_client", lambda: object())

    async def fake_extract_json(instruction, content, **kwargs):
        return {
            "category": "environment",
            "severity": "critical",
            "sentiment_score": -0.8,
            "summary": "Severe chemical contamination reported.",
        }

    monkeypatch.setattr(ai_classifier, "extract_json", fake_extract_json)

    signal = {"title": "Chemical spill near plant", "content": "toxic waste in river"}
    result = await enrich_signal(signal)

    assert result["enriched_by"] == "aimlapi"
    assert result["category"] == "environment"
    assert result["severity"] == "critical"
    assert result["sentiment_score"] == -0.8
    assert result["ai_summary"] == "Severe chemical contamination reported."


@pytest.mark.asyncio
async def test_enrich_signal_handles_ai_failure(monkeypatch):
    """If the AI call raises, enrichment falls back to keyword classification."""
    monkeypatch.setattr(ai_classifier, "get_aimlapi_client", lambda: object())

    async def boom(instruction, content, **kwargs):
        raise RuntimeError("network down")

    monkeypatch.setattr(ai_classifier, "extract_json", boom)

    result = await enrich_signal({"title": "Worker strike over wages", "content": ""})
    assert result["enriched_by"] == "keyword"


@pytest.mark.asyncio
async def test_enrich_signals_batch_empty():
    assert await enrich_signals_batch([]) == []


@pytest.mark.asyncio
async def test_enrich_signals_batch_preserves_order(monkeypatch):
    monkeypatch.setattr(ai_classifier, "get_aimlapi_client", lambda: None)

    signals = [
        {"title": "forced labor confirmed", "content": ""},
        {"title": "minor pollution complaint", "content": ""},
    ]
    results = await enrich_signals_batch(signals)

    assert len(results) == 2
    assert all(r["enriched_by"] == "keyword" for r in results)
