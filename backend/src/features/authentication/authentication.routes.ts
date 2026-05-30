import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { loginSchema, registerSchema, refreshTokenSchema } from "./authentication.schema.js"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import * as authService from "./authentication.service.js"
import type { AppVariables } from "@/lib/hono.js"

const authRoutes = new Hono<{ Variables: AppVariables }>()

authRoutes.post("/register", zValidator("json", registerSchema), async (ctx) => {
  const body = ctx.req.valid("json")
  const user = await authService.register(body)
  return ctx.json(response.success(user, "Registration successful"), 201)
})

authRoutes.post("/login", zValidator("json", loginSchema), async (ctx) => {
  const body = ctx.req.valid("json")
  const result = await authService.login(body)
  return ctx.json(response.success({ user: result.user, tokens: result.tokens }, "Login successful"))
})

authRoutes.post("/refresh", zValidator("json", refreshTokenSchema), async (ctx) => {
  const body = ctx.req.valid("json")
  const tokens = await authService.refreshAccessToken(body.refreshToken)
  return ctx.json(response.success(tokens, "Token refreshed"))
})

authRoutes.post("/logout", authMiddleware, async (ctx) => {
  const userId = ctx.get("userId")
  await authService.logout(userId)
  return ctx.json(response.success(null, "Logged out successfully"))
})

authRoutes.get("/me", authMiddleware, async (ctx) => {
  const userId = ctx.get("userId")
  const organizationId = ctx.get("organizationId")

  const { prisma } = await import("@/config/database.js")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        where: { organizationId },
        include: { organization: true },
        take: 1,
      },
    },
  })

  if (!user) return ctx.json(response.error("User not found"), 404)

  const membership = user.memberships[0]

  return ctx.json(response.success({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    organizationId: membership?.organizationId,
    organizationName: membership?.organization.name,
  }))
})

export { authRoutes }
