import { env } from "@/config/env.js"
import { logger } from "@/lib/logger.js"
import { AppError } from "@/lib/errors.js"
import type { TranscribeEvidenceInput } from "./audio-evidence.schema.js"
import type { AudioEvidenceResult } from "./audio-evidence.types.js"

const TRANSCRIBE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes (batch ASR can be slow)

interface BackendAiResponse {
  success: boolean
  data: AudioEvidenceResult | null
  message: string
  error: string | null
}

/**
 * Forwards an audio-evidence transcription request to the Python AI backend,
 * which runs Speechmatics speech-to-text and AI/ML API signal extraction.
 *
 * @param input - The validated transcription request.
 * @returns The transcript and the extracted compliance signal.
 */
export async function transcribeEvidence(
  input: TranscribeEvidenceInput
): Promise<AudioEvidenceResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TRANSCRIBE_TIMEOUT_MS)

  try {
    const res = await fetch(`${env.BACKEND_AI_URL}/api/v1/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64: input.audioBase64,
        filename: input.filename,
        language: input.language,
        supplierName: input.supplierName ?? "",
        sourceUrl: input.sourceUrl ?? "",
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new AppError(
        `AI backend transcription failed (${res.status})`,
        502
      )
    }

    const body = (await res.json()) as BackendAiResponse

    if (!body.success || !body.data) {
      throw new AppError(
        body.error ?? body.message ?? "Transcription failed",
        502
      )
    }

    logger.info(
      { transcriptLength: body.data.transcript.length },
      "Audio evidence transcribed"
    )

    return body.data
  } catch (error) {
    if (error instanceof AppError) throw error

    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("Transcription timed out", 504)
    }

    logger.error({ error }, "Failed to reach AI backend for transcription")
    throw new AppError("Transcription service unavailable", 503)
  } finally {
    clearTimeout(timeout)
  }
}
