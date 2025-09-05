import asyncio
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Callable, Optional, Any, List
import json
import openai
import traceback
from litellm import RateLimitError, AuthenticationError
from ..models.journey import Job, JobStatus, JobProgress, JourneyFormData, JourneyMap, Persona, JourneyPhase
from ..models.auth import UserProfile
from ..agents.crew_coordinator import CrewCoordinator
from ..services.usage_service import usage_service
import logging

logger = logging.getLogger(__name__)

# Import safe_json from main module
def safe_json(data):
    """Convert data to JSON-safe format, handling datetime objects"""
    return json.dumps(data, default=str)

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, Job] = {}
        self.progress_callbacks: Dict[str, List[Callable]] = {}
        self._cleanup_tasks: Dict[str, asyncio.Task] = {}
        self._workflow_tasks: Dict[str, asyncio.Task] = {}
    
    def safe_json(self, data):
        """Convert data to JSON-safe format, handling datetime objects"""
        import json
        return json.dumps(data, default=str)
        
    async def create_job(self, form_data: Dict[str, Any], user: UserProfile) -> Job:
        try:
            logger.info(f"Creating journey map for user {user.id}, industry: {form_data.get('industry')}")
            journey_form_data = JourneyFormData(**form_data)

            # Generate job_id FIRST
            job_id = str(uuid.uuid4())

            # Save job in memory
            job = Job(
                id=job_id,
                status=JobStatus.QUEUED,
                user_id=user.id,
                form_data=journey_form_data
            )
            self.jobs[job_id] = job

            # Record it in Supabase - let Supabase auto-generate the ID
            try:
                await usage_service.record_journey_creation(
                    user_id=user.id,
                    title=form_data.get('title', 'Untitled Journey'),
                    industry=form_data.get('industry', ''),
                    form_data=form_data
                )
            except Exception as db_err:
                logger.error(f"Failed to record journey in DB: {db_err}")

            # Start workflow
            asyncio.create_task(self._run_agent_workflow(job_id, user))
            return job
        except Exception as e:
            logger.error(f"Error creating journey: {str(e)}")
            raise e

    
    def get_job(self, job_id: str, user_id: Optional[str] = None) -> Optional[Job]:
        job = self.jobs.get(job_id)
        if job and user_id and job.user_id != user_id:
            return None
        return job
    
    async def cancel_job(self, job_id: str, user_id: Optional[str] = None) -> bool:
        """Cancel a running job"""
        job = self.jobs.get(job_id)
        if not job:
            logger.warning(f"Cancel requested for non-existent job: {job_id}")
            return False
            
        # Check user permission
        if user_id and job.user_id != user_id:
            logger.warning(f"User {user_id} attempted to cancel job {job_id} owned by {job.user_id}")
            return False
            
        # Only cancel if job is still running
        if job.status not in [JobStatus.QUEUED, JobStatus.PROCESSING]:
            logger.info(f"Job {job_id} already completed/failed, cannot cancel")
            return False
            
        try:
            # Cancel the workflow task if it exists
            if job_id in self._workflow_tasks:
                workflow_task = self._workflow_tasks[job_id]
                if not workflow_task.done():
                    workflow_task.cancel()
                    logger.info(f"Cancelled workflow task for job {job_id}")
                self._workflow_tasks.pop(job_id, None)
            
            # Update job status
            job.status = JobStatus.CANCELLED
            job.updated_at = datetime.now()
            job.error_message = "Job cancelled by user"
            
            # Update database
            try:
                await usage_service.update_journey_status(
                    journey_id=job_id,
                    status="cancelled",
                    progress_data={"cancelled_at": datetime.now().isoformat()}
                )
            except Exception as db_error:
                logger.error(f"Failed to update cancelled job in database: {db_error}")
            
            # Send final progress update
            await self._update_progress(job_id, -1, "Cancelled", "Job cancelled by user")
            
            logger.info(f"Successfully cancelled job {job_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error cancelling job {job_id}: {str(e)}")
            return False
    
    def register_progress_callback(self, job_id: str, callback: Callable) -> bool:
        if job_id not in self.jobs:
            logger.warning(f"Cannot register callback: Job {job_id} not found")
            return False
            
        if job_id not in self.progress_callbacks:
            self.progress_callbacks[job_id] = []
            
        if callback not in self.progress_callbacks[job_id]:
            self.progress_callbacks[job_id].append(callback)
            logger.debug(f"Registered callback for job {job_id}")
        
        if job_id in self._cleanup_tasks and not self._cleanup_tasks[job_id].done():
            self._cleanup_tasks[job_id].cancel()
            
        return True
    
    def unregister_progress_callback(self, job_id: str, callback: Callable = None):
        if job_id not in self.progress_callbacks:
            return
        if callback is None:
            del self.progress_callbacks[job_id]
        else:
            if callback in self.progress_callbacks[job_id]:
                self.progress_callbacks[job_id].remove(callback)
            if not self.progress_callbacks[job_id]:
                del self.progress_callbacks[job_id]
    
    async def _update_progress(self, job_id: str, step: int, step_name: str, message: str):
        """Update job progress and send WebSocket-safe updates."""
        logger.info(f"Updating progress for job {job_id}: Step {step} - {step_name}: {message}")
        
        if job_id not in self.jobs:
            logger.error(f"Job {job_id} not found")
            return
            
        job = self.jobs[job_id]
        percentage = min(100, max(0, (step / 8) * 100))
        progress = JobProgress(
            current_step=step,
            total_steps=8,
            step_name=step_name,
            message=message,
            percentage=percentage
        )
        job.progress = progress
        job.updated_at = datetime.now()
        
        update_msg = {
            "job_id": job_id,
            "progress": progress.dict(),
            "status": job.status.value,
            "timestamp": datetime.utcnow().isoformat(),
            "step_name": step_name,
            "message": message
        }
        
        # 🔹 Include result in final completion message
        if job.status == JobStatus.COMPLETED and job.result:
            try:
                update_msg["result"] = job.result.dict()
            except Exception as e:
                logger.error(f"Failed to serialize job result for job {job_id}: {e}")
        
        # 🔹 Include cancellation info
        if job.status == JobStatus.CANCELLED:
            update_msg["cancelled"] = True
            update_msg["message"] = "Job cancelled by user"
        
        # 🔹 Include error info for failed jobs
        if job.status == JobStatus.FAILED and job.error_message:
            update_msg["error"] = job.error_message
            update_msg["error_message"] = job.error_message
        
        # 🔹 WebSocket-safe callback handling - don't let this crash the workflow
        callbacks_sent = False
        if job_id in self.progress_callbacks:
            callbacks = self.progress_callbacks[job_id].copy()
            for cb in callbacks:
                try:
                    if asyncio.iscoroutinefunction(cb):
                        await cb(update_msg)
                    else:
                        result = cb(update_msg)
                        if asyncio.iscoroutine(result):
                            await result
                    callbacks_sent = True
                except Exception as e:
                    logger.warning(f"WebSocket callback failed for {job_id}: {e}")
                    if cb in self.progress_callbacks[job_id]:
                        self.progress_callbacks[job_id].remove(cb)
        
        if not callbacks_sent:
            logger.debug(f"No active WebSocket callbacks for job {job_id}")
        
        if job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
            if job_id in self._cleanup_tasks and not self._cleanup_tasks[job_id].done():
                self._cleanup_tasks[job_id].cancel()
            self._cleanup_tasks[job_id] = asyncio.create_task(
                self._cleanup_callbacks_after_delay(job_id)
            )

    
    async def _cleanup_callbacks_after_delay(self, job_id: str, delay_seconds: int = 300):
        try:
            await asyncio.sleep(delay_seconds)
            if job_id in self.jobs and self.jobs[job_id].status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                self.progress_callbacks.pop(job_id, None)
        except asyncio.CancelledError:
            pass
        finally:
            self._cleanup_tasks.pop(job_id, None)
    
    async def _run_agent_workflow(self, job_id: str, user: UserProfile):
        logger.info(f"Starting agent workflow for job {job_id}")
        job = self.jobs.get(job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        workflow_result = None
        final_status = JobStatus.FAILED
        error_message = None

        try:
            job.status = JobStatus.PROCESSING
            job.updated_at = datetime.now()
            await self._update_progress(job_id, 0, "Starting", "Initializing journey mapping process...")
            
            # Convert form data to dictionary for crew coordinator
            form_data_dict = job.form_data.dict()
            logger.info(f"Form data prepared for workflow: {form_data_dict}")
            
            crew_coordinator = CrewCoordinator(user)

            async def progress_callback(step: int, step_name: str, message: str):
                await self._update_progress(job_id, step, step_name, message)

            # Add timeout to prevent hanging
            workflow_task = asyncio.create_task(
                crew_coordinator.execute_workflow(form_data_dict, progress_callback, job_id)
            )
            
            # Store the task so it can be cancelled
            self._workflow_tasks[job_id] = workflow_task
            
            # Wait for completion with timeout (15 minutes max)
            workflow_result = await asyncio.wait_for(workflow_task, timeout=900)
            
            journey_map = self._convert_to_journey_map(workflow_result)
            job.result = journey_map
            job.status = JobStatus.COMPLETED
            job.updated_at = datetime.now()
            final_status = JobStatus.COMPLETED
            
            logger.info(f"Workflow completed successfully for job {job_id}")
            
        except RateLimitError as e:
            logger.error(f"OpenAI quota/rate limit exceeded for job {job_id}: {str(e)}")
            job.status = JobStatus.FAILED
            final_status = JobStatus.FAILED
            error_message = "Your OpenAI API quota has been exceeded. Please check your plan and billing details, or upgrade your OpenAI account."
            job.updated_at = datetime.now()
            
        except AuthenticationError as e:
            logger.error(f"OpenAI authentication failed for job {job_id}: {str(e)}")
            job.status = JobStatus.FAILED
            final_status = JobStatus.FAILED
            error_message = "OpenAI API key is invalid or expired. Please check your API key in settings."
            job.updated_at = datetime.now()
            
        except openai.APIError as e:
            logger.error(f"OpenAI API error for job {job_id}: {str(e)}")
            job.status = JobStatus.FAILED
            final_status = JobStatus.FAILED
            if "quota" in str(e).lower():
                error_message = "Your OpenAI API quota has been exceeded. Please check your plan and billing details."
            elif "rate limit" in str(e).lower():
                error_message = "OpenAI API rate limit exceeded. Please try again in a few minutes."
            else:
                error_message = f"OpenAI API error: {str(e)}"
            job.updated_at = datetime.now()
            
        except asyncio.CancelledError:
            logger.info(f"Workflow cancelled for job {job_id}")
            job.status = JobStatus.CANCELLED
            final_status = JobStatus.CANCELLED
            error_message = "Workflow cancelled by user"
            job.updated_at = datetime.now()
            logger.info(f"Job {job_id} was cancelled")
            
        except asyncio.TimeoutError:
            logger.error(f"Workflow timeout for job {job_id}")
            job.status = JobStatus.FAILED
            final_status = JobStatus.FAILED
            error_message = "Journey generation timed out after 15 minutes. This may be due to complex requirements or API delays. Please try again with simpler inputs."
            job.updated_at = datetime.now()
            logger.error(f"Job {job_id} timed out")
            
        except Exception as workflow_error:
            # Capture full traceback for debugging
            raw_trace = traceback.format_exc()
            logger.error(f"Workflow error for job {job_id}: {workflow_error}\n{raw_trace}")
            
            job.status = JobStatus.FAILED
            final_status = JobStatus.FAILED
            
            # Provide user-friendly error messages for common issues
            error_str = str(workflow_error).lower()
            if "quota" in error_str or "billing" in error_str:
                error_message = "OpenAI API quota exceeded. Please check your billing details."
            elif "rate limit" in error_str:
                error_message = "API rate limit exceeded. Please try again in a few minutes."
            elif "authentication" in error_str or "api key" in error_str:
                error_message = "Invalid OpenAI API key. Please check your API key in settings."
            elif "network" in error_str or "connection" in error_str:
                error_message = "Network connection error. Please check your internet connection and try again."
            else:
                error_message = f"Journey generation failed: {str(workflow_error)}"
            
            # Store both user-friendly message and debug info
            job.updated_at = datetime.now()
            logger.info(f"Job {job_id} failed - User message: {error_message}")
            logger.debug(f"Job {job_id} debug info: {workflow_error}")

        finally:
            # CRITICAL: Update job error message first
            if error_message:
                job.error_message = error_message
            
            # CRITICAL: Always update database - this must succeed regardless of WebSocket failures
            try:
                if final_status == JobStatus.COMPLETED and workflow_result:
                    await usage_service.update_journey_completion(
                        journey_id=job_id,
                        status=final_status.value,
                        result_data=workflow_result
                    )
                    logger.info(f"Database updated: Job {job_id} marked as completed")
                else:
                    # Include error message in progress data for database storage
                    progress_data = {"completed_at": datetime.now().isoformat()}
                    if error_message:
                        progress_data["error"] = error_message
                        progress_data["user_friendly_error"] = error_message
                    
                    await usage_service.update_journey_status(
                        journey_id=job_id,
                        status=final_status.value,
                        progress_data=progress_data
                    )
                    logger.info(f"Database updated: Job {job_id} marked as {final_status.value}")
            except Exception as db_error:
                logger.error(f"CRITICAL: Failed to update database for job {job_id}: {str(db_error)}")
                # Even if DB update fails, continue to try WebSocket update
            
            # OPTIONAL: Try to send final progress update via WebSocket - this is secondary to DB update
            try:
                if final_status == JobStatus.COMPLETED:
                    await self._update_progress(job_id, 8, "Completed", "Journey map generated successfully!")
                elif final_status == JobStatus.CANCELLED:
                    await self._update_progress(job_id, -1, "Cancelled", "Workflow cancelled by user")
                else:
                    # Send detailed error info via WebSocket
                    error_update = {
                        "job_id": job_id,
                        "status": "failed",
                        "error": error_message or "Journey generation failed",
                        "error_message": error_message or "Journey generation failed",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    # Send via progress update mechanism
                    await self._update_progress(job_id, -1, "Failed", error_message or "Journey generation failed")
                    
                logger.info(f"Final progress update sent for job {job_id}")
                
            except Exception as progress_error:
                logger.warning(f"Failed to send final progress update for job {job_id}: {str(progress_error)}")
                # This is non-critical since database update was already attempted
            
            # Clean up workflow task reference
            self._workflow_tasks.pop(job_id, None)
            
            # Schedule callback cleanup after delay
            if job_id in self._cleanup_tasks and not self._cleanup_tasks[job_id].done():
                self._cleanup_tasks[job_id].cancel()
            self._cleanup_tasks[job_id] = asyncio.create_task(
                self._cleanup_callbacks_after_delay(job_id)
            )
            
            logger.info(f"Workflow cleanup completed for job {job_id} with final status: {final_status.value}")

    def _convert_to_journey_map(self, journey_map_data: Dict[str, Any]) -> JourneyMap:
        personas = [Persona(**p) for p in journey_map_data.get('personas', [])]
        phases = [JourneyPhase(**ph) for ph in journey_map_data.get('phases', [])]
        return JourneyMap(
            id=journey_map_data.get('id', str(uuid.uuid4())),
            title=journey_map_data.get('title', 'AI Generated Journey'),
            industry=journey_map_data.get('industry', ''),
            createdAt=datetime.fromisoformat(
                journey_map_data.get('created_at', datetime.now().isoformat())
            ),
            personas=personas,
            phases=phases
        )