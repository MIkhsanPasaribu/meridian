"""
Bright Data MCP Server client for LangGraph agent integration.

Connects LangGraph agents directly to Bright Data's hosted MCP server using
`langchain-mcp-adapters`. Exposes both the raw LangChain tool list (for binding
to a ReAct agent) and convenience wrappers for the two tools Meridian uses most:
`search_engine` and `scrape_as_markdown`.

Docs: docs/MCP Server/  |  Tools reference: docs/MCP Server/tools.md
"""
from typing import Any
from src.core.config import settings
from src.core.logger import logger

# Tool groups Meridian needs: advanced scraping (batch), social platforms,
# business data, and research feeds. See docs/MCP Server/tools.md.
TOOL_GROUPS = "advanced_scraping,social,business,research"


class BrightDataMCPClient:
    """
    Client for the Bright Data MCP Server.

    Caches the loaded tool objects and a name→tool index so convenience methods
    can invoke a specific MCP tool without rebuilding the connection each call.
    """

    def __init__(self) -> None:
        self._mcp_url = settings.brightdata_mcp_url_with_token
        self._tools: list[Any] | None = None
        self._tool_index: dict[str, Any] = {}

    def is_configured(self) -> bool:
        """Returns True when a Bright Data API key is available."""
        return bool(settings.brightdata_api_key)

    async def get_tools(self) -> list[Any]:
        """
        Loads (and caches) the list of available MCP tools from Bright Data via
        langchain-mcp-adapters, for binding to a LangGraph ReAct agent.

        Returns:
            List of LangChain tool objects (empty list when unavailable).
        """
        if self._tools is not None:
            return self._tools

        if not self.is_configured():
            logger.warning("Bright Data API key not configured, MCP tools unavailable")
            self._tools = []
            return self._tools

        try:
            from langchain_mcp_adapters.client import MultiServerMCPClient

            client = MultiServerMCPClient({
                "bright_data": {
                    "url": self._mcp_url,
                    "transport": "sse",
                }
            })

            tools = await client.get_tools()
            self._tools = tools
            self._tool_index = {getattr(t, "name", ""): t for t in tools}
            logger.info("MCP tools loaded", count=len(tools))
            return tools

        except ImportError:
            logger.warning("langchain-mcp-adapters not installed, MCP tools unavailable")
            self._tools = []
            return self._tools
        except Exception as e:
            logger.error("Failed to load MCP tools", error=str(e))
            self._tools = []
            return self._tools


    async def _invoke_tool(self, tool_name: str, args: dict[str, Any]) -> Any:
        """
        Invokes a single named MCP tool with the given arguments.

        Args:
            tool_name: The MCP tool name (e.g. "search_engine").
            args: Keyword arguments for the tool.

        Returns:
            The tool's raw result, or None when the tool is unavailable/fails.
        """
        if not self._tool_index:
            await self.get_tools()

        tool = self._tool_index.get(tool_name)
        if tool is None:
            logger.warning("MCP tool not available", tool=tool_name)
            return None

        try:
            # LangChain tools expose an async ainvoke accepting a single dict.
            return await tool.ainvoke(args)
        except Exception as e:
            logger.error("MCP tool invocation failed", tool=tool_name, error=str(e))
            return None

    async def search_engine(
        self,
        query: str,
        engine: str = "google",
    ) -> str:
        """
        Runs the MCP `search_engine` tool (Google/Bing/Yandex).

        Args:
            query: The search query.
            engine: Search engine — "google", "bing", or "yandex".

        Returns:
            Raw SERP result text (JSON for Google, Markdown for Bing/Yandex),
            or an empty string when unavailable.
        """
        logger.info("MCP search_engine", query=query, engine=engine)
        result = await self._invoke_tool(
            "search_engine",
            {"query": query, "engine": engine},
        )
        return str(result) if result is not None else ""

    async def scrape_as_markdown(self, url: str) -> str:
        """
        Runs the MCP `scrape_as_markdown` tool to extract a page as Markdown,
        bypassing bot protection and CAPTCHA via Bright Data's unlocker.

        Args:
            url: The URL to scrape.

        Returns:
            Page content as Markdown, or an empty string when unavailable.
        """
        logger.info("MCP scrape_as_markdown", url=url)
        result = await self._invoke_tool("scrape_as_markdown", {"url": url})
        return str(result) if result is not None else ""


mcp_client = BrightDataMCPClient()
