import type { Context, Next } from "hono"
import { redis } from "@/config/redis.js"
import { response } from "@/lib/response.js"

const WINDOW_SECONDS = 60
const MAX_REQUESTS_PER_WINDOW = 100

/**
 * Rate limiting middleware using Redis sliding window.
 * Limits each IP to 100 requests per 60 seconds.
 */
export async function rateLimitMiddleware(ctx: Context, next: Next): Promise<void> {
  const ip = ctx.req.header("x-forwarded-for") ?? ctx.req.header("x-real-ip") ?? "unknown"
  const key = `rate_limit:${ip}`

  try {
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, WINDOW_SECONDS)
    }

    ctx.res.headers.set("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString())
    ctx.res.headers.set(
      "X-RateLimit-Remaining",
      Math.max(0, MAX_REQUESTS_PER_WINDOW - current).toString()
    )

    if (current > MAX_REQUESTS_PER_WINDOW) {
      ctx.res = ctx.json(
        response.error("Too many requests. Please slow down."),
        429
      )
      return
    }
  } catch {
    // If Redis is unavailable, allow the request through
  }

  await next()
}
