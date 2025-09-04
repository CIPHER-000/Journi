from fastapi import APIRouter, HTTPException, Depends, status
from ..models.auth import UserSignup, UserLogin, AuthToken, UserProfile, UserSettings, SubscriptionPlan, PlanUpgrade, OpenAIKeyValidation
from ..services.auth_service import auth_service
from ..services.usage_service import usage_service
from ..services.openai_service import openai_service
from ..middleware.auth_middleware import require_auth
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup")
async def signup(user_data: UserSignup):
    """Register a new user"""
    try:
        return await auth_service.signup(user_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=AuthToken)
async def login(credentials: UserLogin):
    """Authenticate user and return access token"""
    try:
        return await auth_service.login(credentials)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: UserProfile = Depends(require_auth)):
    """Get current user profile"""
    return current_user

@router.get("/usage", response_model=Dict[str, Any])
async def get_usage_stats(current_user: UserProfile = Depends(require_auth)):
    """Get current user's journey usage statistics"""
    try:
        usage_stats = await usage_service.get_usage_stats(current_user.id)
        limit_check = await usage_service.check_journey_limit(current_user)
        
        return {
            "usage": usage_stats,
            "limit_status": limit_check.dict()
        }
    except Exception as e:
        logger.error(f"Usage stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve usage statistics")

@router.put("/settings", response_model=UserProfile)
async def update_user_settings(
    settings: UserSettings,
    current_user: UserProfile = Depends(require_auth)
):
    """Update user settings including OpenAI API key"""
    try:
        return await auth_service.update_user_settings(
            current_user.id,
            settings.openai_api_key
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Settings update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update settings")

@router.get("/plans", response_model=list[SubscriptionPlan])
async def get_subscription_plans():
    """Get available subscription plans"""
    try:
        return await auth_service.get_subscription_plans()
    except Exception as e:
        logger.error(f"Plans fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve subscription plans")

@router.post("/validate-openai-key", response_model=OpenAIKeyValidation)
async def validate_openai_key(
    validation_request: dict,
    current_user: UserProfile = Depends(require_auth)
):
    """Validate an OpenAI API key"""
    try:
        api_key = validation_request.get("api_key")
        if not api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        validation_result = await openai_service.validate_openai_key(api_key)
        return validation_result
        
    except Exception as e:
        logger.error(f"API key validation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to validate API key")

@router.post("/upgrade-plan", response_model=UserProfile)
async def upgrade_plan(
    upgrade_request: PlanUpgrade,
    current_user: UserProfile = Depends(require_auth)
):
    """Upgrade user to a new plan"""
    try:
        # Validate the plan exists
        plans = await auth_service.get_subscription_plans()
        valid_plan = next((p for p in plans if p.id == upgrade_request.plan_id), None)
        
        if not valid_plan:
            raise HTTPException(status_code=400, detail="Invalid plan selected")
        
        # For Pro plan, validate OpenAI API key if provided
        if upgrade_request.plan_id == 'pro' and upgrade_request.openai_api_key:
            validation = await openai_service.validate_openai_key(upgrade_request.openai_api_key)
            if not validation.is_valid:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid OpenAI API key: {validation.error_message}"
                )
        
        # Update user plan and API key
        updated_user = await auth_service.upgrade_user_plan(
            current_user.id,
            upgrade_request.plan_id,
            upgrade_request.openai_api_key
        )
        
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Plan upgrade error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upgrade plan")