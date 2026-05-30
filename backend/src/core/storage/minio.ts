import { Client as MinioClient } from "minio"
import { env } from "@/config/env.js"
import { logger } from "@/lib/logger.js"

let minioInstance: MinioClient | null = null

/**
 * Returns a singleton MinIO client instance.
 *
 * Works with local MinIO and any S3-compatible cloud storage (AWS S3,
 * Supabase Storage S3 endpoint). For cloud, set MINIO_USE_SSL=true, the cloud
 * host in MINIO_ENDPOINT, the correct MINIO_REGION, and port 443.
 */
export function getMinioClient(): MinioClient {
  if (minioInstance) return minioInstance

  minioInstance = new MinioClient({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    region: env.MINIO_REGION,
  })

  return minioInstance
}

/**
 * Ensures the evidence bucket exists, creating it if necessary.
 */
export async function ensureBucketExists(): Promise<void> {
  const client = getMinioClient()

  try {
    const exists = await client.bucketExists(env.MINIO_BUCKET)
    if (!exists) {
      await client.makeBucket(env.MINIO_BUCKET, env.MINIO_REGION)
      logger.info({ bucket: env.MINIO_BUCKET }, "MinIO bucket created")
    }
  } catch (error) {
    logger.error({ error }, "Failed to ensure MinIO bucket exists")
  }
}

/**
 * Generates a presigned URL for accessing an evidence file.
 * URL expires after 24 hours.
 */
export async function getPresignedUrl(objectKey: string): Promise<string> {
  const client = getMinioClient()
  const EXPIRY_SECONDS = 24 * 60 * 60 // 24 hours

  return client.presignedGetObject(env.MINIO_BUCKET, objectKey, EXPIRY_SECONDS)
}

/**
 * Uploads a file to MinIO object storage.
 */
export async function uploadFile(
  objectKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> {
  const client = getMinioClient()

  await client.putObject(env.MINIO_BUCKET, objectKey, buffer, buffer.length, {
    "Content-Type": mimeType,
  })

  logger.info({ objectKey, size: buffer.length }, "File uploaded to MinIO")
}
