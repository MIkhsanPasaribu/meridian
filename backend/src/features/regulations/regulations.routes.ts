import { Hono } from "hono"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { prisma } from "@/config/database.js"
import type { AppVariables } from "@/lib/hono.js"

const regulationsRoutes = new Hono<{ Variables: AppVariables }>()

regulationsRoutes.use("*", authMiddleware)

/**
 * GET /api/v1/regulations — List all regulatory frameworks
 */
regulationsRoutes.get("/", async (ctx) => {
  const frameworks = await prisma.regulatoryFramework.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  })

  return ctx.json(response.success(frameworks))
})

/**
 * GET /api/v1/regulations/:code — Get a specific regulatory framework
 */
regulationsRoutes.get("/:code", async (ctx) => {
  const code = ctx.req.param("code").toUpperCase()

  const framework = await prisma.regulatoryFramework.findUnique({
    where: { code },
  })

  if (!framework) {
    return ctx.json(response.error(`Regulation ${code} not found`), 404)
  }

  return ctx.json(response.success(framework))
})

export { regulationsRoutes }
