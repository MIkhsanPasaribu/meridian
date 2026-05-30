"""
Qdrant vector database client for semantic search over signal history.
"""
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams
from src.core.config import settings
from src.core.logger import logger

SIGNAL_COLLECTION = "signal_embeddings"
VECTOR_SIZE = 1536  # OpenAI-compatible embedding dimension (AI/ML API / Featherless)

_qdrant_client: AsyncQdrantClient | None = None


def get_qdrant_client() -> AsyncQdrantClient:
    """Returns a singleton Qdrant client instance."""
    global _qdrant_client

    if _qdrant_client is None:
        # api_key is required for Qdrant Cloud; omitted for local Docker.
        if settings.qdrant_api_key:
            _qdrant_client = AsyncQdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
            )
        else:
            _qdrant_client = AsyncQdrantClient(url=settings.qdrant_url)
        logger.info("Qdrant client initialized", url=settings.qdrant_url)

    return _qdrant_client


async def ensure_collection_exists() -> None:
    """
    Ensures the signal embeddings collection exists in Qdrant.
    Creates it if it doesn't exist.
    """
    client = get_qdrant_client()

    try:
        collections = await client.get_collections()
        existing = [c.name for c in collections.collections]

        if SIGNAL_COLLECTION not in existing:
            await client.create_collection(
                collection_name=SIGNAL_COLLECTION,
                vectors_config=VectorParams(
                    size=VECTOR_SIZE,
                    distance=Distance.COSINE,
                ),
            )
            logger.info("Qdrant collection created", collection=SIGNAL_COLLECTION)
    except Exception as e:
        logger.error("Failed to ensure Qdrant collection", error=str(e))
