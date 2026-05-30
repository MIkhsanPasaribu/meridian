"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"

interface SignalBreakdownChartProps {
  data: Record<string, number>
  height?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  human_rights: "#EF4444",
  environment: "#10B981",
  labor_conditions: "#F59E0B",
  financial_distress: "#3B82F6",
  leadership_change: "#8B5CF6",
}

const CATEGORY_LABELS: Record<string, string> = {
  human_rights: "Human Rights",
  environment: "Environment",
  labor_conditions: "Labor",
  financial_distress: "Financial",
  leadership_change: "Leadership",
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#161B25] border border-[#1E2737] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[#8B9BB4]">{CATEGORY_LABELS[payload[0].name] ?? payload[0].name}</p>
      <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>
        {payload[0].value} signals
      </p>
    </div>
  )
}

/**
 * Pie chart showing signal distribution by category.
 * Used in the VVS score detail view.
 */
export function SignalBreakdownChart({ data, height = 200 }: SignalBreakdownChartProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value,
      fill: CATEGORY_COLORS[key] ?? "#8B9BB4",
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-[#8B9BB4]">No signal data available</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={height * 0.25}
            outerRadius={height * 0.4}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="transparent"
                style={{ filter: `drop-shadow(0 0 4px ${entry.fill}60)` }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-[#8B9BB4]">
                {CATEGORY_LABELS[value] ?? value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
