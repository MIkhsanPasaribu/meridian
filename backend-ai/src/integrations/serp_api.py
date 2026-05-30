"""
Bright Data SERP API client for multi-language news signal collection.
"""
import httpx
from typing import Any
from tenacity import retry, stop_after_attempt, wait_exponential
from src.core.config import settings
from src.core.logger import logger


class SerpApiClient:
    """
    Client for the Bright Data SERP API.
    Supports Google, Bing, and Yandex search engines.
    """

    BASE_URL = "https://www.google.com/search"
    TIMEOUT_SECONDS = 30

    def __init__(self) -> None:
        self._proxy_url = settings.serp_proxy_url

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def search(
        self,
        query: str,
        language: str = "en",
        country: str = "US",
        days_limit: int = 7,
        num_results: int = 10,
    ) -> list[dict[str, Any]]:
        """
        Executes a SERP query via Bright Data and returns structured results.

        Args:
            query: The search query string.
            language: Target language code (en, zh, ar, vi, etc.).
            country: Target country code for geo-targeting.
            days_limit: Filter results to the last N days.
            num_results: Maximum number of results to return.

        Returns:
            List of search result dicts with url, title, snippet, date.
        """
        params = {
            "q": query,
            "hl": language,
            "gl": country.lower(),
            "num": num_results,
            "tbs": f"qdr:d{days_limit}",
        }

        logger.info(
            "SERP API search",
            query=query,
            language=language,
            country=country,
        )

        try:
            async with httpx.AsyncClient(
                proxies={"https://": self._proxy_url, "http://": self._proxy_url},
                verify=False,
                timeout=self.TIMEOUT_SECONDS,
            ) as client:
                resp = await client.get(self.BASE_URL, params=params)
                resp.raise_for_status()

                # Parse the response — Bright Data returns structured JSON for Google
                data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                results = data.get("organic", [])

                return [
                    {
                        "url": r.get("link", ""),
                        "title": r.get("title", ""),
                        "snippet": r.get("snippet", ""),
                        "language": language,
                        "date": r.get("date", ""),
                        "relevance_score": r.get("position", 10) / 10,
                        "source_type": "national_media",
                    }
                    for r in results
                ]

        except httpx.HTTPError as e:
            logger.error("SERP API request failed", error=str(e), query=query)
            return []

    async def batch_search(
        self,
        queries: list[dict[str, str]],
    ) -> list[dict[str, Any]]:
        """
        Executes multiple SERP queries in parallel.

        Args:
            queries: List of dicts with 'query', 'language', 'country' keys.

        Returns:
            Flattened list of all search results.
        """
        import asyncio

        tasks = [
            self.search(
                query=q["query"],
                language=q.get("language", "en"),
                country=q.get("country", "US"),
            )
            for q in queries
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_results: list[dict[str, Any]] = []

        for result in results:
            if isinstance(result, list):
                all_results.extend(result)

        return all_results


serp_api_client = SerpApiClient()
