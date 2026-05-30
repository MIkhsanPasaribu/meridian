"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as reportsService from "../services/reportsService"

/**
 * Hook for fetching all reports.
 */
export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: reportsService.getReports,
  })
}

/**
 * Hook for fetching a single report.
 * Polls every 4s while the report has no generated content yet, then stops.
 */
export function useReport(id: string) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => reportsService.getReportById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const report = query.state.data
      if (!report) return 4000
      const content = (report.content ?? {}) as Record<string, unknown>
      const hasContent = Boolean(content.markdown || content.briefMarkdown)
      // Keep polling until the AI worker writes the content back.
      return hasContent ? false : 4000
    },
  })
}

/**
 * Hook for generating a new compliance report.
 */
export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reportsService.generateReport,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })
}
