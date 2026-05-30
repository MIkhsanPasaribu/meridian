"use client"

import { motion } from "framer-motion"
import { Activity, Globe, Zap } from "lucide-react"
import { useMonitoringJobs } from "@/features/monitoring"
import { AgentJobBoard } from "@/features/monitoring"
import { ManualScanTrigger } from "@/features/monitoring"
import { AgentHealthDashboard } from "@/features/monitoring"

const GEO_SOURCES = [
  { region: "East Asia", lang: "ZH", sources: ["Weibo", "Maimai", "Baidu News", "CNKI"], color: "#EF4444" },
  { region: "Southeast Asia", lang: "VI/ID/TH", sources: ["VnExpress", "Kompas", "Khaosod", "WALHI"], color: "#F59E0B" },
  { region: "South Asia", lang: "HI/BN", sources: ["India Labour", "Daily Star BD", "RMG Forums"], color: "#10B981" },
  { region: "MENA", lang: "AR", sources: ["Saudi Gazette", "HRSD", "Regional Portals"], color: "#3B82F6" },
  { region: "Global NGOs", lang: "EN", sources: ["BHRRC", "KnowTheChain", "CHRB", "GSI"], color: "#8B9BB4" },
]

/**
 * Monitoring agent page — GNSH Engine dashboard with job board and health metrics.
 */
export default function MonitoringPage() {
  const { data: jobs = [], isLoading } = useMonitoringJobs()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#3B82F6]/10">
          <Activity size={20} className="text-[#3B82F6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Monitoring Agent</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            GNSH Engine — Geo-Native Signal Harvesting across 60+ sources
          </p>
        </div>
      </div>

      {/* Health metrics */}
      <AgentHealthDashboard jobs={jobs} />

      {/* Manual scan trigger */}
      <ManualScanTrigger />

      {/* Job board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[#3B82F6]" />
          <h2 className="text-sm font-semibold text-[#E8EDF5]">Agent Job Board</h2>
          <span className="ml-auto text-xs text-[#4A5568]">
            {jobs.length} total jobs
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 rounded w-20" />
                <div className="skeleton h-16 rounded-lg" />
                <div className="skeleton h-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <AgentJobBoard jobs={jobs} />
        )}
      </motion.div>

      {/* Geo-native sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-[#8B9BB4]" />
          <h2 className="text-sm font-semibold text-[#E8EDF5]">Geo-Native Signal Sources</h2>
          <span className="ml-auto text-xs text-[#4A5568]">60+ sources monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {GEO_SOURCES.map((region, i) => (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="p-3 rounded-lg bg-[#161B25] border border-[#1E2737]"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: region.color }}
                />
                <span className="text-xs font-semibold text-[#E8EDF5]">
                  {region.region}
                </span>
              </div>
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded mb-2 inline-block"
                style={{
                  backgroundColor: `${region.color}15`,
                  color: region.color,
                }}
              >
                {region.lang}
              </span>
              <div className="space-y-0.5">
                {region.sources.map((source) => (
                  <p key={source} className="text-xs text-[#4A5568]">
                    · {source}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
