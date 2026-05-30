import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { prisma } from "@/config/database.js"
import { NotFoundError, ForbiddenError } from "@/lib/errors.js"
import type { AppVariables } from "@/lib/hono.js"

const vvsScoreRoutes = new Hono<{ Variables: AppVariables }>()

vvsScoreRoutes.use("*", authMiddleware)

const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(90),
})

/**
 * GET /api/v1/vvs/:supplierId/current — Get current VVS score
 */
vvsScoreRoutes.get("/:supplierId/current", async (ctx) => {
  const supplierId = ctx.req.param("supplierId")
  const organizationId = ctx.get("organizationId")

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { organizationId: true },
  })

  if (!supplier) throw new NotFoundError("Supplier")
  if (supplier.organizationId !== organizationId) throw new ForbiddenError()

  const latest = await prisma.vvsReading.findFirst({
    where: { supplierId },
    orderBy: { recordedAt: "desc" },
  })

  return ctx.json(response.success(latest))
})

/**
 * GET /api/v1/vvs/:supplierId/history — Get VVS history
 */
vvsScoreRoutes.get(
  "/:supplierId/history",
  zValidator("query", historyQuerySchema),
  async (ctx) => {
    const supplierId = ctx.req.param("supplierId")
    const organizationId = ctx.get("organizationId")
    const { days } = ctx.req.valid("query")

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { organizationId: true },
    })

    if (!supplier) throw new NotFoundError("Supplier")
    if (supplier.organizationId !== organizationId) throw new ForbiddenError()

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const readings = await prisma.vvsReading.findMany({
      where: { supplierId, recordedAt: { gte: since } },
      orderBy: { recordedAt: "asc" },
    })

    return ctx.json(response.success(readings))
  }
)

/**
 * GET /api/v1/vvs/:supplierId/signals — Get signal events
 */
vvsScoreRoutes.get("/:supplierId/signals", async (ctx) => {
  const supplierId = ctx.req.param("supplierId")
  const organizationId = ctx.get("organizationId")

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { organizationId: true },
  })

  if (!supplier) throw new NotFoundError("Supplier")
  if (supplier.organizationId !== organizationId) throw new ForbiddenError()

  const signals = await prisma.signalEvent.findMany({
    where: { supplierId },
    orderBy: { detectedAt: "desc" },
    take: 50,
  })

  return ctx.json(response.success(signals))
})

export { vvsScoreRoutes }
