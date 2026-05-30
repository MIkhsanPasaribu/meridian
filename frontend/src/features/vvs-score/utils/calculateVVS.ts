import type { VvsStage } from "@/types/api.types"

/**
 * Classifies a VVS score into a risk stage.
 */
export function classifyVvsStage(score: number): VvsStage {
  if (score <= 25) return "MURMUR"
  if (score <= 50) return "RIPPLE"
  if (score <= 75) return "WAVE"
  return "SURGE"
}

/**
 * Returns the color hex for a VVS stage.
 */
export function getStageColor(stage: VvsStage): string {
  const colors: Record<VvsStage, string> = {
    MURMUR: "#10B981",
    RIPPLE: "#F59E0B",
    WAVE: "#F97316",
    SURGE: "#EF4444",
  }
  return colors[stage]
}

/**
 * Returns the action description for a VVS stage.
 */
export function getStageAction(stage: VvsStage): string {
  const actions: Record<VvsStage, string> = {
    MURMUR: "Monitor normally — no action required",
    RIPPLE: "Escalate to analyst for review",
    WAVE: "Alert manager and begin investigation",
    SURGE: "Emergency escalation — pause transactions",
  }
  return actions[stage]
}

/**
 * Calculates the percentage progress within a stage's range.
 */
export function getStageProgress(score: number): number {
  if (score <= 25) return (score / 25) * 100
  if (score <= 50) return ((score - 26) / 24) * 100
  if (score <= 75) return ((score - 51) / 24) * 100
  return ((score - 76) / 24) * 100
}
