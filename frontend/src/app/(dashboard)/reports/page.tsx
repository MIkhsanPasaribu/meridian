"use client"

import { motion } from "framer-motion"
import { FileText, Plus, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { useReports } from "@/features/reports"
import { EmptyState } from "@/components/common/EmptyState"
import { VVSStageIndicator } from "@/features/vvs-score"
import { formatDate } from "@/lib/utils"
import type { VvsStage } from "@/types/api.types"

const REPORT_TYPE_LABELS: Record<string, string> = {
  INTELLIGENCE_BRIEF: "Intelligence Brief",
  CSDDD: "EU CSDDD",
  UFLPA: "US UFLPA",
  LKSG: "Germany LkSG",
}

const REPORT_TYPE_COLORS: Record<string, string> = {
  INTELLIGENCE_BRIEF: "#3B82F6",
  CSDDD: "#10B981",
  UFLPA: "#F59E0B",
  LKSG: "#F97316",
}

/**
 * Intelligence reports library page.
 */
export default function ReportsPage() {
  const { data: reports, isLoading } = useReports()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#3B82F6]/10">
            <FileText size={20} className="text-[#3B82F6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5]">Intelligence Reports</h1>
            <p className="text-sm text-[#8B9BB4] mt-0.5">
              AI-generated compliance briefs and regulatory reports
            </p>
          </div>
        </div>
        <Link href="/regulations/generate">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Generate Report
          </motion.button>
        </Link>
      </div>

      {/* Reports list */}
      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#3B82F6]" />
          </div>
        ) : !reports?.length ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Generate your first intelligence brief or compliance report."
            action={
              <Link href="/regulations/generate">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">
                  <Plus size={14} />
                  Generate Report
                </button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-[#1E2737]">
            {reports.map((report, i) => {
              const typeColor = REPORT_TYPE_COLORS[report.reportType] ?? "#8B9BB4"
              const typeLabel = REPORT_TYPE_LABELS[report.reportType] ?? report.reportType

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#161B25] transition-colors"
                >
                  {/* Type badge */}
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${typeColor}10` }}
                  >
                    <FileText size={16} style={{ color: typeColor }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E8EDF5] truncate">
                      {report.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: typeColor }}
                      >
                        {typeLabel}
                      </span>
                      <span className="text-xs text-[#4A5568]">·</span>
                      <span className="text-xs text-[#8B9BB4]">
                        {report.supplier?.name}
                      </span>
                      <span className="text-xs text-[#4A5568]">·</span>
                      <span className="text-xs text-[#4A5568]">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* VVS stage */}
                  {report.vvsStage && (
                    <VVSStageIndicator
                      stage={report.vvsStage as VvsStage}
                      size="sm"
                      animated={false}
                    />
                  )}

                  {/* Status */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      report.status === "FINALIZED"
                        ? "bg-[#10B981]/15 text-[#10B981]"
                        : report.status === "DRAFT"
                        ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                        : "bg-[#8B9BB4]/15 text-[#8B9BB4]"
                    }`}
                  >
                    {report.status}
                  </span>

                  {/* View link */}
                  <Link href={`/reports/${report.id}`}>
                    <button className="p-1.5 rounded-lg text-[#4A5568] hover:text-[#8B9BB4] hover:bg-[#161B25] transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
