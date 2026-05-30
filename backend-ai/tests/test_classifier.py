"""
Tests for the deterministic keyword signal classifier.
"""
from src.features.vvs_scoring.classifier import (
    classify_signal_category,
    classify_signal_severity,
    classify_signal,
)


class TestClassifyCategory:
    """Tests for signal category classification."""

    def test_human_rights_keywords(self) -> None:
        assert classify_signal_category("forced labor violation detected") == "human_rights"
        assert classify_signal_category("human rights abuse reported") == "human_rights"

    def test_environment_keywords(self) -> None:
        assert classify_signal_category("environmental pollution found") == "environment"
        assert classify_signal_category("carbon emissions exceed limits") == "environment"

    def test_labor_keywords(self) -> None:
        assert classify_signal_category("workers on strike over wages") == "labor_conditions"

    def test_financial_keywords(self) -> None:
        assert classify_signal_category("company facing bankruptcy") == "financial_distress"
        assert classify_signal_category("fraud investigation launched") == "financial_distress"

    def test_default_category(self) -> None:
        # Unknown text defaults to labor_conditions
        assert classify_signal_category("some random text") == "labor_conditions"


class TestClassifySeverity:
    """Tests for signal severity classification."""

    def test_critical_keywords(self) -> None:
        assert classify_signal_severity("company products banned at the border") == "critical"
        assert classify_signal_severity("criminal charges and arrested") == "critical"

    def test_high_keywords(self) -> None:
        assert classify_signal_severity("investigation opened by authorities") == "high"
        assert classify_signal_severity("fine imposed for violation") == "high"

    def test_default_medium(self) -> None:
        assert classify_signal_severity("some complaint filed") == "medium"


class TestClassifySignal:
    """Tests for the combined signal classifier."""

    def test_adds_category_and_severity(self) -> None:
        result = classify_signal({"title": "forced labor confirmed", "content": "arrested"})
        assert result["category"] == "human_rights"
        assert result["severity"] == "critical"

    def test_preserves_existing_classification(self) -> None:
        result = classify_signal(
            {"title": "x", "content": "y", "category": "environment", "severity": "low"}
        )
        assert result["category"] == "environment"
        assert result["severity"] == "low"
