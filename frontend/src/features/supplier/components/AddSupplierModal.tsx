"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Loader2, Building2 } from "lucide-react"
import { useCreateSupplier } from "../hooks/useSupplier"
import type { CreateSupplierFormData } from "../types/supplier.types"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().length(2, "Enter a 2-letter country code (e.g. CN, US)").toUpperCase(),
  industry: z.string().min(2, "Industry is required"),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  tier: z.coerce.number().int().min(1).max(2).default(1),
  tags: z.array(z.string()).default([]),
})

interface AddSupplierModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal for adding a new supplier to the monitoring system.
 * Triggers an initial GNSH scan on creation.
 */
export function AddSupplierModal({ isOpen, onClose }: AddSupplierModalProps) {
  const createSupplier = useCreateSupplier()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupplierFormData>({
    resolver: zodResolver(schema),
    defaultValues: { tier: 1, tags: [] },
  })

  const onSubmit = (data: CreateSupplierFormData) => {
    createSupplier.mutate(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-[#161B25] border border-[#1E2737] text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors text-sm"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[#0E1117] border border-[#1E2737] rounded-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#1E2737]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                    <Building2 size={18} className="text-[#3B82F6]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#E8EDF5]">Add Supplier</h2>
                    <p className="text-xs text-[#8B9BB4]">Triggers an initial compliance scan</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#4A5568] hover:text-[#8B9BB4] hover:bg-[#161B25] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
                    Supplier Name *
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Shenzhen Electronics Co."
                    className={inputClass}
                  />
                  {errors.name && <p className="text-xs text-[#EF4444]">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
                      Country Code *
                    </label>
                    <input
                      {...register("country")}
                      placeholder="CN"
                      maxLength={2}
                      className={inputClass}
                    />
                    {errors.country && <p className="text-xs text-[#EF4444]">{errors.country.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
                      Industry *
                    </label>
                    <input
                      {...register("industry")}
                      placeholder="Electronics"
                      className={inputClass}
                    />
                    {errors.industry && <p className="text-xs text-[#EF4444]">{errors.industry.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
                    Website URL
                  </label>
                  <input
                    {...register("websiteUrl")}
                    type="url"
                    placeholder="https://supplier.com"
                    className={inputClass}
                  />
                  {errors.websiteUrl && <p className="text-xs text-[#EF4444]">{errors.websiteUrl.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Brief description of the supplier..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {createSupplier.error && (
                  <div className="px-4 py-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm">
                    {createSupplier.error.message}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2737] text-[#8B9BB4] hover:text-[#E8EDF5] hover:border-[#2A3447] transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={createSupplier.isPending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium transition-colors disabled:opacity-60 text-sm"
                  >
                    {createSupplier.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    {createSupplier.isPending ? "Adding..." : "Add Supplier"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
