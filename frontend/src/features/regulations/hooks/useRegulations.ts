"use client"

import { useQuery } from "@tanstack/react-query"
import * as regulationsService from "../services/regulationsService"

/**
 * Hook for fetching regulatory frameworks.
 */
export function useRegulations() {
  return useQuery({
    queryKey: ["regulations"],
    queryFn: regulationsService.getRegulatoryFrameworks,
    staleTime: 10 * 60 * 1000, // 10 minutes — regulations don't change often
  })
}
