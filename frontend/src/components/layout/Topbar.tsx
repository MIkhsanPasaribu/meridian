"use client"

import { motion } from "framer-motion"
import { Bell, Search, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/features/authentication"

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  supplier: "Suppliers",
  monitoring: "Monitoring",
  alerts: "Alerts",
  reports: "Reports",
  regulations: "Regulations",
  settings: "Settings",
}

/**
 * Top navigation bar with breadcrumb, search, and notification bell.
 */
export function Topbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = segments.map((seg) => BREADCRUMB_MAP[seg] ?? seg)

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[#1E2737] bg-[#0E1117] flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#4A5568]">Meridian</span>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-[#4A5568]" />
            <span
              className={
                i === breadcrumbs.length - 1
                  ? "text-[#E8EDF5] font-medium"
                  : "text-[#8B9BB4]"
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-[#4A5568]" />
          <input
            type="text"
            placeholder="Search suppliers..."
            className="pl-9 pr-4 py-2 text-sm bg-[#161B25] border border-[#1E2737] rounded-lg text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] transition-colors w-48"
          />
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-lg text-[#8B9BB4] hover:text-[#E8EDF5] hover:bg-[#161B25] transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
        </motion.button>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-[#1E2737]">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/30 flex items-center justify-center">
              <span className="text-xs font-bold text-[#3B82F6]">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-[#E8EDF5]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-[#4A5568]">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
