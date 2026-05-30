"""
US UFLPA (Uyghur Forced Labor Prevention Act) report template.
Generates reports in US CBP (Customs and Border Protection) format.
"""

UFLPA_SYSTEM_PROMPT = """You are a US trade compliance specialist with expertise in UFLPA documentation.
Generate a compliance report in US CBP format for UFLPA due diligence.
Be precise, cite evidence, and flag gaps where documentation is insufficient.
Format the report in clean Markdown."""

UFLPA_TEMPLATE = """Generate a US UFLPA Compliance Report for:

**Company:** {supplier_name}
**Country:** {supplier_country}
**Industry:** {supplier_industry}
**VVS Score:** {vvs_score} ({vvs_stage})
**Report Date:** {report_date}

## Required UFLPA Sections

### 1. Supply Chain Traceability
Document the complete supply chain from raw materials to finished goods.
Identify any connections to the Xinjiang Uyghur Autonomous Region (XUAR).

### 2. Due Diligence Evidence
Provide evidence of due diligence measures to ensure no forced labor in the supply chain.

### 3. Rebuttable Presumption Documentation
If goods originate from XUAR, provide clear and convincing evidence that:
- The goods were not produced with forced labor
- The importer fully complied with CBP guidance

## Evidence Available
{signal_summary}

## Instructions
- Fill each section based on available evidence
- Flag gaps with [EVIDENCE REQUIRED] where documentation is insufficient
- Use US CBP UFLPA standard terminology
- Include specific dates, sources, and certifications where available
"""


def get_uflpa_prompt(
    supplier_name: str,
    supplier_country: str,
    supplier_industry: str,
    vvs_score: float,
    vvs_stage: str,
    signal_summary: str,
    report_date: str,
) -> tuple[str, str]:
    """
    Returns the system prompt and user prompt for UFLPA report generation.

    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    user_prompt = UFLPA_TEMPLATE.format(
        supplier_name=supplier_name,
        supplier_country=supplier_country,
        supplier_industry=supplier_industry,
        vvs_score=vvs_score,
        vvs_stage=vvs_stage,
        report_date=report_date,
        signal_summary=signal_summary,
    )

    return UFLPA_SYSTEM_PROMPT, user_prompt
