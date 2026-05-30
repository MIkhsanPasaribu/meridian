import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"

export interface RegulatoryFramework {
  id: string
  code: string
  name: string
  jurisdiction: string
  appliesTo: string
  reportFormat: string
  requiredFields: string[]
  isActive: boolean
}

/**
 * Fetches all regulatory frameworks.
 */
export async function getRegulatoryFrameworks(): Promise<RegulatoryFramework[]> {
  const res = await apiClient.get<ApiResponse<RegulatoryFramework[]>>("/regulations")
  return res.data.data ?? []
}
