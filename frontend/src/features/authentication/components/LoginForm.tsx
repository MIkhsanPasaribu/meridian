"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import type { LoginFormData } from "../types/auth.types"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

/**
 * Login form with animated transitions and validation.
 * Used on the /login page.
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loginError, isLoginPending } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#8B9BB4]">Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          className="w-full px-4 py-3 rounded-lg bg-[#161B25] border border-[#1E2737] text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
        />
        {errors.email && (
          <p className="text-xs text-[#EF4444]">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#8B9BB4]">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full px-4 py-3 pr-12 rounded-lg bg-[#161B25] border border-[#1E2737] text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#8B9BB4] transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-[#EF4444]">{errors.password.message}</p>
        )}
      </div>

      {/* Server error */}
      {loginError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm"
        >
          {loginError}
        </motion.div>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoginPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoginPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <LogIn size={18} />
        )}
        {isLoginPending ? "Signing in..." : "Sign In"}
      </motion.button>
    </motion.form>
  )
}
