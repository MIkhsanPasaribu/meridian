"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronRight, ChevronLeft, FileText, Loader2, CheckCircle2 } from "lucide-react"
import { useSuppliers } from "@/features/supplier"
import { useGenerateReport } from "@/features/reports"

const REGULATIONS = [
  {
    code: "INTELLIGENCE_BRIEF",
    name: "Intelligence Brief",
    description: "AI-generated analyst-style narrative report",
    color: "#3B82F6",
  },
  {
    code: "CSDDD",
    name: "EU CSDDD",
    description: "Corporate Sustainability Due Diligence Directive",
    color: "#10B981",
  },
  {
    code: "UFLPA",
    name: "US UFLPA",
    description: "Uyghur Forced Labor Prevention Act",
    color: "#F59E0B",
  },
  {
    code: "LKSG",
    name: "Germany LkSG",
    description: "Lieferkettensorgfaltspflichtengesetz",
    color: "#F97316",
  },
] as const

type RegulationType = (typeof REGULATIONS)[number]["code"]

const schema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  reportType: z.enum(["INTELLIGENCE_BRIEF", "CSDDD", "UFLPA", "LKSG"]),
})

type FormData = z.infer<typeof schema>

/**
 * 4-step wizard for generating compliance reports.
 * Steps: Select Supplier → Select Regulation → Review → Generate
 */
export function ReportGeneratorWizard() {
  const [step, setStep] = useState(0)
  const [selectedRegulation, setSelectedRegulation] = useState<RegulationType | null>(null)
  const { data: suppliersData } = useSuppliers({ limit: 100 })
  const generateReport = useGenerateReport()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const selectedSupplierId = watch("supplierId")
  const selectedSupplier = suppliersData?.suppliers.find((s) => s.id === selectedSupplierId)

  const onSubmit = (data: FormData) => {
    generateReport.mutate(data, {
      onSuccess: () => setStep(3),
    })
  }

  const steps = ["Select Supplier", "Select Regulation", "Review", "Done"]

  return (
    <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-[#1E2737]">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex-1 px-4 py-3 text-xs font-medium text-center transition-colors ${
              i === step
                ? "text-[#3B82F6] border-b-2 border-[#3B82F6] bg-[#3B82F6]/5"
                : i < step
                ? "text-[#10B981]"
                : "text-[#4A5568]"
            }`}
          >
            {i < step ? "✓ " : ""}{s}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Select Supplier */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-base font-semibold text-[#E8EDF5]">
                  Select a Supplier
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {suppliersData?.suppliers.map((supplier) => (
                    <label
                      key={supplier.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSupplierId === supplier.id
                          ? "border-[#3B82F6] bg-[#3B82F6]/5"
                          : "border-[#1E2737] hover:border-[#2A3447]"
                      }`}
                    >
                      <input
                        type="radio"
                        value={supplier.id}
                        {...register("supplierId")}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#E8EDF5]">{supplier.name}</p>
                        <p className="text-xs text-[#8B9BB4]">
                          {supplier.country} · {supplier.industry}
                        </p>
                      </div>
                      {selectedSupplierId === supplier.id && (
                        <CheckCircle2 size={16} className="text-[#3B82F6]" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.supplierId && (
                  <p className="text-xs text-[#EF4444]">{errors.supplierId.message}</p>
                )}
              </motion.div>
            )}

            {/* Step 1: Select Regulation */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-base font-semibold text-[#E8EDF5]">
                  Select Report Type
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {REGULATIONS.map((reg) => (
                    <label
                      key={reg.code}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedRegulation === reg.code
                          ? "border-[#3B82F6] bg-[#3B82F6]/5"
                          : "border-[#1E2737] hover:border-[#2A3447]"
                      }`}
                      onClick={() => {
                        setSelectedRegulation(reg.code)
                        setValue("reportType", reg.code)
                      }}
                    >
                      <input
                        type="radio"
                        value={reg.code}
                        {...register("reportType")}
                        className="sr-only"
                      />
                      <div
                        className="text-xs font-bold mb-1"
                        style={{ color: reg.color }}
                      >
                        {reg.name}
                      </div>
                      <p className="text-xs text-[#8B9BB4]">{reg.description}</p>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-base font-semibold text-[#E8EDF5]">Review & Generate</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#161B25]">
                    <span className="text-xs text-[#8B9BB4]">Supplier</span>
                    <span className="text-sm font-medium text-[#E8EDF5]">
                      {selectedSupplier?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#161B25]">
                    <span className="text-xs text-[#8B9BB4]">Report Type</span>
                    <span className="text-sm font-medium text-[#E8EDF5]">
                      {REGULATIONS.find((r) => r.code === selectedRegulation)?.name ?? "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#3B82F6]/5 border border-[#3B82F6]/20">
                    <p className="text-xs text-[#8B9BB4]">
                      Meridian&apos;s AI/ML API intelligence layer will generate this report using
                      all available signals
                      and evidence. This typically takes 30–60 seconds.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Done */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 size={32} className="text-[#10B981]" />
                </motion.div>
                <h3 className="text-base font-semibold text-[#E8EDF5]">
                  Report Generation Started
                </h3>
                <p className="text-sm text-[#8B9BB4]">
                  Your report is being generated by Meridian&apos;s AI/ML API intelligence layer.
                  Check the Reports page in 30–60 seconds.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1E2737]">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#8B9BB4] hover:text-[#E8EDF5] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>

            {step < 2 ? (
              <motion.button
                type="button"
                onClick={() => setStep(step + 1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={generateReport.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {generateReport.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileText size={14} />
                )}
                {generateReport.isPending ? "Generating..." : "Generate Report"}
              </motion.button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
