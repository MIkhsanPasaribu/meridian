---
title: Meridian Backend
emoji: 🛰️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
---

# Meridian Backend (Hono API)

Node.js + Hono REST API for the Meridian supply-chain ESG compliance platform.
Deployed as a Hugging Face **Docker Space**.

## How this Space runs

Hugging Face builds the `Dockerfile` in this directory and runs the container,
exposing the port declared by `app_port` above (8000). The container applies
Prisma migrations on boot, then starts the Hono server.

## Required Space secrets

Set these under **Settings → Variables and secrets** (do NOT commit them):

| Secret | Example / notes |
|--------|-----------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase pooled URL (port 6543) + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase session URL (port 5432) — for migrations |
| `REDIS_URL` | Upstash `rediss://` TLS URL |
| `JWT_SECRET` | 32+ char random string |
| `JWT_REFRESH_SECRET` | 32+ char random string |
| `FRONTEND_URL` | your Vercel frontend origin (CORS) |
| `BACKEND_AI_URL` | the backend-ai Space URL |
| `INTERNAL_API_SECRET` | shared secret, must match backend-ai |
| `MINIO_ENDPOINT` / `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | S3-compatible storage |
| `MINIO_PORT` | `443` |
| `MINIO_USE_SSL` | `true` |
| `MINIO_BUCKET` | `meridian-evidence` |
| `MINIO_REGION` | e.g. `us-east-1` |

See `docs/DEPLOY.md` for the full walkthrough.
