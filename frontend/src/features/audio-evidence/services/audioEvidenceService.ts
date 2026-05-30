import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"

/**
 * An enriched compliance signal extracted from an audio transcript.
 */
export interface AudioEvidenceSignal {
  title: string
  content: string
  category: string
  severity: string
  source_type: string
  language: string
  sentiment_score?: number
  ai_summary?: string
  enriched_by?: string
}

export interface AudioEvidenceResult {
  transcript: string
  signal: AudioEvidenceSignal | Record<string, never>
}

export type TranscribeLanguage =
  | "en"
  | "zh"
  | "ar"
  | "vi"
  | "id"
  | "th"
  | "hi"
  | "bn"

export interface TranscribeParams {
  file: File
  language: TranscribeLanguage
  supplierName?: string
  sourceUrl?: string
}

/**
 * Reads a File into a base64 string (without the data: prefix).
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the "data:<mime>;base64," prefix.
      const base64 = result.includes(",") ? result.split(",")[1] : result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error("Failed to read audio file"))
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads an audio evidence file for transcription + signal extraction.
 */
export async function transcribeEvidence(
  params: TranscribeParams
): Promise<AudioEvidenceResult> {
  const audioBase64 = await fileToBase64(params.file)

  const res = await apiClient.post<ApiResponse<AudioEvidenceResult>>(
    "/audio-evidence/transcribe",
    {
      audioBase64,
      filename: params.file.name,
      language: params.language,
      supplierName: params.supplierName ?? "",
      sourceUrl: params.sourceUrl ?? "",
    },
    { timeout: 5 * 60 * 1000 }
  )

  if (!res.data.data) throw new Error(res.data.message)
  return res.data.data
}
