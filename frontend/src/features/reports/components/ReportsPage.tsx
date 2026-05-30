"use client"

import { motion } from "framer-motion"
import { FileText, Plus, Download, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"

const MOCK_REPORTS = [
  { id: "1", title: "Compliance Intelligence Brief — Bangladesh Garments Ltd", supplier: "Bangladesh Garments Ltd", type: "generate_brief", status: "final", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "2", title: "EU CSDDD Report — Shenzhen Electronics Co.", supplier: "Shenzhen Electronics Co.", type: "generate_csddd", status: "draft", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "3", title: "LkSG Report — Vietnam Textile Group", supplier: "Vietnam Textile Group", type: "generate_lksg", status: "final", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
]

const TYPE_LABELS: Record<string, string> = {
  generate_brief: "Intelligence Brief",
  generate_csddd: "EU CSDDD",
  generate_uflpa: "US UFLPA",
  generate_lksg: "Germany LkSG",
}

/**
 * Reports library page showing generated compliance reports.
 */
export function ReportsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Reports</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">AI-generated compliance intelligence reports</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </motion.button>
      </motion.div>

      <div className="space-y-3">
        {MOCK_REPORTS.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5 hover:border-[#2A3447] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#E8EDF5] mb-1">{report.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8B9BB4]">{report.supplier}</span>
                  <span className="text-xs px-2 py-0.5 bg-[#161B25] border border-[#1E2737] text-[#8B9BB4] rounded-full">
                    {TYPE_LABELS[report.type] ?? report.type}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: report.status === "final" ? "#10B981" : "#F59E0B",
                      backgroundColor: report.status === "final" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[#4A5568]">{formatDate(report.createdAt)}</span>
                <button className="p-1.5 text-[#4A5568] hover:text-[#E8EDF5] hover:bg-[#161B25] rounded-lg transition-all">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[#4A5568] hover:text-[#3B82F6] hover:bg-[#1E3A5F] rounded-lg transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
