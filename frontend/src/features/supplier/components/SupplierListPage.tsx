"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Building2, RefreshCw } from "lucide-react"
import { useSuppliers } from "../hooks/useSupplier"
import { AddSupplierModal } from "./AddSupplierModal"
import { VVSStageBadge } from "@/components/common/VVSStageBadge"
import { EmptyState } from "@/components/common/EmptyState"
import { countryFlag, formatDate } from "@/lib/utils"
import type { VvsStage } from "@/types/api.types"
import type { Supplier } from "@/types/global.types"

/**
 * Supplier list page with search, filters, and add supplier functionality.
 */
export function SupplierListPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data, isLoading, refetch } = useSuppliers({ search })

  const suppliers = data?.suppliers ?? []
  const total = data?.pagination.total ?? 0

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Suppliers</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">{total} suppliers monitored</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </motion.button>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            className="w-full pl-9 pr-4 py-2 bg-[#0E1117] border border-[#1E2737] rounded-lg text-sm text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] transition-all"
          />
        </div>
        <button
          onClick={() => void refetch()}
          className="p-2 text-[#8B9BB4] hover:text-[#E8EDF5] hover:bg-[#161B25] rounded-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E2737]">
              {["Supplier", "Country", "Industry", "VVS Stage", "Updated"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1E2737]">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton h-4 rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={Building2}
                    title="No suppliers yet"
                    description="Add your first supplier to start monitoring ESG compliance signals."
                    action={
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Add Supplier
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              suppliers.map((supplier: Supplier, index: number) => {
                const latestReading = supplier.vvsReadings?.[0]
                return (
                  <motion.tr
                    key={supplier.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-[#1E2737] hover:bg-[#161B25] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#E8EDF5]">{supplier.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#8B9BB4]">
                        {countryFlag(supplier.country)} {supplier.country}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#8B9BB4]">{supplier.industry}</span>
                    </td>
                    <td className="px-4 py-3">
                      {latestReading ? (
                        <VVSStageBadge stage={latestReading.stage as VvsStage} score={latestReading.score} />
                      ) : (
                        <span className="text-xs text-[#4A5568]">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#4A5568]">{formatDate(supplier.updatedAt)}</span>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <AddSupplierModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}
