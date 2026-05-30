"""
SocialSignalAgent — Accesses geo-native worker forums via Web Unlocker + Scraping Browser.
Uses Residential Proxies with local country IP for geo-native access.
"""
from typing import Any
from src.integrations.web_unlocker import web_unlocker_client
from src.features.monitoring_agent.models import GNSHAgentState
from src.core.logger import logger

# Regional sources mapped by country code
REGIONAL_SOURCES: dict[str, list[str]] = {
    "CN": [
        "https://weibo.com/search?q={name}",
        "https://www.maimai.cn/search/user?keywords={name}",
    ],
    "VN": [
        "https://vnexpress.net/search?q={name}",
    ],
    "ID": [
        "https://www.kompas.com/search?q={name}",
    ],
    "BD": [
        "https://www.thedailystar.net/search?q={name}",
    ],
    "IN": [
        "https://labour.gov.in/search?q={name}",
    ],
    "SA": [
        "https://www.saudigazette.com.sa/search?q={name}",
    ],
}

NGO_SOURCES = [
    "https://www.business-humanrights.org/en/companies/?q={name}",
    "https://knowthechain.org/companies/?q={name}",
]


async def social_agent_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    LangGraph node for collecting social signals from geo-native sources.
    Uses Web Unlocker with country-specific IP routing.

    Args:
        state: The current GNSH agent state.

    Returns:
        Updated state with social_signals populated.
    """
    supplier_name = state.get("supplier_name", "")
    supplier_country = state.get("supplier_country", "US")

    logger.info(
        "SocialSignalAgent started",
        supplier=supplier_name,
        country=supplier_country,
    )

    sources = REGIONAL_SOURCES.get(supplier_country, [])
    urls = [s.format(name=supplier_name) for s in sources[:3]]  # Limit to 3 sources

    if not urls:
        return {**state, "social_signals": []}

    results = await web_unlocker_client.unlock_batch(urls, country=supplier_country)

    social_signals: list[dict[str, Any]] = []
    for result in results:
        if result.get("content"):
            social_signals.append({
                "platform": result["url"].split("/")[2],
                "content": result["content"][:500],  # Truncate for storage
                "date": "",
                "sentiment_score": 0.0,
                "source_type": "social_media",
                "url": result["url"],
                "language": "zh" if supplier_country == "CN" else "en",
                "category": "labor_conditions",
                "severity": "medium",
                "title": f"Social signal from {result['url'].split('/')[2]}",
            })

    logger.info(
        "SocialSignalAgent completed",
        supplier=supplier_name,
        signal_count=len(social_signals),
    )

    return {**state, "social_signals": social_signals}
