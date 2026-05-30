import { prisma } from "@/config/database.js"
import { NotFoundError, ForbiddenError } from "@/lib/errors.js"
import { enqueueMonitoringJob } from "@/core/queue/monitoringQueue.js"
import { v4 as uuidv4 } from "uuid"
import type { CreateSupplierInput, UpdateSupplierInput, SupplierQueryInput } from "./supplier.schema.js"

/**
 * Creates a new supplier and triggers an initial monitoring scan.
 */
export async function createSupplier(
  organizationId: string,
  data: CreateSupplierInput
) {
  const supplier = await prisma.supplier.create({
    data: {
      ...data,
      organizationId,
      websiteUrl: data.websiteUrl || null,
    },
  })

  await prisma.monitoringConfig.create({
    data: {
      supplierId: supplier.id,
      frequency: "daily",
      targetLanguages: ["en"],
      isActive: true,
    },
  })

  const jobId = uuidv4()

  await prisma.monitoringJob.create({
    data: {
      id: jobId,
      supplierId: supplier.id,
      jobType: "initial_scan",
      status: "QUEUED",
      priority: 1,
      payload: {
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierCountry: supplier.country,
        supplierIndustry: supplier.industry,
      },
    },
  })

  await enqueueMonitoringJob({
    jobId,
    jobType: "initial_scan",
    supplierId: supplier.id,
    supplierName: supplier.name,
    supplierCountry: supplier.country,
    supplierIndustry: supplier.industry,
    targetLanguages: ["en", "zh", "ar", "vi"],
    targetPlatforms: [],
    createdAt: new Date().toISOString(),
    priority: 1,
  })

  return { supplier, jobId }
}

/**
 * Returns a paginated list of suppliers for an organization.
 */
export async function getSuppliers(
  organizationId: string,
  query: SupplierQueryInput
) {
  const { page, limit, search, country, industry, sortBy, sortOrder } = query
  const skip = (page - 1) * limit

  const where = {
    organizationId,
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { country: { contains: search, mode: "insensitive" as const } },
        { industry: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(country && { country }),
    ...(industry && { industry }),
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy === "vvsScore"
        ? { createdAt: sortOrder }
        : { [sortBy]: sortOrder },
      include: {
        vvsReadings: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
        _count: {
          select: { alerts: true, signalEvents: true },
        },
      },
    }),
    prisma.supplier.count({ where }),
  ])

  return {
    suppliers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Returns a single supplier by ID, verifying organization ownership.
 */
export async function getSupplierById(
  supplierId: string,
  organizationId: string
) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      contacts: true,
      monitoringConfig: true,
      vvsReadings: {
        orderBy: { recordedAt: "desc" },
        take: 90,
      },
      _count: {
        select: { alerts: true, signalEvents: true, monitoringJobs: true },
      },
    },
  })

  if (!supplier) throw new NotFoundError("Supplier")
  if (supplier.organizationId !== organizationId) throw new ForbiddenError()

  return supplier
}

/**
 * Updates a supplier's details.
 */
export async function updateSupplier(
  supplierId: string,
  organizationId: string,
  data: UpdateSupplierInput
) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  })

  if (!supplier) throw new NotFoundError("Supplier")
  if (supplier.organizationId !== organizationId) throw new ForbiddenError()

  return prisma.supplier.update({
    where: { id: supplierId },
    data: {
      ...data,
      websiteUrl: data.websiteUrl || null,
    },
  })
}

/**
 * Soft-deletes a supplier by marking it as inactive.
 */
export async function deleteSupplier(
  supplierId: string,
  organizationId: string
): Promise<void> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  })

  if (!supplier) throw new NotFoundError("Supplier")
  if (supplier.organizationId !== organizationId) throw new ForbiddenError()

  await prisma.supplier.update({
    where: { id: supplierId },
    data: { isActive: false },
  })
}
