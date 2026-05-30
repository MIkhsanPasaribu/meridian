"use client"

import { motion } from "framer-motion"
import { Bell, AlertTriangle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/axios"
import { ActiveAlertsFeed } from "@/features/dashboard"
import type { ApiResponse } from "@/types/api.types"
import type { Alert } from "@/types/global.types"

export default function AlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ alerts: Alert[] }>>("/alerts")
      return res.data.data?.alerts ?? []
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Alert Inbox</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            Multi-channel compliance alert management
          </p>
        </div>
        {data && data.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-[#EF4444]/15 text-[#EF4444] text-sm font-semibold">
            {data.length} alerts
          </span>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
      >
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <ActiveAlertsFeed alerts={data ?? []} />
        )}
      </motion.div>
    </div>
  )
}
