import nodemailer from "nodemailer"
import { env } from "@/config/env.js"
import { logger } from "@/lib/logger.js"

/**
 * Creates a configured Nodemailer transporter.
 * Uses SMTP settings from environment variables.
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  })
}

/**
 * Sends an email using the configured SMTP transporter.
 */
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    logger.warn("Email not configured, skipping send")
    return
  }

  const transporter = createTransporter()

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    logger.info({ to: options.to, subject: options.subject }, "Email sent")
  } catch (error) {
    logger.error({ error, to: options.to }, "Failed to send email")
    throw error
  }
}
