"""
Pydantic models for the GNSH monitoring agent state.
"""
from typing import TypedDict, Any


class GNSHAgentState(TypedDict, total=False):
    """
    Shared state for the LangGraph GNSH agent graph.
    Each agent node reads from and writes to this state.
    """

    # Input fields
    supplier_id: str
    supplier_name: str
    supplier_country: str
    supplier_industry: str
    target_languages: list[str]
    target_platforms: list[str]
    job_id: str

    # Agent output fields (populated as graph executes)
    news_signals: list[dict[str, Any]]
    social_signals: list[dict[str, Any]]
    ngo_signals: list[dict[str, Any]]
    regulatory_signals: list[dict[str, Any]]

    # Aggregated signals
    all_signals: list[dict[str, Any]]

    # VVS scoring output
    vvs_score: float
    vvs_stage: str
    vvs_delta: float

    # Report output
    brief_markdown: str
    evidence_urls: list[str]

    # Open-source inference digest (Featherless AI)
    signal_digest: str

    # Metadata
    error: str | None
    completed_at: str | None
