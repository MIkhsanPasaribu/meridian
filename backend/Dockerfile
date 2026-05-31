# syntax=docker/dockerfile:1
# Meridian Backend (Hono) — production image
# Build: docker build -t meridian-backend ./backend
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# OpenSSL is required by Prisma's query engine (node:22-slim ships without it).
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# Pin pnpm to a known-good version (avoids corepack pulling a newer pnpm that
# errors on ERR_PNPM_IGNORED_BUILDS in non-interactive CI).
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
# pnpm-workspace.yaml carries the overrides/catalog the lockfile was built from,
# so it must be present for --frozen-lockfile to validate.
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
# --ignore-scripts: skip dependency lifecycle build scripts (esbuild, msgpackr,
# prisma postinstall). The Prisma client is generated explicitly in the build
# stage below, and the runtime is a plain tsc-compiled app, so no native builds
# are needed during install.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# --- Build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate --schema=database/prisma/schema.prisma
RUN pnpm build

# --- Runtime ---
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/database ./database
COPY package.json ./

EXPOSE 8000
# Schema is applied out-of-band via `pnpm db:push` (the project uses db push,
# not migration files), so the container just starts the server.
# tsc preserves the src/ folder (rootDir ./), so the entry is dist/src/index.js.
CMD ["node", "dist/src/index.js"]
