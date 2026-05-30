import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { DashboardOverview } from "@/types/global.types"

/**
 * Fetches the dashboard overview data.
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiClient.get<ApiResponse<DashboardOverview>>("/dashboard/overview")
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Fetches heatmap data for the world map.
 */
export async function getHeatmapData(): Promise<
  Array<{ country: string; maxVvsScore: number; supplierCount: number }>
> {
  const res = await apiClient.get<
    ApiResponse<Array<{ country: string; maxVvsScore: number; supplierCount: number }>>
  >("/dashboard/heatmap")
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}
