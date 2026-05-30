# syntax=docker/dockerfile:1
# Meridian Backend (Hono) — production image
# Build: docker build -t meridian-backend ./backend
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
# pnpm-workspace.yaml carries the overrides/catalog the lockfile was built from,
# so it must be present for --frozen-lockfile to validate.
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

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
# Apply migrations then start the server.
CMD ["sh", "-c", "pnpm prisma migrate deploy --schema=database/prisma/schema.prisma && node dist/index.js"]
