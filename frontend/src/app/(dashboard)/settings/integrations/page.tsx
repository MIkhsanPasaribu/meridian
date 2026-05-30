"use client"

import { motion } from "framer-motion"
import { Plug, CheckCircle, AlertCircle } from "lucide-react"

const INTEGRATIONS = [
  {
    name: "Bright Data SERP API",
    description: "Multi-language news signal collection",
    status: "configured",
    icon: "🔍",
  },
  {
    name: "Bright Data Web Unlocker",
    description: "Bypass geo-blocks on regional forums",
    status: "configured",
    icon: "🔓",
  },
  {
    name: "Bright Data Scraping Browser",
    description: "Render JS-heavy platforms (Weibo, Maimai)",
    status: "configured",
    icon: "🌐",
  },
  {
    name: "Bright Data MCP Server",
    description: "Direct LangGraph agent web access",
    status: "configured",
    icon: "🤖",
  },
  {
    name: "AI/ML API",
    description: "Intelligence layer — reasoning, extraction & report generation",
    status: "configured",
    icon: "🧠",
  },
  {
    name: "Featherless AI",
    description: "Serverless open-source model inference (signal summarization)",
    status: "configured",
    icon: "🪶",
  },
  {
    name: "Speechmatics",
    description: "Speech-to-text transcription for audio evidence",
    status: "configured",
    icon: "🎙️",
  },
  {
    name: "Groq",
    description: "Fast LLM preprocessing & signal classification",
    status: "configured",
    icon: "⚡",
  },
  {
    name: "Slack Webhook",
    description: "Alert notifications to Slack",
    status: "not_configured",
    icon: "💬",
  },
]

/**
 * Integrations settings page.
 */
export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Plug size={20} className="text-[#3B82F6]" />
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Integrations</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            Connected services and API configurations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration, i) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-4 hover:border-[#2A3447] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#E8EDF5]">{integration.name}</p>
                  <p className="text-xs text-[#8B9BB4] mt-0.5">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {integration.status === "configured" ? (
                  <>
                    <CheckCircle size={14} className="text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="text-[#F59E0B]" />
                    <span className="text-xs text-[#F59E0B]">Setup needed</span>
                  </>
                )}
              </div>
            </div>
            {integration.status === "not_configured" && (
              <button className="mt-3 w-full px-3 py-1.5 rounded-lg border border-[#3B82F6]/30 text-[#3B82F6] text-xs hover:bg-[#3B82F6]/5 transition-colors">
                Configure
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
