import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { prisma } from "@/config/database.js"
import { NotFoundError } from "@/lib/errors.js"
import type { AppVariables } from "@/lib/hono.js"

const userRoutes = new Hono<{ Variables: AppVariables }>()

userRoutes.use("*", authMiddleware)

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
})

/**
 * GET /api/v1/users/profile — Get current user profile
 */
userRoutes.get("/profile", async (ctx) => {
  const userId = ctx.get("userId")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })

  if (!user) throw new NotFoundError("User")

  return ctx.json(response.success(user))
})

/**
 * PATCH /api/v1/users/profile — Update current user profile
 */
userRoutes.patch(
  "/profile",
  zValidator("json", updateProfileSchema),
  async (ctx) => {
    const userId = ctx.get("userId")
    const body = ctx.req.valid("json")

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...body,
        avatarUrl: body.avatarUrl || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
      },
    })

    return ctx.json(response.success(user, "Profile updated"))
  }
)

/**
 * GET /api/v1/users — List organization members (admin only)
 */
userRoutes.get("/", async (ctx) => {
  const organizationId = ctx.get("organizationId")

  const memberships = await prisma.membership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          lastLoginAt: true,
          isActive: true,
        },
      },
    },
  })

  return ctx.json(response.success(memberships))
})

export { userRoutes }
