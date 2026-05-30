"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Globe, Building2 } from "lucide-react"
import Link from "next/link"
import { useSupplier } from "../hooks/useSupplier"
import { VVSStageBadge } from "@/components/common/VVSStageBadge"
import { countryFlag, formatDate } from "@/lib/utils"
import type { VvsStage } from "@/types/api.types"

interface SupplierDetailPageProps {
  supplierId: string
}

/**
 * Supplier detail page showing full supplier info and VVS score.
 */
export function SupplierDetailPage({ supplierId }: SupplierDetailPageProps) {
  const { data: supplier, isLoading } = useSupplier(supplierId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8B9BB4]">Supplier not found</p>
      </div>
    )
  }

  const latestReading = supplier.vvsReadings?.[0]

  return (
    <div className="space-y-6">
      <Link href="/supplier" className="inline-flex items-center gap-2 text-sm text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Suppliers
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">{supplier.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-[#8B9BB4]">
              {countryFlag(supplier.country)} {supplier.country}
            </span>
            <span className="text-[#1E2737]">·</span>
            <span className="text-sm text-[#8B9BB4]">{supplier.industry}</span>
            <span className="text-[#1E2737]">·</span>
            <span className="text-sm text-[#8B9BB4]">Tier {supplier.tier}</span>
          </div>
        </div>
        {latestReading && (
          <VVSStageBadge
            stage={latestReading.stage as VvsStage}
            score={latestReading.score}
            size="lg"
          />
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supplier.websiteUrl && (
          <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-4 flex items-center gap-3">
            <Globe className="w-4 h-4 text-[#3B82F6]" />
            <div>
              <p className="text-xs text-[#4A5568]">Website</p>
              <a
                href={supplier.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#3B82F6] hover:underline"
              >
                {supplier.websiteUrl}
              </a>
            </div>
          </div>
        )}
        <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-4 flex items-center gap-3">
          <Building2 className="w-4 h-4 text-[#8B9BB4]" />
          <div>
            <p className="text-xs text-[#4A5568]">Industry</p>
            <p className="text-sm text-[#E8EDF5]">{supplier.industry}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5">
        <p className="text-xs text-[#4A5568]">
          Added {formatDate(supplier.createdAt)} · Last updated {formatDate(supplier.updatedAt)}
        </p>
      </div>
    </div>
  )
}
