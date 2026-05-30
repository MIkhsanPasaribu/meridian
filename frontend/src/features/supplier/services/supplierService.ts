import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { Supplier } from "@/types/global.types"
import type { CreateSupplierFormData, SupplierFilters } from "../types/supplier.types"

interface SuppliersResponse {
  suppliers: Supplier[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Fetches a paginated list of suppliers.
 */
export async function getSuppliers(
  filters: SupplierFilters & { page?: number; limit?: number }
): Promise<SuppliersResponse> {
  const res = await apiClient.get<ApiResponse<SuppliersResponse>>("/suppliers", {
    params: filters,
  })
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Fetches a single supplier by ID.
 */
export async function getSupplierById(id: string): Promise<Supplier> {
  const res = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`)
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Creates a new supplier.
 */
export async function createSupplier(
  data: CreateSupplierFormData
): Promise<{ supplier: Supplier; jobId: string }> {
  const res = await apiClient.post<ApiResponse<{ supplier: Supplier; jobId: string }>>(
    "/suppliers",
    data
  )
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Updates a supplier.
 */
export async function updateSupplier(
  id: string,
  data: Partial<CreateSupplierFormData>
): Promise<Supplier> {
  const res = await apiClient.patch<ApiResponse<Supplier>>(`/suppliers/${id}`, data)
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Deletes a supplier.
 */
export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`)
}
