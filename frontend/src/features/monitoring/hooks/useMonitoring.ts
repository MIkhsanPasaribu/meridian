"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as monitoringService from "../services/monitoringService"

/**
 * Hook for fetching all monitoring jobs.
 */
export function useMonitoringJobs() {
  return useQuery({
    queryKey: ["monitoring", "jobs"],
    queryFn: monitoringService.getMonitoringJobs,
    refetchInterval: 10 * 1000, // Refresh every 10 seconds
  })
}

/**
 * Hook for polling a specific job's status.
 */
export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["monitoring", "jobs", jobId, "status"],
    queryFn: () => monitoringService.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "COMPLETED" || status === "FAILED" || status === "CANCELLED") {
        return false
      }
      return 5000 // Poll every 5 seconds while running
    },
  })
}

/**
 * Hook for triggering a manual scan.
 */
export function useTriggerScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      supplierId,
      jobType = "manual_scan",
    }: {
      supplierId: string
      jobType?: "manual_scan" | "initial_scan"
    }) => monitoringService.triggerScan(supplierId, jobType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["monitoring", "jobs"] })
    },
  })
}
