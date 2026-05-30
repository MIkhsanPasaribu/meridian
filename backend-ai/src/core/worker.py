"""
BullMQ job consumer for the Meridian AI backend.
Consumes monitoring_jobs and report_jobs from Redis queues using the official
bullmq library (full BullMQ v5 protocol support).
"""
import asyncio
from typing import Any
from src.core.config import settings
from src.core.logger import logger

MONITORING_QUEUE = "monitoring_jobs"
REPORT_QUEUE = "report_jobs"


async def process_monitoring_job(payload: dict[str, Any]) -> None:
    """
    Processes a monitoring job by running the GNSH scan.

    Args:
        payload: The job payload from BullMQ.
    """
    from src.features.monitoring_agent.service import run_monitoring_scan

    job_id = payload.get("jobId", "")
    supplier_id = payload.get("supplierId", "")
    supplier_name = payload.get("supplierName", "")
    supplier_country = payload.get("supplierCountry", "US")
    supplier_industry = payload.get("supplierIndustry", "")
    target_languages = payload.get("targetLanguages", ["en"])

    logger.info("Processing monitoring job", job_id=job_id, supplier=supplier_name)

    result = await run_monitoring_scan(
        job_id=job_id,
        supplier_id=supplier_id,
        supplier_name=supplier_name,
        supplier_country=supplier_country,
        supplier_industry=supplier_industry,
        target_languages=target_languages,
    )

    # Notify backend of completion via HTTP
    await _notify_backend_job_complete(job_id, result)


async def process_report_job(payload: dict[str, Any]) -> None:
    """
    Processes a report generation job using the AI/ML API intelligence layer.

    Args:
        payload: The job payload from BullMQ.
    """
    from src.features.report_generator.report_chain import (
        generate_intelligence_brief,
        generate_compliance_report,
    )

    job_id = payload.get("jobId", "")
    report_id = payload.get("reportId", "")
    # The Hono backend sends jobType like "generate_csddd"; map it to the
    # report_type the generator expects ("csddd"/"uflpa"/"lksg"/"brief").
    job_type = payload.get("jobType", "generate_brief")
    report_type = job_type.removeprefix("generate_")

    logger.info("Processing report job", job_id=job_id, report_id=report_id, type=report_type)

    common_args = dict(
        supplier_name=payload.get("supplierName", "Unknown"),
        supplier_country=payload.get("supplierCountry", "US"),
        supplier_industry=payload.get("supplierIndustry", ""),
        vvs_score=payload.get("vvsScore", 0.0),
        vvs_stage=payload.get("vvsStage", "MURMUR"),
        signals=payload.get("signals", []),
    )

    if report_type in {"csddd", "uflpa", "lksg"}:
        brief = await generate_compliance_report(report_type=report_type, **common_args)
    else:
        brief = await generate_intelligence_brief(**common_args)

    await _notify_backend_report_complete(report_id, brief)


async def _notify_backend_job_complete(
    job_id: str,
    result: dict[str, Any],
) -> None:
    """Notifies the main backend that a monitoring job is complete."""
    import httpx

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            await client.post(
                f"{settings.backend_url}/api/v1/internal/monitoring/jobs/{job_id}/complete",
                headers={"x-internal-secret": settings.internal_api_secret},
                json={
                    "vvsScore": result.get("vvs_score", 0),
                    "vvsStage": result.get("vvs_stage", "MURMUR"),
                    "signalCount": len(result.get("all_signals", [])),
                    "error": result.get("error"),
                },
            )
    except Exception as e:
        logger.error("Failed to notify backend", job_id=job_id, error=str(e))


async def _notify_backend_report_complete(
    report_id: str,
    brief_markdown: str,
) -> None:
    """Notifies the main backend that a report is ready."""
    import httpx

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            await client.post(
                f"{settings.backend_url}/api/v1/internal/reports/{report_id}/complete",
                headers={"x-internal-secret": settings.internal_api_secret},
                json={"briefMarkdown": brief_markdown},
            )
    except Exception as e:
        logger.error("Failed to notify backend", report_id=report_id, error=str(e))


async def start_worker() -> None:
    """
    Starts BullMQ workers that consume the monitoring and report queues.

    Uses the official `bullmq` library so it speaks the full BullMQ v5 protocol
    (prioritized jobs, job hashes, locks, completion, retries) — the previous
    raw `lpop` consumer was incompatible with prioritized jobs.
    """
    from bullmq import Worker

    # bullmq accepts a Redis URL string and calls redis.from_url under the hood,
    # so rediss:// (Upstash TLS) works. skipVersionCheck is required because
    # Upstash reports a non-standard server version.
    worker_opts = {
        "connection": settings.redis_url,
        "concurrency": 2,
        "skipVersionCheck": True,
        "lockDuration": 120000,  # scans can take a while; hold the lock 2 min
    }

    async def _monitoring_processor(job: "Any", token: str) -> dict[str, Any]:
        await process_monitoring_job(dict(job.data))
        return {"ok": True}

    async def _report_processor(job: "Any", token: str) -> dict[str, Any]:
        await process_report_job(dict(job.data))
        return {"ok": True}

    monitoring_worker = Worker(MONITORING_QUEUE, _monitoring_processor, worker_opts)
    report_worker = Worker(REPORT_QUEUE, _report_processor, worker_opts)

    logger.info("BullMQ workers started", queues=[MONITORING_QUEUE, REPORT_QUEUE])

    try:
        # Keep the workers alive until cancelled (FastAPI lifespan handles shutdown).
        await asyncio.Event().wait()
    except asyncio.CancelledError:
        logger.info("Stopping BullMQ workers")
        await monitoring_worker.close()
        await report_worker.close()
        raise
