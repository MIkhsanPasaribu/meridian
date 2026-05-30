import type { Context, Next } from "hono"
import { response } from "@/lib/response.js"

/**
 * Middleware that validates the Content-Type header for POST/PUT/PATCH requests.
 * Ensures the request body is JSON.
 */
export async function validateContentType(ctx: Context, next: Next): Promise<void> {
  const method = ctx.req.method

  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentType = ctx.req.header("content-type")

    if (contentType && !contentType.includes("application/json")) {
      ctx.res = ctx.json(
        response.error("Content-Type must be application/json"),
        415
      )
      return
    }
  }

  await next()
}
