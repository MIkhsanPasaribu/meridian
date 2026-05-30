import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { AuthUser, AuthTokens, LoginFormData, RegisterFormData } from "../types/auth.types"

interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
}

/**
 * Authenticates a user and returns tokens.
 */
export async function login(data: LoginFormData): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data)
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Registers a new organization and admin user.
 */
export async function register(data: Omit<RegisterFormData, "confirmPassword">): Promise<AuthUser> {
  const res = await apiClient.post<ApiResponse<AuthUser>>("/auth/register", data)
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Returns the current authenticated user.
 */
export async function getMe(): Promise<AuthUser> {
  const res = await apiClient.get<ApiResponse<AuthUser>>("/auth/me")
  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}

/**
 * Logs out the current user.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout")
}
