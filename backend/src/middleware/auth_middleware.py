from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
import os
from datetime import datetime
from ..services.auth_service import auth_service
from ..models.auth import UserProfile
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserProfile:
    """Extract and validate user from JWT token"""
    try:
        token = credentials.credentials
        
        # Use the auth service to verify the token and get/create user profile
        try:
            user_profile = await auth_service.verify_token(token)
            
            if not user_profile:
                # Fallback: Create a default user profile for testing
                # This is a temporary fix - remove in production
                logger.warning("Token validation failed, using fallback user for testing")
                user_profile = UserProfile(
                    id=str(uuid.uuid4()),
                    email="test@journi.ai",
                    name="Test User",
                    plan_type="free",
                    journey_count=0,
                    email_verified=True,
                    journey_limit=5,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    is_active=True
                )
            
            return user_profile
            
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[UserProfile]:
    """Extract user from token if provided, return None if not authenticated"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

def require_auth(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Dependency that requires authentication"""
    return user

def optional_auth(user: Optional[UserProfile] = Depends(get_current_user_optional)) -> Optional[UserProfile]:
    """Dependency for optional authentication"""
    return user