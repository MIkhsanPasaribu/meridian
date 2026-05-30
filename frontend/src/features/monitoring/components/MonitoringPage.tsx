"use client"

import { motion } from "framer-motion"
import { Activity, Scan, BarChart3 } from "lucide-react"
import { useState } from "react"
import { AgentJobBoard } from "./AgentJobBoard"
import { ManualScanTrigger } from "./ManualScanTrigger"
import { AgentHealthDashboard } from "./AgentHealthDashboard"
import { useMonitoringJobs } from "../hooks/useMonitoring"
import { LottieAnimation } from "@/components/common/LottieAnimation"

/**
 * Monitoring agent page — GNSH Engine job board and health dashboard.
 */
export function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<"board" | "health" | "scan">("board")
  const { data: jobs = [], isLoading } = useMonitoringJobs()

  const activeJobs = jobs.filter((j) => j.status === "RUNNING").length

  const tabs = [
    { id: "board" as const, label: "Job Board", icon: Activity },
    { id: "health" as const, label: "Health", icon: BarChart3 },
    { id: "scan" as const, label: "Manual Scan", icon: Scan },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Monitoring Agent</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            GNSH Engine — Geo-Native Signal Harvesting
          </p>
        </div>

        {activeJobs > 0 && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30"
          >
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-xs text-[#3B82F6] font-medium">
              {activeJobs} active scan{activeJobs > 1 ? "s" : ""}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0E1117] border border-[#1E2737] rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#3B82F6] text-white"
                  : "text-[#8B9BB4] hover:text-[#E8EDF5]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LottieAnimation type="loading" size={48} />
        </div>
      ) : (
        <>
          {activeTab === "board" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5"
            >
              <h2 className="text-sm font-semibold text-[#E8EDF5] mb-4">Agent Job Board</h2>
              <AgentJobBoard jobs={jobs} />
            </motion.div>
          )}

          {activeTab === "health" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <AgentHealthDashboard jobs={jobs} />

              {/* Signal sources */}
              <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-[#E8EDF5] mb-4">
                  Monitored Signal Sources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { region: "East Asia", sources: ["Weibo", "Maimai", "Baidu News", "CNKI"], flag: "🇨🇳" },
                    { region: "Southeast Asia", sources: ["Kompas", "VnExpress", "Khaosod", "Nakertrans"], flag: "🌏" },
                    { region: "South Asia", sources: ["India Labour", "Daily Star BD", "RMG Forums"], flag: "🇮🇳" },
                    { region: "MENA", sources: ["Saudi Gazette", "HRSD Saudi", "Regional Portals"], flag: "🌍" },
                    { region: "NGO Global", sources: ["BHRRC", "KnowTheChain", "CHRB", "GSI"], flag: "🌐" },
                    { region: "Regulatory", sources: ["CBP UFLPA", "BAFA LkSG", "EC CSDDD"], flag: "⚖️" },
                  ].map((item) => (
                    <div
                      key={item.region}
                      className="p-3 rounded-lg bg-[#161B25] border border-[#1E2737]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span>{item.flag}</span>
                        <span className="text-xs font-semibold text-[#E8EDF5]">{item.region}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.sources.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-1.5 py-0.5 rounded bg-[#1E2737] text-[#8B9BB4]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "scan" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-md"
            >
              <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-[#E8EDF5] mb-4">
                  Trigger Manual Scan
                </h2>
                <p className="text-xs text-[#8B9BB4] mb-4">
                  Run an on-demand GNSH scan for any supplier. The agent will query
                  SERP API, Web Unlocker, NGO databases, and regulatory portals.
                </p>
                <ManualScanTrigger />
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
