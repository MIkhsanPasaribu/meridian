"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, Play, CheckCircle2, XCircle, Loader2, Zap } from "lucide-react"
import { timeAgo, countryFlag } from "@/lib/utils"
import type { MonitoringJob } from "@/types/global.types"
import type { JobStatus } from "@/types/api.types"

interface AgentJobBoardProps {
  jobs: MonitoringJob[]
}

const STATUS_CONFIG: Record<JobStatus, {
  icon: React.ElementType
  color: string
  bg: string
  label: string
}> = {
  QUEUED: { icon: Clock, color: "#8B9BB4", bg: "rgba(139, 155, 180, 0.1)", label: "Queued" },
  RUNNING: { icon: Loader2, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", label: "Running" },
  COMPLETED: { icon: CheckCircle2, color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", label: "Completed" },
  FAILED: { icon: XCircle, color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", label: "Failed" },
  CANCELLED: { icon: XCircle, color: "#4A5568", bg: "rgba(74, 85, 104, 0.1)", label: "Cancelled" },
}

const COLUMNS: JobStatus[] = ["QUEUED", "RUNNING", "COMPLETED", "FAILED"]

/**
 * Kanban board showing monitoring jobs by status.
 * Real-time updates via WebSocket.
 */
export function AgentJobBoard({ jobs }: AgentJobBoardProps) {
  const jobsByStatus = COLUMNS.reduce<Record<JobStatus, MonitoringJob[]>>(
    (acc, status) => {
      acc[status] = jobs.filter((j) => j.status === status)
      return acc
    },
    { QUEUED: [], RUNNING: [], COMPLETED: [], FAILED: [], CANCELLED: [] }
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((status) => {
        const config = STATUS_CONFIG[status]
        const Icon = config.icon
        const columnJobs = jobsByStatus[status]

        return (
          <div key={status} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1">
              <div
                className="p-1 rounded"
                style={{ backgroundColor: config.bg }}
              >
                <Icon
                  size={12}
                  style={{ color: config.color }}
                  className={status === "RUNNING" ? "animate-spin" : ""}
                />
              </div>
              <span className="text-xs font-semibold text-[#8B9BB4] uppercase tracking-wider">
                {config.label}
              </span>
              <span
                className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                {columnJobs.length}
              </span>
            </div>

            {/* Job cards */}
            <div className="space-y-2 min-h-[100px]">
              <AnimatePresence>
                {columnJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-lg border transition-colors ${
                      status === "RUNNING"
                        ? "border-[#3B82F6]/30 bg-[#3B82F6]/5 agent-active"
                        : "border-[#1E2737] bg-[#0E1117]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-medium text-[#E8EDF5] truncate">
                        {job.supplier?.name ?? "Unknown"}
                      </p>
                      {job.supplier?.country && (
                        <span className="text-xs text-[#4A5568] flex-shrink-0">
                          {countryFlag(job.supplier.country)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap size={10} style={{ color: config.color }} />
                      <span className="text-xs text-[#4A5568] font-mono">
                        {job.jobType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5568] mt-1">
                      {timeAgo(job.createdAt)}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnJobs.length === 0 && (
                <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-[#1E2737]">
                  <p className="text-xs text-[#4A5568]">No jobs</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
