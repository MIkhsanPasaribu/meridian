import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "@/config/database.js"
import { redis } from "@/config/redis.js"
import { env } from "@/config/env.js"
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors.js"
import type {
  AuthTokens,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "./authentication.types.js"

const BCRYPT_ROUNDS = 12
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

/**
 * Generates a JWT access token for the given user.
 */
async function generateAccessToken(
  userId: string,
  organizationId: string,
  role: string
): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  return new SignJWT({ organizationId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret)
}

/**
 * Generates a refresh token and stores it in Redis.
 */
async function generateRefreshToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(secret)

  await redis.setex(
    `refresh_token:${userId}`,
    REFRESH_TOKEN_TTL_SECONDS,
    token
  )

  return token
}

/**
 * Registers a new organization and its first admin user.
 */
export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  })

  if (existingUser) {
    throw new ConflictError("Email already registered")
  }

  const existingOrg = await prisma.organization.findUnique({
    where: { slug: payload.organizationSlug },
  })

  if (existingOrg) {
    throw new ConflictError("Organization slug already taken")
  }

  const passwordHash = await bcrypt.hash(payload.password, BCRYPT_ROUNDS)

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: payload.organizationName,
        slug: payload.organizationSlug,
      },
    })

    const user = await tx.user.create({
      data: {
        email: payload.email,
        passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: "ADMIN",
      },
    })

    await tx.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "ADMIN",
      },
    })

    await tx.organizationSettings.create({
      data: { organizationId: organization.id },
    })

    return { user, organization }
  })

  return {
    id: result.user.id,
    email: result.user.email,
    firstName: result.user.firstName,
    lastName: result.user.lastName,
    role: result.user.role,
    organizationId: result.organization.id,
    organizationName: result.organization.name,
  }
}

/**
 * Authenticates a user and returns JWT tokens.
 */
export async function login(
  payload: LoginPayload
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      memberships: {
        include: { organization: true },
        take: 1,
      },
    },
  })

  if (!user || !user.isActive) {
    throw new UnauthorizedError("Invalid email or password")
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash)

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password")
  }

  const membership = user.memberships[0]

  if (!membership) {
    throw new ValidationError("User has no organization membership")
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user.id, membership.organizationId, user.role),
    generateRefreshToken(user.id),
  ])

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: membership.organizationId,
      organizationName: membership.organization.name,
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    },
  }
}

/**
 * Refreshes the access token using a valid refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthTokens> {
  const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

  let userId: string

  try {
    const { payload } = await jwtVerify(refreshToken, secret)
    userId = payload.sub as string
  } catch {
    throw new UnauthorizedError("Invalid refresh token")
  }

  const storedToken = await redis.get(`refresh_token:${userId}`)

  if (storedToken !== refreshToken) {
    throw new UnauthorizedError("Refresh token has been revoked")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { take: 1 } },
  })

  if (!user || !user.isActive) {
    throw new NotFoundError("User")
  }

  const membership = user.memberships[0]

  if (!membership) {
    throw new ValidationError("User has no organization membership")
  }

  const [newAccessToken, newRefreshToken] = await Promise.all([
    generateAccessToken(user.id, membership.organizationId, user.role),
    generateRefreshToken(user.id),
  ])

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 15 * 60,
  }
}

/**
 * Logs out a user by revoking their refresh token.
 */
export async function logout(userId: string): Promise<void> {
  await redis.del(`refresh_token:${userId}`)
}
