"use client"

import { motion } from "framer-motion"
import { getVvsStageColor, getVvsStageLabel } from "@/lib/utils"
import type { VvsStage } from "@/types/api.types"

interface VVSGaugeProps {
  score: number
  stage: VvsStage
  size?: "sm" | "md" | "lg"
}

const SIZE_CONFIG = {
  sm: { width: 120, height: 70, strokeWidth: 8, fontSize: 20 },
  md: { width: 180, height: 100, strokeWidth: 10, fontSize: 28 },
  lg: { width: 240, height: 140, strokeWidth: 12, fontSize: 36 },
}

/**
 * Arc-shaped gauge chart displaying the VVS score (0-100).
 * Color changes based on the current VVS stage.
 */
export function VVSGauge({ score, stage, size = "md" }: VVSGaugeProps) {
  const config = SIZE_CONFIG[size]
  const { width, height, strokeWidth, fontSize } = config

  const radius = (width - strokeWidth * 2) / 2
  const cx = width / 2
  const cy = height - strokeWidth

  // Arc from 180° to 0° (left to right)
  const startAngle = Math.PI
  const endAngle = 0
  const totalAngle = Math.PI

  const scoreAngle = startAngle - (score / 100) * totalAngle

  const startX = cx + radius * Math.cos(startAngle)
  const startY = cy + radius * Math.sin(startAngle)
  const endX = cx + radius * Math.cos(scoreAngle)
  const endY = cy + radius * Math.sin(scoreAngle)

  const largeArcFlag = score > 50 ? 1 : 0

  const trackPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`
  const scorePath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`

  const stageColor = getVvsStageColor(stage)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={width} height={height + strokeWidth} viewBox={`0 0 ${width} ${height + strokeWidth}`}>
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="#1E2737"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Score arc */}
        <motion.path
          d={scorePath}
          fill="none"
          stroke={stageColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          style={{
            filter: `drop-shadow(0 0 6px ${stageColor}60)`,
          }}
        />

        {/* Score text */}
        <motion.text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={stageColor}
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="Geist Mono, monospace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {Math.round(score)}
        </motion.text>
      </svg>

      {/* Stage label */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-1.5"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: stageColor, boxShadow: `0 0 6px ${stageColor}` }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: stageColor }}>
          {getVvsStageLabel(stage)}
        </span>
      </motion.div>
    </div>
  )
}
