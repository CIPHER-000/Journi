import asyncio
import uuid
from datetime import datetime
from typing import Dict, Callable, Optional, Any, List
from ..models.journey import Job, JobStatus, JobProgress, JourneyFormData, JourneyMap, Persona, JourneyPhase
from ..models.auth import UserProfile
from ..agents.crew_coordinator import CrewCoordinator
from ..services.usage_service import usage_service
import logging

logger = logging.getLogger(__name__)

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, Job] = {}
        self.progress_callbacks: Dict[str, List[Callable]] = {}
        self._cleanup_tasks: Dict[str, asyncio.Task] = {}
        self._workflow_tasks: Dict[str, asyncio.Task] = {}
        
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
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # 🔹 Include result in final completion message
        if job.status == JobStatus.COMPLETED and job.result:
            try:
                update_msg["result"] = job.result.dict()
            except Exception as e:
                logger.error(f"Failed to serialize job result for job {job_id}: {e}")
        
        try:
            await usage_service.update_journey_status(
                journey_id=job_id,
                status=job.status.value,
                progress_data=progress.dict()
            )
        except Exception as e:
            logger.error(f"Failed DB update for job {job_id}: {e}")
            update_msg["db_error"] = str(e)
        
        # 🔹 WebSocket-safe callback handling
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
                except Exception as e:
                    logger.error(f"Error in callback for {job_id}: {e}")
                    self.progress_callbacks[job_id].remove(cb)
        
        if job.status in [JobStatus.COMPLETED, JobStatus.FAILED]:
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

        try:
            job.status = JobStatus.PROCESSING
            job.updated_at = datetime.now()
            await self._update_progress(job_id, 0, "Starting", "Initializing journey mapping process...")
            
            # Convert form data to dictionary for crew coordinator
            form_data_dict = job.form_data.dict()
            logger.info(f"Form data prepared for workflow: {form_data_dict}")
            
            # Add timeout for the entire workflow
            import asyncio
            
            crew_coordinator = CrewCoordinator(user)

            async def progress_callback(step: int, step_name: str, message: str):
                await self._update_progress(job_id, step, step_name, message)

            try:
                # Add timeout to prevent hanging
                workflow_task = asyncio.create_task(
                    crew_coordinator.execute_workflow(form_data_dict, progress_callback, job_id)
                )
                
                # Wait for completion with timeout (15 minutes max)
                journey_map_data = await asyncio.wait_for(workflow_task, timeout=900)
                
                journey_map = self._convert_to_journey_map(journey_map_data)
                job.result = journey_map
                job.status = JobStatus.COMPLETED
                job.updated_at = datetime.now()
                
                try:
                    await usage_service.update_journey_completion(
                        journey_id=job_id,
                        status="completed",
                        result_data=journey_map_data
                    )
                except Exception as e:
                    logger.error(f"Completion update failed: {e}")

                await self._update_progress(job_id, 8, "Completed", "Journey map generated successfully!")

            except asyncio.TimeoutError:
                logger.error(f"Workflow timeout for job {job_id}")
                job.status = JobStatus.FAILED
                job.error_message = "Workflow timed out after 15 minutes"
                job.updated_at = datetime.now()
                await usage_service.update_journey_status(
                    journey_id=job_id,
                    status="failed",
                    progress_data={"error": "Workflow timeout"}
                )
                await self._update_progress(job_id, -1, "Failed", "Workflow timed out")
                raise
            except Exception as workflow_error:
                logger.error(f"Workflow error for job {job_id}: {str(workflow_error)}")
                job.status = JobStatus.FAILED
                job.error_message = str(workflow_error)
                job.updated_at = datetime.now()
                await usage_service.update_journey_status(
                    journey_id=job_id,
                    status="failed",
                    progress_data={"error": str(workflow_error)}
                )
                await self._update_progress(job_id, -1, "Failed", f"Job failed: {str(workflow_error)}")
                raise workflow_error

        except Exception as e:
            logger.error(f"Job manager error for job {job_id}: {str(e)}")
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            await usage_service.update_journey_status(
                journey_id=job_id,
                status="failed",
                progress_data={"error": str(e)}
            )
            await self._update_progress(job_id, -1, "Failed", f"Unexpected error: {str(e)}")
            raise

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
