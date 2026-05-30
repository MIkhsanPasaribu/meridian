"""
Featherless AI integration (featherless.ai).

Serverless inference for open-source models, used as Meridian's open-source
inference layer (fast signal summarization and a fallback for the intelligence
layer). Fully OpenAI-compatible.

Docs: https://featherless.ai/docs  |  Base URL: https://api.featherless.ai/v1
"""
from openai import AsyncOpenAI
from src.core.config import settings
from src.core.logger import logger

_client: AsyncOpenAI | None = None


def get_featherless_client() -> AsyncOpenAI | None:
    """
    Returns a cached AsyncOpenAI client pointed at Featherless AI.

    Returns:
        Configured AsyncOpenAI client, or None when no API key is set.
    """
    global _client

    if not settings.featherless_api_key:
        return None

    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.featherless_api_key,
            base_url=settings.featherless_base_url,
        )

    return _client


async def featherless_completion(
    system_prompt: str,
    user_prompt: str,
    *,
    model: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.3,
) -> str:
    """
    Runs a chat completion against a Featherless-hosted open-source model.

    Args:
        system_prompt: System instruction defining the assistant persona.
        user_prompt: The user message / task prompt.
        model: Optional model override. Defaults to settings.featherless_model.
        max_tokens: Maximum tokens to generate.
        temperature: Sampling temperature.

    Returns:
        The generated assistant text, or an empty string on failure.

    Raises:
        RuntimeError: When the Featherless API key is not configured.
    """
    client = get_featherless_client()
    if client is None:
        raise RuntimeError("FEATHERLESS_API_KEY is not configured")

    selected_model = model or settings.featherless_model

    logger.info("Featherless inference", model=selected_model)

    response = await client.chat.completions.create(
        model=selected_model,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    if not response.choices:
        return ""

    return response.choices[0].message.content or ""


async def summarize_signals(signal_summary: str) -> str:
    """
    Produces a concise open-source-model summary of detected signals.
    Demonstrates Featherless serverless inference inside the GNSH pipeline.

    Args:
        signal_summary: Pre-formatted signal text to condense.

    Returns:
        A short risk summary, or an empty string when Featherless is unavailable.
    """
    client = get_featherless_client()
    if client is None:
        logger.warning("Featherless not configured, skipping signal summarization")
        return ""

    return await featherless_completion(
        system_prompt=(
            "You are an ESG risk analyst. Summarize the supplier compliance "
            "signals into 2-3 sentences highlighting the most severe risks."
        ),
        user_prompt=signal_summary,
        max_tokens=256,
    )
