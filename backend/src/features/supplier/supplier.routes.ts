import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
} from "./supplier.schema.js"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import * as supplierService from "./supplier.service.js"
import type { AppVariables } from "@/lib/hono.js"

const supplierRoutes = new Hono<{ Variables: AppVariables }>()

supplierRoutes.use("*", authMiddleware)

supplierRoutes.get("/", zValidator("query", supplierQuerySchema), async (ctx) => {
  const organizationId = ctx.get("organizationId")
  const query = ctx.req.valid("query")
  const result = await supplierService.getSuppliers(organizationId, query)
  return ctx.json(response.success(result))
})

supplierRoutes.post("/", zValidator("json", createSupplierSchema), async (ctx) => {
  const organizationId = ctx.get("organizationId")
  const body = ctx.req.valid("json")
  const result = await supplierService.createSupplier(organizationId, body)
  return ctx.json(response.success(result, "Supplier created successfully"), 201)
})

supplierRoutes.get("/:id", async (ctx) => {
  const supplierId = ctx.req.param("id") ?? ""
  const organizationId = ctx.get("organizationId")
  const supplier = await supplierService.getSupplierById(supplierId, organizationId)
  return ctx.json(response.success(supplier))
})

supplierRoutes.patch("/:id", zValidator("json", updateSupplierSchema), async (ctx) => {
  const supplierId = ctx.req.param("id") ?? ""
  const organizationId = ctx.get("organizationId")
  const body = ctx.req.valid("json")
  const supplier = await supplierService.updateSupplier(supplierId, organizationId, body)
  return ctx.json(response.success(supplier, "Supplier updated successfully"))
})

supplierRoutes.delete("/:id", async (ctx) => {
  const supplierId = ctx.req.param("id") ?? ""
  const organizationId = ctx.get("organizationId")
  await supplierService.deleteSupplier(supplierId, organizationId)
  return ctx.json(response.success(null, "Supplier deleted successfully"))
})

export { supplierRoutes }
