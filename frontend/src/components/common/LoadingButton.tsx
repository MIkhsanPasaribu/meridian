"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  icon?: ReactNode
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
}

const VARIANT_CLASSES = {
  primary: "bg-[#3B82F6] hover:bg-[#2563EB] text-white",
  secondary: "bg-[#161B25] border border-[#1E2737] text-[#8B9BB4] hover:text-[#E8EDF5] hover:border-[#2A3447]",
  danger: "bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20",
  ghost: "text-[#8B9BB4] hover:text-[#E8EDF5] hover:bg-[#161B25]",
}

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

/**
 * Button component with loading state and animation.
 * Used throughout the application for form submissions and actions.
 */
export function LoadingButton({
  isLoading = false,
  loadingText,
  icon,
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.99 }}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      disabled={disabled || isLoading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {isLoading ? (
        <Loader2 size={size === "sm" ? 14 : size === "lg" ? 18 : 16} className="animate-spin" />
      ) : (
        icon
      )}
      {isLoading ? (loadingText ?? "Loading...") : children}
    </motion.button>
  )
}
