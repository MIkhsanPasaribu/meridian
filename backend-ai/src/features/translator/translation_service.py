"""
Translation service for multi-language signal preprocessing.
Translates non-English signals to English for VVS scoring.
"""
from typing import Any
from src.core.logger import logger

# Language codes that need translation
NON_ENGLISH_LANGUAGES = {"zh", "ar", "vi", "id", "th", "hi", "bn", "ko", "ja"}


async def translate_signal(signal: dict[str, Any]) -> dict[str, Any]:
    """
    Translates a signal's title and content to English if needed.

    Args:
        signal: The signal dict with 'language', 'title', and 'content' fields.

    Returns:
        The signal dict with translated title and content.
    """
    language = signal.get("language", "en")

    if language not in NON_ENGLISH_LANGUAGES:
        return signal

    try:
        from deep_translator import GoogleTranslator

        translator = GoogleTranslator(source=language, target="en")

        title = signal.get("title", "")
        content = signal.get("content", "")

        translated_title = translator.translate(title) if title else title
        translated_content = translator.translate(content[:500]) if content else content

        return {
            **signal,
            "title": translated_title or title,
            "content": translated_content or content,
            "original_language": language,
            "language": "en",
        }

    except Exception as e:
        logger.warning(
            "Translation failed, using original text",
            language=language,
            error=str(e),
        )
        return signal


async def translate_signals_batch(
    signals: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Translates a batch of signals to English.

    Args:
        signals: List of signal dicts.

    Returns:
        List of translated signal dicts.
    """
    import asyncio

    tasks = [translate_signal(s) for s in signals]
    return await asyncio.gather(*tasks)
