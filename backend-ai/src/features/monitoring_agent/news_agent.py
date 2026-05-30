"""
NewsSignalAgent — Collects news signals via Bright Data SERP API.
Queries in 4 languages: EN, ZH, AR, VI.
"""
import asyncio
from typing import Any
from src.integrations.serp_api import serp_api_client
from src.features.monitoring_agent.models import GNSHAgentState
from src.core.logger import logger

QUERY_TEMPLATES: dict[str, str] = {
    "en": '"{name}" violation OR "forced labor" OR "human rights" OR compliance',
    "zh": '"{name}" 违规 OR 劳工 OR 合规 OR 人权',
    "ar": '"{name}" انتهاك OR عمالة OR امتثال OR حقوق',
    "vi": '"{name}" vi phạm OR lao động OR tuân thủ OR nhân quyền',
}


async def news_agent_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    LangGraph node for collecting news signals via the SERP API.
    Runs queries in 4 languages in parallel for maximum geo-native coverage.

    Args:
        state: The current GNSH agent state.

    Returns:
        Updated state with news_signals populated.
    """
    supplier_name = state.get("supplier_name", "")
    supplier_country = state.get("supplier_country", "US")
    target_languages = state.get("target_languages", ["en"])

    logger.info(
        "NewsSignalAgent started",
        supplier=supplier_name,
        languages=target_languages,
    )

    queries = [
        {
            "query": QUERY_TEMPLATES.get(lang, QUERY_TEMPLATES["en"]).format(name=supplier_name),
            "language": lang,
            "country": supplier_country,
        }
        for lang in target_languages
        if lang in QUERY_TEMPLATES
    ]

    all_results = await serp_api_client.batch_search(queries)

    # Classify source type based on result position and language
    classified: list[dict[str, Any]] = []
    for result in all_results:
        source_type = "regional_media" if result.get("language") != "en" else "national_media"
        classified.append({**result, "source_type": source_type})

    logger.info(
        "NewsSignalAgent completed",
        supplier=supplier_name,
        signal_count=len(classified),
    )

    return {**state, "news_signals": classified}
