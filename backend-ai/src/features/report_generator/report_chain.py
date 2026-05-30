"""
Report Generator — uses the AI/ML API (aimlapi.com) intelligence layer to
generate senior-analyst intelligence briefs and regulation-specific compliance
reports. Falls back to Featherless AI open-source inference, then to a
deterministic placeholder when no provider is configured.
"""
from typing import Any
from datetime import datetime, timezone
from src.integrations.aimlapi_client import chat_completion, get_aimlapi_client
from src.integrations.featherless_client import (
    featherless_completion,
    get_featherless_client,
)
from src.features.report_generator.templates.csddd_template import get_csddd_prompt
from src.features.report_generator.templates.uflpa_template import get_uflpa_prompt
from src.features.report_generator.templates.lksg_template import get_lksg_prompt
from src.core.logger import logger

BRIEF_SYSTEM_PROMPT = """You are a senior ESG compliance analyst at a top-tier consulting firm.
You write precise, authoritative intelligence briefs for Fortune 500 procurement and compliance teams.
Your writing is clear, data-driven, and actionable. You never speculate without evidence.
Format your response in clean Markdown."""

BRIEF_USER_TEMPLATE = """Generate a Compliance Intelligence Brief for the following supplier:

**Supplier:** {supplier_name}
**Country:** {supplier_country}
**Industry:** {supplier_industry}
**VVS Score:** {vvs_score} ({vvs_stage})
**Signals Detected:** {signal_count}

**Signal Summary:**
{signal_summary}

Generate a brief with these sections:
1. Executive Summary (2-3 paragraphs, senior analyst tone)
2. Key Risk Findings (bullet points with evidence)
3. VVS Stage Analysis (explain what the score means)
4. Applicable Regulations (CSDDD, UFLPA, LkSG — which apply and why)
5. Recommended Actions (prioritized, actionable)

Be specific, cite the signals, and maintain a professional tone."""

# Report type → template prompt builder
_REPORT_BUILDERS = {
    "csddd": get_csddd_prompt,
    "uflpa": get_uflpa_prompt,
    "lksg": get_lksg_prompt,
}


async def _run_llm(system_prompt: str, user_prompt: str, max_tokens: int = 2048) -> str | None:
    """
    Routes a generation request through the configured providers in priority
    order: AI/ML API (primary) → Featherless AI (open-source fallback).

    Returns:
        Generated Markdown text, or None when no provider is configured/usable.
    """
    if get_aimlapi_client() is not None:
        try:
            text = await chat_completion(system_prompt, user_prompt, max_tokens=max_tokens)
            if text:
                return text
        except Exception as e:
            logger.error("AI/ML API generation failed, trying Featherless", error=str(e))

    if get_featherless_client() is not None:
        try:
            text = await featherless_completion(system_prompt, user_prompt, max_tokens=max_tokens)
            if text:
                return text
        except Exception as e:
            logger.error("Featherless generation failed", error=str(e))

    return None


async def generate_intelligence_brief(
    supplier_name: str,
    supplier_country: str,
    supplier_industry: str,
    vvs_score: float,
    vvs_stage: str,
    signals: list[dict[str, Any]],
) -> str:
    """
    Generates a senior analyst-style intelligence brief.

    Args:
        supplier_name: The supplier's name.
        supplier_country: ISO country code.
        supplier_industry: Industry category.
        vvs_score: Current VVS score.
        vvs_stage: Current VVS stage (MURMUR/RIPPLE/WAVE/SURGE).
        signals: List of detected compliance signals.

    Returns:
        Intelligence brief as Markdown string.
    """
    signal_summary = _format_signal_summary(signals)

    prompt = BRIEF_USER_TEMPLATE.format(
        supplier_name=supplier_name,
        supplier_country=supplier_country,
        supplier_industry=supplier_industry,
        vvs_score=vvs_score,
        vvs_stage=vvs_stage,
        signal_count=len(signals),
        signal_summary=signal_summary,
    )

    logger.info("Generating intelligence brief", supplier=supplier_name)

    brief = await _run_llm(BRIEF_SYSTEM_PROMPT, prompt, max_tokens=2048)

    if brief:
        logger.info("Intelligence brief generated", supplier=supplier_name, length=len(brief))
        return brief

    logger.warning("No AI provider configured, returning placeholder brief")
    return _generate_placeholder_brief(supplier_name, vvs_score, vvs_stage, signals)


