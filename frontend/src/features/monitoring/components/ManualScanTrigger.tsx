"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Scan, Loader2 } from "lucide-react"
import { useTriggerScan } from "../hooks/useMonitoring"
import { useSuppliers } from "@/features/supplier"

const schema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  jobType: z.enum(["manual_scan", "initial_scan"]).default("manual_scan"),
})

type FormData = z.infer<typeof schema>

interface ManualScanTriggerProps {
  onSuccess?: (jobId: string) => void
}

/**
 * Form for triggering an on-demand manual scan for a supplier.
 */
export function ManualScanTrigger({ onSuccess }: ManualScanTriggerProps) {
  const { data: suppliersData } = useSuppliers({ limit: 100 })
  const triggerScan = useTriggerScan()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { jobType: "manual_scan" },
  })

  const onSubmit = (data: FormData) => {
    triggerScan.mutate(
      { supplierId: data.supplierId, jobType: data.jobType },
      {
        onSuccess: (result) => {
          reset()
          onSuccess?.(result.jobId)
        },
      }
    )
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#161B25] border border-[#1E2737] text-[#E8EDF5] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
          Select Supplier
        </label>
        <select {...register("supplierId")} className={inputClass}>
          <option value="">Choose a supplier...</option>
          {suppliersData?.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.country})
            </option>
          ))}
        </select>
        {errors.supplierId && (
          <p className="text-xs text-[#EF4444]">{errors.supplierId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
          Scan Type
        </label>
        <select {...register("jobType")} className={inputClass}>
          <option value="manual_scan">Manual Scan</option>
          <option value="initial_scan">Full Initial Scan</option>
        </select>
      </div>

      {triggerScan.error && (
        <div className="px-3 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs">
          {triggerScan.error.message}
        </div>
      )}

      {triggerScan.isSuccess && (
        <div className="px-3 py-2 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs">
          Scan triggered successfully
        </div>
      )}

      <motion.button
        type="submit"
        disabled={triggerScan.isPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-sm transition-colors disabled:opacity-60"
      >
        {triggerScan.isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Scan size={16} />
        )}
        {triggerScan.isPending ? "Triggering scan..." : "Trigger Scan"}
      </motion.button>
    </form>
  )
}
