import os
import sys
import asyncio
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent.resolve())
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Depends, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from typing import List, Dict, Any, Optional
import logging
from dotenv import load_dotenv
import aiofiles
import uuid
import json
import traceback
from io import BytesIO
import base64
from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

try:
    from src.models.journey import JourneyFormData, Job, JourneyMap
    from src.services.job_manager import JobManager
    from src.routes.auth_routes import router as auth_router
    from src.middleware.auth_middleware import require_auth
    from src.models.auth import UserProfile
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

# Load environment variables
load_dotenv()

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

# Initialize job manager as None, will be initialized in startup event
job_manager = None

# Add startup and shutdown event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize services and connections when the application starts."""
    global job_manager
    try:
        logger.info("Starting up application...")
        # Initialize job manager
        job_manager = JobManager()
        logger.info("Job manager initialized successfully")
        
        # Add any other initialization code here
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources when the application shuts down."""
    global job_manager
    try:
        logger.info("Shutting down application...")
        
        # Clean up job manager resources
        if job_manager:
            if hasattr(job_manager, 'close'):
                if asyncio.iscoroutinefunction(job_manager.close):
                    await job_manager.close()
                else:
                    job_manager.close()
            logger.info("Job manager shut down successfully")
        
        # Add any other cleanup code here
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        # job_connections: job_id -> list of websockets
        self.job_connections: Dict[str, List[WebSocket]] = {}
        # store the mapping job_id -> websocket -> callback, so we can unregister exact callback
        self._callback_refs: Dict[str, Dict[WebSocket, Callable]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()

        # Store connection
        if job_id not in self.job_connections:
            self.job_connections[job_id] = []
            self._callback_refs[job_id] = {}

        self.job_connections[job_id].append(websocket)

        # Create a callback bound to this websocket
        # The job_manager expects a callback that accepts a single argument: update_msg
        async def ws_callback(update_msg):
            # Forward only the progress part to this websocket
            try:
                await websocket.send_text(json.dumps(update_msg))
            except Exception as e:
                logger.debug(f"Failed to send websocket progress for job {job_id}: {e}")
                # On failure we can remove this websocket/callback
                # Note: removal handled in disconnect or by JobManager's error handling
                pass

        # Register the callback with the job manager
        job_manager.register_progress_callback(job_id, ws_callback)
        # Keep a reference so we can unregister later
        self._callback_refs[job_id][websocket] = ws_callback

        logger.info(f"WebSocket accepted and callback registered for job {job_id}")

    def disconnect(self, job_id: str, websocket: Optional[WebSocket] = None):
        # If websocket is provided, remove only that one; otherwise remove all
        if job_id not in self.job_connections:
            return

        if websocket:
            try:
                if websocket in self.job_connections[job_id]:
                    self.job_connections[job_id].remove(websocket)
                # Unregister associated callback
                cb = self._callback_refs.get(job_id, {}).pop(websocket, None)
                if cb:
                    job_manager.unregister_progress_callback(job_id, cb)
            except Exception as e:
                logger.debug(f"Error disconnecting websocket for job {job_id}: {e}")
        else:
            # Remove all connections and callbacks for this job
            for ws in list(self.job_connections.get(job_id, [])):
                cb = self._callback_refs.get(job_id, {}).pop(ws, None)
                if cb:
                    job_manager.unregister_progress_callback(job_id, cb)
            self.job_connections.pop(job_id, None)
            self._callback_refs.pop(job_id, None)

        # If no websockets left, clean up
        if job_id in self.job_connections and not self.job_connections[job_id]:
            self.job_connections.pop(job_id, None)
            self._callback_refs.pop(job_id, None)
            logger.debug(f"No active websockets left for job {job_id}, cleaned up.")

    async def send_progress_update(self, job_id: str, progress_data: Dict[str, Any]):
        """Backwards-compatible: send to all websockets for a job"""
        if job_id in self.job_connections:
            for websocket in list(self.job_connections[job_id]):
                try:
                    await websocket.send_text(json.dumps(progress_data))
                except Exception as e:
                    logger.debug(f"WebSocket send failed; removing socket for job {job_id}: {e}")
                    # Clean up this socket
                    self.disconnect(job_id, websocket)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Journi CrewAI Backend is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    from datetime import datetime
    
    try:
        # Basic