import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { ComplianceReport } from "@/types/global.types"

/**
 * Fetches all compliance reports for the organization.
 */
export async function getReports(): Promise<ComplianceReport[]> {
  const res = await apiClient.get<ApiResponse<ComplianceReport[]>>("/reports")
  return res.data.data ?? []
}

/**
 * Fetches a single report by ID.
 */
export async function getReportById(id: string): Promise<ComplianceReport | null> {
  const res = await apiClient.get<ApiResponse<ComplianceReport>>(`/reports/${id}`)
  return res.data.data
}

/**
 * Generates a new compliance report.
 */
export async function generateReport(params: {
  supplierId: string
  reportType: "INTELLIGENCE_BRIEF" | "CSDDD" | "UFLPA" | "LKSG"
}): Promise<{ report: ComplianceReport; jobId: string }> {
  const res = await apiClient.post<
    ApiResponse<{ report: ComplianceReport; jobId: string }>
  >("/reports/generate", params)
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}
