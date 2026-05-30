import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { prisma } from "@/config/database.js"
import { enqueueReportJob } from "@/core/queue/reportQueue.js"
import { v4 as uuidv4 } from "uuid"
import { NotFoundError, ForbiddenError } from "@/lib/errors.js"
import type { AppVariables } from "@/lib/hono.js"

const reportsRoutes = new Hono<{ Variables: AppVariables }>()

reportsRoutes.use("*", authMiddleware)

const generateReportSchema = z.object({
  supplierId: z.string().min(1),
  reportType: z.enum(["INTELLIGENCE_BRIEF", "CSDDD", "UFLPA", "LKSG"]),
})

/**
 * POST /api/v1/reports/generate — Trigger report generation
 */
reportsRoutes.post(
  "/generate",
  zValidator("json", generateReportSchema),
  async (ctx) => {
    const { supplierId, reportType } = ctx.req.valid("json")
    const organizationId = ctx.get("organizationId")
    const userId = ctx.get("userId")

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) throw new NotFoundError("Supplier")
    if (supplier.organizationId !== organizationId) throw new ForbiddenError()

    const reportId = uuidv4()
    const jobId = uuidv4()

    const jobTypeMap: Record<string, "generate_brief" | "generate_csddd" | "generate_uflpa" | "generate_lksg"> = {
      INTELLIGENCE_BRIEF: "generate_brief",
      CSDDD: "generate_csddd",
      UFLPA: "generate_uflpa",
      LKSG: "generate_lksg",
    }

    const report = await prisma.complianceReport.create({
      data: {
        id: reportId,
        supplierId,
        organizationId,
        userId,
        reportType,
        regulation: reportType === "INTELLIGENCE_BRIEF" ? "BRIEF" : reportType,
        title: `${reportType} Report — ${supplier.name}`,
        content: {},
        status: "DRAFT",
      },
    })

    // Gather the latest VVS reading and recent signals so the AI worker can
    // generate a data-rich report instead of an empty placeholder.
    const latestReading = await prisma.vvsReading.findFirst({
      where: { supplierId },
      orderBy: { recordedAt: "desc" },
    })

    const recentSignals = await prisma.signalEvent.findMany({
      where: { supplierId },
      orderBy: { detectedAt: "desc" },
      take: 20,
    })

    await enqueueReportJob({
      jobId,
      jobType: jobTypeMap[reportType],
      supplierId,
      reportId,
      organizationId,
      userId,
      createdAt: new Date().toISOString(),
      supplierName: supplier.name,
      supplierCountry: supplier.country,
      supplierIndustry: supplier.industry,
      vvsScore: latestReading?.score ?? 0,
      vvsStage: latestReading?.stage ?? "MURMUR",
      signals: recentSignals.map((s) => ({
        title: s.title,
        content: s.content ?? "",
        category: s.category,
        severity: s.severity,
        source_type: s.sourceType,
        url: s.url ?? "",
        language: s.language,
      })),
    })

    return ctx.json(response.success({ report, jobId }, "Report generation started"), 201)
  }
)

/**
 * GET /api/v1/reports — List reports for the organization
 */
reportsRoutes.get("/", async (ctx) => {
  const organizationId = ctx.get("organizationId")

  const reports = await prisma.complianceReport.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      supplier: { select: { name: true, country: true } },
    },
  })

  return ctx.json(response.success(reports))
})

/**
 * GET /api/v1/reports/:id — Get a single report
 */
reportsRoutes.get("/:id", async (ctx) => {
  const reportId = ctx.req.param("id")
  const organizationId = ctx.get("organizationId")

  const report = await prisma.complianceReport.findUnique({
    where: { id: reportId },
    include: {
      supplier: true,
      evidenceItems: true,
    },
  })

  if (!report) throw new NotFoundError("Report")
  if (report.organizationId !== organizationId) throw new ForbiddenError()

  return ctx.json(response.success(report))
})

export { reportsRoutes }
