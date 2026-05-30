"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Upload, FileAudio, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useTranscribeEvidence } from "../hooks/useAudioEvidence"
import type {
  AudioEvidenceResult,
  TranscribeLanguage,
} from "../services/audioEvidenceService"

const LANGUAGES: { value: TranscribeLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh", label: "Chinese (中文)" },
  { value: "ar", label: "Arabic (العربية)" },
  { value: "vi", label: "Vietnamese (Tiếng Việt)" },
  { value: "id", label: "Indonesian" },
  { value: "th", label: "Thai (ไทย)" },
  { value: "hi", label: "Hindi (हिन्दी)" },
  { value: "bn", label: "Bengali (বাংলা)" },
]

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#10B981",
}

const MAX_FILE_MB = 50

/**
 * Audio evidence uploader — transcribes recordings (press conferences, worker
 * testimony, broadcasts) via Speechmatics and extracts a compliance signal via
 * the AI/ML API intelligence layer.
 */
export function AudioEvidenceUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState<TranscribeLanguage>("en")
  const [supplierName, setSupplierName] = useState("")
  const [result, setResult] = useState<AudioEvidenceResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const transcribe = useTranscribeEvidence()

  const handleFileSelect = (selected: File | null) => {
    setValidationError(null)
    setResult(null)

    if (!selected) return

    if (!selected.type.startsWith("audio/")) {
      setValidationError("Please select an audio file (mp3, wav, m4a, ...).")
      return
    }
    if (selected.size > MAX_FILE_MB * 1024 * 1024) {
      setValidationError(`File too large. Maximum ${MAX_FILE_MB} MB.`)
      return
    }

    setFile(selected)
  }

  const handleSubmit = async () => {
    if (!file) {
      setValidationError("Select an audio file first.")
      return
    }

    try {
      const res = await transcribe.mutateAsync({
        file,
        language,
        supplierName: supplierName.trim() || undefined,
      })
      setResult(res)
    } catch {
      // Error surfaced via transcribe.isError below.
    }
  }

  const signal = result?.signal && "severity" in result.signal ? result.signal : null
  const severityColor = signal ? SEVERITY_COLORS[signal.severity] ?? "#8B9BB4" : "#8B9BB4"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mic size={20} className="text-[#3B82F6]" />
        <div>
          <h1 className="text-2xl font-bold text-[#E8EDF5]">Audio Evidence</h1>
          <p className="text-sm text-[#8B9BB4] mt-0.5">
            Transcribe recordings and extract compliance signals with AI
          </p>
        </div>
      </div>

      {/* Upload card */}
      <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-6 space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-[#2A3447] rounded-lg p-8 flex flex-col items-center gap-3 hover:border-[#3B82F6]/50 transition-colors"
        >
          {file ? (
            <FileAudio size={32} className="text-[#3B82F6]" />
          ) : (
            <Upload size={32} className="text-[#8B9BB4]" />
          )}
          <span className="text-sm text-[#E8EDF5]">
            {file ? file.name : "Click to select an audio file"}
          </span>
          <span className="text-xs text-[#4A5568]">
            mp3, wav, m4a · max {MAX_FILE_MB} MB
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8B9BB4] mb-1.5">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as TranscribeLanguage)}
              className="w-full bg-[#161B25] border border-[#1E2737] rounded-lg px-3 py-2 text-sm text-[#E8EDF5] focus:border-[#3B82F6] outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8B9BB4] mb-1.5">
              Supplier name (optional)
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. Acme Manufacturing Co."
              className="w-full bg-[#161B25] border border-[#1E2737] rounded-lg px-3 py-2 text-sm text-[#E8EDF5] focus:border-[#3B82F6] outline-none"
            />
          </div>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 text-xs text-[#EF4444]">
            <AlertCircle size={14} />
            {validationError}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={transcribe.isPending || !file}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {transcribe.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Transcribing & analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Transcribe & Extract Signal
            </>
          )}
        </button>

        {transcribe.isError && (
          <div className="flex items-center gap-2 text-xs text-[#EF4444]">
            <AlertCircle size={14} />
            Transcription failed. Check that Speechmatics is configured and try again.
          </div>
        )}
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {signal && (
              <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#E8EDF5]">
                    Extracted Compliance Signal
                  </h3>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: severityColor, backgroundColor: `${severityColor}1a` }}
                  >
                    {signal.severity.toUpperCase()}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-[#4A5568]">Category</dt>
                    <dd className="text-[#E8EDF5]">{signal.category}</dd>
                  </div>
                  <div>
                    <dt className="text-[#4A5568]">Source type</dt>
                    <dd className="text-[#E8EDF5]">{signal.source_type}</dd>
                  </div>
                  {typeof signal.sentiment_score === "number" && (
                    <div>
                      <dt className="text-[#4A5568]">Sentiment</dt>
                      <dd className="text-[#E8EDF5]">{signal.sentiment_score.toFixed(2)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[#4A5568]">Enriched by</dt>
                    <dd className="text-[#E8EDF5]">{signal.enriched_by ?? "keyword"}</dd>
                  </div>
                </dl>
                {signal.ai_summary && (
                  <p className="mt-3 text-sm text-[#8B9BB4] border-t border-[#1E2737] pt-3">
                    {signal.ai_summary}
                  </p>
                )}
              </div>
            )}

            <div className="bg-[#0E1117] border border-[#1E2737] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-2">Transcript</h3>
              <p className="text-sm text-[#8B9BB4] whitespace-pre-wrap max-h-72 overflow-y-auto scrollbar-thin">
                {result.transcript || "No speech detected in the audio."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
