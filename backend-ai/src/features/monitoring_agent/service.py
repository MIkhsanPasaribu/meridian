"""
Monitoring agent service — orchestrates the GNSH engine for a supplier scan.
"""
from typing import Any
from src.features.monitoring_agent.agent_graph import gnsh_graph
from src.features.monitoring_agent.models import GNSHAgentState
from src.core.logger import logger


async def run_monitoring_scan(
    job_id: str,
    supplier_id: str,
    supplier_name: str,
    supplier_country: str,
    supplier_industry: str,
    target_languages: list[str] | None = None,
    target_platforms: list[str] | None = None,
) -> dict[str, Any]:
    """
    Runs a full GNSH monitoring scan for a supplier.

    Args:
        job_id: The BullMQ job ID.
        supplier_id: The supplier's database ID.
        supplier_name: The supplier's name for search queries.
        supplier_country: ISO 2-letter country code.
        supplier_industry: Industry category.
        target_languages: Languages to query (default: en, zh, ar, vi).
        target_platforms: Specific platforms to monitor.

    Returns:
        Dict with vvs_score, vvs_stage, all_signals, and metadata.
    """
    if target_languages is None:
        target_languages = ["en", "zh", "ar", "vi"]

    if target_platforms is None:
        target_platforms = []

    initial_state: GNSHAgentState = {
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "supplier_country": supplier_country,
        "supplier_industry": supplier_industry,
        "target_languages": target_languages,
        "target_platforms": target_platforms,
        "job_id": job_id,
        "news_signals": [],
        "social_signals": [],
        "ngo_signals": [],
        "regulatory_signals": [],
        "all_signals": [],
        "vvs_score": 0.0,
        "vvs_stage": "MURMUR",
        "vvs_delta": 0.0,
        "brief_markdown": "",
        "evidence_urls": [],
        "signal_digest": "",
        "error": None,
        "completed_at": None,
    }

    logger.info(
        "GNSH scan started",
        job_id=job_id,
        supplier=supplier_name,
        country=supplier_country,
    )

    try:
        final_state = await gnsh_graph.ainvoke(initial_state)

        logger.info(
            "GNSH scan completed",
            job_id=job_id,
            supplier=supplier_name,
            vvs_score=final_state.get("vvs_score"),
            vvs_stage=final_state.get("vvs_stage"),
            signal_count=len(final_state.get("all_signals", [])),
        )

        return dict(final_state)

    except Exception as e:
        logger.error("GNSH scan failed", job_id=job_id, error=str(e))
        return {**initial_state, "error": str(e)}
