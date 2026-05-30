import { io, type Socket } from "socket.io-client"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"

let socket: Socket | null = null

/**
 * Returns a singleton Socket.IO client instance.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      path: "/ws",
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    })
  }
  return socket
}

/**
 * Connects the Socket.IO client.
 */
export function connectSocket(organizationId: string): void {
  const s = getSocket()

  if (!s.connected) {
    s.connect()
  }

  s.emit("join:organization", organizationId)
}

/**
 * Disconnects the Socket.IO client.
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect()
  }
}
