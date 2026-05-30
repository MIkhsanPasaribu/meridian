"use client"

import { motion } from "framer-motion"
import { Key, Bell, Clock } from "lucide-react"

interface SettingsField {
  label: string
  type: "text" | "password" | "select" | "toggle"
  placeholder?: string
  options?: string[]
}

interface SettingsSection {
  icon: React.ElementType
  title: string
  description: string
  fields: SettingsField[]
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    icon: Key,
    title: "Bright Data API",
    description: "Configure your Bright Data API credentials for web intelligence gathering.",
    fields: [
      { label: "API Key", type: "password", placeholder: "bd_api_key_••••••••" },
      { label: "MCP Server URL", type: "text", placeholder: "https://mcp.brightdata.com/sse" },
    ],
  },
  {
    icon: Clock,
    title: "Monitoring Schedule",
    description: "Configure how frequently Meridian scans your suppliers.",
    fields: [
      {
        label: "Scan Frequency",
        type: "select",
        options: ["Every 24 hours", "Every 12 hours", "Every 7 days"],
      },
      { label: "Target Languages", type: "text", placeholder: "en, zh, ar, vi" },
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure alert channels and notification preferences.",
    fields: [
      { label: "Slack Webhook URL", type: "text", placeholder: "https://hooks.slack.com/services/..." },
      { label: "Email Notifications", type: "toggle" },
    ],
  },
]

/**
 * Settings page for configuring Meridian integrations and preferences.
 */
export function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#E8EDF5]">Settings</h1>
        <p className="text-sm text-[#8B9BB4] mt-0.5">Configure integrations and monitoring preferences</p>
      </motion.div>

      <div className="space-y-4">
        {SETTINGS_SECTIONS.map(({ icon: Icon, title, description, fields }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-6"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-9 h-9 rounded-lg bg-[#161B25] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#E8EDF5]">{title}</h2>
                <p className="text-xs text-[#8B9BB4] mt-0.5">{description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-[#8B9BB4] mb-1.5">
                    {field.label}
                  </label>
                  {field.type === "select" && field.options ? (
                    <select className="w-full max-w-sm px-3 py-2 bg-[#161B25] border border-[#1E2737] rounded-lg text-sm text-[#E8EDF5] focus:outline-none focus:border-[#3B82F6] transition-all">
                      {field.options.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === "toggle" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-5 bg-[#3B82F6] rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                      </div>
                      <span className="text-xs text-[#8B9BB4]">Enabled</span>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full max-w-sm px-3 py-2 bg-[#161B25] border border-[#1E2737] rounded-lg text-sm text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#1E2737] flex justify-end">
              <button className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
