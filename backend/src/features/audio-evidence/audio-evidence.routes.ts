import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "@/core/middleware/authentication.middleware.js"
import { response } from "@/lib/response.js"
import { transcribeEvidenceSchema } from "./audio-evidence.schema.js"
import { transcribeEvidence } from "./audio-evidence.service.js"
import type { AppVariables } from "@/lib/hono.js"

const audioEvidenceRoutes = new Hono<{ Variables: AppVariables }>()

audioEvidenceRoutes.use("*", authMiddleware)

/**
 * POST /api/v1/audio-evidence/transcribe
 * Transcribes an audio evidence file (Speechmatics) and extracts a structured
 * compliance signal from the transcript (AI/ML API), via the Python AI backend.
 */
audioEvidenceRoutes.post(
  "/transcribe",
  zValidator("json", transcribeEvidenceSchema),
  async (ctx) => {
    const input = ctx.req.valid("json")
    const result = await transcribeEvidence(input)
    return ctx.json(response.success(result, "Transcription completed"))
  }
)

export { audioEvidenceRoutes }
