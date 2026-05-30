import { prisma } from "@/config/database.js"

/**
 * Returns aggregated dashboard overview data for an organization.
 */
export async function getDashboardOverview(organizationId: string) {
  const [
    totalSuppliers,
    activeJobs,
    recentAlerts,
    recentBriefs,
    vvsDistribution,
  ] = await Promise.all([
    prisma.supplier.count({ where: { organizationId, isActive: true } }),

    prisma.monitoringJob.count({
      where: {
        supplier: { organizationId },
        status: { in: ["QUEUED", "RUNNING"] },
      },
    }),

    prisma.alert.findMany({
      where: {
        supplier: { organizationId },
        status: "UNREAD",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { supplier: { select: { name: true, country: true } } },
    }),

    prisma.complianceReport.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { supplier: { select: { name: true, country: true } } },
    }),

    prisma.vvsReading.groupBy({
      by: ["stage"],
      where: {
        supplier: { organizationId },
        recordedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      _count: { stage: true },
    }),
  ])

  const stageCounts: Record<string, number> = {
    MURMUR: 0,
    RIPPLE: 0,
    WAVE: 0,
    SURGE: 0,
  }

  for (const item of vvsDistribution) {
    stageCounts[item.stage] = item._count.stage
  }

  return {
    totalSuppliers,
    activeJobs,
    unreadAlerts: recentAlerts.length,
    recentAlerts,
    recentBriefs,
    vvsDistribution: stageCounts,
  }
}

/**
 * Returns VVS readings aggregated by country for the world heatmap.
 */
export async function getHeatmapData(organizationId: string) {
  const readings = await prisma.vvsReading.findMany({
    where: {
      supplier: { organizationId },
      recordedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    include: {
      supplier: { select: { country: true } },
    },
    orderBy: { recordedAt: "desc" },
  })

  const countryMap = new Map<string, { maxScore: number; count: number }>()

  for (const reading of readings) {
    const country = reading.supplier.country
    const existing = countryMap.get(country)

    if (!existing || reading.score > existing.maxScore) {
      countryMap.set(country, {
        maxScore: reading.score,
        count: (existing?.count ?? 0) + 1,
      })
    }
  }

  return Array.from(countryMap.entries()).map(([country, data]) => ({
    country,
    maxVvsScore: data.maxScore,
    supplierCount: data.count,
  }))
}
