"""
VVS (Violation Velocity Score) Scoring Engine.
Calculates a 0-100 risk score from collected compliance signals.
"""
from datetime import datetime, timezone
from collections import Counter
from src.features.vvs_scoring.models import Signal, VvsResult, VvsStage


CATEGORY_WEIGHTS: dict[str, float] = {
    "human_rights": 0.35,
    "environment": 0.25,
    "labor_conditions": 0.20,
    "financial_distress": 0.15,
    "leadership_change": 0.05,
}

SEVERITY_WEIGHTS: dict[str, float] = {
    "critical": 1.0,
    "high": 0.7,
    "medium": 0.4,
    "low": 0.15,
}

SOURCE_WEIGHTS: dict[str, float] = {
    "government_regulation": 1.0,
    "national_media": 0.85,
    "international_ngo": 0.75,
    "regional_media": 0.60,
    "social_media": 0.40,
    "local_forum": 0.30,
}

MURMUR_MAX = 25.0
RIPPLE_MAX = 50.0
WAVE_MAX = 75.0


def classify_stage(score: float) -> VvsStage:
    """
    Classifies a VVS score into a risk stage.

    Args:
        score: The VVS score (0-100).

    Returns:
        The corresponding VVS stage.
    """
    if score <= MURMUR_MAX:
        return "MURMUR"
    if score <= RIPPLE_MAX:
        return "RIPPLE"
    if score <= WAVE_MAX:
        return "WAVE"
    return "SURGE"


def calculate_velocity(signals: list[Signal]) -> float:
    """
    Calculates the velocity factor based on signal accumulation rate.
    More signals in a shorter time window = higher velocity.

    Args:
        signals: List of signals with date information.

    Returns:
        Velocity multiplier (1.0 to 3.0).
    """
    if len(signals) < 2:
        return 1.0

    # Count signals per day bucket
    recent_count = sum(1 for s in signals if s.date)
    total = len(signals)

    if total == 0:
        return 1.0

    # Velocity increases with signal density
    density = recent_count / max(total, 1)
    velocity = 1.0 + (density * 2.0)

    return min(3.0, velocity)


def calculate_vvs(signals: list[Signal], previous_score: float = 0.0) -> VvsResult:
    """
    Calculates the Violation Velocity Score from a list of signals.

    Formula:
        raw_score = Σ (category_weight × severity_weight × source_weight)
        final_score = min(100, raw_score × velocity_factor)

    Args:
        signals: List of compliance signals from all agents.
        previous_score: The previous VVS score for delta calculation.

    Returns:
        VvsResult with score, stage, delta, and breakdowns.
    """
    if not signals:
        return VvsResult(
            score=0.0,
            stage="MURMUR",
            delta=0.0 - previous_score,
            signal_count=0,
        )

    velocity_factor = calculate_velocity(signals)

    raw_score = sum(
        CATEGORY_WEIGHTS.get(s.category, 0.1)
        * SEVERITY_WEIGHTS.get(s.severity, 0.1)
        * SOURCE_WEIGHTS.get(s.source_type, 0.1)
        * (1.0 + s.relevance_score)
        for s in signals
    )

    # Scale: each signal contributes ~5-10 points at max weights
    scaled_score = raw_score * 10.0
    final_score = min(100.0, round(scaled_score * velocity_factor, 2))

    stage = classify_stage(final_score)
    delta = round(final_score - previous_score, 2)

    category_breakdown = dict(Counter(s.category for s in signals))
    severity_breakdown = dict(Counter(s.severity for s in signals))

    return VvsResult(
        score=final_score,
        stage=stage,
        delta=delta,
        signal_count=len(signals),
        category_breakdown=category_breakdown,
        severity_breakdown=severity_breakdown,
        velocity_factor=velocity_factor,
    )
