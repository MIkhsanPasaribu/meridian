import { z } from "zod"

export const createSupplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  country: z.string().length(2, "Country must be a 2-letter ISO code").toUpperCase(),
  industry: z.string().min(2, "Industry is required").max(100),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  tier: z.number().int().min(1).max(2).default(1),
  tags: z.array(z.string()).default([]),
})

export const updateSupplierSchema = createSupplierSchema.partial()

export const supplierQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  stage: z.enum(["MURMUR", "RIPPLE", "WAVE", "SURGE"]).optional(),
  sortBy: z.enum(["name", "country", "createdAt", "vvsScore"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type SupplierQueryInput = z.infer<typeof supplierQuerySchema>
