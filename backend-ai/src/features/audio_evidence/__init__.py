# Audio Evidence — Speechmatics speech-to-text → AI/ML API signal extraction
from src.features.audio_evidence.service import (
    transcribe_and_extract,
    AudioEvidenceResult,
)

__all__ = ["transcribe_and_extract", "AudioEvidenceResult"]
