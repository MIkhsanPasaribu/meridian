export { AudioEvidenceUploader } from "./components/AudioEvidenceUploader"
export { useTranscribeEvidence } from "./hooks/useAudioEvidence"
export * as audioEvidenceService from "./services/audioEvidenceService"
export type {
  AudioEvidenceResult,
  AudioEvidenceSignal,
  TranscribeLanguage,
  TranscribeParams,
} from "./services/audioEvidenceService"
