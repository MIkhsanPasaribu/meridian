import type { Context } from "hono"

/**
 * Hono context variables type for authenticated routes.
 * All authenticated routes have userId, organizationId, and role set by the auth middleware.
 */
export interface AppVariables {
  userId: string
  organizationId: string
  role: string
}

/**
 * Typed Hono context for authenticated routes.
 */
export type AppContext = Context<{ Variables: AppVariables }>
