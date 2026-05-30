import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { VvsReading } from "@/types/global.types"

/**
 * Fetches the current VVS reading for a supplier.
 */
export async function getCurrentVvsScore(supplierId: string): Promise<VvsReading | null> {
  const res = await apiClient.get<ApiResponse<VvsReading>>(`/vvs/${supplierId}/current`)
  return res.data.data
}

/**
 * Fetches VVS history for a supplier over the specified number of days.
 */
export async function getVvsHistory(
  supplierId: string,
  days = 90
): Promise<VvsReading[]> {
  const res = await apiClient.get<ApiResponse<VvsReading[]>>(
    `/vvs/${supplierId}/history?days=${days}`
  )
  return res.data.data ?? []
}

/**
 * Fetches signal events for a supplier.
 */
export async function getSignalEvents(supplierId: string): Promise<unknown[]> {
  const res = await apiClient.get<ApiResponse<unknown[]>>(`/vvs/${supplierId}/signals`)
  return res.data.data ?? []
}
