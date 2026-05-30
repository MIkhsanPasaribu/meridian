import { Hono } from "hono"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { getDashboardOverview, getHeatmapData } from "./dashboard.service.js"
import type { AppVariables } from "@/lib/hono.js"

const dashboardRoutes = new Hono<{ Variables: AppVariables }>()

dashboardRoutes.use("*", authMiddleware)

dashboardRoutes.get("/overview", async (ctx) => {
  const organizationId = ctx.get("organizationId")
  const data = await getDashboardOverview(organizationId)
  return ctx.json(response.success(data))
})

dashboardRoutes.get("/heatmap", async (ctx) => {
  const organizationId = ctx.get("organizationId")
  const data = await getHeatmapData(organizationId)
  return ctx.json(response.success(data))
})

export { dashboardRoutes }
