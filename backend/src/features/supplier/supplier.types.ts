export interface Supplier {
  id: string
  name: string
  country: string
  industry: string
  website?: string
  contactEmail?: string
  contactName?: string
  tier: number
  organizationId: string
  vvsScore?: number
  vvsStage?: VvsStage
  createdAt: string
  updatedAt: string
}

export type VvsStage = "MURMUR" | "RIPPLE" | "WAVE" | "SURGE" | "UNSCORED"

export interface CreateSupplierInput {
  name: string
  country: string
  industry: string
  website?: string
  contactEmail?: string
  contactName?: string
  tier?: number
}

export interface UpdateSupplierInput {
  name?: string
  country?: string
  industry?: string
  website?: string
  contactEmail?: string
  contactName?: string
}

export interface SupplierListQuery {
  page?: number
  limit?: number
  search?: string
  country?: string
  industry?: string
  vvsStage?: VvsStage
  sortBy?: "name" | "vvsScore" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface PaginatedSuppliers {
  suppliers: Supplier[]
  total: number
  page: number
  limit: number
  totalPages: number
}
