/**
 * Standard API response format for all Meridian endpoints.
 */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
  error: string | null
  timestamp: string
}

/**
 * Creates a successful API response.
 */
export function successResponse<T>(
  data: T,
  message = "Success"
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    error: null,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Creates an error API response.
 */
export function errorResponse(
  message: string,
  error: string | null = null
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    message,
    error,
    timestamp: new Date().toISOString(),
  }
}

export const response = {
  success: successResponse,
  error: errorResponse,
}
