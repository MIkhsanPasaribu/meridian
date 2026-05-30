"""
VVS Stage Classifier — classifies signals into categories and severities.
Uses Groq (llama-3.3-70b) for fast preprocessing.
"""
from typing import Any
from src.core.config import settings
from src.core.logger import logger

# Keyword patterns for category classification
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "human_rights": [
        "forced labor", "human rights", "slavery", "trafficking", "child labor",
        "abuse", "exploitation", "detention", "torture", "discrimination",
        "强迫劳动", "人权", "奴役", "عمالة قسرية", "حقوق الإنسان",
    ],
    "environment": [
        "pollution", "environmental", "toxic", "waste", "emissions", "carbon",
        "deforestation", "contamination", "hazardous", "chemical spill",
        "污染", "环境", "有毒", "ô nhiễm", "môi trường",
    ],
    "labor_conditions": [
        "labor violation", "wage theft", "overtime", "unsafe conditions",
        "workplace accident", "strike", "union", "worker complaint",
        "劳工", "工资", "工人", "lao động", "điều kiện làm việc",
    ],
    "financial_distress": [
        "bankruptcy", "insolvency", "debt", "financial crisis", "layoffs",
        "restructuring", "default", "fraud", "corruption",
        "破产", "债务", "欺诈", "phá sản",
    ],
    "leadership_change": [
        "CEO resigned", "executive departure", "management change",
        "board resignation", "leadership transition",
        "CEO辞职", "管理层变动",
    ],
}

# Severity keywords
SEVERITY_KEYWORDS: dict[str, list[str]] = {
    "critical": [
        "arrested", "criminal", "indicted", "banned", "emergency",
        "death", "fatality", "forced labor confirmed", "government investigation",
    ],
    "high": [
        "fine", "penalty", "lawsuit", "investigation", "violation confirmed",
        "regulatory action", "audit failure",
    ],
    "medium": [
        "complaint", "allegation", "concern", "report", "warning",
        "inspection", "review",
    ],
    "low": [
        "rumor", "anonymous", "unverified", "claim", "potential",
        "possible", "might",
    ],
}


def classify_signal_category(text: str) -> str:
    """
    Classifies a signal text into a category based on keyword matching.

    Args:
        text: The signal text to classify.

    Returns:
        The most likely category string.
    """
    text_lower = text.lower()
    scores: dict[str, int] = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in text_lower)
        if score > 0:
            scores[category] = score

    if not scores:
        return "labor_conditions"  # Default category

    return max(scores, key=lambda k: scores[k])


def classify_signal_severity(text: str) -> str:
    """
    Classifies a signal text into a severity level based on keyword matching.

    Args:
        text: The signal text to classify.

    Returns:
        The severity level string.
    """
    text_lower = text.lower()

    for severity in ["critical", "high", "medium", "low"]:
        keywords = SEVERITY_KEYWORDS[severity]
        if any(kw.lower() in text_lower for kw in keywords):
            return severity

    return "medium"  # Default severity


def classify_signal(signal: dict[str, Any]) -> dict[str, Any]:
    """
    Classifies a signal dict with category and severity.

    Args:
        signal: The signal dict with at least 'title' and 'content' fields.

    Returns:
        The signal dict with 'category' and 'severity' added.
    """
    text = f"{signal.get('title', '')} {signal.get('content', '')}"

    return {
        **signal,
        "category": signal.get("category") or classify_signal_category(text),
        "severity": signal.get("severity") or classify_signal_severity(text),
    }
