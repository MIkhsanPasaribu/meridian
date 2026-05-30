"use client"

import { motion } from "framer-motion"
import { VVSStageIndicator } from "./VVSStageIndicator"
import { countryFlag } from "@/lib/utils"
import type { VvsStage } from "@/types/api.types"

interface SupplierVvsRow {
  id: string
  name: string
  country: string
  score: number
  stage: VvsStage
  delta: number
}

interface VVSComparatorTableProps {
  suppliers: SupplierVvsRow[]
  highlightId?: string
}

/**
 * Comparison table of VVS scores across suppliers in the same industry.
 * Highlights the current supplier for context.
 */
export function VVSComparatorTable({ suppliers, highlightId }: VVSComparatorTableProps) {
  const sorted = [...suppliers].sort((a, b) => b.score - a.score)

  return (
    <div className="overflow-hidden rounded-xl border border-[#1E2737]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1E2737]">
            <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
              Stage
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[#4A5568] uppercase tracking-wider">
              Score
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[#4A5568] uppercase tracking-wider">
              Δ 7d
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((supplier, i) => {
            const isHighlighted = supplier.id === highlightId
            return (
              <motion.tr
                key={supplier.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`border-b border-[#1E2737] transition-colors ${
                  isHighlighted
                    ? "bg-[#3B82F6]/5 border-l-2 border-l-[#3B82F6]"
                    : "hover:bg-[#161B25]"
                }`}
              >
                <td className="px-4 py-3 text-sm font-mono text-[#4A5568]">
                  #{i + 1}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className={`text-sm font-medium ${isHighlighted ? "text-[#3B82F6]" : "text-[#E8EDF5]"}`}>
                      {supplier.name}
                      {isHighlighted && (
                        <span className="ml-2 text-xs text-[#3B82F6] opacity-70">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-[#4A5568]">
                      {countryFlag(supplier.country)} {supplier.country}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <VVSStageIndicator stage={supplier.stage} size="sm" animated={false} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold font-mono text-[#E8EDF5]">
                    {supplier.score.toFixed(0)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className="text-xs font-mono"
                    style={{
                      color:
                        supplier.delta > 0
                          ? "#EF4444"
                          : supplier.delta < 0
                          ? "#10B981"
                          : "#8B9BB4",
                    }}
                  >
                    {supplier.delta > 0 ? "+" : ""}
                    {supplier.delta.toFixed(1)}
                  </span>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
