import { z } from "zod"

/**
 * Validation schema for the audio-evidence transcription request.
 * The audio file is sent as a base64-encoded string so it can travel through
 * the JSON API to the Python AI backend (Speechmatics).
 */
export const transcribeEvidenceSchema = z.object({
  audioBase64: z.string().min(1, "audioBase64 is required"),
  filename: z.string().min(1).default("evidence.wav"),
  language: z.enum(["en", "zh", "ar", "vi", "id", "th", "hi", "bn"]).default("en"),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
})

export type TranscribeEvidenceInput = z.infer<typeof transcribeEvidenceSchema>
