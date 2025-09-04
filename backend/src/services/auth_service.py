import os
import jwt
import uuid
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from supabase import create_client, Client
from ..models.auth import UserProfile, UserSignup, UserLogin, AuthToken, SubscriptionPlan
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        # Initialize clients if configuration is available
        self.supabase = None
        self.supabase_admin = None
        
        if self.supabase_url and self.supabase_anon_key:
            try:
                self.supabase: Client = create_client(self.supabase_url, self.supabase_anon_key)
                if self.supabase_service_key:
                    self.supabase_admin: Client = create_client(self.supabase_url, self.supabase_service_key)
                logger.info("Supabase auth clients initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase auth clients: {e}")
        else:
            logger.warning("Supabase auth configuration missing - auth will not work")
            
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def _is_available(self) -> bool:
        """Check if Supabase auth is available"""
        return self.supabase is not None and self.supabase_admin is not None
    
    def _encrypt_api_key(self, api_key: str) -> str:
        """Simple encryption for API keys (in production, use proper encryption)"""
        if not api_key:
            return None
        # In production, use proper encryption like Fernet
        return api_key  # Placeholder - implement proper encryption
    
    def _decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt API key"""
        if not encrypted_key:
            return None
        # In production, use proper decryption
        return encrypted_key  # Placeholder - implement proper decryption
    
    async def signup(self, user_data: UserSignup) -> AuthToken:
        """Register a new user using Supabase Auth with email verification"""
        if not self._is_available():
            raise ValueError("Authentication service is not available - missing Supabase configuration")
            
        try:
            logger.info(f"Starting signup process for: {user_data.email}")
            
            # Use Supabase Auth to create user and send verification email
            auth_response = self.supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password
            })
            
            if auth_response.user is None:
                raise ValueError("Failed to create user account")
            
            user_id = auth_response.user.id
            logger.info(f"Supabase Auth user created with ID: {user_id}")
            # Create extended user profile in public.users table
            profile_data = {
                "id": user_id,
                "email": user_data.email,
                "password_hash": hashed_password,
                "plan_type": "free",
                "journey_count": 0,
                "is_active": True,
                "email_verified": False
            }
            
            try:
                profile_response = self.supabase_admin.table("users").insert(profile_data).execute()
                logger.info(f"User profile insert response: {profile_response}")
                
                if not profile_response.data:
                    raise ValueError("Failed to create user profile - no data returned")
                    
                logger.info(f"User profile created successfully: {profile_response.data[0]}")
                
            except Exception as e:
                logger.error(f"Failed to insert user profile: {e}")
                raise ValueError(f"Failed to create user profile: {str(e)}")
            
            # Return success response (no token until verified)
            return {
                "message": "Account created successfully. Please check your email to verify your account.",
                "email": user_data.email,
                "requires_verification": True
            }
            
        except Exception as e:
            logger.error(f"Signup failed: {str(e)}")
            raise ValueError(f"Registration failed: {str(e)}")
    
    async def login(self, credentials: UserLogin) -> AuthToken:
        """Authenticate user using Supabase Auth"""
        if not self._is_available():
            raise ValueError("Authentication service is not available - missing Supabase configuration")
            
        try:
            logger.info(f"Login attempt for: {credentials.email}")
            
            # Use Supabase Auth to authenticate
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })
            
            if auth_response.user is None or auth_response.session is None:
                raise ValueError("Invalid email or password")
            
            # Check if email is confirmed in Supabase Auth
            if not auth_response.user.email_confirmed_at:
                raise ValueError("Please verify your email address before signing in. Check your inbox for the verification link.")
            
            # Get user profile from our users table
            user_record = self.supabase_admin.table("users").select("*").eq("id", auth_response.user.id).execute()
            
            if not user_record.data:
                raise ValueError("User profile not found. Please contact support.")
            
            user_data = user_record.data[0]
            
            # Update email_verified status in our users table if needed
            if not user_data.get("email_verified"):
                self.supabase_admin.table("users").update({
                    "email_verified": True,
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", auth_response.user.id).execute()
                user_data["email_verified"] = True
            
            logger.info(f"Authentication successful for: {credentials.email}")
            
            # Get journey limit based on plan
            plan_response = self.supabase_admin.table("subscription_plans").select("journey_limit").eq("id", user_data.get("plan_type", "free")).execute()
            journey_limit = plan_response.data[0]["journey_limit"] if plan_response.data else 5
            user_data['journey_limit'] = journey_limit
            
            user_profile = UserProfile(**user_data)
            
            # Decrypt API key for response
            if user_profile.openai_api_key:
                user_profile.openai_api_key = self._decrypt_api_key(user_profile.openai_api_key)
            
            # Update last login
            self.supabase_admin.table("users").update({
                "last_login": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", auth_response.user.id).execute()
            
            return AuthToken(
                access_token=auth_response.session.access_token,
                expires_in=auth_response.session.expires_in or 3600,
                user=user_profile
            )
            
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            raise ValueError(f"Authentication failed: {str(e)}")
    
    async def verify_token(self, token: str) -> Optional[UserProfile]:
        """Verify Supabase access token and return user profile"""
        if not self._is_available():
            logger.warning("Supabase auth service not available")
            return None
            
        try:
            # Verify token with Supabase Auth
            auth_response = self.supabase_admin.auth.get_user(token)
            
            if auth_response.user is None:
                logger.warning("Invalid token or user not found")
                return None
            
            # Check if email is confirmed
            if not auth_response.user.email_confirmed_at:
                logger.warning(f"Email not confirmed for user: {auth_response.user.id}")
                return None
            
            logger.info(f"Successfully verified token for user: {auth_response.user.id}")
            
            # Try to get existing user profile
            profile_response = self.supabase_admin.table("users").select("*").eq("id", auth_response.user.id).execute()
            
            if profile_response.data:
                # User profile exists, use it
                logger.info(f"Found existing user profile for: {auth_response.user.id}")
                profile_data = profile_response.data[0]
            else:
                # User profile doesn't exist, create it
                logger.info(f"Creating user profile for new user: {auth_response.user.id}")
                
                new_profile_data = {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "plan_type": "free",
                    "journey_count": 0,
                    "is_active": True,
                    "email_verified": True,
                }
                
                try:
                    create_response = self.supabase_admin.table("users").insert(new_profile_data).execute()
                    logger.info(f"User profile creation response: {create_response}")
                    
                    if not create_response.data:
                        logger.error(f"Failed to create user profile for {auth_response.user.id}")
                        return None
                    profile_data = create_response.data[0]
                    logger.info(f"Successfully created user profile for {auth_response.user.id}")
                except Exception as create_error:
                    logger.error(f"Error creating user profile: {str(create_error)}")
                    # If profile creation fails, create a minimal profile from auth data
                    logger.info("Creating minimal profile from auth data")
                    profile_data = {
                        "id": auth_response.user.id,
                        "email": auth_response.user.email,
                        "plan_type": "free",
                        "journey_count": 0,
                        "is_active": True,
                        "email_verified": True,
                        "created_at": auth_response.user.created_at,
                        "updated_at": auth_response.user.updated_at or auth_response.user.created_at,
                        "journey_limit": 2,
                        "openai_api_key": None,
                        "last_login": None
                    }
            
            # Get user's plan details
            try:
                plan_response = self.supabase_admin.table("subscription_plans").select("journey_limit").eq("id", profile_data.get("plan_type", "free")).execute()
                journey_limit = plan_response.data[0]["journey_limit"] if plan_response.data else 2
                profile_data['journey_limit'] = journey_limit
            except Exception as plan_error:
                logger.warning(f"Failed to get plan details, using default: {plan_error}")
                profile_data['journey_limit'] = 2
            
            # Ensure all required fields are present
            if 'created_at' not in profile_data:
                profile_data['created_at'] = auth_response.user.created_at
            if 'updated_at' not in profile_data:
                profile_data['updated_at'] = auth_response.user.updated_at or auth_response.user.created_at
            if 'openai_api_key' not in profile_data:
                profile_data['openai_api_key'] = None
            if 'last_login' not in profile_data:
                profile_data['last_login'] = None
            
            logger.info(f"Creating UserProfile object with data: {profile_data}")
            user_profile = UserProfile(**profile_data)
            
            # Decrypt API key
            if user_profile.openai_api_key:
                user_profile.openai_api_key = self._decrypt_api_key(user_profile.openai_api_key)
            
            logger.info(f"Successfully created UserProfile for: {user_profile.email}")
            return user_profile
            
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}", exc_info=True)
            return None
    
    async def update_user_settings(self, user_id: str, openai_api_key: Optional[str]) -> UserProfile:
        """Update user settings including OpenAI API key"""
        try:
            encrypted_key = self._encrypt_api_key(openai_api_key) if openai_api_key else None
            
            update_data = {
                "openai_api_key": encrypted_key,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase_admin.table("users").update(update_data).eq("id", user_id).execute()
            
            if not response.data:
                raise ValueError("Failed to update user settings")
            
            profile_data = response.data[0]
            
            # Get journey limit based on plan
            plan_response = self.supabase_admin.table("subscription_plans").select("journey_limit").eq("id", profile_data.get("plan_type", "free")).execute()
            journey_limit = plan_response.data[0]["journey_limit"] if plan_response.data else 5
            profile_data['journey_limit'] = journey_limit
            
            user_profile = UserProfile(**profile_data)
            
            # Decrypt API key for response
            if user_profile.openai_api_key:
                user_profile.openai_api_key = self._decrypt_api_key(user_profile.openai_api_key)
            
            return user_profile
            
        except Exception as e:
            logger.error(f"Settings update failed: {str(e)}")
            raise ValueError(f"Failed to update settings: {str(e)}")
    
    async def upgrade_user_plan(self, user_id: str, plan_id: str, openai_api_key: Optional[str] = None) -> UserProfile:
        """Upgrade user to a new plan"""
        try:
            encrypted_key = self._encrypt_api_key(openai_api_key) if openai_api_key else None
            
            update_data = {
                "plan_type": plan_id,
                "openai_api_key": encrypted_key,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase_admin.table("users").update(update_data).eq("id", user_id).execute()
            
            if not response.data:
                raise ValueError("Failed to upgrade user plan")
            
            profile_data = response.data[0]
            
            # Get journey limit based on plan
            plan_response = self.supabase_admin.table("subscription_plans").select("journey_limit").eq("id", plan_id).execute()
            journey_limit = plan_response.data[0]["journey_limit"] if plan_response.data else None
            profile_data['journey_limit'] = journey_limit
            
            user_profile = UserProfile(**profile_data)
            
            # Decrypt API key for response
            if user_profile.openai_api_key:
                user_profile.openai_api_key = self._decrypt_api_key(user_profile.openai_api_key)
            
            return user_profile
            
        except Exception as e:
            logger.error(f"Plan upgrade failed: {str(e)}")
            raise ValueError(f"Failed to upgrade plan: {str(e)}")
    
    async def get_subscription_plans(self) -> list[SubscriptionPlan]:
        """Get all available subscription plans"""
        try:
            response = self.supabase_admin.table("subscription_plans").select("*").eq("is_active", True).execute()
            return [SubscriptionPlan(**plan) for plan in response.data]
        except Exception as e:
            logger.error(f"Failed to get subscription plans: {str(e)}")
            return []

# Global auth service instance
auth_service = AuthService()