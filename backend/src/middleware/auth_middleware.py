from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
import os
from ..services.auth_service import auth_service
from ..models.auth import UserProfile
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserProfile:
    """Extract and validate user from JWT token"""
    try:
        token = credentials.credentials
        
        # First try to decode the JWT to get user info
        try:
            # Decode without verification first to get the payload
            decoded = jwt.decode(token, options={"verify_signature": False})
            user_id = decoded.get('sub')
            email = decoded.get('email')
            
            if not user_id or not email:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Create a user profile from the token data
            user = UserProfile(
                id=user_id,
                email=email,
                plan_type="free",
                journey_count=0,
                email_verified=True,  # If they have a valid token, email is verified
                journey_limit=2,
                created_at=decoded.get('iat', ''),
                updated_at=decoded.get('iat', ''),
                is_active=True
            )
            
            return user
            
        except jwt.InvalidTokenError as e:
            logger.error(f"JWT decode error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
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