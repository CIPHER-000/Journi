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
        # Basic health check - just verify the server is responding
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Backend is running"
        }
    except Exception as e:
        # If we can't even return a simple response, something is very wrong
        return {
            "status": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@app.post("/api/journey/create")
async def create_journey(
    industry: str = Form(...),
    businessGoals: str = Form(...),
    targetPersonas: List[str] = Form([]),
    journeyPhases: List[str] = Form([]),
    additionalContext: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    current_user: UserProfile = Depends(require_auth)
) -> Job:
    """Create a new journey mapping job using CrewAI, auto-generating the title from industry"""

    if not job_manager:
        logger.error("Job manager not initialized")
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")

    from src.services.usage_service import usage_service

    # Auto-generate title from industry
    journey_title = f"{industry} Customer Journey"

    # Check if user can create another journey
    limit_check = await usage_service.check_journey_limit(current_user)
    if not limit_check.allowed:
        logger.warning(f"User {current_user.id} reached journey limit: {limit_check}")
        raise HTTPException(
            status_code=402,  # Payment Required
            detail={
                "message": limit_check.message,
                "needs_upgrade": limit_check.needs_upgrade,
                "current_usage": limit_check.current_usage,
                "limit": limit_check.limit,
                "plan_type": limit_check.plan_type
            }
        )

    # Record journey creation in usage tracking
    try:
        await usage_service.record_journey_creation(
            current_user.id,
            journey_title,
            industry,
            {
                "industry": industry,
                "businessGoals": businessGoals,
                "targetPersonas": targetPersonas,
                "journeyPhases": journeyPhases,
                "additionalContext": additionalContext
            }
        )
        logger.info("Successfully recorded journey creation")
    except Exception as e:
        logger.error(f"Error recording journey creation: {str(e)}", exc_info=True)
        # Don't fail the request if just analytics recording failed

    # Prepare form data for job creation
    form_dict = {
        "title": journey_title,
        "industry": industry,
        "businessGoals": businessGoals,
        "targetPersonas": targetPersonas,
        "journeyPhases": journeyPhases,
        "additionalContext": additionalContext,
        "user_id": str(current_user.id)
    }

    # Handle uploaded files if any
    if files:
        upload_dir = f"uploads/{current_user.id}"
        os.makedirs(upload_dir, exist_ok=True)
        saved_files = []
        for file in files:
            file_extension = os.path.splitext(file.filename)[1].lower()
            file_id = str(uuid.uuid4())
            filename = f"{file_id}{file_extension}"
            file_path = os.path.join(upload_dir, filename)

            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            saved_files.append(file_path)
        form_dict["uploaded_files"] = saved_files

    try:
        job = await job_manager.create_job(form_dict, current_user)
        if not job:
            raise ValueError("Job manager returned None")
        logger.info(f"Successfully created job {job.id} with status {job.status}")
        return job
    except Exception as e:
        logger.error(f"Error in job creation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create job: {str(e)}"
        )

@app.get("/api/journey/status/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: UserProfile = Depends(require_auth)
) -> Job:
    """Get the current status of a journey mapping job"""
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    
    job = job_manager.get_job(job_id, current_user.id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    
    return job

@app.get("/api/journey/{journey_id}")
async def get_journey_map(
    journey_id: str,
    current_user: UserProfile = Depends(require_auth)
) -> JourneyMap:
    """Get a completed journey map"""
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    
    # In a real implementation, this would query a database
    # For now, we'll look through completed jobs
    for job in job_manager.jobs.values():
        if job.result and job.result.id == journey_id and job.user_id == current_user.id:
            return job.result
    
    raise HTTPException(status_code=404, detail="Journey map not found or access denied")

def generate_journey_pdf(journey, output_buffer):
    """Generate a PDF document for the journey map"""
    doc = SimpleDocTemplate(output_buffer, pagesize=letter, rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    title_style = ParagraphStyle(
        name='Title',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=12,
        textColor=colors.HexColor('#2c3e50')
    )
    
    elements.append(Paragraph(journey.title, title_style))
    elements.append(Spacer(1, 12))
    
    # Metadata
    meta_style = styles['Normal']
    elements.append(Paragraph(f"<b>Industry:</b> {journey.industry}", meta_style))
    elements.append(Paragraph(f"<b>Created:</b> {journey.createdAt.strftime('%Y-%m-%d %H:%M')}", meta_style))
    elements.append(Spacer(1, 24))
    
    # Personas Section
    elements.append(Paragraph("Customer Personas", styles['Heading2']))
    elements.append(Spacer(1, 12))
    
    for persona in journey.personas:
        elements.append(Paragraph(f"<b>{persona.name}</b> ({persona.age})", styles['Heading3']))
        elements.append(Paragraph(f"<b>Occupation:</b> {persona.occupation}", meta_style))
        elements.append(Paragraph(f"<b>Goals:</b> {', '.join(persona.goals)}", meta_style))
        elements.append(Paragraph(f"<b>Pain Points:</b> {', '.join(persona.painPoints)}", meta_style))
        elements.append(Paragraph(f"<i>\"{persona.quote}\"</i>", meta_style))
        elements.append(Spacer(1, 12))
    
    # Journey Phases Section
    elements.append(Paragraph("Journey Phases", styles['Heading2']))
    elements.append(Spacer(1, 12))
    
    for phase in journey.phases:
        # Phase Header
        elements.append(Paragraph(phase.name.upper(), styles['Heading3']))
        
        # Phase Details Table
        phase_data = [
            ["Actions", ", ".join(phase.actions)],
            ["Touchpoints", ", ".join(phase.touchpoints)],
            ["Emotions", phase.emotions],
            ["Pain Points", ", ".join(phase.painPoints)],
            ["Opportunities", ", ".join(phase.opportunities)],
            ["Customer Quote", f'"{phase.customerQuote}"']
        ]
        
        phase_table = Table(phase_data, colWidths=[doc.width/3.0, 2*doc.width/3.0])
        phase_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2c3e50')),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (0, -1), 12),
            ('LEFTPADDING', (0, 0), (0, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e9ecef')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(phase_table)
        elements.append(Spacer(1, 18))
    
    # Footer
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Generated by Journi - AI-Powered Customer Journey Mapping", 
                            styles['Italic']))
    
    # Build the PDF
    doc.build(elements)
    return output_buffer

@app.get("/api/journey/{journey_id}/export/{format}")
async def export_journey_map(
    journey_id: str, 
    format: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Export journey map in various formats"""
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    
    if format not in ["pdf", "png", "pptx"]:
        raise HTTPException(status_code=400, detail="Unsupported export format. Supported formats: pdf, png, pptx")
    
    try:
        # Get the journey data
        journey = None
        for job in job_manager.jobs.values():
            if job.result and job.result.id == journey_id and job.user_id == current_user.id:
                journey = job.result
                break
        
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found or access denied")
        
        if format == "pdf":
            # Generate PDF in memory
            buffer = BytesIO()
            generate_journey_pdf(journey, buffer)
            buffer.seek(0)
            
            # Return the PDF as a file download
            return Response(
                content=buffer.getvalue(),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=journey_{journey_id}.pdf"}
            )
            
        elif format == "png":
            # Example: Generate PNG using a library like matplotlib or pillow
            # png_data = generate_png(journey)
            # return Response(content=png_data, media_type="image/png",
            #                headers={"Content-Disposition": f"attachment; filename=journey_{journey_id}.png"})
            return {"message": "PNG export not yet implemented"}
            
        elif format == "pptx":
            # Example: Generate PowerPoint using python-pptx
            # pptx_data = generate_pptx(journey)
            # return Response(content=pptx_data, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            #                headers={"Content-Disposition": f"attachment; filename=journey_{journey_id}.pptx"})
            return {"message": "PowerPoint export not yet implemented"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting journey {journey_id} as {format}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to export journey: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error exporting journey map: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/files/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: UserProfile = Depends(require_auth)
) -> Dict[str, List[str]]:
    """Upload research files for processing"""
    
    uploaded_files = []
    upload_dir = f"uploads/{current_user.id}"  # User-specific upload directory
    
    # Create upload directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)
    
    try:
        for file in files:
            # Validate file type
            allowed_extensions = ['.pdf', '.docx', '.csv', '.txt']
            file_extension = os.path.splitext(file.filename)[1].lower()
            if file_extension not in allowed_extensions:
                logger.warning(f"Skipping unsupported file type: {file.filename}")
                continue
                
            # Generate unique filename
            file_id = str(uuid.uuid4())
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
        logger.error(f"Error uploading files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/progress/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time progress updates"""
    logger.info(f"WebSocket connection attempt for job {job_id}")

    # Get the Origin header from the WebSocket handshake
    origin = websocket.headers.get("origin")
    logger.debug(f"WebSocket Origin: {origin}")

    # Enforce origin check only in production
    if ENVIRONMENT != "development":
        if origin not in ALLOWED_ORIGINS:
            logger.warning(f"WebSocket connection rejected from origin: {origin}")
            await websocket.close(code=1008)  # Policy violation
            return

    try:
        await manager.connect(websocket, job_id)
        logger.info(f"WebSocket connected for job {job_id}")

        # Keep the connection alive by receiving messages
        while True:
            try:
                data = await websocket.receive_text()
                logger.debug(f"Received message from client for job {job_id}: {data}")

                # Handle ping/pong for connection keep-alive
                if data == "ping":
                    await websocket.send_text("pong")

            except WebSocketDisconnect as e:
                logger.info(f"WebSocket disconnected for job {job_id}: {e}")
                break

    except Exception as e:
        logger.error(f"Error in WebSocket connection for job {job_id}: {str(e)}")
        logger.debug(f"Error details: {traceback.format_exc()}")

    finally:
        logger.info(f"Cleaning up WebSocket resources for job {job_id}")
        manager.disconnect(job_id, websocket)
        logger.info(f"WebSocket disconnected for job {job_id}")

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
