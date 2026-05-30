"""
Audio Evidence workflow — voice-enabled compliance monitoring.

Pipeline:
    1. Speechmatics transcribes audio evidence (press conferences, worker
       testimony recordings, investigative broadcasts) into text.
    2. The AI/ML API intelligence layer reasons over the transcript and turns it
       into a structured compliance signal (category, severity, sentiment, summary).

This combines two partner technologies into one real-world workflow:
Speechmatics (speech-to-text) + AI/ML API (reasoning/extraction), feeding the
same VVS scoring pipeline as the web-harvested signals.
"""
from typing import Any
from pydantic import BaseModel, Field
from src.integrations.speechmatics_client import transcribe_audio, is_configured
from src.features.vvs_scoring.ai_classifier import enrich_signal
from src.core.logger import logger


class AudioEvidenceResult(BaseModel):
    """Result of transcribing and analyzing a piece of audio evidence."""

    transcript: str = ""
    signal: dict[str, Any] = Field(default_factory=dict)
    transcription_available: bool = True


async def transcribe_and_extract(
    audio_bytes: bytes,
    *,
    filename: str = "evidence.wav",
    language: str = "en",
    supplier_name: str = "",
    source_url: str = "",
) -> AudioEvidenceResult:
    """
    Transcribes an audio evidence file and converts it into an enriched
    compliance signal ready for VVS scoring.

    Args:
        audio_bytes: Raw audio file content.
        filename: Original filename (used for content-type inference).
        language: Transcription language code (en, zh, ar, vi, ...).
        supplier_name: Optional supplier the evidence relates to.
        source_url: Optional source URL/reference for the recording.

    Returns:
        AudioEvidenceResult with the transcript and an enriched signal dict.
    """
    if not is_configured():
        logger.warning("Speechmatics not configured, audio evidence skipped")
        return AudioEvidenceResult(transcription_available=False)

    transcript = await transcribe_audio(audio_bytes, filename=filename, language=language)

    if not transcript.strip():
        logger.info("Audio evidence produced empty transcript", filename=filename)
        return AudioEvidenceResult(transcript="", signal={})

    title = (
        f"Audio evidence: {supplier_name}".strip(": ")
        if supplier_name
        else "Audio evidence transcript"
    )

    raw_signal: dict[str, Any] = {
        "title": title,
        "content": transcript[:4000],
        "url": source_url,
        "source_type": "local_forum",
        "language": language,
        "platform": "audio",
    }

    enriched = await enrich_signal(raw_signal)

    logger.info(
        "Audio evidence processed",
        filename=filename,
        transcript_length=len(transcript),
        category=enriched.get("category"),
        severity=enriched.get("severity"),
    )

    return AudioEvidenceResult(transcript=transcript, signal=enriched)
