"use client"

import { motion } from "framer-motion"
import { FileText, Download, ExternalLink, Calendar, TrendingUp } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { formatDate } from "@/lib/utils"
import { VVSStageIndicator } from "@/features/vvs-score"
import type { ComplianceReport } from "@/types/global.types"
import type { VvsStage } from "@/types/api.types"

interface BriefViewerProps {
  report: ComplianceReport
}

/**
 * Full-page brief reader with evidence highlights.
 * Renders the AI-generated compliance intelligence report.
 */
export function BriefViewer({ report }: BriefViewerProps) {
  const content = report.content as Record<string, unknown>
  const briefMarkdown =
    (content?.markdown as string) ?? (content?.briefMarkdown as string) ?? ""

  /**
   * Exports the report markdown as a downloadable .md file.
   */
  const handleExport = () => {
    if (!briefMarkdown) return
    const blob = new Blob([briefMarkdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const safeTitle = (report.title || "meridian-report")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${safeTitle}.md`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Report header */}
      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#3B82F6]/10">
              <FileText size={24} className="text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#E8EDF5]">{report.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 font-mono">
                  {report.regulation}
                </span>
                {report.vvsStage && (
                  <VVSStageIndicator
                    stage={report.vvsStage as VvsStage}
                    score={report.vvsScore ?? undefined}
                    showScore
                    size="sm"
                  />
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    report.status === "FINALIZED"
                      ? "bg-[#10B981]/10 text-[#10B981]"
                      : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}
                >
                  {report.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!briefMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B25] border border-[#1E2737] text-xs text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#1E2737]">
          <div className="flex items-center gap-1.5 text-xs text-[#4A5568]">
            <Calendar size={12} />
            Generated {formatDate(report.createdAt)}
          </div>
          {report.supplier && (
            <div className="flex items-center gap-1.5 text-xs text-[#4A5568]">
              <ExternalLink size={12} />
              {report.supplier.name} · {report.supplier.country}
            </div>
          )}
        </div>
      </div>

      {/* Report content */}
      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-6 md:p-8">
        {briefMarkdown ? (
          <div className="max-w-none text-sm leading-relaxed text-[#C7D2E0] space-y-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-[#E8EDF5] mt-2 mb-4 pb-2 border-b border-[#1E2737]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-[#E8EDF5] mt-6 mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-[#E8EDF5] mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => <p className="text-[#C7D2E0] my-2">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#E8EDF5]">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1 text-[#C7D2E0]">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 my-2 space-y-1 text-[#C7D2E0]">{children}</ol>
                ),
                li: ({ children }) => <li className="text-[#C7D2E0]">{children}</li>,
                hr: () => <hr className="my-5 border-[#1E2737]" />,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3B82F6] hover:underline"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#3B82F6]/40 pl-4 italic text-[#8B9BB4] my-3">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded bg-[#161B25] text-[#E8EDF5] font-mono text-xs">
                    {children}
                  </code>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="w-full text-left border-collapse text-xs">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-[#1E2737] px-3 py-2 bg-[#161B25] text-[#E8EDF5] font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-[#1E2737] px-3 py-2 text-[#C7D2E0]">{children}</td>
                ),
              }}
            >
              {briefMarkdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp size={32} className="text-[#4A5568] mb-3" />
            <p className="text-sm text-[#8B9BB4]">Report content is being generated</p>
            <p className="text-xs text-[#4A5568] mt-1">
              This may take up to 60 seconds
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
