"""
Germany LkSG (Lieferkettensorgfaltspflichtengesetz) report template.
Generates reports in BAFA (Bundesamt für Wirtschaft und Ausfuhrkontrolle) format.
"""

LKSG_SYSTEM_PROMPT = """You are a German supply chain compliance specialist with expertise in LkSG reporting.
Generate a compliance report in BAFA format for the Lieferkettensorgfaltspflichtengesetz.
Be precise, cite evidence, and flag gaps where documentation is insufficient.
Format the report in clean Markdown."""

LKSG_TEMPLATE = """Generate a Germany LkSG Compliance Report for:

**Company:** {supplier_name}
**Country:** {supplier_country}
**Industry:** {supplier_industry}
**VVS Score:** {vvs_score} ({vvs_stage})
**Report Date:** {report_date}

## Required LkSG Sections (BAFA Format)

### 1. Risk Management Process (§ 4 LkSG)
Document the risk analysis process for identifying human rights and environmental risks.

### 2. Preventive Measures (§ 6 LkSG)
Describe preventive measures implemented to address identified risks.

### 3. Remediation Measures (§ 7 LkSG)
Document remediation actions taken when violations were identified.

### 4. Complaint Procedure (§ 8 LkSG)
Describe the grievance mechanism and how it has been communicated.

## Evidence Available
{signal_summary}

## Instructions
- Fill each section based on available evidence
- Flag gaps with [NACHWEIS ERFORDERLICH] where documentation is insufficient
- Use BAFA LkSG standard terminology
- Include specific dates, sources, and certifications where available
"""


def get_lksg_prompt(
    supplier_name: str,
    supplier_country: str,
    supplier_industry: str,
    vvs_score: float,
    vvs_stage: str,
    signal_summary: str,
    report_date: str,
) -> tuple[str, str]:
    """
    Returns the system prompt and user prompt for LkSG report generation.

    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    user_prompt = LKSG_TEMPLATE.format(
        supplier_name=supplier_name,
        supplier_country=supplier_country,
        supplier_industry=supplier_industry,
        vvs_score=vvs_score,
        vvs_stage=vvs_stage,
        report_date=report_date,
        signal_summary=signal_summary,
    )

    return LKSG_SYSTEM_PROMPT, user_prompt
