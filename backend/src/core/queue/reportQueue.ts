import { Queue } from "bullmq"
import { redis } from "@/config/redis.js"
import { logger } from "@/lib/logger.js"

export const REPORT_QUEUE_NAME = "report_jobs"

export interface ReportJobPayload {
  jobId: string
  jobType: "generate_brief" | "generate_csddd" | "generate_uflpa" | "generate_lksg"
  supplierId: string
  reportId: string
  organizationId: string
  userId: string
  createdAt: string
  // Supplier + scoring context the AI worker needs to generate the report.
  supplierName: string
  supplierCountry: string
  supplierIndustry: string
  vvsScore: number
  vvsStage: "MURMUR" | "RIPPLE" | "WAVE" | "SURGE"
  signals: Array<Record<string, unknown>>
}

/**
 * BullMQ queue for AI report generation jobs.
 * Jobs are consumed by the backend-ai Python worker.
 */
export const reportQueue = new Queue<ReportJobPayload>(REPORT_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
})

/**
 * Adds a report generation job to the queue.
 */
export async function enqueueReportJob(
  payload: ReportJobPayload
): Promise<string> {
  const job = await reportQueue.add(payload.jobType, payload, {
    jobId: payload.jobId,
  })

  logger.info(
    { jobId: job.id, reportId: payload.reportId, jobType: payload.jobType },
    "Report job enqueued"
  )

  return job.id ?? payload.jobId
}
