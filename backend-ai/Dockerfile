# syntax=docker/dockerfile:1
# Meridian Backend AI (FastAPI + LangGraph) — production image
# Build: docker build -t meridian-backend-ai ./backend-ai
#
# Chromium is OPTIONAL: the Scraping Browser integration connects to Bright
# Data's REMOTE browser over CDP, so local Chromium is not required at runtime.
# It is skipped by default to keep the image small enough for free-tier RAM.
# To bundle a local Chromium, build with: --build-arg INSTALL_CHROMIUM=true
FROM python:3.12-slim AS base

ARG INSTALL_CHROMIUM=false

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Only download the Chromium binary when explicitly requested.
RUN if [ "$INSTALL_CHROMIUM" = "true" ]; then playwright install --with-deps chromium; fi

COPY . .

EXPOSE 8001
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
