"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/axios"
import { VVSGauge, VVSHistoryChart, VVSStageIndicator } from "@/features/vvs-score"
import type { ApiResponse, VvsStage } from "@/types/api.types"
import type { VvsReading } from "@/types/global.types"

interface ScorePageProps {
  params: Promise<{ id: string }>
}

/**
 * Supplier VVS score detail page with gauge and history chart.
 */
export default function SupplierScorePage({ params }: ScorePageProps) {
  const { id } = use(params)

  const { data: current } = useQuery({
    queryKey: ["vvs", id, "current"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<VvsReading>>(`/vvs/${id}/current`)
      return res.data.data
    },
  })

  const { data: history } = useQuery({
    queryKey: ["vvs", id, "history"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<VvsReading[]>>(`/vvs/${id}/history?days=90`)
      return res.data.data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <Link
        href={`/supplier/${id}`}
        className="inline-flex items-center gap-2 text-sm text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Supplier
      </Link>

      <div className="flex items-center gap-3">
        <TrendingUp size={20} className="text-[#3B82F6]" />
        <h1 className="text-2xl font-bold text-[#E8EDF5]">VVS Score Analysis</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-6 flex flex-col items-center gap-4"
        >
          <h2 className="text-sm font-semibold text-[#8B9BB4] uppercase tracking-wider">
            Current Score
          </h2>
          {current ? (
            <>
              <VVSGauge score={current.score} stage={current.stage as VvsStage} size="lg" />
              <VVSStageIndicator stage={current.stage as VvsStage} size="md" />
              <div className="text-center">
                <p className="text-xs text-[#4A5568]">
                  Delta:{" "}
                  <span
                    className={
                      current.delta > 0
                        ? "text-[#EF4444]"
                        : current.delta < 0
                        ? "text-[#10B981]"
                        : "text-[#8B9BB4]"
                    }
                  >
                    {current.delta > 0 ? "+" : ""}
                    {current.delta.toFixed(1)}
                  </span>
                </p>
                <p className="text-xs text-[#4A5568] mt-1">
                  {current.signalCount} signals detected
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#8B9BB4]">No score yet</p>
              <p className="text-xs text-[#4A5568] mt-1">Run a scan to generate a score</p>
            </div>
          )}
        </motion.div>

        {/* History Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-[#0E1117] border border-[#1E2737] rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-[#E8EDF5] mb-4">90-Day VVS History</h2>
          {history && history.length > 0 ? (
            <VVSHistoryChart readings={history} height={220} />
          ) : (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-sm text-[#8B9BB4]">No history available yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Stage Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-[#E8EDF5] mb-4">Stage Reference</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(
            [
              { stage: "MURMUR" as VvsStage, range: "0–25", action: "Monitor normally" },
              { stage: "RIPPLE" as VvsStage, range: "26–50", action: "Escalate to analyst" },
              { stage: "WAVE" as VvsStage, range: "51–75", action: "Alert manager" },
              { stage: "SURGE" as VvsStage, range: "76–100", action: "Emergency escalation" },
            ] as const
          ).map(({ stage, range, action }) => (
            <div
              key={stage}
              className="p-3 rounded-lg bg-[#161B25] border border-[#1E2737]"
            >
              <VVSStageIndicator stage={stage} size="sm" />
              <p className="text-xs font-mono text-[#8B9BB4] mt-2">{range}</p>
              <p className="text-xs text-[#4A5568] mt-1">{action}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
