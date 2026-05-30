"use client"

import { create } from "zustand"
import { setAccessToken } from "@/lib/axios"
import type { AuthUser, AuthState } from "../types/auth.types"

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

/**
 * Zustand store for authentication state.
 * Access token is stored in memory only (not localStorage).
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setToken: (token) => {
    setAccessToken(token)
  },

  logout: () => {
    setAccessToken(null)
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
}))
