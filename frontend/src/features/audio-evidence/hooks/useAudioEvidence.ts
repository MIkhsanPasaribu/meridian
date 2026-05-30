"use client"

import { useMutation } from "@tanstack/react-query"
import * as audioEvidenceService from "../services/audioEvidenceService"

/**
 * Hook for transcribing an audio evidence file and extracting a compliance signal.
 * Wraps the Speechmatics + AI/ML API workflow exposed by the backend.
 */
export function useTranscribeEvidence() {
  return useMutation({
    mutationFn: audioEvidenceService.transcribeEvidence,
  })
}
