"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/axios"
import { EmptyState } from "@/components/common/EmptyState"
import { formatDate } from "@/lib/utils"
import type { ApiResponse } from "@/types/api.types"
import type { ComplianceReport } from "@/types/global.types"

interface SupplierReportsPageProps {
  params: Promise<{ id: string }>
}

/**
 * Supplier-specific reports page — shows all reports for a supplier.
 */
export default function SupplierReportsPage({ params }: SupplierReportsPageProps) {
  const { id } = use(params)
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports", "supplier", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ComplianceReport[]>>("/reports")
      return (res.data.data ?? []).filter((r) => r.supplierId === id)
    },
  })

  const generateMutation = useMutation({
    mutationFn: async (reportType: string) => {
      const res = await apiClient.post("/reports/generate", {
        supplierId: id,
        reportType,
      })
      return res.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[#3B82F6]" />
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Compliance Reports</h1>
        </div>

        <div className="flex items-center gap-2">
          {(["INTELLIGENCE_BRIEF", "CSDDD", "UFLPA", "LKSG"] as const).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateMutation.mutate(type)}
              disabled={generateMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B25] border border-[#1E2737] text-xs text-[#8B9BB4] hover:text-[#E8EDF5] hover:border-[#2A3447] transition-colors disabled:opacity-50"
            >
              <Plus size={12} />
              {type === "INTELLIGENCE_BRIEF" ? "Brief" : type}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : !reports?.length ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Generate your first compliance report using the buttons above."
          />
        ) : (
          <div className="divide-y divide-[#1E2737]">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#161B25] transition-colors"
              >
                <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                  <FileText size={16} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#E8EDF5] truncate">{report.title}</p>
                  <p className="text-xs text-[#8B9BB4]">
                    {report.regulation} · {formatDate(report.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    report.status === "FINALIZED"
                      ? "bg-[#10B981]/15 text-[#10B981]"
                      : "bg-[#F59E0B]/15 text-[#F59E0B]"
                  }`}
                >
                  {report.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
