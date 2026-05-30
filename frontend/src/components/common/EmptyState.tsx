import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

/**
 * Empty state component for lists and data views.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-4 rounded-full bg-[#161B25] mb-4">
        <Icon size={32} className="text-[#4A5568]" />
      </div>
      <h3 className="text-base font-semibold text-[#E8EDF5] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#8B9BB4] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}
