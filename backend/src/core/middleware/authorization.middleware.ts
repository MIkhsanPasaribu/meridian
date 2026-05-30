import type { MiddlewareHandler } from "hono"
import { response } from "@/lib/response.js"

export type Role = "super_admin" | "admin" | "analyst" | "viewer"

const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  analyst: 2,
  viewer: 1,
}

/**
 * Creates a middleware that requires the user to have at least the specified role.
 */
export function requireRole(minimumRole: Role): MiddlewareHandler {
  return async (ctx, next) => {
    const userRole = ctx.get("role") as Role | undefined

    if (!userRole) {
      return ctx.json(response.error("Unauthorized"), 401)
    }

    const userLevel = ROLE_HIERARCHY[userRole] ?? 0
    const requiredLevel = ROLE_HIERARCHY[minimumRole]

    if (userLevel < requiredLevel) {
      return ctx.json(response.error("Insufficient permissions"), 403)
    }

    await next()
    return
  }
}
