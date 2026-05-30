import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { prisma } from "@/config/database.js"
import { NotFoundError, ForbiddenError } from "@/lib/errors.js"
import type { AppVariables } from "@/lib/hono.js"

const alertsRoutes = new Hono<{ Variables: AppVariables }>()

alertsRoutes.use("*", authMiddleware)

const alertQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["UNREAD", "READ", "ACKNOWLEDGED", "DISMISSED"]).optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]).optional(),
})

/**
 * GET /api/v1/alerts — List alerts for the organization
 */
alertsRoutes.get("/", zValidator("query", alertQuerySchema), async (ctx) => {
  const organizationId = ctx.get("organizationId")
  const { page, limit, status, severity } = ctx.req.valid("query")
  const skip = (page - 1) * limit

  const where = {
    supplier: { organizationId },
    ...(status && { status }),
    ...(severity && { severity }),
  }

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { name: true, country: true } },
      },
    }),
    prisma.alert.count({ where }),
  ])

  return ctx.json(
    response.success({
      alerts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  )
})

/**
 * PATCH /api/v1/alerts/:id/acknowledge
 */
alertsRoutes.patch("/:id/acknowledge", async (ctx) => {
  const alertId = ctx.req.param("id")
  const organizationId = ctx.get("organizationId")
  const userId = ctx.get("userId")

  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { supplier: { select: { organizationId: true } } },
  })

  if (!alert) throw new NotFoundError("Alert")
  if (alert.supplier.organizationId !== organizationId) throw new ForbiddenError()

  const updated = await prisma.alert.update({
    where: { id: alertId },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date(),
      acknowledgedBy: userId,
    },
  })

  return ctx.json(response.success(updated, "Alert acknowledged"))
})

/**
 * PATCH /api/v1/alerts/:id/dismiss
 */
alertsRoutes.patch("/:id/dismiss", async (ctx) => {
  const alertId = ctx.req.param("id")
  const organizationId = ctx.get("organizationId")

  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { supplier: { select: { organizationId: true } } },
  })

  if (!alert) throw new NotFoundError("Alert")
  if (alert.supplier.organizationId !== organizationId) throw new ForbiddenError()

  const updated = await prisma.alert.update({
    where: { id: alertId },
    data: { status: "DISMISSED" },
  })

  return ctx.json(response.success(updated, "Alert dismissed"))
})

export { alertsRoutes }
