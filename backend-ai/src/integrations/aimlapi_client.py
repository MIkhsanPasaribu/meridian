"""
AI/ML API integration (aimlapi.com).

OpenAI-compatible client used as Meridian's primary intelligence layer for
reasoning, extraction, and senior-analyst report generation. Replaces the
previous Anthropic/Claude dependency.

Docs: https://docs.aimlapi.com  |  Base URL: https://api.aimlapi.com/v1
"""
from typing import Any
from openai import AsyncOpenAI
from src.core.config import settings
from src.core.logger import logger

_client: AsyncOpenAI | None = None


def get_aimlapi_client() -> AsyncOpenAI | None:
    """
    Returns a cached AsyncOpenAI client pointed at the AI/ML API gateway.

    Returns:
        Configured AsyncOpenAI client, or None when no API key is set.
    """
    global _client

    if not settings.aimlapi_api_key:
        return None

    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.aimlapi_api_key,
            base_url=settings.aimlapi_base_url,
        )

    return _client


async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    *,
    model: str | None = None,
    max_tokens: int = 2048,
    temperature: float = 0.4,
) -> str:
    """
    Runs a single chat completion against the AI/ML API.

    Args:
        system_prompt: System instruction defining the assistant persona.
        user_prompt: The user message / task prompt.
        model: Optional model override. Defaults to settings.aimlapi_model.
        max_tokens: Maximum tokens to generate.
        temperature: Sampling temperature.

    Returns:
        The generated assistant text, or an empty string on failure.

    Raises:
        RuntimeError: When the AI/ML API key is not configured.
    """
    client = get_aimlapi_client()
    if client is None:
        raise RuntimeError("AIMLAPI_API_KEY is not configured")

    selected_model = model or settings.aimlapi_model

    logger.info("AI/ML API chat completion", model=selected_model)

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


async def extract_structured(
    instruction: str,
    content: str,
    *,
    model: str | None = None,
    max_tokens: int = 1024,
) -> str:
    """
    Reasoning/extraction helper for turning unstructured signal text into
    structured analyst output. Uses the configured reasoning model by default.

    Args:
        instruction: What to extract or how to reason about the content.
        content: The raw input text to analyze.
        model: Optional model override. Defaults to settings.aimlapi_reasoning_model.
        max_tokens: Maximum tokens to generate.

    Returns:
        The model's structured response text.
    """
    return await chat_completion(
        system_prompt=(
            "You are a precise data extraction engine. Follow the instruction "
            "exactly and return only the requested structured output."
        ),
        user_prompt=f"{instruction}\n\n---\n{content}",
        model=model or settings.aimlapi_reasoning_model,
        max_tokens=max_tokens,
        temperature=0.1,
    )


async def extract_json(
    instruction: str,
    content: str,
    *,
    model: str | None = None,
    max_tokens: int = 1024,
) -> dict[str, Any] | None:
    """
    Structured-output helper that asks the AI/ML API to return strict JSON and
    parses it. Powers the intelligence layer's extraction and classification
    workflows (e.g. signal enrichment).

    Args:
        instruction: The extraction instruction (must describe the JSON shape).
        content: The raw input text to analyze.
        model: Optional model override. Defaults to settings.aimlapi_reasoning_model.
        max_tokens: Maximum tokens to generate.

    Returns:
        Parsed JSON object, or None when no provider is available or parsing fails.
    """
    import json
    import re

    client = get_aimlapi_client()
    if client is None:
        return None

    selected_model = model or settings.aimlapi_reasoning_model

    try:
        response = await client.chat.completions.create(
            model=selected_model,
            max_tokens=max_tokens,
            temperature=0.0,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise extraction engine. Return ONLY valid "
                        "JSON matching the requested shape. No prose, no markdown."
                    ),
                },
                {"role": "user", "content": f"{instruction}\n\n---\n{content}"},
            ],
        )
    except Exception as e:
        # Some models reject response_format; retry without it.
        logger.warning("AI/ML API json mode failed, retrying as text", error=str(e))
        raw = await chat_completion(
            system_prompt=(
                "You are a precise extraction engine. Return ONLY valid JSON "
                "matching the requested shape. No prose, no markdown fences."
            ),
            user_prompt=f"{instruction}\n\n---\n{content}",
            model=selected_model,
            max_tokens=max_tokens,
            temperature=0.0,
        )
    else:
        raw = response.choices[0].message.content if response.choices else ""

    if not raw:
        return None

    # Strip markdown fences if the model wrapped the JSON.
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()

    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        logger.warning("AI/ML API returned non-JSON output", preview=cleaned[:120])
        return None
