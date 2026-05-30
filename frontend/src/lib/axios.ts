import axios, { type AxiosInstance, type AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/**
 * Configured axios instance for all API calls.
 * Automatically attaches the JWT access token from memory.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
})

// In-memory token storage (not localStorage for security)
let accessToken: string | null = null

/**
 * Sets the access token for subsequent requests.
 */
export function setAccessToken(token: string | null): void {
  accessToken = token
}

/**
 * Returns the current access token.
 */
export function getAccessToken(): string | null {
  return accessToken
}

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor — handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newToken = data?.data?.accessToken as string | undefined

        if (newToken) {
          setAccessToken(newToken)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return apiClient(originalRequest)
        }
      } catch {
        setAccessToken(null)
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)
