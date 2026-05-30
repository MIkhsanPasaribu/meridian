"use client"

import { useQuery } from "@tanstack/react-query"
import * as dashboardService from "../services/dashboardService"

/**
 * Hook for fetching dashboard overview data.
 * Auto-refreshes every 60 seconds.
 */
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getDashboardOverview,
    refetchInterval: 60 * 1000,
  })
}

/**
 * Hook for fetching heatmap data.
 */
export function useHeatmapData() {
  return useQuery({
    queryKey: ["dashboard", "heatmap"],
    queryFn: dashboardService.getHeatmapData,
    refetchInterval: 5 * 60 * 1000,
  })
}
