"""
Bright Data Scraping Browser client for rendering JS-heavy platforms.
"""
from typing import Any
from src.core.config import settings
from src.core.logger import logger


class ScrapingBrowserClient:
    """
    Client for the Bright Data Scraping Browser.
    Uses Playwright to connect to the remote browser via WebSocket.
    """

    def __init__(self) -> None:
        self._endpoint = settings.brightdata_scraping_browser_endpoint

    async def get_page_text(self, url: str) -> str:
        """
        Navigates to a URL using the Scraping Browser and returns the page text.

        Args:
            url: The URL to navigate to.

        Returns:
            The page text content.
        """
        if not self._endpoint:
            logger.warning("Scraping Browser endpoint not configured")
            return ""

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(self._endpoint)
                page = await browser.new_page()

                await page.goto(url, wait_until="networkidle", timeout=30000)
                text = await page.inner_text("body")

                await browser.close()
                return text

        except Exception as e:
            logger.error("Scraping Browser failed", error=str(e), url=url)
            return ""

    async def take_screenshot(self, url: str) -> bytes:
        """
        Takes a screenshot of a URL using the Scraping Browser.

        Args:
            url: The URL to screenshot.

        Returns:
            Screenshot as bytes (PNG format).
        """
        if not self._endpoint:
            logger.warning("Scraping Browser endpoint not configured")
            return b""

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(self._endpoint)
                page = await browser.new_page()

                await page.goto(url, wait_until="networkidle", timeout=30000)
                screenshot = await page.screenshot(full_page=True)

                await browser.close()
                return screenshot

        except Exception as e:
            logger.error("Screenshot failed", error=str(e), url=url)
            return b""


scraping_browser_client = ScrapingBrowserClient()
