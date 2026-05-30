"use client"

import { motion } from "framer-motion"

interface LottieAnimationProps {
  type: "loading" | "success" | "empty" | "agent-active"
  size?: number
  className?: string
}

/**
 * Animated placeholder component using CSS animations.
 * Replaces Lottie JSON files with pure CSS animations for reliability.
 * Used for loading states, empty states, and success animations.
 */
export function LottieAnimation({ type, size = 80, className }: LottieAnimationProps) {
  if (type === "loading") {
    return (
      <div className={className} style={{ width: size, height: size }}>
        <motion.div
          className="w-full h-full rounded-full border-2 border-[#3B82F6]/20 border-t-[#3B82F6]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (type === "success") {
    return (
      <motion.div
        className={className}
        style={{ width: size, height: size }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 200 }}
      >
        <div className="w-full h-full rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10B981"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-1/2 h-1/2"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.svg>
        </div>
      </motion.div>
    )
  }

  if (type === "agent-active") {
    return (
      <div className={className} style={{ width: size, height: size }}>
        <div className="relative w-full h-full flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-[#3B82F6]/40"
              style={{ width: `${(i + 1) * 33}%`, height: `${(i + 1) * 33}%` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
        </div>
      </div>
    )
  }

  // empty state
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="w-full h-full rounded-xl bg-[#161B25] border border-[#1E2737] flex items-center justify-center">
        <div className="w-1/2 h-1/2 rounded-lg bg-[#1E2737]" />
      </div>
    </motion.div>
  )
}
