import type { VvsStage } from "@/types/api.types"

export interface CreateSupplierFormData {
  name: string
  country: string
  industry: string
  websiteUrl?: string
  description?: string
  tier: number
  tags: string[]
}

export interface SupplierWithVvs {
  id: string
  name: string
  country: string
  industry: string
  websiteUrl?: string | null
  tier: number
  tags: string[]
  isActive: boolean
  createdAt: string
  latestVvsScore?: number
  latestVvsStage?: VvsStage
  alertCount?: number
  signalCount?: number
}

export interface SupplierFilters {
  search?: string
  country?: string
  industry?: string
  stage?: VvsStage
  sortBy?: "name" | "country" | "createdAt" | "vvsScore"
  sortOrder?: "asc" | "desc"
}
