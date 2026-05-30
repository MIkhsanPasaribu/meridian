"""
EU CSDDD (Corporate Sustainability Due Diligence Directive) report template.
Generates reports in EFRAG CSRD standard format.
"""

CSDDD_SYSTEM_PROMPT = """You are a senior ESG compliance specialist with expertise in EU CSDDD reporting.
Generate a compliance report in EFRAG CSRD standard format.
Be precise, cite evidence, and flag gaps where documentation is insufficient.
Format the report in clean Markdown."""

CSDDD_TEMPLATE = """Generate an EU CSDDD Compliance Report for:

**Company:** {supplier_name}
**Country:** {supplier_country}
**Industry:** {supplier_industry}
**VVS Score:** {vvs_score} ({vvs_stage})
**Report Date:** {report_date}

## Required CSDDD Sections

### 1. Adverse Impact Identification
Identify actual and potential adverse human rights and environmental impacts.

### 2. Due Diligence Process
Document the due diligence measures taken to prevent, mitigate, and remediate impacts.

### 3. Remediation Plan
Describe remediation actions for identified adverse impacts.

### 4. Grievance Mechanism
Document the complaint procedure and how it has been communicated to stakeholders.

## Evidence Available
{signal_summary}

## Instructions
- Fill each section based on available evidence
- Flag gaps with [EVIDENCE REQUIRED] where documentation is insufficient
- Use EFRAG CSRD standard terminology
- Include specific dates and sources where available
"""


def get_csddd_prompt(
    supplier_name: str,
    supplier_country: str,
    supplier_industry: str,
    vvs_score: float,
    vvs_stage: str,
    signal_summary: str,
    report_date: str,
) -> tuple[str, str]:
    """
    Returns the system prompt and user prompt for CSDDD report generation.

    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    user_prompt = CSDDD_TEMPLATE.format(
        supplier_name=supplier_name,
        supplier_country=supplier_country,
        supplier_industry=supplier_industry,
        vvs_score=vvs_score,
        vvs_stage=vvs_stage,
        report_date=report_date,
        signal_summary=signal_summary,
    )

    return CSDDD_SYSTEM_PROMPT, user_prompt
