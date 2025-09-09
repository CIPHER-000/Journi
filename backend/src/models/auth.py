from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    plan_type: str = 'free'
    journey_count: int = 0
    journey_limit: Optional[int] = 5
    openai_api_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    email_verified: bool = False
    last_login: Optional[datetime] = None

class UserSettings(BaseModel):
    openai_api_key: Optional[str] = None

class UserJourney(BaseModel):
    id: str
    user_id: str
    title: str
    industry: Optional[str] = None
    status: str = 'completed'
    created_at: datetime
    form_data: Optional[dict] = None
    result_data: Optional[dict] = None
    job_id: Optional[str] = None  # Job tracking ID
    error_message: Optional[str] = None  # Error message if failed
    progress_data: Optional[dict] = None  # Progress tracking data

class SubscriptionPlan(BaseModel):
    id: str
    name: str
    journey_limit: Optional[int]
    price_monthly: float
    features: list
    is_active: bool = True

class UsageLimitResponse(BaseModel):
    allowed: bool
    needs_upgrade: bool
    message: str
    current_usage: int
    limit: int
    plan_type: str
    available_plans: list = []

class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfile

class PlanUpgrade(BaseModel):
    plan_id: str
    openai_api_key: Optional[str] = None

class OpenAIKeyValidation(BaseModel):
    api_key: str
    is_valid: bool
    error_message: Optional[str] = None