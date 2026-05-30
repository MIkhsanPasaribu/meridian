import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { response } from "@/lib/response.js"
import { prisma } from "@/config/database.js"
import { env } from "@/config/env.js"
import { logger } from "@/lib/logger.js"
import { UnauthorizedError, NotFoundError } from "@/lib/errors.js"

const internalRoutes = new Hono()

/**
 * Service-to-service auth: the AI worker must send the shared internal secret.
 * These endpoints are NOT for browser clients (no JWT/cookies).
 */
internalRoutes.use("*", async (ctx, next) => {
  const provided = ctx.req.header("x-internal-secret")
  if (!provided || provided !== env.INTERNAL_API_SECRET) {
    throw new UnauthorizedError("Invalid internal secret")
  }
  await next()
})

const completeScanSchema = z.object({
  vvsScore: z.number().default(0),
  vvsStage: z.enum(["MURMUR", "RIPPLE", "WAVE", "SURGE"]).default("MURMUR"),
  signalCount: z.number().int().default(0),
  error: z.string().nullable().optional(),
})

/**
 * POST /api/v1/internal/monitoring/jobs/:jobId/complete
 * Called by the AI worker when a GNSH scan finishes. Updates the job status and
 * records a VVS reading for the supplier.
 */
internalRoutes.post(
  "/monitoring/jobs/:jobId/complete",
  zValidator("json", completeScanSchema),
  async (ctx) => {
    const jobId = ctx.req.param("jobId")
    const { vvsScore, vvsStage, signalCount, error } = ctx.req.valid("json")

    const job = await prisma.monitoringJob.findUnique({ where: { id: jobId } })
    if (!job) throw new NotFoundError("Job")

    const failed = Boolean(error)

    await prisma.monitoringJob.update({
      where: { id: jobId },
      data: {
        status: failed ? "FAILED" : "COMPLETED",
        errorMsg: error ?? null,
        completedAt: new Date(),
        result: { vvsScore, vvsStage, signalCount },
      },
    })

    if (!failed) {
      await prisma.vvsReading.create({
        data: { supplierId: job.supplierId, score: vvsScore, stage: vvsStage, signalCount, jobId },
      })
    }

    logger.info({ jobId, vvsScore, vvsStage, failed }, "Monitoring job completion recorded")
    return ctx.json(response.success({ jobId, status: failed ? "FAILED" : "COMPLETED" }))
  }
)

const completeReportSchema = z.object({
  briefMarkdown: z.string().default(""),
})

/**
 * POST /api/v1/internal/reports/:reportId/complete
 * Called by the AI worker when a report/brief is generated. Saves the content
 * and marks the report ready for review.
 */
internalRoutes.post(
  "/reports/:reportId/complete",
  zValidator("json", completeReportSchema),
  async (ctx) => {
    const reportId = ctx.req.param("reportId")
    const { briefMarkdown } = ctx.req.valid("json")

    const report = await prisma.complianceReport.findUnique({ where: { id: reportId } })
    if (!report) throw new NotFoundError("Report")

    await prisma.complianceReport.update({
      where: { id: reportId },
      data: { content: { markdown: briefMarkdown }, status: "REVIEW" },
    })

    logger.info({ reportId, length: briefMarkdown.length }, "Report completion recorded")
    return ctx.json(response.success({ reportId, status: "REVIEW" }))
  }
)

export { internalRoutes }
