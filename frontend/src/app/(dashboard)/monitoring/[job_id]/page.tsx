"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Activity, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react"
import Link from "next/link"
import { useJobStatus } from "@/features/monitoring"
import { timeAgo } from "@/lib/utils"
import type { JobStatus } from "@/types/api.types"

interface JobDetailPageProps {
  params: Promise<{ job_id: string }>
}

const STATUS_CONFIG: Record<JobStatus, { icon: React.ElementType; color: string; label: string }> = {
  QUEUED: { icon: Clock, color: "#8B9BB4", label: "Queued" },
  RUNNING: { icon: Loader2, color: "#3B82F6", label: "Running" },
  COMPLETED: { icon: CheckCircle2, color: "#10B981", label: "Completed" },
  FAILED: { icon: XCircle, color: "#EF4444", label: "Failed" },
  CANCELLED: { icon: XCircle, color: "#4A5568", label: "Cancelled" },
}

/**
 * Monitoring job detail page — shows job status and results.
 */
export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { job_id } = use(params)
  const { data: job, isLoading } = useJobStatus(job_id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8B9BB4]">Job not found</p>
        <Link href="/monitoring" className="text-[#3B82F6] text-sm mt-2 inline-block">
          Back to Monitoring
        </Link>
      </div>
    )
  }

  const config = STATUS_CONFIG[job.status]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      <Link
        href="/monitoring"
        className="inline-flex items-center gap-2 text-sm text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Monitoring
      </Link>

      <div className="flex items-center gap-3">
        <Activity size={20} className="text-[#3B82F6]" />
        <h1 className="text-2xl font-bold text-[#E8EDF5]">Job Details</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-[#0E1117] border rounded-xl p-6 ${
          job.status === "RUNNING" ? "border-[#3B82F6]/30 agent-active" : "border-[#1E2737]"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-[#4A5568] font-mono mb-1">{job.id}</p>
            <h2 className="text-lg font-semibold text-[#E8EDF5]">
              {job.supplier?.name ?? "Unknown Supplier"}
            </h2>
            <p className="text-sm text-[#8B9BB4]">{job.jobType.replace(/_/g, " ")}</p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon
              size={14}
              style={{ color: config.color }}
              className={job.status === "RUNNING" ? "animate-spin" : ""}
            />
            <span className="text-xs font-semibold" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#1E2737]">
          <div>
            <p className="text-xs text-[#4A5568] mb-1">Created</p>
            <p className="text-sm text-[#E8EDF5]">{timeAgo(job.createdAt)}</p>
          </div>
          {job.startedAt && (
            <div>
              <p className="text-xs text-[#4A5568] mb-1">Started</p>
              <p className="text-sm text-[#E8EDF5]">{timeAgo(job.startedAt)}</p>
            </div>
          )}
          {job.completedAt && (
            <div>
              <p className="text-xs text-[#4A5568] mb-1">Completed</p>
              <p className="text-sm text-[#E8EDF5]">{timeAgo(job.completedAt)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-[#4A5568] mb-1">Priority</p>
            <p className="text-sm text-[#E8EDF5]">{job.priority}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
