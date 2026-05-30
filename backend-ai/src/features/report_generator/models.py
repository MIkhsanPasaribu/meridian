"""Pydantic models for the report generator."""
from pydantic import BaseModel
from typing import Any


class ReportRequest(BaseModel):
    """Request model for report generation."""
    supplier_name: str
    supplier_country: str
    supplier_industry: str
    vvs_score: float = 0.0
    vvs_stage: str = "MURMUR"
    signals: list[dict[str, Any]] = []
    regulation: str = "BRIEF"
