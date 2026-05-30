"""
Unit tests for the audio-evidence workflow (Speechmatics + AI/ML API).
These tests mock the integrations and do not require live API keys.
"""
import pytest

from src.features.audio_evidence import service as audio_service
from src.features.audio_evidence.service import transcribe_and_extract


@pytest.mark.asyncio
async def test_transcribe_and_extract_unconfigured(monkeypatch):
    """When Speechmatics is not configured, returns transcription_available=False."""
    monkeypatch.setattr(audio_service, "is_configured", lambda: False)

    result = await transcribe_and_extract(b"fake-audio", filename="a.wav")

    assert result.transcription_available is False
    assert result.transcript == ""
    assert result.signal == {}


@pytest.mark.asyncio
async def test_transcribe_and_extract_empty_transcript(monkeypatch):
    """An empty transcript produces an empty signal, not a crash."""
    monkeypatch.setattr(audio_service, "is_configured", lambda: True)

    async def fake_transcribe(audio_bytes, **kwargs):
        return "   "

    monkeypatch.setattr(audio_service, "transcribe_audio", fake_transcribe)

    result = await transcribe_and_extract(b"fake-audio", filename="a.wav")
    assert result.transcript == ""
    assert result.signal == {}


@pytest.mark.asyncio
async def test_transcribe_and_extract_full_pipeline(monkeypatch):
    """A real transcript is enriched into a structured signal."""
    monkeypatch.setattr(audio_service, "is_configured", lambda: True)

    async def fake_transcribe(audio_bytes, **kwargs):
        return "Workers report forced overtime and unsafe conditions at the plant."

    async def fake_enrich(signal):
        return {
            **signal,
            "category": "labor_conditions",
            "severity": "high",
            "enriched_by": "aimlapi",
        }

    monkeypatch.setattr(audio_service, "transcribe_audio", fake_transcribe)
    monkeypatch.setattr(audio_service, "enrich_signal", fake_enrich)

    result = await transcribe_and_extract(
        b"fake-audio",
        filename="testimony.wav",
        supplier_name="Acme Co",
    )

    assert "forced overtime" in result.transcript
    assert result.signal["category"] == "labor_conditions"
    assert result.signal["severity"] == "high"
    assert result.signal["source_type"] == "local_forum"
    assert "Acme Co" in result.signal["title"]
