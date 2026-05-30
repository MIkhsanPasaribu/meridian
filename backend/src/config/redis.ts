import { Redis } from "ioredis"
import { env } from "./env.js"
import { logger } from "@/lib/logger.js"

let redisInstance: Redis | null = null

/**
 * Returns a singleton Redis client instance.
 */
export function getRedisClient(): Redis {
  if (redisInstance) return redisInstance

  redisInstance = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  })

  redisInstance.on("connect", () => {
    logger.info("✅ Redis connected successfully")
  })

  redisInstance.on("error", (error: Error) => {
    logger.error({ error }, "❌ Redis connection error")
  })

  return redisInstance
}

export const redis = getRedisClient()
