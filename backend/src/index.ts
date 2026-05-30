import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createServer } from "http"
import { env } from "./config/env.js"
import { connectDatabase } from "./config/database.js"
import { redis } from "./config/redis.js"
import { initWebSocket } from "./core/realtime/websocket.js"
import { loggerMiddleware } from "./core/middleware/logger.middleware.js"
import { logger } from "./lib/logger.js"
import { response } from "./lib/response.js"
import { AppError } from "./lib/errors.js"

// Feature routes
import { authRoutes } from "./features/authentication/index.js"
import { supplierRoutes } from "./features/supplier/index.js"
import { dashboardRoutes } from "./features/dashboard/index.js"
import { monitoringRoutes } from "./features/monitoring/index.js"
import { alertsRoutes } from "./features/alerts/index.js"
import { vvsScoreRoutes } from "./features/vvs-score/index.js"
import { reportsRoutes } from "./features/reports/index.js"
import { regulationsRoutes } from "./features/regulations/index.js"
import { userRoutes } from "./features/user/index.js"
import { audioEvidenceRoutes } from "./features/audio-evidence/index.js"
import { internalRoutes } from "./features/internal/index.js"

const app = new Hono()

// Global middleware
app.use("*", loggerMiddleware)
app.use(
  "*",
  cors({
    origin: env.FRONTEND_URL,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)

// Health check
app.get("/health", (ctx) =>
  ctx.json(
    response.success({ status: "ok", version: "1.0.0", service: "meridian-backend" })
  )
)

// API routes
app.route("/api/v1/auth", authRoutes)
app.route("/api/v1/suppliers", supplierRoutes)
app.route("/api/v1/dashboard", dashboardRoutes)
app.route("/api/v1/monitoring", monitoringRoutes)
app.route("/api/v1/alerts", alertsRoutes)
app.route("/api/v1/vvs", vvsScoreRoutes)
app.route("/api/v1/reports", reportsRoutes)
app.route("/api/v1/regulations", regulationsRoutes)
app.route("/api/v1/users", userRoutes)
app.route("/api/v1/audio-evidence", audioEvidenceRoutes)
app.route("/api/v1/internal", internalRoutes)

// Global error handler
app.onError((err, ctx) => {
  if (err instanceof AppError) {
    return ctx.json(response.error(err.message, err.name), err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500)
  }

  logger.error({ err }, "Unhandled error")
  return ctx.json(response.error("Internal server error"), 500)
})

// 404 handler
app.notFound((ctx) =>
  ctx.json(response.error(`Route ${ctx.req.path} not found`), 404)
)

async function bootstrap(): Promise<void> {
  await connectDatabase()

  // BullMQ queues (imported by the feature routes) auto-connect the shared
  // ioredis instance, so it may already be connecting by the time we get here.
  // Only call connect() when the client is still idle to avoid
  // "Redis is already connecting/connected".
  if (redis.status === "wait" || redis.status === "end") {
    await redis.connect()
  }

  const httpServer = createServer()

  initWebSocket(httpServer)

  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
      hostname: "0.0.0.0",
    },
    (info) => {
      logger.info(`🚀 Meridian Backend running on http://localhost:${info.port}`)
    }
  )
}

bootstrap().catch((error: unknown) => {
  const detail =
    error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { value: String(error) }
  logger.error({ error: detail }, "Failed to start server")
  process.exit(1)
})
