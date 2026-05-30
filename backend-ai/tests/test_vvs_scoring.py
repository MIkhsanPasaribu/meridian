"""
Unit tests for the VVS scoring engine — verifies score bounds and stage
classification remain correct after the pipeline changes.
"""
from src.features.vvs_scoring.scoring_engine import calculate_vvs, classify_stage
from src.features.vvs_scoring.models import Signal


def test_classify_stage_boundaries():
    assert classify_stage(0) == "MURMUR"
    assert classify_stage(25) == "MURMUR"
    assert classify_stage(26) == "RIPPLE"
    assert classify_stage(50) == "RIPPLE"
    assert classify_stage(51) == "WAVE"
    assert classify_stage(75) == "WAVE"
    assert classify_stage(76) == "SURGE"
    assert classify_stage(100) == "SURGE"


def test_calculate_vvs_empty_signals():
    result = calculate_vvs([])
    assert result.score == 0.0
    assert result.stage == "MURMUR"
    assert result.signal_count == 0


def test_calculate_vvs_never_exceeds_100():
    signals = [
        Signal(
            title=f"Critical violation {i}",
            category="human_rights",
            severity="critical",
            source_type="government_regulation",
            relevance_score=1.0,
            date="2026-05-01",
        )
        for i in range(50)
    ]
    result = calculate_vvs(signals)
    assert 0.0 <= result.score <= 100.0


def test_calculate_vvs_critical_outweighs_low():
    critical = [
        Signal(
            title="Forced labor confirmed",
            category="human_rights",
            severity="critical",
            source_type="government_regulation",
            relevance_score=1.0,
        )
    ]
    low = [
        Signal(
            title="Unverified rumor",
            category="leadership_change",
            severity="low",
            source_type="local_forum",
            relevance_score=0.1,
        )
    ]
    assert calculate_vvs(critical).score > calculate_vvs(low).score
