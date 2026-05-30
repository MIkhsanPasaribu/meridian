"""
Meridian AI Backend — FastAPI application entry point.
Handles AI agent orchestration, VVS scoring, and report generation.
"""
import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.logger import logger
from src.core.redis_client import get_redis, close_redis
from src.lib.response import success_response, error_response


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — startup and shutdown events."""
    logger.info("🚀 Meridian AI Backend starting up")

    # Connect to Redis
    await get_redis()

    # Start background worker
    worker_task = asyncio.create_task(_start_worker_background())

    yield

    # Shutdown
    worker_task.cancel()
    await close_redis()
    logger.info("Meridian AI Backend shut down")


async def _start_worker_background() -> None:
    """Starts the BullMQ worker in the background."""
    try:
        from src.core.worker import start_worker
        await start_worker()
    except asyncio.CancelledError:
        logger.info("Worker stopped")
    except Exception as e:
        logger.error("Worker crashed", error=str(e))


app = FastAPI(
    title="Meridian AI Backend",
    description="GNSH Engine — Geo-Native Signal Harvesting for ESG Compliance",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return success_response(
        {"status": "ok", "version": "1.0.0", "service": "meridian-backend-ai"}
    )


@app.post("/api/v1/scan")
async def trigger_scan(payload: dict) -> dict:
    """
    Triggers a GNSH monitoring scan for a supplier.
    Called directly by the backend or via BullMQ worker.
    """
    from src.features.monitoring_agent.service import run_monitoring_scan

    try:
        result = await run_monitoring_scan(
            job_id=payload.get("jobId", ""),
            supplier_id=payload.get("supplierId", ""),
            supplier_name=payload.get("supplierName", ""),
            supplier_country=payload.get("supplierCountry", "US"),
            supplier_industry=payload.get("supplierIndustry", ""),
            target_languages=payload.get("targetLanguages", ["en"]),
        )

        return success_response(result, "Scan completed")

    except Exception as e:
        logger.error("Scan endpoint failed", error=str(e))
        return error_response("Scan failed", str(e))


@app.post("/api/v1/reports/generate")
async def generate_report(payload: dict) -> dict:
    """
    Generates an intelligence brief or regulation-specific compliance report
    using the AI/ML API intelligence layer (Featherless AI fallback).
    """
    from src.features.report_generator.report_chain import (
        generate_intelligence_brief,
        generate_compliance_report,
    )

    try:
        report_type = payload.get("reportType", "brief")
        common_args = dict(
            supplier_name=payload.get("supplierName", ""),
            supplier_country=payload.get("supplierCountry", "US"),
            supplier_industry=payload.get("supplierIndustry", ""),
            vvs_score=float(payload.get("vvsScore", 0)),
            vvs_stage=payload.get("vvsStage", "MURMUR"),
            signals=payload.get("signals", []),
        )

        if report_type in {"csddd", "uflpa", "lksg"}:
            brief = await generate_compliance_report(report_type=report_type, **common_args)
        else:
            brief = await generate_intelligence_brief(**common_args)

        return success_response({"brief": brief, "reportType": report_type}, "Report generated")

    except Exception as e:
        logger.error("Report generation failed", error=str(e))
        return error_response("Report generation failed", str(e))


@app.post("/api/v1/transcribe")
async def transcribe_evidence(payload: dict) -> dict:
    """
    Transcribes audio evidence (press conferences, worker testimony, broadcasts)
    into text using Speechmatics, then uses the AI/ML API intelligence layer to
    extract a structured compliance signal from the transcript.

    Expects a base64-encoded `audioBase64` field and optional `language`,
    `supplierName`, and `sourceUrl`.
    """
    import base64
    from src.features.audio_evidence import transcribe_and_extract
    from src.integrations.speechmatics_client import is_configured

    if not is_configured():
        return error_response("Transcription unavailable", "SPEECHMATICS_API_KEY not configured")

    try:
        audio_b64 = payload.get("audioBase64", "")
        if not audio_b64:
            return error_response("Transcription failed", "Missing audioBase64")

        audio_bytes = base64.b64decode(audio_b64)
        result = await transcribe_and_extract(
            audio_bytes,
            filename=payload.get("filename", "evidence.wav"),
            language=payload.get("language", "en"),
            supplier_name=payload.get("supplierName", ""),
            source_url=payload.get("sourceUrl", ""),
        )

        return success_response(
            {"transcript": result.transcript, "signal": result.signal},
            "Transcription completed",
        )

    except Exception as e:
        logger.error("Transcription failed", error=str(e))
        return error_response("Transcription failed", str(e))
