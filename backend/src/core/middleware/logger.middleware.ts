import type { Context, Next } from "hono"
import { logger } from "@/lib/logger.js"

/**
 * Middleware that logs all incoming HTTP requests with method, path, and duration.
 */
export async function loggerMiddleware(ctx: Context, next: Next): Promise<void> {
  const start = Date.now()
  const method = ctx.req.method
  const path = ctx.req.path

  await next()

  const duration = Date.now() - start
  const status = ctx.res.status

  logger.info({ method, path, status, duration: `${duration}ms` }, "HTTP Request")
}
