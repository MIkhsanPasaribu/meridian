"""
Structured logging configuration for the Meridian AI backend.
"""
import structlog
import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """Configures structlog for structured JSON logging."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer() if level == "DEBUG" else structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, level.upper(), logging.INFO)
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
    )


configure_logging()
logger = structlog.get_logger("meridian-ai")
