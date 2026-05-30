"use client"

import { motion } from "framer-motion"
import { Bell, Activity, RefreshCw } from "lucide-react"
import { useDashboard } from "../hooks/useDashboard"
import { PortfolioSummary } from "./PortfolioSummary"
import { ActiveAlertsFeed } from "./ActiveAlertsFeed"
import { AgentMonitoringStatus } from "./AgentMonitoringStatus"
import type { Alert } from "@/types/global.types"

/**
 * Main dashboard page with portfolio overview, alerts feed, and agent status.
 */
export function DashboardPage() {
  const { data, isLoading, refetch, isFetching } = useDashboard()

  const recentAlerts = (data?.recentAlerts ?? []) as Alert[]

  const vvsDistribution = data?.vvsDistribution ?? {
    MURMUR: 0,
    RIPPLE: 0,
    WAVE: 0,
    SURGE: 0,
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Portfolio Overview</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            Real-time ESG compliance intelligence across your supply chain
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 bg-[#161B25] border border-[#1E2737] rounded-lg text-sm text-[#8B9BB4] hover:text-[#E8EDF5] hover:border-[#2A3447] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {data && <PortfolioSummary data={data} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-[#E8EDF5] mb-4">VVS Stage Distribution</h2>
          <div className="space-y-3">
            {(
              [
                { stage: "SURGE" as const, label: "Surge", color: "#EF4444" },
                { stage: "WAVE" as const, label: "Wave", color: "#F97316" },
                { stage: "RIPPLE" as const, label: "Ripple", color: "#F59E0B" },
                { stage: "MURMUR" as const, label: "Murmur", color: "#10B981" },
              ] as const
            ).map(({ stage, label, color }) => {
              const count = vvsDistribution[stage]
              const total = Math.max(data?.totalSuppliers ?? 1, 1)
              const pct = (count / total) * 100

              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-xs text-[#8B9BB4] w-14 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-[#161B25] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#E8EDF5] w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-sm font-semibold text-[#E8EDF5]">Agent Activity</h2>
            <span className="ml-auto text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <AgentMonitoringStatus activeJobs={data?.activeJobs ?? 0} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-sm font-semibold text-[#E8EDF5]">Recent Alerts</h2>
          {recentAlerts.length > 0 && (
            <span className="ml-auto text-xs text-[#8B9BB4]">{recentAlerts.length} alerts</span>
          )}
        </div>
        <ActiveAlertsFeed alerts={recentAlerts} />
      </motion.div>
    </div>
  )
}
