import type { Context } from "hono"
import * as dashboardService from "./dashboard.service"
import { response } from "@/lib/response"
import { logger } from "@/lib/logger"

/**
 * GET /api/v1/dashboard/overview
 */
export async function getDashboardOverviewController(ctx: Context): Promise<Response> {
  try {
    const organizationId = ctx.get("organizationId") as string
    const overview = await dashboardService.getDashboardOverview(organizationId)
    return ctx.json(response.success(overview))
  } catch (error) {
    logger.error({ error }, "Dashboard overview error")
    return ctx.json(response.error("Failed to load dashboard"), 500)
  }
}
