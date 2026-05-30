"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2, UserPlus } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import type { RegisterFormData } from "../types/auth.types"

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    organizationName: z.string().min(2, "Organization name is required"),
    organizationSlug: z
      .string()
      .min(2, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

/**
 * Registration form for new organizations.
 * Used on the /register page.
 */
export function RegisterForm() {
  const { register: registerUser, registerError, isRegisterPending } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => registerUser(data)

  // Auto-generate slug from organization name
  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50)
    setValue("organizationSlug", slug)
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#161B25] border border-[#1E2737] text-[#E8EDF5] placeholder-[#4A5568] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#8B9BB4]">First Name</label>
          <input {...register("firstName")} placeholder="Sarah" className={inputClass} />
          {errors.firstName && <p className="text-xs text-[#EF4444]">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#8B9BB4]">Last Name</label>
          <input {...register("lastName")} placeholder="Chen" className={inputClass} />
          {errors.lastName && <p className="text-xs text-[#EF4444]">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#8B9BB4]">Work Email</label>
        <input {...register("email")} type="email" placeholder="you@company.com" className={inputClass} />
        {errors.email && <p className="text-xs text-[#EF4444]">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#8B9BB4]">Organization Name</label>
        <input
          {...register("organizationName")}
          placeholder="Acme Corporation"
          className={inputClass}
          onChange={(e) => {
            register("organizationName").onChange(e)
            handleOrgNameChange(e)
          }}
        />
        {errors.organizationName && <p className="text-xs text-[#EF4444]">{errors.organizationName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#8B9BB4]">Organization Slug</label>
        <input {...register("organizationSlug")} placeholder="acme-corporation" className={inputClass} />
        {errors.organizationSlug && <p className="text-xs text-[#EF4444]">{errors.organizationSlug.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#8B9BB4]">Password</label>
        <input {...register("password")} type="password" placeholder="••••••••" className={inputClass} />
        {errors.password && <p className="text-xs text-[#EF4444]">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#8B9BB4]">Confirm Password</label>
        <input {...register("confirmPassword")} type="password" placeholder="••••••••" className={inputClass} />
        {errors.confirmPassword && <p className="text-xs text-[#EF4444]">{errors.confirmPassword.message}</p>}
      </div>

      {registerError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm"
        >
          {registerError}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isRegisterPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isRegisterPending ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
        {isRegisterPending ? "Creating account..." : "Create Account"}
      </motion.button>
    </motion.form>
  )
}
