"use client"

import { motion } from "framer-motion"
import { Building2, AlertTriangle, Activity, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardOverview } from "@/types/global.types"

interface PortfolioSummaryProps {
  data: DashboardOverview
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  delay?: number
}

function StatCard({ label, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5 hover:border-[#2A3447] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold font-mono" style={{ color }}>
            {value}
          </p>
        </div>
        <div
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Portfolio health summary cards for the main dashboard.
 * Shows total suppliers, active jobs, unread alerts, and VVS distribution.
 */
export function PortfolioSummary({ data }: PortfolioSummaryProps) {
  const criticalCount = data.vvsDistribution.SURGE + data.vvsDistribution.WAVE

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Suppliers"
        value={data.totalSuppliers}
        icon={<Building2 size={20} />}
        color="#3B82F6"
        delay={0}
      />
      <StatCard
        label="Unread Alerts"
        value={data.unreadAlerts}
        icon={<AlertTriangle size={20} />}
        color={data.unreadAlerts > 0 ? "#EF4444" : "#10B981"}
        delay={0.1}
      />
      <StatCard
        label="Active Scans"
        value={data.activeJobs}
        icon={<Activity size={20} />}
        color="#F59E0B"
        delay={0.2}
      />
      <StatCard
        label="High Risk"
        value={criticalCount}
        icon={<FileText size={20} />}
        color={criticalCount > 0 ? "#F97316" : "#10B981"}
        delay={0.3}
      />
    </div>
  )
}
