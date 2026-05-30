"use client"

import { use } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useReport } from "@/features/reports"
import { BriefViewer } from "@/features/reports"
import { LottieAnimation } from "@/components/common/LottieAnimation"

interface ReportDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Report detail page — shows the full compliance report.
 */
export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = use(params)
  const { data: report, isLoading } = useReport(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LottieAnimation type="loading" size={48} />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8B9BB4]">Report not found</p>
        <Link href="/reports" className="text-[#3B82F6] text-sm mt-2 inline-block">
          Back to Reports
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-sm text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Reports
      </Link>
      <BriefViewer report={report} />
    </div>
  )
}
