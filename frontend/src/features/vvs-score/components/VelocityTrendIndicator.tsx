"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface VelocityTrendIndicatorProps {
  delta: number
  period?: string
}

/**
 * Arrow indicator showing VVS trend direction vs the previous period.
 * Green = improving, Red = worsening, Gray = stable.
 */
export function VelocityTrendIndicator({
  delta,
  period = "7 days",
}: VelocityTrendIndicatorProps) {
  const isUp = delta > 2
  const isDown = delta < -2
  const isStable = !isUp && !isDown

  const config = isUp
    ? { icon: TrendingUp, color: "#EF4444", label: "Rising", bg: "rgba(239, 68, 68, 0.1)" }
    : isDown
    ? { icon: TrendingDown, color: "#10B981", label: "Falling", bg: "rgba(16, 185, 129, 0.1)" }
    : { icon: Minus, color: "#8B9BB4", label: "Stable", bg: "rgba(139, 155, 180, 0.1)" }

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ backgroundColor: config.bg }}
    >
      <Icon size={14} style={{ color: config.color }} />
      <span className="text-xs font-semibold" style={{ color: config.color }}>
        {config.label}
      </span>
      <span className="text-xs font-mono" style={{ color: config.color }}>
        {delta > 0 ? "+" : ""}
        {delta.toFixed(1)}
      </span>
      <span className="text-xs text-[#4A5568]">vs {period}</span>
    </motion.div>
  )
}
