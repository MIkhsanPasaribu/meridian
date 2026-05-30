import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { prisma } from "@/config/database.js"
import { enqueueMonitoringJob } from "@/core/queue/monitoringQueue.js"
import { v4 as uuidv4 } from "uuid"
import { NotFoundError, ForbiddenError } from "@/lib/errors.js"
import type { AppVariables } from "@/lib/hono.js"

const monitoringRoutes = new Hono<{ Variables: AppVariables }>()

monitoringRoutes.use("*", authMiddleware)

const triggerScanSchema = z.object({
  supplierId: z.string().min(1),
  jobType: z.enum(["manual_scan", "initial_scan"]).default("manual_scan"),
})

/**
 * POST /api/v1/monitoring/jobs — Trigger a manual scan
 */
monitoringRoutes.post(
  "/jobs",
  zValidator("json", triggerScanSchema),
  async (ctx) => {
    const { supplierId, jobType } = ctx.req.valid("json")
    const organizationId = ctx.get("organizationId")

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) throw new NotFoundError("Supplier")
    if (supplier.organizationId !== organizationId) throw new ForbiddenError()

    const jobId = uuidv4()

    await prisma.monitoringJob.create({
      data: {
        id: jobId,
        supplierId,
        jobType,
        status: "QUEUED",
        priority: 2,
        payload: {
          supplierId,
          supplierName: supplier.name,
          supplierCountry: supplier.country,
        },
      },
    })

    await enqueueMonitoringJob({
      jobId,
      jobType,
      supplierId,
      supplierName: supplier.name,
      supplierCountry: supplier.country,
      supplierIndustry: supplier.industry,
      targetLanguages: ["en", "zh", "ar", "vi"],
      targetPlatforms: [],
      createdAt: new Date().toISOString(),
      priority: 2,
    })

    return ctx.json(response.success({ jobId }, "Scan triggered"), 201)
  }
)

/**
 * GET /api/v1/monitoring/jobs/:jobId/status
 */
monitoringRoutes.get("/jobs/:jobId/status", async (ctx) => {
  const jobId = ctx.req.param("jobId")
  const organizationId = ctx.get("organizationId")

  const job = await prisma.monitoringJob.findUnique({
    where: { id: jobId },
    include: { supplier: { select: { organizationId: true } } },
  })

  if (!job) throw new NotFoundError("Job")
  if (job.supplier.organizationId !== organizationId) throw new ForbiddenError()

  return ctx.json(response.success(job))
})

/**
 * GET /api/v1/monitoring/jobs — List all jobs for the organization
 */
monitoringRoutes.get("/jobs", async (ctx) => {
  const organizationId = ctx.get("organizationId")

  const jobs = await prisma.monitoringJob.findMany({
    where: { supplier: { organizationId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      supplier: { select: { name: true, country: true } },
    },
  })

  return ctx.json(response.success(jobs))
})

export { monitoringRoutes }
