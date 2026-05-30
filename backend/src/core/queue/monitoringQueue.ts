import { Queue, Worker, type Job } from "bullmq"
import { redis } from "@/config/redis.js"
import { logger } from "@/lib/logger.js"

export const MONITORING_QUEUE_NAME = "monitoring_jobs"

export interface MonitoringJobPayload {
  jobId: string
  jobType: "initial_scan" | "scheduled_scan" | "manual_scan"
  supplierId: string
  supplierName: string
  supplierCountry: string
  supplierIndustry: string
  targetLanguages: string[]
  targetPlatforms: string[]
  createdAt: string
  priority: number
}

/**
 * BullMQ queue for monitoring agent jobs.
 * Jobs are consumed by the backend-ai Python worker.
 */
export const monitoringQueue = new Queue<MonitoringJobPayload>(
  MONITORING_QUEUE_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  }
)

/**
 * Adds a monitoring job to the queue.
 */
export async function enqueueMonitoringJob(
  payload: MonitoringJobPayload
): Promise<string> {
  const job = await monitoringQueue.add(payload.jobType, payload, {
    priority: payload.priority,
    jobId: payload.jobId,
  })

  logger.info(
    { jobId: job.id, supplierId: payload.supplierId, jobType: payload.jobType },
    "Monitoring job enqueued"
  )

  return job.id ?? payload.jobId
}
