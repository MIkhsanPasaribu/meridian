"use client"

import { motion } from "framer-motion"
import { Bell, AlertTriangle, TrendingUp, Zap, CheckCircle2 } from "lucide-react"
import { SeverityBadge } from "@/components/common/SeverityBadge"
import { timeAgo } from "@/lib/utils"

const MOCK_ALERTS = [
  { id: "1", title: "VVS Spike Detected", supplier: "Bangladesh Garments Ltd", severity: "CRITICAL" as const, type: "vvs_spike", vvsBefore: 65, vvsAfter: 82, time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), acknowledged: false },
  { id: "2", title: "New Stage: WAVE", supplier: "Shenzhen Electronics Co.", severity: "HIGH" as const, type: "new_stage_entered", vvsBefore: 48, vvsAfter: 54, time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), acknowledged: false },
  { id: "3", title: "Critical Signal Detected", supplier: "Vietnam Textile Group", severity: "HIGH" as const, type: "critical_signal", time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), acknowledged: true },
  { id: "4", title: "Scan Completed", supplier: "India Auto Parts Mfg", severity: "INFO" as const, type: "scan_completed", time: new Date(Date.now() - 1000 * 60 * 180).toISOString(), acknowledged: true },
]

/**
 * Alerts inbox page showing all compliance alerts.
 */
export function AlertsPage() {
  const unacknowledged = MOCK_ALERTS.filter((a) => !a.acknowledged).length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Alert Inbox</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            {unacknowledged} unacknowledged alerts
          </p>
        </div>
        {unacknowledged > 0 && (
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-full">
            {unacknowledged} new
          </span>
        )}
      </motion.div>

      <div className="space-y-3">
        {MOCK_ALERTS.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`bg-[#0E1117] border rounded-xl p-4 transition-all ${
              alert.acknowledged ? "border-[#1E2737] opacity-60" : "border-[#1E2737] hover:border-[#2A3447]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#161B25] flex items-center justify-center shrink-0">
                {alert.type === "vvs_spike" && <TrendingUp className="w-4 h-4 text-[#EF4444]" />}
                {alert.type === "new_stage_entered" && <Zap className="w-4 h-4 text-[#F97316]" />}
                {alert.type === "critical_signal" && <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />}
                {alert.type === "scan_completed" && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-[#E8EDF5]">{alert.title}</p>
                  <SeverityBadge severity={alert.severity} size="sm" />
                  {alert.acknowledged && (
                    <span className="text-xs text-[#4A5568]">Acknowledged</span>
                  )}
                </div>
                <p className="text-sm text-[#8B9BB4]">{alert.supplier}</p>
                {alert.vvsBefore !== undefined && alert.vvsAfter !== undefined && (
                  <p className="text-xs text-[#4A5568] mt-1 font-mono">
                    VVS: {alert.vvsBefore} → <span className="text-[#EF4444]">{alert.vvsAfter}</span>
                    {" "}(+{alert.vvsAfter - alert.vvsBefore})
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-[#4A5568]">{timeAgo(alert.time)}</span>
                {!alert.acknowledged && (
                  <button className="text-xs px-2 py-1 bg-[#161B25] border border-[#1E2737] text-[#8B9BB4] hover:text-[#E8EDF5] rounded-lg transition-all">
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
