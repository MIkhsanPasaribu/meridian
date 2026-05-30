import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { Alert } from "@/types/global.types"

interface AlertsResponse {
  alerts: Alert[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Fetches alerts for the organization with optional filters.
 */
export async function getAlerts(params?: {
  page?: number
  limit?: number
  status?: string
  severity?: string
}): Promise<AlertsResponse> {
  const res = await apiClient.get<ApiResponse<AlertsResponse>>("/alerts", { params })
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Acknowledges an alert.
 */
export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  const res = await apiClient.patch<ApiResponse<Alert>>(`/alerts/${alertId}/acknowledge`)
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Dismisses an alert.
 */
export async function dismissAlert(alertId: string): Promise<Alert> {
  const res = await apiClient.patch<ApiResponse<Alert>>(`/alerts/${alertId}/dismiss`)
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}
