"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as alertsService from "../services/alertsService"

/**
 * Hook for fetching alerts with optional filters.
 */
export function useAlerts(params?: {
  page?: number
  limit?: number
  status?: string
  severity?: string
}) {
  return useQuery({
    queryKey: ["alerts", params],
    queryFn: () => alertsService.getAlerts(params),
    refetchInterval: 30 * 1000,
  })
}

/**
 * Hook for acknowledging an alert.
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: alertsService.acknowledgeAlert,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

/**
 * Hook for dismissing an alert.
 */
export function useDismissAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: alertsService.dismissAlert,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] })
    },
  })
}
