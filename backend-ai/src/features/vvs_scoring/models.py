"""
Pydantic models for the VVS Scoring Engine.
"""
from pydantic import BaseModel, Field
from typing import Literal


SignalCategory = Literal[
    "human_rights",
    "environment",
    "labor_conditions",
    "financial_distress",
    "leadership_change",
]

SignalSeverity = Literal["critical", "high", "medium", "low"]

SourceType = Literal[
    "government_regulation",
    "national_media",
    "international_ngo",
    "regional_media",
    "social_media",
    "local_forum",
]

VvsStage = Literal["MURMUR", "RIPPLE", "WAVE", "SURGE"]


class Signal(BaseModel):
    """Represents a single compliance signal detected by an agent."""

    url: str = ""
    title: str
    content: str = ""
    category: SignalCategory
    severity: SignalSeverity
    source_type: SourceType
    language: str = "en"
    platform: str = ""
    date: str = ""
    sentiment_score: float = Field(default=0.0, ge=-1.0, le=1.0)
    relevance_score: float = Field(default=0.5, ge=0.0, le=1.0)


class VvsResult(BaseModel):
    """Result of the VVS scoring calculation."""

    score: float = Field(ge=0.0, le=100.0)
    stage: VvsStage
    delta: float = 0.0
    signal_count: int = 0
    category_breakdown: dict[str, int] = {}
    severity_breakdown: dict[str, int] = {}
    velocity_factor: float = 1.0
