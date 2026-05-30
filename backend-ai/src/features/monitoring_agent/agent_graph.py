"""
GNSH Engine — LangGraph StateGraph orchestrating all monitoring agents.
Agents run in parallel where possible, then feed into AI enrichment and VVS scoring.

Graph flow:
    news → social → ngo → regulatory   (Bright Data harvesting agents)
        → aggregate_signals
        → enrich_signals    (AI/ML API intelligence layer — reasoning/extraction)
        → vvs_scoring
        → digest_signals    (Featherless AI open-source serverless inference)
        → END
"""
from langgraph.graph import StateGraph, END
from src.features.monitoring_agent.models import GNSHAgentState
from src.features.monitoring_agent.news_agent import news_agent_node
from src.features.monitoring_agent.social_agent import social_agent_node
from src.features.monitoring_agent.ngo_agent import ngo_agent_node
from src.features.monitoring_agent.regulatory_agent import regulatory_agent_node
from src.core.logger import logger
from datetime import datetime, timezone


async def aggregate_signals_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    Aggregates all agent outputs into a single signals list.
    Runs after all parallel agents complete.
    """
    all_signals = [
        *state.get("news_signals", []),
        *state.get("social_signals", []),
        *state.get("ngo_signals", []),
        *state.get("regulatory_signals", []),
    ]

    logger.info(
        "Signals aggregated",
        supplier=state.get("supplier_name"),
        total_signals=len(all_signals),
    )

    return {**state, "all_signals": all_signals}


async def enrich_signals_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    Intelligence layer — enriches every aggregated signal with AI/ML API
    reasoning (category, severity, sentiment, ESG summary). Falls back to the
    deterministic keyword classifier when the AI/ML API is not configured.
    """
    from src.features.vvs_scoring.ai_classifier import enrich_signals_batch

    all_signals = state.get("all_signals", [])
    enriched = await enrich_signals_batch(all_signals)

    ai_count = sum(1 for s in enriched if s.get("enriched_by") == "aimlapi")
    logger.info(
        "Signals enriched",
        supplier=state.get("supplier_name"),
        total=len(enriched),
        ai_enriched=ai_count,
    )

    return {**state, "all_signals": enriched}


async def vvs_scoring_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    Calculates the VVS score from enriched signals.
    """
    from src.features.vvs_scoring.scoring_engine import calculate_vvs
    from src.features.vvs_scoring.models import Signal

    all_signals = state.get("all_signals", [])

    signal_objects = []
    for s in all_signals:
        try:
            signal_objects.append(Signal(
                url=s.get("url", ""),
                title=s.get("title", "Signal"),
                content=s.get("content", ""),
                category=s.get("category", "labor_conditions"),
                severity=s.get("severity", "medium"),
                source_type=s.get("source_type", "social_media"),
                language=s.get("language", "en"),
                platform=s.get("platform", ""),
                date=s.get("date", ""),
                relevance_score=float(s.get("relevance_score", 0.5)),
            ))
        except Exception:
            continue

    result = calculate_vvs(signal_objects)

    return {
        **state,
        "vvs_score": result.score,
        "vvs_stage": result.stage,
        "vvs_delta": result.delta,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }


async def digest_signals_node(state: GNSHAgentState) -> GNSHAgentState:
    """
    Open-source inference layer — uses Featherless AI to produce a short
    natural-language risk digest of the scored signals. No-op (empty digest)
    when Featherless is not configured.
    """
    from src.integrations.featherless_client import summarize_signals

    all_signals = state.get("all_signals", [])
    if not all_signals:
        return {**state, "signal_digest": ""}

    lines = [
        f"- [{s.get('severity', 'medium').upper()}] {s.get('title', 'Signal')} "
        f"({s.get('category', 'unknown')}, via {s.get('source_type', 'unknown')})"
        for s in all_signals[:15]
    ]
    summary_input = (
        f"Supplier: {state.get('supplier_name')} | "
        f"VVS: {state.get('vvs_score')} ({state.get('vvs_stage')})\n"
        + "\n".join(lines)
    )

    try:
        digest = await summarize_signals(summary_input)
    except Exception as e:
        logger.warning("Featherless digest failed", error=str(e))
        digest = ""

    logger.info("Signal digest generated", supplier=state.get("supplier_name"), length=len(digest))
    return {**state, "signal_digest": digest}


def build_gnsh_graph() -> StateGraph:
    """
    Builds and compiles the GNSH LangGraph StateGraph.

    Graph structure:
        START → news_agent → social_agent → ngo_agent → regulatory_agent
              → aggregate_signals
              → enrich_signals   (AI/ML API)
              → vvs_scoring
              → digest_signals   (Featherless AI)
              → END
    """
    graph = StateGraph(GNSHAgentState)

    # Add agent nodes
    graph.add_node("news_agent", news_agent_node)
    graph.add_node("social_agent", social_agent_node)
    graph.add_node("ngo_agent", ngo_agent_node)
    graph.add_node("regulatory_agent", regulatory_agent_node)
    graph.add_node("aggregate_signals", aggregate_signals_node)
    graph.add_node("enrich_signals", enrich_signals_node)
    graph.add_node("vvs_scoring", vvs_scoring_node)
    graph.add_node("digest_signals", digest_signals_node)

    # Set entry point — fan out to all agents in parallel
    graph.set_entry_point("news_agent")

    # Sequential for now (parallel requires Send API in LangGraph)
    graph.add_edge("news_agent", "social_agent")
    graph.add_edge("social_agent", "ngo_agent")
    graph.add_edge("ngo_agent", "regulatory_agent")
    graph.add_edge("regulatory_agent", "aggregate_signals")
    graph.add_edge("aggregate_signals", "enrich_signals")
    graph.add_edge("enrich_signals", "vvs_scoring")
    graph.add_edge("vvs_scoring", "digest_signals")
    graph.add_edge("digest_signals", END)

    return graph.compile()


# Singleton compiled graph
gnsh_graph = build_gnsh_graph()
