"use client"

import { motion } from "framer-motion"
import { Settings, Key, Bell, Database, Clock } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E8EDF5]">Settings</h1>
        <p className="text-sm text-[#8B9BB4] mt-0.5">
          Configure monitoring, integrations, and organization preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Key, label: "Bright Data API", desc: "Configure API keys for web intelligence" },
          { icon: Bell, label: "Notifications", desc: "Email, Slack, and in-app alert settings" },
          { icon: Clock, label: "Monitoring Schedule", desc: "Set scan frequency and timing" },
          { icon: Database, label: "Data Retention", desc: "Configure signal and evidence retention" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5 hover:border-[#2A3447] transition-colors cursor-pointer flex items-center gap-4"
          >
            <div className="p-3 rounded-lg bg-[#161B25]">
              <item.icon size={20} className="text-[#8B9BB4]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#E8EDF5]">{item.label}</p>
              <p className="text-xs text-[#8B9BB4]">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
