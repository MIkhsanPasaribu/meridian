import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { MonitoringJob } from "@/types/global.types"

/**
 * Fetches all monitoring jobs for the organization.
 */
export async function getMonitoringJobs(): Promise<MonitoringJob[]> {
  const res = await apiClient.get<ApiResponse<MonitoringJob[]>>("/monitoring/jobs")
  return res.data.data ?? []
}

/**
 * Fetches the status of a specific monitoring job.
 */
export async function getJobStatus(jobId: string): Promise<MonitoringJob | null> {
  const res = await apiClient.get<ApiResponse<MonitoringJob>>(
    `/monitoring/jobs/${jobId}/status`
  )
  return res.data.data
}

/**
 * Triggers a manual scan for a supplier.
 */
export async function triggerScan(
  supplierId: string,
  jobType: "manual_scan" | "initial_scan" = "manual_scan"
): Promise<{ jobId: string }> {
  const res = await apiClient.post<ApiResponse<{ jobId: string }>>("/monitoring/jobs", {
    supplierId,
    jobType,
  })
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}
