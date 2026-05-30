"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Activity,
  Bell,
  FileText,
  Scale,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  LogOut,
  Mic,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/authentication"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/supplier", icon: Building2, label: "Suppliers" },
  { href: "/monitoring", icon: Activity, label: "Monitoring" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/regulations", icon: Scale, label: "Regulations" },
  { href: "/audio-evidence", icon: Mic, label: "Audio Evidence" },
]

/**
 * Main sidebar navigation with collapsible icon-only mode.
 * Shows Meridian logo and agent status indicator.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="relative flex flex-col h-screen bg-[#0E1117] border-r border-[#1E2737] flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#1E2737] flex-shrink-0">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full"
            >
              <Image
                src="/meridian-logo.png"
                alt="Meridian"
                width={32}
                height={32}
                priority
                className="h-8 w-8 object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <Image
                src="/meridian-logo.png"
                alt="Meridian"
                width={32}
                height={32}
                priority
                className="h-8 w-8 object-contain flex-shrink-0"
              />
              <span className="text-base font-semibold tracking-[0.2em] text-[#E8EDF5]">
                MERIDIAN
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                    : "text-[#8B9BB4] hover:text-[#E8EDF5] hover:bg-[#161B25]"
                )}
              >
                <item.icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-[#1E2737] space-y-1">
        <Link href="/settings">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
              pathname.startsWith("/settings")
                ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                : "text-[#8B9BB4] hover:text-[#E8EDF5] hover:bg-[#161B25]"
            )}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </div>
        </Link>

        {/* User info */}
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-[#161B25]">
            <p className="text-xs font-medium text-[#E8EDF5] truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-[#4A5568] truncate">{user.organizationName}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#8B9BB4] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#161B25] border border-[#1E2737] flex items-center justify-center text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
