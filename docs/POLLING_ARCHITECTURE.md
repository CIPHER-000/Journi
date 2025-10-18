# 🔄 HTTP Polling Architecture Documentation

**System**: Real-Time Progress Tracking via HTTP Polling  
**Pattern**: Frontend polls backend every 3 seconds  
**Last Updated**: 2025-01-18

---

## 🎯 Architecture Overview

```
Frontend                        Backend                     Database
   |                               |                            |
   |-- POST /api/journey/create -->|                            |
   |                               |-- Create Job in Memory     |
   |                               |-- Save to DB ------------->|
   |                               |-- Start Workflow (async)   |
   |<-- Return job_id -------------|                            |
   |                               |                            |
   |                          [Workflow Running]                |
   |                               |                            |
   |== Poll every 3s =============>|                            |
   |   GET /api/journey/status/:id |                            |
   |                               |-- Check Memory             |
   |                               |-- Or Load from DB -------->|
   |<-- Progress Update -----------|                            |
   |                               |                            |
   |== Poll every 3s =============>|                            |
   |                               |-- Progress: Step 3/8       |
   |<-- Progress Update -----------|                            |
   |                               |                            |
   |== Poll every 3s =============>|                            |
   |                               |-- Progress: Step 8/8       |
   |                               |-- Status: COMPLETED        |
   |<-- Final Result --------------|                            |
   |                               |                            |
   |-- Stop Polling                |                            |
```

---

## 📦 Backend Implementation

### File: `backend/src/services/job_manager.py` (32.9 KB)

**Class**: `JobManager`

### Key Data Structures

#### 1. In-Memory Storage
```python
self.jobs: Dict[str, Job] = {}
# Stores all active jobs in memory
# Key: job_id (UUID)
# Value: Job object with status, progress, result

self.progress_callbacks: Dict[str, List[Callable]] = {}
# Callbacks for progress updates (used for potential future WebSocket)

self._workflow_tasks: Dict[str, asyncio.Task] = {}
# Tracks async workflow tasks for cancellation

self._last_progress_save: Dict[str, float] = {}
# Throttles database saves to every 10 seconds
```

#### 2. Job Object Structure
```python
class Job:
    id: str                           # UUID
    status: JobStatus                 # QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED
    user_id: str                      # Owner
    created_at: datetime
    updated_at: datetime
    form_data: JourneyFormData       # User input
    progress: Optional[JobProgress]   # Current progress
    progress_history: List[dict]     # Last 50 progress updates
    result: Optional[JourneyMap]     # Final output
    error_message: Optional[str]     # If failed
```

#### 3. Progress Object
```python
class JobProgress:
    current_step: int        # 1-8
    total_steps: int         # Always 8
    step_name: str          # "Context Analysis", etc.
    message: str            # Detailed progress message
    percentage: float       # 0-100
```

---

## 🔄 Core Polling Flow

### 1. Job Creation (`create_job()`)

**Endpoint**: `POST /api/journey/create`

**Flow**:
```python
async def create_job(form_data, user):
    # Generate UUID
    job_id = str(uuid.uuid4())
    
    # Create job in memory
    job = Job(
        id=job_id,
        status=JobStatus.QUEUED,
        user_id=user.id,
        form_data=JourneyFormData(**form_data)
    )
    self.jobs[job_id] = job
    
    # Save to database
    await usage_service.record_journey_creation(
        user_id=user.id,
        title=form_data.get('title'),
        industry=form_data.get('industry'),
        form_data=form_data,
        job_id=job_id  # Critical for tracking
    )
    
    # Start workflow asynchronously (doesn't block)
    asyncio.create_task(self._run_agent_workflow(job_id, user))
    
    # Return job_id immediately
    return job
```

---

### 2. Status Polling (`get_job_async()`)

**Endpoint**: `GET /api/journey/status/{job_id}`

**Frontend Behavior**:
```javascript
// Poll every 3 seconds
const pollInterval = setInterval(async () => {
  const status = await fetch(`/api/journey/status/${jobId}`);
  
  if (status.status === 'completed' || status.status === 'failed') {
    clearInterval(pollInterval);
  }
}, 3000);
```

**Backend Flow**:
```python
async def get_job_async(job_id, user_id):
    # 1. Check in-memory first (fast)
    job = self.jobs.get(job_id)
    if job:
        # Verify user owns job
        if user_id and job.user_id != user_id:
            return None
        return job
    
    # 2. Not in memory? Load from database (slow)
    loaded_job = await self.load_job_state(job_id)
    
    if loaded_job:
        # Cache in memory for future polls
        self.jobs[job_id] = loaded_job
        return loaded_job
    
    # 3. Not found anywhere
    return None
```

---

## 🔄 Progress Update Flow

### 1. Workflow Calls Progress Callback

