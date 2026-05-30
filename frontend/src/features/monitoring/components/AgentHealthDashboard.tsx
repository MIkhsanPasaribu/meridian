"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react"
import type { MonitoringJob } from "@/types/global.types"

interface AgentHealthDashboardProps {
  jobs: MonitoringJob[]
}

/**
 * Agent health monitoring dashboard showing success rate, average duration, and error rate.
 */
export function AgentHealthDashboard({ jobs }: AgentHealthDashboardProps) {
  const completed = jobs.filter((j) => j.status === "COMPLETED").length
  const failed = jobs.filter((j) => j.status === "FAILED").length
  const total = completed + failed

  const successRate = total > 0 ? Math.round((completed / total) * 100) : 100
  const errorRate = total > 0 ? Math.round((failed / total) * 100) : 0

  const completedWithTime = jobs.filter(
    (j) => j.status === "COMPLETED" && j.startedAt && j.completedAt
  )
  const avgDurationMs =
    completedWithTime.length > 0
      ? completedWithTime.reduce((acc, j) => {
          const start = new Date(j.startedAt!).getTime()
          const end = new Date(j.completedAt!).getTime()
          return acc + (end - start)
        }, 0) / completedWithTime.length
      : 0
  const avgDurationSec = Math.round(avgDurationMs / 1000)

  const stats = [
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: CheckCircle2,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
    {
      label: "Error Rate",
      value: `${errorRate}%`,
      icon: XCircle,
      color: errorRate > 10 ? "#EF4444" : "#8B9BB4",
      bg: errorRate > 10 ? "rgba(239, 68, 68, 0.1)" : "rgba(139, 155, 180, 0.1)",
    },
    {
      label: "Avg Duration",
      value: avgDurationSec > 0 ? `${avgDurationSec}s` : "—",
      icon: Clock,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      label: "Total Scans",
      value: total.toString(),
      icon: TrendingUp,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: stat.bg }}>
                <Icon size={14} style={{ color: stat.color }} />
              </div>
              <span className="text-xs text-[#8B9BB4]">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
