import { Server as SocketIOServer } from "socket.io"
import type { Server as HttpServer } from "http"
import { logger } from "@/lib/logger.js"
import { env } from "@/config/env.js"

let io: SocketIOServer | null = null

/**
 * Initializes the Socket.IO server for real-time dashboard updates.
 */
export function initWebSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/ws",
  })

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "WebSocket client connected")

    socket.on("join:organization", (organizationId: string) => {
      void socket.join(`org:${organizationId}`)
      logger.debug({ socketId: socket.id, organizationId }, "Client joined org room")
    })

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "WebSocket client disconnected")
    })
  })

  return io
}

/**
 * Returns the Socket.IO server instance.
 */
export function getSocketIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO not initialized")
  return io
}

/**
 * Emits an event to all clients in an organization room.
 */
export function emitToOrganization(
  organizationId: string,
  event: string,
  data: unknown
): void {
  if (!io) return
  io.to(`org:${organizationId}`).emit(event, data)
}
