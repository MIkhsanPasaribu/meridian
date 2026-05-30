import type { Context, Next } from "hono"
import { jwtVerify } from "jose"
import { env } from "@/config/env.js"
import { UnauthorizedError } from "@/lib/errors.js"
import { response } from "@/lib/response.js"
import type { AppVariables } from "@/lib/hono.js"

/**
 * Middleware that verifies the JWT access token from the Authorization header.
 * Sets userId, organizationId, and role in the context for downstream handlers.
 */
export async function authMiddleware(
  ctx: Context<{ Variables: AppVariables }>,
  next: Next
): Promise<void> {
  const authHeader = ctx.req.header("Authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    ctx.res = ctx.json(
      response.error("Missing or invalid authorization header"),
      401
    )
    return
  }

  const token = authHeader.slice(7)

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    ctx.set("userId", payload.sub as string)
    ctx.set("organizationId", payload.organizationId as string)
    ctx.set("role", payload.role as string)

    await next()
  } catch {
    ctx.res = ctx.json(
      response.error("Invalid or expired token", UnauthorizedError.name),
      401
    )
  }
}
