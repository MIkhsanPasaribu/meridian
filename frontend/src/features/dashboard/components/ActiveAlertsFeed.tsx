"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronRight } from "lucide-react"
import { timeAgo, countryFlag } from "@/lib/utils"
import type { Alert } from "@/types/global.types"
import type { AlertSeverity } from "@/types/api.types"

interface ActiveAlertsFeedProps {
  alerts: Alert[]
}

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: React.ReactNode; color: string; bg: string }> = {
  CRITICAL: {
    icon: <AlertTriangle size={14} />,
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
  HIGH: {
    icon: <AlertCircle size={14} />,
    color: "#F97316",
    bg: "rgba(249, 115, 22, 0.1)",
  },
  MEDIUM: {
    icon: <AlertCircle size={14} />,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  LOW: {
    icon: <Info size={14} />,
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.1)",
  },
  INFO: {
    icon: <CheckCircle size={14} />,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
  },
}

/**
 * Real-time feed of the latest compliance alerts.
 * Animates new alerts as they arrive via WebSocket.
 */
export function ActiveAlertsFeed({ alerts }: ActiveAlertsFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle size={32} className="text-[#10B981] mb-2 opacity-60" />
        <p className="text-sm text-[#8B9BB4]">No active alerts</p>
        <p className="text-xs text-[#4A5568] mt-1">All suppliers are within normal parameters</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {alerts.map((alert, i) => {
          const config = SEVERITY_CONFIG[alert.severity]

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-[#1E2737] hover:border-[#2A3447] cursor-pointer transition-colors group"
              style={{ backgroundColor: config.bg }}
            >
              <div
                className="flex-shrink-0 p-1.5 rounded-md mt-0.5"
                style={{ color: config.color, backgroundColor: `${config.color}20` }}
              >
                {config.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold" style={{ color: config.color }}>
                    {alert.severity}
                  </span>
                  {alert.supplier && (
                    <span className="text-xs text-[#8B9BB4]">
                      {countryFlag(alert.supplier.country)} {alert.supplier.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#E8EDF5] truncate">{alert.title}</p>
                <p className="text-xs text-[#4A5568] mt-0.5">{timeAgo(alert.createdAt)}</p>
              </div>

              <ChevronRight
                size={14}
                className="flex-shrink-0 text-[#4A5568] group-hover:text-[#8B9BB4] transition-colors mt-1"
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
