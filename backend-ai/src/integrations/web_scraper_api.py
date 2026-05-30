"""
Bright Data Web Scraper API client for structured data from NGO databases.
"""
import httpx
from typing import Any
from tenacity import retry, stop_after_attempt, wait_exponential
from src.core.config import settings
from src.core.logger import logger

BASE_URL = "https://api.brightdata.com"


class WebScraperApiClient:
    """
    Client for the Bright Data Web Scraper API (660+ pre-built scrapers).
    Used for structured data extraction from NGO databases and LinkedIn.
    """

    TIMEOUT_SECONDS = 120

    def __init__(self) -> None:
        self._api_key = settings.brightdata_api_key
        self._headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=5, max=30),
    )
    async def scrape_url(
        self,
        dataset_id: str,
        url: str,
    ) -> dict[str, Any]:
        """
        Triggers a synchronous scrape for a single URL.

        Args:
            dataset_id: The Bright Data dataset/scraper ID.
            url: The URL to scrape.

        Returns:
            Structured data dict from the scraper.
        """
        endpoint = f"{BASE_URL}/datasets/v3/trigger"
        payload = {
            "dataset_id": dataset_id,
            "include_errors": True,
            "type": "discover_new",
            "discover_by": "url",
            "data": [{"url": url}],
        }

        logger.info("Web Scraper API request", dataset_id=dataset_id, url=url)

        try:
            async with httpx.AsyncClient(
                headers=self._headers,
                timeout=self.TIMEOUT_SECONDS,
            ) as client:
                resp = await client.post(endpoint, json=payload)
                resp.raise_for_status()
                return resp.json()

        except httpx.HTTPError as e:
            logger.error("Web Scraper API failed", error=str(e), url=url)
            return {}


web_scraper_api_client = WebScraperApiClient()
