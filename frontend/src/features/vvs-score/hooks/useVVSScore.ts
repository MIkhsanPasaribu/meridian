"use client"

import { useQuery } from "@tanstack/react-query"
import * as vvsScoreService from "../services/vvsScoreService"

/**
 * Hook for fetching the current VVS score for a supplier.
 */
export function useCurrentVvsScore(supplierId: string) {
  return useQuery({
    queryKey: ["vvs", supplierId, "current"],
    queryFn: () => vvsScoreService.getCurrentVvsScore(supplierId),
    enabled: !!supplierId,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  })
}

/**
 * Hook for fetching VVS score history for a supplier.
 */
export function useVvsHistory(supplierId: string, days = 90) {
  return useQuery({
    queryKey: ["vvs", supplierId, "history", days],
    queryFn: () => vvsScoreService.getVvsHistory(supplierId, days),
    enabled: !!supplierId,
  })
}

/**
 * Hook for fetching signal events for a supplier.
 */
export function useSignalEvents(supplierId: string) {
  return useQuery({
    queryKey: ["vvs", supplierId, "signals"],
    queryFn: () => vvsScoreService.getSignalEvents(supplierId),
    enabled: !!supplierId,
  })
}
