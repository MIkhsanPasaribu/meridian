"""
SQLAlchemy async database engine for the Meridian AI backend.
Used for reading signal data and writing VVS scores back to PostgreSQL.

Works with local PostgreSQL and the Supabase transaction pooler (pgbouncer).
When connecting through the Supabase pooler (host contains "pooler.supabase"),
asyncpg statement caching is disabled because pgbouncer transaction mode does
not support prepared statements.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from src.core.config import settings
from src.core.logger import logger


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def _build_engine_kwargs() -> dict:
    """
    Builds engine keyword arguments, adapting to the Supabase transaction pooler.

    Returns:
        Engine kwargs dict (connect_args/poolclass tuned for the target DB).
    """
    kwargs: dict = {
        "echo": settings.environment == "development",
        "pool_pre_ping": True,
    }

    is_pooler = "pooler.supabase" in settings.database_url or "pgbouncer" in settings.database_url

    if is_pooler:
        # pgbouncer transaction mode: disable prepared statements + driver-side pooling.
        from sqlalchemy.pool import NullPool

        kwargs["poolclass"] = NullPool
        kwargs["connect_args"] = {
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0,
        }
        logger.info("Database engine configured for Supabase pooler")
    else:
        kwargs["pool_size"] = 5
        kwargs["max_overflow"] = 10

    return kwargs


engine = create_async_engine(settings.database_url, **_build_engine_kwargs())

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncSession:
    """
    Returns an async database session.
    Use as a dependency in FastAPI endpoints.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def connect_database() -> None:
    """Verifies the database connection on startup."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda c: c.execute(c.text("SELECT 1")))
        logger.info("Database connection verified")
    except Exception as e:
        logger.error("Database connection failed", error=str(e))
        raise
