"use client"

import { motion } from "framer-motion"
import { Plus, Search, Building2 } from "lucide-react"
import { useState } from "react"
import { useSuppliers } from "@/features/supplier"
import { AddSupplierModal } from "@/features/supplier"
import { VVSStageBadge } from "@/components/common/VVSStageBadge"
import { EmptyState } from "@/components/common/EmptyState"
import { countryFlag, timeAgo } from "@/lib/utils"
import type { VvsStage } from "@/types/api.types"

/**
 * Supplier management page with searchable, sortable table.
 */
export default function SupplierPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data, isLoading } = useSuppliers({ search, limit: 20 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Suppliers</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            {data?.pagination.total ?? 0} suppliers monitored
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium transition-colors text-sm"
        >
          <Plus size={16} />
          Add Supplier
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
        <input
          type="text"
          placeholder="Search by name, country, or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0E1117] border border-[#1E2737] rounded-lg text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-lg" />
            ))}
          </div>
        ) : !data?.suppliers.length ? (
          <EmptyState
            icon={Building2}
            title="No suppliers yet"
            description="Add your first supplier to start monitoring compliance signals."
            action={
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-medium"
              >
                <Plus size={14} />
                Add Supplier
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2737]">
                {["Supplier", "Country", "Industry", "VVS Stage", "Alerts", "Added"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#8B9BB4] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.suppliers.map((supplier, i) => {
                const latestReading = supplier.vvsReadings?.[0]

                return (
                  <motion.tr
                    key={supplier.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-[#1E2737] hover:bg-[#161B25] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-[#3B82F6]" />
                        </div>
                        <span className="text-sm font-medium text-[#E8EDF5]">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8B9BB4]">
                      {countryFlag(supplier.country)} {supplier.country}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8B9BB4]">{supplier.industry}</td>
                    <td className="px-4 py-3">
                      {latestReading ? (
                        <VVSStageBadge
                          stage={latestReading.stage as VvsStage}
                          score={latestReading.score}
                        />
                      ) : (
                        <span className="text-xs text-[#4A5568]">Pending scan</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-[#8B9BB4]">
                        {supplier._count?.alerts ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568]">
                      {timeAgo(supplier.createdAt)}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddSupplierModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  )
}
