"use client"

import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { motion } from "framer-motion"

/**
 * Main dashboard layout with sidebar and topbar.
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#080A0F] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-6 bg-grid"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
