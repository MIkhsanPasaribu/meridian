"use client"

import { cn } from "@/lib/utils"
import type { AlertSeverity } from "@/types/api.types"

interface SeverityBadgeProps {
  severity: AlertSeverity
  size?: "sm" | "md"
}

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: "Critical", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  HIGH: { label: "High", color: "#F97316", bg: "rgba(249, 115, 22, 0.1)" },
  MEDIUM: { label: "Medium", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
  LOW: { label: "Low", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  INFO: { label: "Info", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" },
}

/**
 * Alert severity badge component.
 */
export function SeverityBadge({ severity, size = "md" }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"
      )}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: `${config.color}30`,
      }}
    >
      {config.label}
    </span>
  )
}
