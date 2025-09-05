from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    CANCELLED = "cancelled"

class JourneyFormData(BaseModel):
    title: Optional[str]
    industry: str
    business_goals: str = Field(..., alias="businessGoals")
    target_personas: List[str] = Field(..., alias="targetPersonas")
    journey_phases: List[str] = Field(..., alias="journeyPhases")
    additional_context: Optional[str] = Field(None, alias="additionalContext")
    files: Optional[List[dict]] = None

    class Config:
        populate_by_name = True


class JobProgress(BaseModel):
    current_step: int = Field(..., description="Current step number")
    total_steps: int = Field(default=8, description="Total number of steps")
    step_name: str = Field(..., description="Name of current step")
    message: str = Field(..., description="Progress message")
    percentage: float = Field(..., description="Completion percentage")

class Persona(BaseModel):
    id: str
    name: str
    age: str
    occupation: str
    goals: List[str]
    pain_points: List[str] = Field(alias="painPoints")
    quote: str
    avatar: str
    demographics: Optional[Dict[str, Any]] = None
    motivations: Optional[List[str]] = None

class JourneyPhase(BaseModel):
    id: str
    name: str
    actions: List[str]
    touchpoints: List[str]
    emotions: str
    pain_points: List[str] = Field(alias="painPoints")
    opportunities: List[str]
    customer_quote: str = Field(alias="customerQuote")

class JourneyMap(BaseModel):
    id: str
    title: str
    industry: str
    created_at: datetime = Field(alias="createdAt")
    personas: List[Persona]
    phases: List[JourneyPhase]
    insights: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None

class Job(BaseModel):
    id: str
    status: JobStatus
    user_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    form_data: JourneyFormData
    progress: Optional[JobProgress] = None
    result: Optional[JourneyMap] = None
    error_message: Optional[str] = None