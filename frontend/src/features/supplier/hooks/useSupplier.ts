"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as supplierService from "../services/supplierService"
import type { SupplierFilters, CreateSupplierFormData } from "../types/supplier.types"

export const SUPPLIER_KEYS = {
  all: ["suppliers"] as const,
  list: (filters: SupplierFilters) => ["suppliers", "list", filters] as const,
  detail: (id: string) => ["suppliers", "detail", id] as const,
}

/**
 * Hook for fetching a paginated list of suppliers.
 */
export function useSuppliers(filters: SupplierFilters & { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: SUPPLIER_KEYS.list(filters),
    queryFn: () => supplierService.getSuppliers(filters),
  })
}

/**
 * Hook for fetching a single supplier.
 */
export function useSupplier(id: string) {
  return useQuery({
    queryKey: SUPPLIER_KEYS.detail(id),
    queryFn: () => supplierService.getSupplierById(id),
    enabled: !!id,
  })
}

/**
 * Hook for creating a new supplier.
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: supplierService.createSupplier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all })
    },
  })
}

/**
 * Hook for deleting a supplier.
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: supplierService.deleteSupplier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all })
    },
  })
}
