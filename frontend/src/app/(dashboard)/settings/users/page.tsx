"use client"

import { motion } from "framer-motion"
import { Users, UserPlus, Shield } from "lucide-react"

const MOCK_USERS = [
  { id: "1", name: "Demo User", email: "demo@meridian.ai", role: "ADMIN", lastLogin: "2 hours ago" },
  { id: "2", name: "Sarah Chen", email: "sarah@company.com", role: "ANALYST", lastLogin: "1 day ago" },
  { id: "3", name: "Michael Braun", email: "michael@company.com", role: "VIEWER", lastLogin: "3 days ago" },
]

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#EF4444",
  ADMIN: "#3B82F6",
  ANALYST: "#F59E0B",
  VIEWER: "#10B981",
}

/**
 * User management page — team members and roles.
 */
export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-[#3B82F6]" />
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5]">Team Members</h1>
            <p className="text-sm text-[#8B9BB4] mt-0.5">Manage access and roles</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
        >
          <UserPlus size={14} />
          Invite Member
        </motion.button>
      </div>

      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E2737]">
              {["Member", "Role", "Last Active", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-[#1E2737] hover:bg-[#161B25] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#3B82F6]">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#E8EDF5]">{user.name}</p>
                      <p className="text-xs text-[#4A5568]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${ROLE_COLORS[user.role] ?? "#8B9BB4"}15`,
                      color: ROLE_COLORS[user.role] ?? "#8B9BB4",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#4A5568]">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg text-[#4A5568] hover:text-[#8B9BB4] hover:bg-[#161B25] transition-colors">
                    <Shield size={14} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role reference */}
      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#E8EDF5] mb-3">Role Permissions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { role: "SUPER_ADMIN", perms: ["Full access", "Billing", "All features"] },
            { role: "ADMIN", perms: ["Manage users", "Configure settings", "All reports"] },
            { role: "ANALYST", perms: ["View suppliers", "Generate reports", "Acknowledge alerts"] },
            { role: "VIEWER", perms: ["View only", "Read reports", "Read alerts"] },
          ].map((item) => (
            <div key={item.role} className="p-3 rounded-lg bg-[#161B25] border border-[#1E2737]">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{
                  backgroundColor: `${ROLE_COLORS[item.role] ?? "#8B9BB4"}15`,
                  color: ROLE_COLORS[item.role] ?? "#8B9BB4",
                }}
              >
                {item.role}
              </span>
              <ul className="space-y-0.5">
                {item.perms.map((p) => (
                  <li key={p} className="text-xs text-[#4A5568]">· {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
