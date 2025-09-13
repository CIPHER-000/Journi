# best_practices_doc_server.py
from mcp.server.fastmcp import FastMCP
from playwright.async_api import async_playwright
import asyncio
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastMCP("best_practices_docs")

@app.tool()
async def scrape_with_playwright(url: str, query: str = "") -> str:
    """
    Scrape a webpage using Playwright (handles JS rendering) with async API.
    - url: Full URL of the page
    - query: Optional keyword to filter content
    """
    browser = None
    try:
        logger.info(f"Starting to scrape URL: {url}")
        
        # Use async playwright
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']  # Needed for some environments
            )
            
            # Create new page with user agent to avoid bot detection
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            # Navigate to the URL with timeout
            await page.goto(url, timeout=30000, wait_until="domcontentloaded")  # 30s timeout
            
            # Wait for content to load
            await page.wait_for_load_state("networkidle", timeout=10000)
            
            # Get the text content
            content = await page.inner_text("body")
            
            # Close the browser
            await browser.close()
            
            logger.info(f"Successfully scraped {len(content)} characters from {url}")
            
    except asyncio.TimeoutError:
        logger.error(f"Timeout while scraping {url}")
        return f"❌ Timeout: The page took too long to load. URL: {url}"
    except Exception as e:
        logger.error(f"Error scraping {url}: {str(e)}")
        if browser:
            try:
                await browser.close()
            except:
                pass
        return f"❌ Scraping error: {str(e)}"

    # If query provided, filter lines that contain the query
    if query:
        logger.info(f"Filtering content for query: {query}")
        lines = []
        for line in content.splitlines():
            if query.lower() in line.lower():
                lines.append(line)
        
        if lines:
            # Return up to 50 matching lines for better context
            result = "\n".join(lines[:50])
            logger.info(f"Found {len(lines)} matching lines for query: {query}")
            return result
        else:
            return f"No content matching '{query}' found on the page."

    # Return first 5000 characters if no query (increased from 2000 for better context)
    return content[:5000]

# Add additional tool for searching documentation
@app.tool()
async def search_docs(topic: str, sources: list[str] = None) -> str:
    """
    Search multiple documentation sources for a specific topic.
    - topic: The topic to search for (e.g., "websocket", "fastapi websocket", "react hooks")
    - sources: Optional list of documentation sites to search (defaults to common docs)
    """
    if sources is None:
        # Default documentation sources
        sources = [
            "https://fastapi.tiangolo.com/advanced/websockets/",
            "https://websockets.readthedocs.io/en/stable/",
            "https://react.dev/reference/react/hooks",
            "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket"
        ]
    
    results = []
    for source in sources:
        try:
            logger.info(f"Searching {source} for topic: {topic}")
            content = await scrape_with_playwright(source, topic)
            if not content.startswith("❌"):
                results.append(f"\n=== From {source} ===\n{content[:1000]}")
        except Exception as e:
            logger.error(f"Error searching {source}: {e}")
            continue
    
    if results:
        return "\n".join(results)
    else:
        return f"No documentation found for topic: {topic}"

# Add tool to get specific code examples
@app.tool()
async def get_code_example(url: str, language: str = "python") -> str:
    """
    Extract code examples from documentation pages.
    - url: URL of the documentation page
    - language: Programming language to filter for (python, javascript, typescript)
    """
    browser = None
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto(url, timeout=30000)
            await page.wait_for_load_state("networkidle", timeout=10000)
            
            # Try to find code blocks
            code_blocks = []
            
            # Common selectors for code blocks in documentation
            selectors = [
                "pre code",
                ".highlight pre",
                ".language-" + language,
                ".hljs",
                "code[class*='language-']",
                ".code-block"
            ]
            
            for selector in selectors:
                elements = await page.query_selector_all(selector)
                for element in elements:
                    code = await element.inner_text()
                    if code and len(code) > 20:  # Filter out tiny snippets
                        code_blocks.append(code)
            
            await browser.close()
            
            if code_blocks:
                # Return the most relevant code examples
                return f"Found {len(code_blocks)} code examples:\n\n" + "\n\n---\n\n".join(code_blocks[:5])
            else:
                return f"No code examples found for {language} on this page."
                
    except Exception as e:
        if browser:
            try:
                await browser.close()
            except:
                pass
        return f"❌ Error extracting code examples: {str(e)}"

if __name__ == "__main__":
    # Run the MCP server
    import sys
    try:
        app.run()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)
