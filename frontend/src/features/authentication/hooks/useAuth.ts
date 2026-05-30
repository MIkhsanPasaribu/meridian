"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../stores/authStore"
import * as authService from "../services/authService"
import type { LoginFormData, RegisterFormData } from "../types/auth.types"

/**
 * Hook for authentication operations.
 * Provides login, register, logout, and current user state.
 */
export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, setUser, setToken, logout: clearAuth } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setToken(data.tokens.accessToken)
      setUser(data.user)
      router.push("/dashboard")
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => {
      const { confirmPassword: _, ...rest } = data
      return authService.register(rest)
    },
    onSuccess: () => {
      router.push("/login?registered=true")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth()
      router.push("/login")
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading,
    login: (data: LoginFormData) => loginMutation.mutate(data),
    register: (data: RegisterFormData) => registerMutation.mutate(data),
    logout: () => logoutMutation.mutate(),
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  }
}
