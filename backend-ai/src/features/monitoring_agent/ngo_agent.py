"""
NGODatabaseAgent — Queries structured NGO databases for documented violations.
Uses Web Scraper API and MCP Server for BHRRC, KnowTheChain, etc.
"""
from typing import Any
from src.integrations.web_unlocker import web_unlocker_client
from src.features.monitoring_agent.models import GNSHAgentState
from src.core.logger import logger

NGO_SOURCES = [
    {
        "name": "Business & Human Rights Resource Centre",
        "url": "https://www.business-humanrights.org/en/companies/?q={name}",
        "source_type": "international_ngo",
    },
    {
        "name": "Know The Chain",
        "url": "https://knowthechain.org/companies/?q={name}",
        "source_type": "international_ngo",
    },
    {
        "name": "Global Slavery Index",
        "url": "https://www.globalslaveryindex.org/search/?q={name}",
        "source_type": "international_ngo",
    },
]


async def ngo_agent_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    LangGraph node for querying NGO databases for documented violations.

    Args:
        state: The current GNSH agent state.

    Returns:
        Updated state with ngo_signals populated.
    """
    supplier_name = state.get("supplier_name", "")
    supplier_country = state.get("supplier_country", "US")

    logger.info("NGODatabaseAgent started", supplier=supplier_name)

    urls = [s["url"].format(name=supplier_name) for s in NGO_SOURCES]
    results = await web_unlocker_client.unlock_batch(urls)

    ngo_signals: list[dict[str, Any]] = []
    for i, result in enumerate(results):
        if result.get("content") and len(result["content"]) > 100:
            source = NGO_SOURCES[i]
            ngo_signals.append({
                "source": source["name"],
                "title": f"NGO report: {supplier_name} — {source['name']}",
                "category": "human_rights",
                "date": "",
                "severity": "medium",
                "url": result["url"],
                "source_type": source["source_type"],
                "content": result["content"][:300],
                "language": "en",
            })

    logger.info(
        "NGODatabaseAgent completed",
        supplier=supplier_name,
        signal_count=len(ngo_signals),
    )

    return {**state, "ngo_signals": ngo_signals}
