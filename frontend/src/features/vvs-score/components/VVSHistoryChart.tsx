"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { format } from "date-fns"
import type { VvsReading } from "@/types/global.types"

interface VVSHistoryChartProps {
  readings: VvsReading[]
  height?: number
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null

  const score = payload[0].value
  const stage =
    score <= 25 ? "MURMUR" : score <= 50 ? "RIPPLE" : score <= 75 ? "WAVE" : "SURGE"
  const stageColors: Record<string, string> = {
    MURMUR: "#10B981",
    RIPPLE: "#F59E0B",
    WAVE: "#F97316",
    SURGE: "#EF4444",
  }

  return (
    <div className="bg-[#161B25] border border-[#1E2737] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[#8B9BB4] mb-1">{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color: stageColors[stage] }}>
        VVS {score}
      </p>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: stageColors[stage] }}>
        {stage}
      </p>
    </div>
  )
}

/**
 * Time-series line chart showing VVS score history over 90 days.
 * Color zones indicate risk stages.
 */
export function VVSHistoryChart({ readings, height = 200 }: VVSHistoryChartProps) {
  const data = readings.map((r) => ({
    date: format(new Date(r.recordedAt), "MMM d"),
    score: Math.round(r.score),
    stage: r.stage,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2737" vertical={false} />

        {/* Stage reference lines */}
        <ReferenceLine y={25} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.4} />
        <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.4} />
        <ReferenceLine y={75} stroke="#F97316" strokeDasharray="4 4" strokeOpacity={0.4} />

        <XAxis
          dataKey="date"
          tick={{ fill: "#4A5568", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#4A5568", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#3B82F6", stroke: "#080A0F", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
