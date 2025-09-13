#!/usr/bin/env python
"""Test script for the MCP server with async Playwright."""

import asyncio
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_scraping():
    """Test the scraping functions."""
    from best_practices_doc_server import scrape_with_playwright, search_docs, get_code_example
    
    print("=" * 60)
    print("Testing MCP Server Async Playwright Implementation")
    print("=" * 60)
    
    # Test 1: Basic scraping with query
    print("\n1. Testing basic scraping with query 'WebSocket'...")
    result = await scrape_with_playwright(
        "https://fastapi.tiangolo.com/advanced/websockets/",
        "WebSocket"
    )
    if result.startswith("❌"):
        print(f"   FAILED: {result}")
    else:
        print(f"   SUCCESS: Found {len(result.splitlines())} lines")
        print(f"   Sample: {result[:200]}...")
    
    # Test 2: Scraping without query
    print("\n2. Testing scraping without query...")
    result = await scrape_with_playwright(
        "https://websockets.readthedocs.io/en/stable/intro/tutorial1.html"
    )
    if result.startswith("❌"):
        print(f"   FAILED: {result}")
    else:
        print(f"   SUCCESS: Scraped {len(result)} characters")
        print(f"   Sample: {result[:200]}...")
    
    # Test 3: Search docs for WebSocket topic
    print("\n3. Testing search_docs for 'websocket'...")
    result = await search_docs("websocket")
    if result.startswith("No documentation"):
        print(f"   FAILED: {result}")
    else:
        print(f"   SUCCESS: Found documentation")
        print(f"   Sample: {result[:300]}...")
    
    # Test 4: Get code examples
    print("\n4. Testing get_code_example...")
    result = await get_code_example(
        "https://fastapi.tiangolo.com/advanced/websockets/",
        "python"
    )
    if result.startswith("❌") or result.startswith("No code"):
        print(f"   FAILED: {result}")
    else:
        print(f"   SUCCESS: {result.splitlines()[0]}")
    
    print("\n" + "=" * 60)
    print("All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_scraping())
