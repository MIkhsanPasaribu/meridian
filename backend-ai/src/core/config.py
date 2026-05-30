"""
Core configuration for the Meridian AI backend.
Uses Pydantic BaseSettings for environment variable validation.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    environment: str = "development"
    port: int = 8001

    # Bright Data
    brightdata_api_key: str = ""
    brightdata_serp_zone: str = ""
    brightdata_serp_username: str = ""
    brightdata_serp_password: str = ""
    brightdata_web_unlocker_username: str = ""
    brightdata_web_unlocker_password: str = ""
    brightdata_scraping_browser_endpoint: str = ""
    brightdata_residential_proxy_host: str = "brd.superproxy.io"
    brightdata_residential_proxy_port: int = 22225
    brightdata_residential_username: str = ""
    brightdata_residential_password: str = ""
    brightdata_mcp_server_url: str = "https://mcp.brightdata.com/sse"

    # AI APIs
    # AI/ML API (aimlapi.com) — OpenAI-compatible intelligence layer (reasoning, reports)
    aimlapi_api_key: str = ""
    aimlapi_base_url: str = "https://api.aimlapi.com/v1"
    aimlapi_model: str = "gpt-4o"
    aimlapi_reasoning_model: str = "openai/o4-mini"

    # Featherless AI (featherless.ai) — serverless open-source model inference
    featherless_api_key: str = ""
    featherless_base_url: str = "https://api.featherless.ai/v1"
    featherless_model: str = "meta-llama/Meta-Llama-3.1-8B-Instruct"

    # Speechmatics — speech-to-text / conversational AI
    speechmatics_api_key: str = ""
    speechmatics_url: str = "https://asr.api.speechmatics.com/v2"

    # Groq — fast preprocessing (signal classification, translation)
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Infrastructure (cloud-ready: Supabase / Upstash / Qdrant Cloud)
    database_url: str = "postgresql+asyncpg://meridian_user:meridian_pass@localhost:5432/meridian_db"
    redis_url: str = "redis://localhost:6379"
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""

    # Backend URL
    backend_url: str = "http://localhost:8000"
    # Shared secret for service-to-service callbacks to the Hono backend.
    internal_api_secret: str = "meridian_internal_secret_change_me"

    @property
    def brightdata_mcp_url_with_token(self) -> str:
        """Returns the MCP server URL with the API token appended."""
        return f"{self.brightdata_mcp_server_url}?token={self.brightdata_api_key}&pro=1"

    @property
    def serp_proxy_url(self) -> str:
        """Returns the SERP API proxy URL."""
        return (
            f"http://{self.brightdata_serp_username}:{self.brightdata_serp_password}"
            f"@brd.superproxy.io:22225"
        )

    @property
    def web_unlocker_proxy_url(self) -> str:
        """Returns the Web Unlocker proxy URL."""
        return (
            f"http://{self.brightdata_web_unlocker_username}:{self.brightdata_web_unlocker_password}"
            f"@brd.superproxy.io:22225"
        )


@lru_cache
def get_settings() -> Settings:
    """Returns a cached Settings instance."""
    return Settings()


settings = get_settings()
