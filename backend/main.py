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
                    await websocket.send_text(safe_json(progress_data))
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

# Journey creation endpoint
@app.post("/api/journey/create")
async def create_journey(
    request: Request,
    current_user: UserProfile = Depends(require_auth)
):
    """Create a new journey map using CrewAI agents"""
    global job_manager
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")
    
    try:
        # Parse form data
        form = await request.form()
        
        # Extract form fields
        form_data = {
            "title": form.get("title", ""),
            "industry": form.get("industry", ""),
            "businessGoals": form.get("businessGoals", ""),
            "targetPersonas": form.getlist("targetPersonas"),
            "journeyPhases": form.getlist("journeyPhases"),
            "additionalContext": form.get("additionalContext", ""),
            "files": []
        }
        
        # Handle uploaded files
        uploaded_files = []
        if "files" in form:
            files = form.getlist("files")
            upload_dir = "/tmp/uploads"
            os.makedirs(upload_dir, exist_ok=True)
            
            for file in files:
                if hasattr(file, 'filename') and file.filename:
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
        
        form_data["uploaded_files"] = uploaded_files
        
        logger.info(f"Creating journey for user {current_user.id} with data: {form_data}")
        
        # Create job
        job = await job_manager.create_job(form_data, current_user)
        
        return {
            "id": job.id,
            "status": job.status.value,
            "created_at": job.created_at.isoformat(),
            "message": "Journey creation started"
        }
        
    except Exception as e:
        logger.error(f"Journey creation error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Journey creation failed: {str(e)}")

# Journey status endpoint
@app.get("/api/journey/status/{job_id}")
async def get_journey_status(
    job_id: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Get the current status of a journey creation job"""
    global job_manager
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")
    
    try:
        job = job_manager.get_job(job_id, current_user.id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        response = {
            "id": job.id,
            "status": job.status.value,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat()
        }
        
        if job.progress:
            response["progress"] = job.progress.dict()
        
        if job.result:
            response["result"] = job.result.dict()
        
        if job.error_message:
            response["error"] = job.error_message
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

# Journey cancellation endpoint
@app.post("/api/journey/cancel/{job_id}")
async def cancel_journey(
    job_id: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Cancel a running journey creation job"""
    global job_manager
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")
    
    try:
        success = await job_manager.cancel_job(job_id, current_user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Job not found or cannot be cancelled")
        
        return {"status": "cancelled", "message": "Job cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job cancellation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Job cancellation failed: {str(e)}")

# Journey retrieval endpoint
@app.get("/api/journey/{journey_id}")
async def get_journey(
    journey_id: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Get a completed journey map"""
    global job_manager
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")
    
    try:
        job = job_manager.get_job(journey_id, current_user.id)
        if not job:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        if job.status != JobStatus.COMPLETED or not job.result:
            raise HTTPException(status_code=400, detail="Journey not completed yet")
        
        return job.result.dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Journey retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Journey retrieval failed: {str(e)}")

# Export endpoints
@app.get("/api/journey/{journey_id}/export/{format}")
async def export_journey(
    journey_id: str,
    format: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Export journey map in various formats"""
    global job_manager
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")
    
    try:
        job = job_manager.get_job(journey_id, current_user.id)
        if not job or job.status != JobStatus.COMPLETED or not job.result:
            raise HTTPException(status_code=404, detail="Completed journey not found")
        
        journey_map = job.result
        
        if format.lower() == "json":
            return journey_map.dict()
        elif format.lower() == "pdf":
            return await export_to_pdf(journey_map)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported export format: {format}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

async def export_to_pdf(journey_map: JourneyMap) -> Response:
    """Export journey map as PDF"""
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
        )
        story.append(Paragraph(journey_map.title, title_style))
        story.append(Spacer(1, 12))
        
        # Industry
        story.append(Paragraph(f"<b>Industry:</b> {journey_map.industry}", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Personas
        story.append(Paragraph("Customer Personas", styles['Heading2']))
        for persona in journey_map.personas:
            story.append(Paragraph(f"<b>{persona.name}</b> - {persona.occupation}", styles['Heading3']))
            story.append(Paragraph(f"<i>\"{persona.quote}\"</i>", styles['Normal']))
            story.append(Spacer(1, 6))
        
        story.append(Spacer(1, 12))
        
        # Journey Phases
        story.append(Paragraph("Journey Phases", styles['Heading2']))
        for phase in journey_map.phases:
            story.append(Paragraph(f"<b>{phase.name}</b>", styles['Heading3']))
            story.append(Paragraph(f"Actions: {', '.join(phase.actions)}", styles['Normal']))
            story.append(Paragraph(f"Touchpoints: {', '.join(phase.touchpoints)}", styles['Normal']))
            story.append(Paragraph(f"<i>\"{phase.customerQuote}\"</i>", styles['Normal']))
            story.append(Spacer(1, 12))
        
        doc.build(story)
        buffer.seek(0)
        
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={journey_map.title.replace(' ', '_')}.pdf"}
        )
        
    except Exception as e:
        logger.error(f"PDF export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")

# WebSocket endpoint for real-time progress updates
@app.websocket("/ws/progress/{job_id}")
async def websocket_progress(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time job progress updates"""
    global job_manager
    
    if not job_manager:
        await websocket.close(code=1011, reason="Job manager not initialized")
        return
    
    try:
        await manager.connect(websocket, job_id)
        logger.info(f"WebSocket connected for job {job_id}")
        
        # Send initial status if job exists
        job = job_manager.get_job(job_id)
        if job:
            initial_status = {
                "job_id": job_id,
                "status": job.status.value,
                "progress": job.progress.dict() if job.progress else None,
                "result": job.result.dict() if job.result else None,
                "timestamp": datetime.utcnow().isoformat()
            }
            await websocket.send_text(safe_json(initial_status))
        
        # Keep connection alive and handle ping/pong
        while True:
            try:
                message = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                if message == "ping":
                    await websocket.send_text("pong")
                    logger.debug(f"Sent pong to job {job_id}")
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await websocket.send_text("ping")
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for job {job_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {str(e)}")
    finally:
        manager.disconnect(job_id, websocket)
        logger.info(f"WebSocket cleanup completed for job {job_id}")

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