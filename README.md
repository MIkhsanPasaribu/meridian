# Meridian

> **Autonomous Supply Chain ESG Compliance Intelligence Agent**
> "Meridian reads signals nobody has seen, from places nobody could reach."

Built for the **Web Data UNLOCKED Hackathon** | Bright Data × lablab.ai | Track 3: Security & Compliance

---

## Architecture

```
meridian/
├── frontend/      Next.js 15 (React 19, App Router, TypeScript, Tailwind CSS v4)
├── backend/       Node.js + Hono (TypeScript, Prisma, PostgreSQL, Redis, BullMQ)
├── backend-ai/    Python + FastAPI (LangGraph, LangChain, Anthropic Claude, Bright Data)
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 22 LTS
- pnpm 9+
- Python 3.12+
- Docker Desktop

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd meridian

# 2. Environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Start infrastructure
docker-compose up -d

# 4. Backend setup
cd backend
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Frontend setup
cd ../frontend
pnpm install

# 6. Backend AI setup
cd ../backend-ai
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
playwright install chromium
```

### Development

```bash
# Frontend (http://localhost:3000)
cd frontend && pnpm dev

# Backend (http://localhost:8000)
cd backend && pnpm dev

# Backend AI (http://localhost:8001)
cd backend-ai && uvicorn src.main:app --reload --port 8001
```

## Key Features

- **GNSH Engine** — Geo-Native Signal Harvesting across 60+ multilingual sources
- **VVS Scoring** — Violation Velocity Score (0–100) with 4 risk stages
- **RMM** — Regulatory Mandate Mapper for CSDDD, UFLPA, LkSG
- **Intelligence Briefs** — Claude Sonnet 4 generated analyst reports
- **Real-time Alerts** — WebSocket-powered multi-channel notifications

## Bright Data Integration

| Tool | Usage |
|------|-------|
| SERP API | Multi-language news monitoring (4 languages) |
| Web Unlocker | Bypass geo-blocks on regional worker forums |
| Scraping Browser | Render JS-heavy platforms (Weibo, Maimai) |
| Web Scraper API | Structured data from NGO databases |
| Residential Proxies | Local country IP for geo-native access |
| MCP Server | Direct LangGraph agent web access |

---

*Web Data UNLOCKED Hackathon | Bright Data × lablab.ai | Track 3: Security & Compliance*
