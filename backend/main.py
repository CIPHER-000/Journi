import os
import sys
import asyncio
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent.resolve())
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, WebSocketException, status, UploadFile, File, Depends, Request, Form
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
    from src.routes.auth_routes import router as auth_router
    from src.middleware.auth_middleware import require_auth
    from src.models.auth import UserProfile
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

# WebSocket connection manager with modern patterns
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self._locks: Dict[str, asyncio.Lock] = {}
        self._callback_refs: Dict[str, Dict[WebSocket, Callable]] = {}

    def _get_lock(self, job_id: str) -> asyncio.Lock:
        """Get or create a lock for thread-safe operations on a job"""
        if job_id not in self._locks:
            self._locks[job_id] = asyncio.Lock()
        return self._locks[job_id]

    async def connect(self, websocket: WebSocket, job_id: str) -> None:
        """Connect a WebSocket for a specific job with proper async handling"""
        async with self._get_lock(job_id):
            # Initialize structures if needed
            if job_id not in self.active_connections:
                self.active_connections[job_id] = []
                self._callback_refs[job_id] = {}

            # Add the WebSocket connection
            self.active_connections[job_id].append(websocket)

            # Create async callback for job updates
            async def ws_callback(update_msg: Dict[str, Any]) -> None:
                try:
                    # Ensure the WebSocket is still in our active list before sending
                    if websocket in self.active_connections.get(job_id, []):
                        await websocket.send_text(json.dumps(update_msg))
                except WebSocketDisconnect:
                    # Connection closed normally, remove it
                    await self.disconnect(job_id, websocket)
                except Exception as e:
                    logger.warning(f"Failed to send WebSocket message for job {job_id}: {e}")
                    await self.disconnect(job_id, websocket)

            # Register callback with job manager if available
            if job_manager:
                job_manager.register_progress_callback(job_id, ws_callback)
                self._callback_refs[job_id][websocket] = ws_callback

            logger.info(f"WebSocket connected for job {job_id}")

    async def disconnect(self, job_id: str, websocket: Optional[WebSocket] = None) -> None:
        """Disconnect WebSocket(s) for a job with proper cleanup"""
        async with self._get_lock(job_id):
            if job_id not in self.active_connections:
                return

            if websocket:
                # Remove specific WebSocket
                if websocket in self.active_connections[job_id]:
                    self.active_connections[job_id].remove(websocket)
                    
                    # Unregister callback if exists
                    if job_id in self._callback_refs:
                        callback = self._callback_refs[job_id].pop(websocket, None)
                        if callback and job_manager:
                            job_manager.unregister_progress_callback(job_id, callback)
            else:
                # Remove all WebSockets for this job
                if job_id in self._callback_refs:
                    for ws, callback in self._callback_refs[job_id].items():
                        if callback and job_manager:
                            job_manager.unregister_progress_callback(job_id, callback)
                    del self._callback_refs[job_id]
                
                if job_id in self.active_connections:
                    del self.active_connections[job_id]

            # Cleanup empty structures
            if job_id in self.active_connections and not self.active_connections[job_id]:
                del self.active_connections[job_id]
            if job_id in self._callback_refs and not self._callback_refs[job_id]:
                del self._callback_refs[job_id]
            if job_id in self._locks and job_id not in self.active_connections:
                del self._locks[job_id]

            logger.debug(f"WebSocket disconnected for job {job_id}")

    async def send_progress_update(self, job_id: str, progress_data: Dict[str, Any]) -> None:
        """Send progress update to all connected WebSockets for a job"""
        if job_id not in self.active_connections:
            return
            
        disconnected = []
        for websocket in self.active_connections[job_id]:
            try:
                await websocket.send_text(safe_json(progress_data))
            except WebSocketDisconnect:
                disconnected.append(websocket)
            except Exception as e:
                logger.warning(f"Failed to send update to WebSocket: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected sockets
        for ws in disconnected:
            await self.disconnect(job_id, ws)
    
    async def send_personal_message(self, message: str, websocket: WebSocket) -> None:
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(message)
        except WebSocketDisconnect:
            logger.debug("WebSocket disconnected while sending personal message")
        except Exception as e:
            logger.warning(f"Failed to send personal message: {e}")
    
    async def broadcast(self, job_id: str, message: str) -> None:
        """Broadcast a message to all connections for a specific job"""
        if job_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_text(message)
                except WebSocketDisconnect:
                    disconnected.append(connection)
                except Exception:
                    disconnected.append(connection)
            
            # Clean up disconnected sockets
            for ws in disconnected:
                await self.disconnect(job_id, ws)

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
            response["error_message"] = job.error_message
        
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

# WebSocket endpoint with modern error handling and connection management
@app.websocket("/ws/progress/{job_id}")
async def websocket_progress(websocket: WebSocket, job_id: str, token: str = None):
    """WebSocket endpoint for real-time job progress updates with improved error handling"""
    global job_manager
    
    # Track connection state
    connection_active = False
    ping_task = None
    
    try:
        # Accept WebSocket connection FIRST, before any validation
        await websocket.accept()
        connection_active = True
        logger.info(f"WebSocket connection accepted for job {job_id}")
        
        # Now check if job manager is available
        if not job_manager:
            logger.error("Job manager not initialized, closing WebSocket")
            await websocket.send_text(json.dumps({
                "type": "error",
                "error": "Service temporarily unavailable",
                "code": 503
            }))
            await websocket.close(code=1011, reason="Service temporarily unavailable")
            return
        
        # Connect to manager
        await manager.connect(websocket, job_id)
        
        # Send initial job status if available
        try:
            job = job_manager.get_job(job_id)
            if job:
                initial_status = {
                    "type": "status",
                    "job_id": job_id,
                    "status": job.status.value,
                    "progress": job.progress.dict() if job.progress else None,
                    "result": job.result.dict() if job.result else None,
                    "error": job.error_message if hasattr(job, 'error_message') else None,
                    "timestamp": datetime.utcnow().isoformat()
                }
                await websocket.send_text(safe_json(initial_status))
        except Exception as e:
            logger.warning(f"Could not send initial status for job {job_id}: {e}")
        
        # Create ping task for keepalive
        async def send_pings():
            while connection_active:
                try:
                    await asyncio.sleep(25)  # Send ping every 25 seconds
                    if connection_active:
                        await websocket.send_text(json.dumps({"type": "ping"}))
                except Exception:
                    break
        
        ping_task = asyncio.create_task(send_pings())
        
        # Handle incoming messages
        while connection_active:
            try:
                # Wait for client messages with timeout
                message = await asyncio.wait_for(
                    websocket.receive_text(), 
                    timeout=60.0  # 60 second timeout for client activity
                )
                
                # Parse and handle message
                try:
                    data = json.loads(message) if message else {}
                    msg_type = data.get("type", "")
                    
                    if msg_type == "ping":
                        await websocket.send_text(json.dumps({"type": "pong"}))
                    elif msg_type == "pong":
                        # Client responded to our ping
                        pass
                    else:
                        # Handle other message types if needed
                        logger.debug(f"Received message type: {msg_type} for job {job_id}")
                        
                except json.JSONDecodeError:
                    # Handle plain text messages for backward compatibility
                    if message == "ping":
                        await websocket.send_text("pong")
                    
            except asyncio.TimeoutError:
                # No activity from client, but connection might still be alive
                logger.debug(f"No client activity for job {job_id}, connection still open")
                continue
                
            except WebSocketDisconnect as e:
                logger.info(f"WebSocket disconnected for job {job_id}: code={e.code} reason={e.reason}")
                break
                
            except Exception as e:
                logger.error(f"Unexpected WebSocket error for job {job_id}: {e}")
                break
    
    except Exception as e:
        logger.error(f"WebSocket setup error for job {job_id}: {e}")
    
    finally:
        connection_active = False
        
        # Cancel ping task
        if ping_task and not ping_task.done():
            ping_task.cancel()
            try:
                await ping_task
            except asyncio.CancelledError:
                pass
        
        # Disconnect from manager
        await manager.disconnect(job_id, websocket)
        
        # Close WebSocket if still open
        try:
            await websocket.close(code=1000, reason="Normal closure")
        except Exception:
            pass
        
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