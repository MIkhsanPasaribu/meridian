"""
Speechmatics integration (speechmatics.com).

Speech-to-text for transcribing audio evidence (press conferences, worker
testimony recordings, investigative broadcasts) into text signals that feed the
GNSH pipeline and VVS scoring.

Docs: https://docs.speechmatics.com  |  Batch API: https://asr.api.speechmatics.com/v2
"""
from typing import Any
import httpx
from src.core.config import settings
from src.core.logger import logger


def is_configured() -> bool:
    """Returns True when a Speechmatics API key is available."""
    return bool(settings.speechmatics_api_key)


def _auth_headers() -> dict[str, str]:
    """Builds the bearer-auth headers for the Speechmatics REST API."""
    return {"Authorization": f"Bearer {settings.speechmatics_api_key}"}


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str = "evidence.wav",
    *,
    language: str = "en",
    poll_interval: float = 3.0,
    timeout: float = 300.0,
) -> str:
    """
    Submits an audio file to the Speechmatics batch API and waits for the
    plain-text transcript.

    Args:
        audio_bytes: Raw audio file content.
        filename: Original filename (used for content-type inference).
        language: Transcription language code (e.g. "en", "zh", "ar", "vi").
        poll_interval: Seconds between job-status polls.
        timeout: Maximum seconds to wait for completion.

    Returns:
        The transcript text, or an empty string when unavailable.

    Raises:
        RuntimeError: When the Speechmatics API key is not configured.
    """
    if not is_configured():
        raise RuntimeError("SPEECHMATICS_API_KEY is not configured")

    config: dict[str, Any] = {
        "type": "transcription",
        "transcription_config": {"language": language, "operating_point": "enhanced"},
    }

    import asyncio
    import json

    async with httpx.AsyncClient(base_url=settings.speechmatics_url, timeout=60) as client:
        # 1. Create the transcription job
        create_resp = await client.post(
            "/jobs",
            headers=_auth_headers(),
            files={
                "data_file": (filename, audio_bytes),
                "config": (None, json.dumps(config)),
            },
        )
        create_resp.raise_for_status()
        job_id = create_resp.json().get("id", "")
        logger.info("Speechmatics job created", job_id=job_id, language=language)

        # 2. Poll for completion
        elapsed = 0.0
        while elapsed < timeout:
            status_resp = await client.get(f"/jobs/{job_id}", headers=_auth_headers())
            status_resp.raise_for_status()
            status = status_resp.json().get("job", {}).get("status", "")

            if status == "done":
                break
            if status in {"rejected", "expired"}:
                logger.error("Speechmatics job failed", job_id=job_id, status=status)
                return ""

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        # 3. Fetch the transcript
        transcript_resp = await client.get(
            f"/jobs/{job_id}/transcript",
            headers=_auth_headers(),
            params={"format": "txt"},
        )
        transcript_resp.raise_for_status()
        transcript = transcript_resp.text

    logger.info("Speechmatics transcript ready", job_id=job_id, length=len(transcript))
    return transcript