```python
async def _run_agent_workflow(job_id, user):
    # Update status to processing
    job.status = JobStatus.PROCESSING
    
    # Create coordinator
    coordinator = CrewCoordinator(user)
    
    # Execute with progress callback
    result = await coordinator.execute_workflow(
        form_data=job.form_data.dict(),
        progress_callback=lambda step, name, msg: 
            self._update_progress(job_id, step, name, msg),
        job_id=job_id
    )
    
    # Mark as completed
    job.status = JobStatus.COMPLETED
    job.result = result
```

### 2. Progress Callback Updates Job State

```python
async def _update_progress(job_id, step, step_name, message):
    # Get job from memory
    job = self.jobs[job_id]
    
    # Calculate percentage (8 steps)
    percentage = min(100, max(0, (step / 8) * 100))
    
    # Update progress object
    job.progress = JobProgress(
        current_step=step,
        total_steps=8,
        step_name=step_name,
        message=message,
        percentage=percentage
    )
    job.updated_at = datetime.now()
    
    # Add to progress history (for frontend)
    job.progress_history = getattr(job, 'progress_history', [])
    job.progress_history.append({
        "timestamp": datetime.utcnow().isoformat(),
        "step": step,
        "step_name": step_name,
        "message": message,
        "percentage": percentage,
        "status": job.status.value
    })
    
    # Keep only last 50 (prevent memory bloat)
    if len(job.progress_history) > 50:
        job.progress_history = job.progress_history[-50:]
    
    # Save to database (throttled to every 10s)
    await self.save_job_state(job_id)
```

---

## 💾 Database Persistence

### 1. Throttled Saves (Performance Optimization)

**Problem**: Saving every progress update would overwhelm database

**Solution**: Throttle to maximum 1 save per 10 seconds

```python
async def save_job_state(job_id, force=False):
    current_time = time.time()
    
    # Check throttle (skip if last save < 10s ago)
    if not force and job_id in self._last_progress_save:
        time_since_last = current_time - self._last_progress_save[job_id]
        if time_since_last < 10:
            return True  # Skip save
    
    # Prepare progress data
    progress_data = {
        "current_step": job.progress.current_step,
        "total_steps": job.progress.total_steps,
        "step_name": job.progress.step_name,
        "message": job.progress.message,
        "percentage": job.progress.percentage,
        "updated_at": datetime.now().isoformat(),
        "progress_history": job.progress_history[-10:]  # Last 10 only
    }
    
    # Update database
    await usage_service.update_journey_status(
        journey_id=job_id,
        status=job.status.value,
        progress_data=progress_data
    )
    
    # Record save time
    self._last_progress_save[job_id] = current_time
    return True
```

---

## 🔍 Frontend Integration

### Example Implementation

```typescript
export const pollJobStatus = async (
  jobId: string,
  onProgress: (progress: JobProgress) => void,
  onComplete: (result: JourneyMap) => void,
  onError: (error: string) => void
) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/journey/status/${jobId}`);
      const data = await response.json();
      
      // Update progress
      if (data.progress) {
        onProgress(data.progress);
      }
      
      // Handle completion
      if (data.status === 'completed') {
        clearInterval(pollInterval);
        onComplete(data.result);
      }
      
      // Handle error
      if (data.status === 'failed') {
        clearInterval(pollInterval);
        onError(data.error_message);
      }
      
    } catch (error) {
      clearInterval(pollInterval);
      onError('Failed to poll job status');
    }
  }, 3000); // Poll every 3 seconds
  
  return pollInterval; // Return for cleanup
};
```

---

## ⚠️ Critical Constraints

### DO NOT MODIFY ❌
1. **3-second polling interval** - UI depends on this timing
2. **Job ID generation** - Must be UUID
3. **Progress history length** (50) - Prevents memory issues
4. **Database throttle** (10s) - Performance optimization
5. **Status enum values** - Frontend expects exact strings

### CAN MODIFY (With Care) ⚠️
1. **Throttle duration** - Could adjust from 10s
2. **History length** - Could adjust from 50
3. **Recovery logic** - Could try to resume workflows
4. **Error messages** - Text can be improved

### FORBIDDEN ❌
1. **Removing database persistence** - Required for recovery
2. **Changing job_id to sequential** - UUID required for security
3. **Removing in-memory cache** - Performance would degrade
4. **Switching to synchronous** - Would block API

---

## 📝 Summary

**Architecture**: HTTP Polling (Pure)  
**Poll Interval**: 3 seconds  
**Storage**: In-memory + Database  
**Throttling**: 10 seconds for DB saves  
**Recovery**: Marks failed on restart  
**Performance**: Excellent for 100s of users  

**Status**: ✅ Fully Functional - Do Not Modify Without Tests

**Last Reviewed**: 2025-01-18  
**Documentation Version**: 1.0
