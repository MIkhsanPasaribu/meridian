"use client"

import { motion } from "framer-motion"
import { Plus, RefreshCw, FileText } from "lucide-react"
import { useState } from "react"
import { useDashboard } from "@/features/dashboard"
import { PortfolioSummary } from "@/features/dashboard"
import { ActiveAlertsFeed } from "@/features/dashboard"
import { AgentMonitoringStatus } from "@/features/dashboard"
import { AddSupplierModal } from "@/features/supplier"
import { StatCardSkeleton } from "@/components/common/SkeletonFrame"

/**
 * Main dashboard page — real-time overview of the compliance portfolio.
 */
export default function DashboardPage() {
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const { data, isLoading, refetch, isFetching } = useDashboard()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Intelligence Dashboard</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            Real-time ESG compliance monitoring across your supplier portfolio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1E2737] text-[#8B9BB4] hover:text-[#E8EDF5] hover:border-[#2A3447] transition-colors text-sm"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddSupplierOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium transition-colors text-sm"
          >
            <Plus size={16} />
            Add Supplier
          </motion.button>
        </div>
      </div>

      {/* Portfolio summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : data ? (
        <PortfolioSummary data={data} />
      ) : null}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent status + Alerts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent monitoring status */}
          {data && (
            <AgentMonitoringStatus activeJobs={data.activeJobs} />
          )}

          {/* VVS Distribution */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
            >
              <h2 className="text-sm font-semibold text-[#E8EDF5] mb-4">
                Portfolio Risk Distribution
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {(["MURMUR", "RIPPLE", "WAVE", "SURGE"] as const).map((stage) => {
                  const colors = {
                    MURMUR: "#10B981",
                    RIPPLE: "#F59E0B",
                    WAVE: "#F97316",
                    SURGE: "#EF4444",
                  }
                  const count = data.vvsDistribution[stage]
                  const total = Object.values(data.vvsDistribution).reduce((a, b) => a + b, 0)
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0

                  return (
                    <div key={stage} className="text-center">
                      <div
                        className="text-2xl font-bold font-mono mb-1"
                        style={{ color: colors[stage] }}
                      >
                        {count}
                      </div>
                      <div
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: colors[stage] }}
                      >
                        {stage}
                      </div>
                      <div className="h-1 rounded-full bg-[#161B25] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors[stage] }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Alerts feed (1/3 width) */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#E8EDF5]">Active Alerts</h2>
              {data && data.unreadAlerts > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] text-xs font-semibold">
                  {data.unreadAlerts}
                </span>
              )}
            </div>
            {data ? (
              <ActiveAlertsFeed alerts={data.recentAlerts} />
            ) : (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
      />
    </div>
  )
}
