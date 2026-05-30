---
title: Meridian Backend AI
emoji: 🧠
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 8001
pinned: false
---

# Meridian Backend AI (FastAPI + LangGraph)

Python AI agent backend (GNSH Engine) for the Meridian supply-chain ESG
compliance platform. Deployed as a Hugging Face **Docker Space**.

## How this Space runs

Hugging Face builds the `Dockerfile` in this directory and runs the container,
exposing the port declared by `app_port` above (8001). The image skips local
Chromium (the Scraping Browser integration uses Bright Data's REMOTE browser),
so it fits comfortably in the free Space's RAM.

## Required Space secrets

Set these under **Settings → Variables and secrets** (do NOT commit them):

| Secret | Notes |
|--------|-------|
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | Supabase pooled URL with `postgresql+asyncpg://` prefix |
| `REDIS_URL` | Upstash `rediss://` TLS URL |
| `QDRANT_URL` / `QDRANT_API_KEY` | Qdrant Cloud cluster |
| `BACKEND_URL` | the backend Space URL (for job callbacks) |
| `INTERNAL_API_SECRET` | shared secret, must match backend |
| `BRIGHTDATA_API_KEY` (+ SERP/Unlocker/Proxy vars) | Bright Data |
| `AIMLAPI_API_KEY` | AI/ML API intelligence layer |
| `FEATHERLESS_API_KEY` | Featherless AI |
| `SPEECHMATICS_API_KEY` | Speechmatics |
| `GROQ_API_KEY` | Groq |

See `docs/DEPLOY.md` for the full walkthrough.
