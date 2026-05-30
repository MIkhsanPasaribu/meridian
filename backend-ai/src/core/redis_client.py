"""
Redis client for consuming BullMQ jobs from the backend.

Works with both local Redis (redis://) and managed Upstash (rediss:// with TLS).
TLS is enabled automatically when the URL uses the secure `rediss://` scheme.
"""
import redis.asyncio as aioredis
from src.core.config import settings
from src.core.logger import logger


_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    """Returns a singleton async Redis client (local Redis or Upstash TLS)."""
    global _redis_client

    if _redis_client is None:
        # redis-py auto-negotiates TLS for the rediss:// scheme (Upstash).
        _redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            health_check_interval=30,
        )
        scheme = settings.redis_url.split("://", 1)[0]
        logger.info("Redis client initialized", scheme=scheme)

    return _redis_client


async def close_redis() -> None:
    """Closes the Redis connection."""
    global _redis_client

    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None
        logger.info("Redis connection closed")
