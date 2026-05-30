"use client"

import { motion } from "framer-motion"
import { Activity, Cpu, Zap } from "lucide-react"

interface AgentMonitoringStatusProps {
  activeJobs: number
}

/**
 * Status indicator for currently running monitoring agents.
 * Shows the scan line animation when agents are active.
 */
export function AgentMonitoringStatus({ activeJobs }: AgentMonitoringStatusProps) {
  const isActive = activeJobs > 0

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 ${
        isActive
          ? "border-[#3B82F6]/40 bg-[#3B82F6]/5 agent-active"
          : "border-[#1E2737] bg-[#0E1117]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-lg ${
            isActive ? "bg-[#3B82F6]/15" : "bg-[#161B25]"
          }`}
        >
          <Cpu
            size={20}
            className={isActive ? "text-[#3B82F6]" : "text-[#4A5568]"}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#E8EDF5]">GNSH Engine</p>
            {isActive && (
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                <span className="text-xs text-[#3B82F6] font-medium">SCANNING</span>
              </motion.div>
            )}
          </div>
          <p className="text-xs text-[#8B9BB4] mt-0.5">
            {isActive
              ? `${activeJobs} active scan${activeJobs > 1 ? "s" : ""} in progress`
              : "All agents idle"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold font-mono text-[#E8EDF5]">{activeJobs}</p>
          <p className="text-xs text-[#4A5568]">active</p>
        </div>
      </div>

      {isActive && (
        <div className="mt-3 flex items-center gap-2">
          {["NewsSignal", "SocialSignal", "NGODatabase", "Regulatory"].map((agent, i) => (
            <motion.div
              key={agent}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#3B82F6]/10 border border-[#3B82F6]/20"
            >
              <Zap size={10} className="text-[#3B82F6]" />
              <span className="text-xs text-[#3B82F6] font-mono">{agent}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
