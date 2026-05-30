"use client"

import { useEffect, useCallback } from "react"
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket"
import { useAuthStore } from "@/features/authentication"

/**
 * Hook for managing WebSocket connection to the backend.
 * Automatically connects when user is authenticated and disconnects on logout.
 */
export function useWebSocket() {
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user?.organizationId) return

    connectSocket(user.organizationId)

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user?.organizationId])

  /**
   * Subscribes to a WebSocket event.
   */
  const on = useCallback(<T>(event: string, handler: (data: T) => void) => {
    const socket = getSocket()
    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [])

  /**
   * Emits a WebSocket event.
   */
  const emit = useCallback((event: string, data?: unknown) => {
    const socket = getSocket()
    socket.emit(event, data)
  }, [])

  return { on, emit }
}
