"use client"

import { motion } from "framer-motion"
import { Scale, CheckCircle, AlertCircle, FileText, Globe } from "lucide-react"
import { useState } from "react"
import { useSuppliers } from "@/features/supplier"
import { useGenerateReport } from "@/features/reports"
import { LoadingButton } from "@/components/common/LoadingButton"

const REGULATIONS = [
  {
    code: "CSDDD",
    name: "EU Corporate Sustainability Due Diligence Directive",
    jurisdiction: "European Union",
    penalty: "5% of global annual turnover",
    appliesTo: ">500 employees, >€150M turnover",
    color: "#3B82F6",
    flag: "🇪🇺",
    requiredFields: [
      "Adverse impact identification",
      "Due diligence process",
      "Remediation plan",
      "Grievance mechanism",
    ],
  },
  {
    code: "UFLPA",
    name: "Uyghur Forced Labor Prevention Act",
    jurisdiction: "United States",
    penalty: "Import ban + fines",
    appliesTo: "All US imports",
    color: "#F59E0B",
    flag: "🇺🇸",
    requiredFields: [
      "Supply chain traceability",
      "Due diligence evidence",
      "Rebuttable presumption documentation",
    ],
  },
  {
    code: "LKSG",
    name: "Lieferkettensorgfaltspflichtengesetz",
    jurisdiction: "Germany",
    penalty: "2% of annual turnover",
    appliesTo: ">1000 employees in Germany",
    color: "#10B981",
    flag: "🇩🇪",
    requiredFields: [
      "Risk management process",
      "Preventive measures",
      "Remediation measures",
      "Complaint procedure",
    ],
  },
]

/**
 * Regulatory Mandate Mapper page.
 * Shows applicable regulations and allows generating compliance reports.
 */
export function RegulationsPage() {
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const { data: suppliersData } = useSuppliers({ limit: 100 })
  const generateReport = useGenerateReport()

  const handleGenerate = () => {
    if (!selectedSupplier || !selectedRegulation) return

    const reportTypeMap: Record<string, "CSDDD" | "UFLPA" | "LKSG"> = {
      CSDDD: "CSDDD",
      UFLPA: "UFLPA",
      LKSG: "LKSG",
    }

    generateReport.mutate({
      supplierId: selectedSupplier,
      reportType: reportTypeMap[selectedRegulation] ?? "CSDDD",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Scale size={24} className="text-[#3B82F6]" />
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Regulatory Mandate Mapper</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            Auto-generate compliance reports in regulator-accepted formats
          </p>
        </div>
      </motion.div>

      {/* Regulation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REGULATIONS.map((reg, i) => (
          <motion.div
            key={reg.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedRegulation(reg.code === selectedRegulation ? null : reg.code)}
            className={`cursor-pointer rounded-xl border p-5 transition-all ${
              selectedRegulation === reg.code
                ? "border-[#3B82F6]/50 bg-[#3B82F6]/5"
                : "border-[#1E2737] bg-[#0E1117] hover:border-[#2A3447]"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{reg.flag}</span>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                  style={{
                    backgroundColor: `${reg.color}15`,
                    color: reg.color,
                    border: `1px solid ${reg.color}30`,
                  }}
                >
                  {reg.code}
                </span>
              </div>
              {selectedRegulation === reg.code && (
                <CheckCircle size={16} className="text-[#3B82F6]" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-[#E8EDF5] mb-1">{reg.name}</h3>
            <p className="text-xs text-[#8B9BB4] mb-3">{reg.jurisdiction}</p>

            <div className="space-y-1.5 mb-3">
              {reg.requiredFields.map((field) => (
                <div key={field} className="flex items-center gap-1.5">
                  <CheckCircle size={10} style={{ color: reg.color }} />
                  <span className="text-xs text-[#8B9BB4]">{field}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1E2737]">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle size={10} className="text-[#EF4444]" />
                <span className="text-xs text-[#4A5568]">Max penalty</span>
              </div>
              <p className="text-xs font-semibold text-[#EF4444]">{reg.penalty}</p>
              <p className="text-xs text-[#4A5568] mt-1">{reg.appliesTo}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report generator */}
      {selectedRegulation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0E1117] border border-[#3B82F6]/30 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText size={18} className="text-[#3B82F6]" />
            <h2 className="text-sm font-semibold text-[#E8EDF5]">
              Generate {selectedRegulation} Report
            </h2>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
                Select Supplier
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161B25] border border-[#1E2737] text-[#E8EDF5] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
              >
                <option value="">Choose a supplier...</option>
                {suppliersData?.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            <LoadingButton
              isLoading={generateReport.isPending}
              loadingText="Generating..."
              icon={<Globe size={16} />}
              onClick={handleGenerate}
              disabled={!selectedSupplier}
              variant="primary"
            >
              Generate Report
            </LoadingButton>
          </div>

          {generateReport.isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 px-3 py-2 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs"
            >
              Report generation started. Check the Reports page for results.
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
