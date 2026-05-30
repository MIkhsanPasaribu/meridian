import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import type { VvsStage } from "@/types/api.types"

/**
 * Merges Tailwind CSS class names, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string to a human-readable format.
 */
export function formatDate(date: string | Date, pattern = "MMM d, yyyy"): string {
  return format(new Date(date), pattern)
}

/**
 * Returns a relative time string (e.g., "2 hours ago").
 */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/**
 * Formats a number with commas and optional decimal places.
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Returns the CSS color variable for a VVS stage.
 */
export function getVvsStageColor(stage: VvsStage): string {
  const colors: Record<VvsStage, string> = {
    MURMUR: "#10B981",
    RIPPLE: "#F59E0B",
    WAVE: "#F97316",
    SURGE: "#EF4444",
  }
  return colors[stage]
}

/**
 * Returns the badge CSS class for a VVS stage.
 */
export function getVvsStageBadgeClass(stage: VvsStage): string {
  const classes: Record<VvsStage, string> = {
    MURMUR: "badge-murmur",
    RIPPLE: "badge-ripple",
    WAVE: "badge-wave",
    SURGE: "badge-surge",
  }
  return classes[stage]
}

/**
 * Returns the display label for a VVS stage.
 */
export function getVvsStageLabel(stage: VvsStage): string {
  return stage.charAt(0) + stage.slice(1).toLowerCase()
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}

/**
 * Returns the ISO 3166-1 alpha-2 country code flag emoji.
 */
export function countryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