async def generate_compliance_report(
    report_type: str,
    supplier_name: str,
    supplier_country: str,
    supplier_industry: str,
    vvs_score: float,
    vvs_stage: str,
    signals: list[dict[str, Any]],
) -> str:
    """
    Generates a regulation-specific compliance report (CSDDD / UFLPA / LkSG).

    Args:
        report_type: One of "csddd", "uflpa", "lksg".
        supplier_name: The supplier's name.
        supplier_country: ISO country code.
        supplier_industry: Industry category.
        vvs_score: Current VVS score.
        vvs_stage: Current VVS stage.
        signals: List of detected compliance signals.

    Returns:
        Compliance report as Markdown string.

    Raises:
        ValueError: When report_type is not supported.
    """
    builder = _REPORT_BUILDERS.get(report_type.lower())
    if builder is None:
        raise ValueError(f"Unsupported report type: {report_type}")

    report_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    signal_summary = _format_signal_summary(signals)

    system_prompt, user_prompt = builder(
        supplier_name=supplier_name,
        supplier_country=supplier_country,
        supplier_industry=supplier_industry,
        vvs_score=vvs_score,
        vvs_stage=vvs_stage,
        signal_summary=signal_summary,
        report_date=report_date,
    )

    logger.info("Generating compliance report", supplier=supplier_name, type=report_type)

    report = await _run_llm(system_prompt, user_prompt, max_tokens=3072)

    if report:
        return report

    logger.warning("No AI provider configured, returning placeholder report")
    return (
        f"# {report_type.upper()} Compliance Report: {supplier_name}\n\n"
        f"**VVS Score:** {vvs_score} ({vvs_stage})\n"
        f"**Report Date:** {report_date}\n\n"
        f"{signal_summary}\n\n"
        "*Configure AIMLAPI_API_KEY or FEATHERLESS_API_KEY for full AI-generated reports.*\n"
    )


def _format_signal_summary(signals: list[dict[str, Any]]) -> str:
    """Formats signals into a readable summary for the model prompt."""
    if not signals:
        return "No signals detected in this monitoring cycle."

    lines = []
    for i, signal in enumerate(signals[:10], 1):  # Limit to top 10
        lines.append(
            f"{i}. [{signal.get('severity', 'medium').upper()}] "
            f"{signal.get('title', 'Signal')} "
            f"(Source: {signal.get('source_type', 'unknown')}, "
            f"Category: {signal.get('category', 'unknown')})"
        )

    return "\n".join(lines)


def _generate_placeholder_brief(
    supplier_name: str,
    vvs_score: float,
    vvs_stage: str,
    signals: list[dict[str, Any]],
) -> str:
    """Generates a placeholder brief when no AI provider is available."""
    return f"""# Compliance Intelligence Brief: {supplier_name}

**VVS Score:** {vvs_score} ({vvs_stage})
**Signals Detected:** {len(signals)}
**Generated:** Meridian v1.0 (Demo Mode)

## Executive Summary

Meridian has completed an automated compliance scan for **{supplier_name}**.
The current Violation Velocity Score of **{vvs_score}** places this supplier
in the **{vvs_stage}** risk stage.

{len(signals)} compliance signals were detected across news, social media,
NGO databases, and regulatory filings during this monitoring cycle.

## Key Risk Findings

{chr(10).join(f"- {s.get('title', 'Signal detected')}" for s in signals[:5]) or "- No critical signals detected in this cycle."}

## Recommended Actions

1. Continue standard monitoring schedule
2. Review any flagged signals with your compliance team
3. Update supplier questionnaire if VVS exceeds 50

---
*Generated by Meridian AI | Configure AIMLAPI_API_KEY (AI/ML API) or FEATHERLESS_API_KEY for full AI-powered briefs*
"""
