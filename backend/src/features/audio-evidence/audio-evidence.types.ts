/**
 * An enriched compliance signal extracted from an audio transcript by the
 * AI/ML API intelligence layer (returned by the Python AI backend).
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

/**
 * Result of transcribing and analyzing a piece of audio evidence.
 */
export interface AudioEvidenceResult {
  transcript: string
  signal: AudioEvidenceSignal | Record<string, never>
}
