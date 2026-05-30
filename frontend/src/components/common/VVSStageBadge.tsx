import { VVSStageIndicator } from "@/features/vvs-score"
import type { VvsStage } from "@/types/api.types"

interface VVSStageBadgeProps {
  stage: VvsStage
  score?: number
  size?: "sm" | "md" | "lg"
}

/**
 * Shared VVS stage badge component for use across features.
 */
export function VVSStageBadge({ stage, score, size = "sm" }: VVSStageBadgeProps) {
  return <VVSStageIndicator stage={stage} score={score} showScore={!!score} size={size} />
}
