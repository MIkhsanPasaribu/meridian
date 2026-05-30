import { cn } from "@/lib/utils"

interface SkeletonFrameProps {
  className?: string
}

/**
 * Skeleton loading placeholder with shimmer animation.
 */
export function SkeletonFrame({ className }: SkeletonFrameProps) {
  return (
    <div
      className={cn(
        "skeleton rounded-lg",
        className
      )}
    />
  )
}

/**
 * Skeleton for a stat card.
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5">
      <SkeletonFrame className="h-3 w-24 mb-3" />
      <SkeletonFrame className="h-8 w-16" />
    </div>
  )
}
