#!/usr/bin/env python3
"""
Development server runner for Journi CrewAI Backend
"""

import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8001))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print(f"Starting Journi CrewAI Backend on {host}:{port}")
    print(f"Reload mode: {reload}")
    print(f"Frontend URL: {os.getenv('FRONTEND_URL', 'http://localhost:5173')}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )