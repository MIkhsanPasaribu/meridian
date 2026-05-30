"""
Bright Data Web Unlocker client for bypassing geo-blocks on regional worker forums.
"""
import httpx
from typing import Any
from tenacity import retry, stop_after_attempt, wait_exponential
from src.core.config import settings
from src.core.logger import logger


class WebUnlockerClient:
    """
    Client for the Bright Data Web Unlocker API.
    Handles bot protection, CAPTCHAs, and geo-restrictions automatically.
    """

    TIMEOUT_SECONDS = 60

    def __init__(self) -> None:
        self._proxy_url = settings.web_unlocker_proxy_url

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=15),
    )
    async def unlock(
        self,
        url: str,
        country: str | None = None,
        render_js: bool = False,
    ) -> str:
        """
        Fetches a URL through the Web Unlocker, bypassing bot protection.

        Args:
            url: The target URL to unlock.
            country: Optional country code for geo-targeting (e.g., "CN", "VN").
            render_js: Whether to render JavaScript before returning content.

        Returns:
            The page content as a string (HTML or text).
        """
        headers: dict[str, str] = {}

        if country:
            headers["x-brd-country"] = country

        if render_js:
            headers["x-brd-render"] = "true"

        logger.info("Web Unlocker request", url=url, country=country, render_js=render_js)

        try:
            async with httpx.AsyncClient(
                proxies={"https://": self._proxy_url, "http://": self._proxy_url},
                verify=False,
                timeout=self.TIMEOUT_SECONDS,
                headers=headers,
            ) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                return resp.text

        except httpx.HTTPError as e:
            logger.error("Web Unlocker request failed", error=str(e), url=url)
            return ""

    async def unlock_batch(
        self,
        urls: list[str],
        country: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Unlocks multiple URLs in parallel.

        Args:
            urls: List of URLs to unlock.
            country: Optional country code for all requests.

        Returns:
            List of dicts with 'url' and 'content' keys.
        """
        import asyncio

        tasks = [self.unlock(url, country=country) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        return [
            {
                "url": url,
                "content": result if isinstance(result, str) else "",
            }
            for url, result in zip(urls, results)
        ]


web_unlocker_client = WebUnlockerClient()
