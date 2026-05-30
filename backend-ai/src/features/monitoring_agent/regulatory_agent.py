"""
RegulatoryFilingAgent — Checks regulatory databases for enforcement actions.
Uses SERP API and Web Unlocker to access government portals.
"""
from typing import Any
from src.integrations.serp_api import serp_api_client
from src.features.monitoring_agent.models import GNSHAgentState
from src.core.logger import logger

REGULATORY_QUERIES = [
    '"{name}" UFLPA OR "forced labor" site:cbp.gov',
    '"{name}" CSDDD OR "due diligence" site:ec.europa.eu',
    '"{name}" LkSG OR Lieferkette site:bafa.de',
    '"{name}" labor violation OR fine OR investigation',
]


async def regulatory_agent_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    LangGraph node for checking regulatory databases and government portals.

    Args:
        state: The current GNSH agent state.

    Returns:
        Updated state with regulatory_signals populated.
    """
    supplier_name = state.get("supplier_name", "")
    supplier_country = state.get("supplier_country", "US")

    logger.info("RegulatoryFilingAgent started", supplier=supplier_name)

    queries = [
        {
            "query": q.format(name=supplier_name),
            "language": "en",
            "country": supplier_country,
        }
        for q in REGULATORY_QUERIES
    ]

    results = await serp_api_client.batch_search(queries)

    regulatory_signals: list[dict[str, Any]] = []
    for result in results:
        if result.get("url") and ("gov" in result.get("url", "") or "europa.eu" in result.get("url", "")):
            regulatory_signals.append({
                "regulation_type": _detect_regulation(result.get("url", "")),
                "status": "investigation",
                "date": result.get("date", ""),
                "action_required": True,
                "source_url": result.get("url", ""),
                "source_type": "government_regulation",
                "title": result.get("title", ""),
                "content": result.get("snippet", ""),
                "language": "en",
                "category": "human_rights",
                "severity": "high",
            })

    logger.info(
        "RegulatoryFilingAgent completed",
        supplier=supplier_name,
        signal_count=len(regulatory_signals),
    )

    return {**state, "regulatory_signals": regulatory_signals}


def _detect_regulation(url: str) -> str:
    """Detects the applicable regulation from the URL domain."""
    if "cbp.gov" in url or "dol.gov" in url:
        return "UFLPA"
    if "europa.eu" in url or "efrag.org" in url:
        return "CSDDD"
    if "bafa.de" in url:
        return "LkSG"
    return "UNKNOWN"
