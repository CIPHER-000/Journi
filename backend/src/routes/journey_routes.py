"""
Journey Routes Module
Handles all journey-related API endpoints for creation, status, and management
"""

import os
import logging
import traceback
import uuid
import aiofiles
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Any

from src.models.journey import JobStatus
from src.models.auth import UserProfile
from src.middleware.auth_middleware import require_auth

# Initialize router
router = APIRouter(prefix="/api/journey", tags=["journeys"])
logger = logging.getLogger(__name__)

# Global job_manager reference (will be set from main.py)
job_manager = None
usage_service = None

def set_dependencies(jm, us):
    """Set job manager and usage service dependencies"""
    global job_manager, usage_service
    job_manager = jm
    usage_service = us


@router.post("/create")
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Journey creation error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Journey creation failed: {str(e)}")


@router.get("/status/{job_id}")
async def get_journey_status(
    job_id: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Get the current status of a journey creation job"""
    global job_manager

    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")

    try:
        job = await job_manager.get_job_async(job_id, current_user.id)
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

        # Include progress history for detailed progress tracking
        if hasattr(job, 'progress_history') and job.progress_history:
            response["progress_history"] = job.progress_history[-10:]  # Return last 10 progress updates

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


@router.post("/cancel/{job_id}")
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


@router.get("/{journey_id}")
async def get_journey(
    journey_id: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Get a completed journey map"""
    global job_manager

    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")

    try:
        job = await job_manager.get_job_async(journey_id, current_user.id)
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


@router.get("/{journey_id}/info")
async def get_journey_info(
    journey_id: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Get journey information regardless of status (running or completed)"""
    global job_manager, usage_service
    from src.models.journey import JourneyFormData, Job
    from datetime import datetime

    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")

    try:
        # First try to get from job manager (handles both memory and database lookup)
        job = await job_manager.get_job_async(journey_id, current_user.id)
        if not job:
            # Fallback: try to find journey in database directly by job_id or id
            try:
                user_journeys = await usage_service.get_user_journeys_by_job_id(journey_id)
                if not user_journeys:
                    # Also try by journey ID (for backwards compatibility)
                    user_journeys_list = await usage_service.get_user_journeys(current_user.id, limit=100)
                    user_journeys = [j for j in user_journeys_list if j.id == journey_id]

                if user_journeys and user_journeys[0].user_id == current_user.id:
                    # Found journey in database, load it
                    loaded_job = await job_manager.load_job_state(journey_id)
                    if loaded_job:
                        job = loaded_job
                    else:
                        # Create minimal job from database record
                        db_journey = user_journeys[0]
                        job = Job(
                            id=db_journey.job_id or db_journey.id,
                            status=JobStatus(db_journey.status),
                            user_id=db_journey.user_id,
                            created_at=db_journey.created_at,
                            form_data=db_journey.form_data or JourneyFormData(
                                industry="",
                                businessGoals="",
                                targetPersonas=[],
                                journeyPhases=[]
                            )
                        )
                        if db_journey.result_data:
                            try:
                                job.result = job_manager._convert_to_journey_map(db_journey.result_data)
                            except Exception as e:
                                logger.warning(f"Failed to convert result data for journey {journey_id}: {e}")
                        if db_journey.error_message:
                            job.error_message = db_journey.error_message

                if not job:
                    raise HTTPException(status_code=404, detail="Journey not found")
            except Exception as db_error:
                logger.error(f"Database lookup failed for journey {journey_id}: {db_error}")
                logger.error(f"Database lookup traceback: {traceback.format_exc()}")
                # Don't raise 404 immediately - try to return a basic response
                try:
                    # Try to get any basic info we can
                    return {
                        "id": journey_id,
                        "title": f"Journey {journey_id}",
                        "status": "unknown",
                        "job_id": journey_id,
                        "industry": "Unknown",
                        "created_at": datetime.now().isoformat(),
                        "updated_at": datetime.now().isoformat(),
                        "error": "Journey data temporarily unavailable"
                    }
                except Exception:
                    # If even that fails, then return 404
                    raise HTTPException(status_code=404, detail="Journey not found")

        # Return basic journey info that works for both running and completed journeys
        response = {
            "id": job.id,
            "title": getattr(job.form_data, 'title', None) or getattr(job, 'title', f"Journey {job.id}"),
            "status": job.status.value,
            "job_id": job.id,  # For compatibility with frontend
            "industry": getattr(job.form_data, 'industry', None) or getattr(job, 'industry', None),
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat()
        }

        # Include progress information if available
        if job.progress:
            response["progress"] = {
                "current_step": job.progress.current_step,
                "total_steps": job.progress.total_steps,
                "step_name": job.progress.step_name,
                "message": job.progress.message,
                "percentage": job.progress.percentage
            }
            if hasattr(job.progress, 'estimatedTimeRemaining'):
                response["progress"]["estimatedTimeRemaining"] = job.progress.estimatedTimeRemaining

        # Include result only if completed
        if job.status.value == "completed" and job.result:
            response["result"] = {
                "id": job.result.id,
                "title": job.result.title
            }

        # Include error message if failed
        if job.status.value == "failed" and job.error_message:
            response["error"] = job.error_message
            response["error_message"] = job.error_message

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Journey info retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Journey info retrieval failed: {str(e)}")


@router.get("/poll/{job_id}")
async def poll_journey_status(
    job_id: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Optimized polling endpoint for real-time job progress updates.
    
    This endpoint is designed for efficient polling with minimal overhead.
    Returns condensed progress information suitable for frequent polling.
    """
    global job_manager
    from fastapi.responses import JSONResponse
    from datetime import datetime
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")
    
    try:
        job = await job_manager.get_job_async(job_id, current_user.id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Build optimized response for polling
        response = {
            "job_id": job_id,
            "status": job.status.value,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Include progress information if available
        if job.progress:
            response["progress"] = {
                "current_step": job.progress.current_step,
                "total_steps": job.progress.total_steps,
                "step_name": job.progress.step_name,
                "message": job.progress.message,
                "percentage": job.progress.percentage
            }
            if hasattr(job.progress, 'estimatedTimeRemaining'):
                response["progress"]["estimatedTimeRemaining"] = job.progress.estimatedTimeRemaining

        # Include progress history for detailed progress tracking
        if hasattr(job, 'progress_history') and job.progress_history:
            response["progress_history"] = job.progress_history[-10:]  # Return last 10 progress updates
        
        # Include result only if completed
        if job.status.value == "completed" and job.result:
            response["result"] = {
                "id": job.result.id,
                "title": job.result.title
            }
        
        # Include error message if failed
        if job.status.value == "failed" and job.error_message:
            response["error"] = job.error_message
            response["error_message"] = job.error_message
        
        # Add cache control headers to prevent stale data
        headers = {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
        
        return JSONResponse(content=response, headers=headers)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Polling error for job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Polling failed: {str(e)}")
