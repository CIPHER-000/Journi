import os
import sys
import asyncio
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent.resolve())
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI, HTTPException, status, UploadFile, File, Depends, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from typing import List, Dict, Any, Optional, Callable
import logging
from dotenv import load_dotenv
import aiofiles
import uuid
import json
import traceback
from io import BytesIO
import base64
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

try:
    from src.models.journey import JourneyFormData, Job, JourneyMap, JobStatus
    from src.services.job_manager import JobManager
    from src.services.usage_service import UsageService
    from src.routes.auth_routes import router as auth_router
    from src.routes.analytics_routes import router as analytics_router
    from src.routes.payments import router as payments_router
    from src.routes.optimized_payments import router as optimized_payments_router
    from src.routes import journey_routes
    from src.routes import export_routes
    from src.middleware.auth_middleware import require_auth
    from src.models.auth import UserProfile, UserJourney, UsageLimitResponse

    # Initialize services
    usage_service = UsageService()
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

# Load environment variables
load_dotenv()

# Helper function for JSON serialization with datetime support
def safe_json(data):
    """Convert data to JSON-safe format, handling datetime objects"""
    return json.dumps(data, default=str)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Journi CrewAI Backend",
    description="AI-powered customer journey mapping using CrewAI with authentication and usage tracking",
    version="1.0.0"
)

# Configure CORS
# Define allowed origins for production
PROD_ALLOWED_ORIGINS = [
    "https://getjourni.netlify.app",
    "https://journi-ai-journey-mapper.netlify.app",
    "https://journi-frontend.netlify.app",
    "http://localhost:5173",
    "https://localhost:5173",
    "http://localhost:3000",
    "https://localhost:3000"
]

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

if ENVIRONMENT == "development":
    # In dev, allow all origins for convenience
    ALLOWED_ORIGINS = ["*"]
else:
    # In production, restrict to explicit domains
    ALLOWED_ORIGINS = PROD_ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include auth routes
app.include_router(auth_router)
# Include analytics routes
app.include_router(analytics_router)
# Include payments routes (legacy - v1)
app.include_router(payments_router)
# Include optimized payments routes (v2 - recommended)
app.include_router(optimized_payments_router)
# Include journey routes
app.include_router(journey_routes.router)
# Include export routes
app.include_router(export_routes.router)

# Initialize job manager as None, will be initialized in startup event
job_manager = None

# Add startup and shutdown event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize services and connections when the application starts."""
    global job_manager
    try:
        logger.info("Starting up application...")
        
        # Skipping Postgres pool initialization — using Supabase as primary data source
        logger.info("Using Supabase REST API for all database operations")
        
        # Initialize job manager
        job_manager = JobManager()
        logger.info("Job manager initialized successfully")

        # Recover any in-progress journeys from database
        logger.info("Checking for in-progress journeys to recover...")
        recovered_count = await job_manager.recover_in_progress_journeys()
        if recovered_count > 0:
            logger.info(f"Recovered {recovered_count} in-progress journeys from database")
        else:
            logger.info("No in-progress journeys found to recover")

        # Set dependencies for journey and export routes
        journey_routes.set_dependencies(job_manager, usage_service)
        export_routes.set_dependencies(job_manager)
        
        logger.info("Application startup complete - All services using Supabase")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources when the application shuts down."""
    global job_manager
    try:
        logger.info("Shutting down application...")
        
        # No database pool to close - using Supabase REST API
        logger.info("Supabase client connections will be cleaned up automatically")
        
        # Clean up job manager resources
        if job_manager:
            if hasattr(job_manager, 'close'):
                if asyncio.iscoroutinefunction(job_manager.close):
                    await job_manager.close()
                else:
                    job_manager.close()
            logger.info("Job manager shut down successfully")
        
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

# Note: WebSocket support has been removed in favor of HTTP polling
# This provides better reliability, especially on free-tier hosting platforms

@app.get("/")
async def root():
    return {"message": "Journi CrewAI Backend is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    from datetime import datetime
    
    try:
        # Basic health check with timestamp
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "Journi CrewAI Backend",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.get("/healthz")
async def health_check_k8s():
    """Kubernetes-style health check endpoint"""
    return {"status": "ok"}

# File upload endpoint
@app.post("/api/files/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: UserProfile = Depends(require_auth)
):
    """Upload research files for journey mapping"""
    try:
        uploaded_files = []
        upload_dir = "/tmp/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = os.path.splitext(file.filename)[1]
            filename = f"{file_id}{file_extension}"
            file_path = os.path.join(upload_dir, filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            uploaded_files.append(file_path)
            logger.info(f"Uploaded file: {file.filename} -> {file_path}")
        
        return {"uploaded_files": uploaded_files}
        
    except Exception as e:
        logger.error(f"File upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# Journey-related endpoints have been moved to src/routes/journey_routes.py
# Export-related endpoints have been moved to src/routes/export_routes.py

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        ws_ping_interval=30,
        ws_ping_timeout=30
    )