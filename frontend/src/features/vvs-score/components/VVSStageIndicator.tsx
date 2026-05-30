"use client"

import { motion } from "framer-motion"
import { getVvsStageColor, getVvsStageBadgeClass, getVvsStageLabel } from "@/lib/utils"
import type { VvsStage } from "@/types/api.types"

interface VVSStageIndicatorProps {
  stage: VvsStage
  score?: number
  showScore?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

const STAGE_DESCRIPTIONS: Record<VvsStage, string> = {
  MURMUR: "Monitor normally",
  RIPPLE: "Escalate to analyst",
  WAVE: "Alert manager",
  SURGE: "Emergency escalation",
}

/**
 * Animated badge showing the current VVS risk stage.
 * Pulses for SURGE stage to indicate urgency.
 */
export function VVSStageIndicator({
  stage,
  score,
  showScore = false,
  size = "md",
  animated = true,
}: VVSStageIndicatorProps) {
  const color = getVvsStageColor(stage)
  const badgeClass = getVvsStageBadgeClass(stage)
  const isSurge = stage === "SURGE"

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      className="inline-flex items-center gap-2"
    >
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${badgeClass} ${sizeClasses[size]}`}
        style={
          isSurge
            ? {
                animation: "pulse-danger 2s ease-in-out infinite",
              }
            : undefined
        }
      >
        {/* Dot indicator */}
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: size === "sm" ? 6 : 8,
            height: size === "sm" ? 6 : 8,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        {getVvsStageLabel(stage)}
        {showScore && score !== undefined && (
          <span className="font-mono opacity-80">({Math.round(score)})</span>
        )}
      </div>
    </motion.div>
  )
}
