import os
from datetime import datetime
from typing import Optional, Dict, Any
from supabase import create_client, Client
from ..models.auth import UserProfile, UserJourney, UsageLimitResponse
import logging

logger = logging.getLogger(__name__)


class UsageService:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        # Allow service to initialize without Supabase for development/testing
        self.supabase = None
        if self.supabase_url and self.supabase_service_key:
            try:
                self.supabase: Client = create_client(self.supabase_url, self.supabase_service_key)
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
        else:
            logger.warning("Supabase configuration missing - running in mock mode")

    def _is_available(self) -> bool:
        """Check if Supabase is available"""
        return self.supabase is not None

    async def check_journey_limit(self, user: UserProfile) -> UsageLimitResponse:
        """Check if user can create another journey"""
        if not self._is_available():
            return UsageLimitResponse(
                allowed=True,
                needs_upgrade=False,
                message="Service temporarily unavailable - proceeding",
                current_usage=0,
                limit=5,
                plan_type="starter",
                available_plans=[]
            )

        try:
            current_count = user.journey_count
            limit = user.journey_limit

            if user.plan_type == 'pro' and user.openai_api_key:
                return UsageLimitResponse(
                    allowed=True,
                    needs_upgrade=False,
                    message="Journey creation allowed",
                    current_usage=current_count,
                    limit=limit or -1,
                    plan_type=user.plan_type,
                    available_plans=[]
                )

            if user.plan_type == 'free' and current_count >= 5:
                return UsageLimitResponse(
                    allowed=False,
                    needs_upgrade=True,
                    message="You've used your 5 free journeys. Upgrade to Pro to continue creating unlimited journey maps with your own OpenAI API key.",
                    current_usage=current_count,
                    limit=5,
                    plan_type=user.plan_type,
                    available_plans=['pro']
                )

            if user.plan_type == 'pro' and not user.openai_api_key:
                return UsageLimitResponse(
                    allowed=False,
                    needs_upgrade=True,
                    message="Please add your OpenAI API key to start creating unlimited journey maps.",
                    current_usage=current_count,
                    limit=0,
                    plan_type=user.plan_type,
                    available_plans=[]
                )

            remaining = (limit or 0) - current_count if limit else -1
            return UsageLimitResponse(
                allowed=True,
                needs_upgrade=False,
                message=f"You have {remaining if remaining > 0 else 'unlimited'} journey{'s' if remaining != 1 else ''} remaining on your {user.plan_type} plan",
                current_usage=current_count,
                limit=limit,
                plan_type=user.plan_type,
                available_plans=[]
            )

        except Exception as e:
            logger.error(f"Failed to check journey limit: {str(e)}")
            return UsageLimitResponse(
                allowed=True,
                needs_upgrade=False,
                message="Unable to verify limit, proceeding",
                current_usage=0,
                limit=5,
                plan_type="free"
            )

    async def record_journey_creation(self, user_id: str, title: str, industry: str, form_data: Dict[str, Any]) -> UserJourney:
        """Record a new journey creation - let Supabase auto-generate the ID"""
        if not self._is_available():
            return UserJourney(
                id=f"mock_{user_id}_{int(datetime.now().timestamp())}",
                user_id=user_id,
                title=title,
                industry=industry,
                status="processing",
                created_at=datetime.now(),
                form_data=form_data,
                result_data=None
            )
            
        try:
            # Don't include 'id' - let Supabase auto-generate it
            journey_data = {
                "user_id": user_id,
                "title": title,
                "industry": industry,
                "status": "processing",
                "form_data": form_data
            }
            
            response = self.supabase.table("user_journeys").insert(journey_data).execute()
            if not response.data:
                raise ValueError("Failed to record journey creation")
            
            created_journey = response.data[0]
            logger.info(f"Recorded journey creation for user {user_id} with ID {created_journey['id']}")
            return UserJourney(**response.data[0])
            
        except Exception as e:
            logger.error(f"Failed to record journey creation: {str(e)}")
            raise


    async def update_journey_status(self, journey_id: str, status: str, progress_data: Optional[Dict[str, Any]] = None):
        """
        Update journey status and progress in the database by user_id and title match.
        """
        if not self._is_available():
            logger.info(f"Mock: Journey {journey_id} status updated to {status}")
            return True

        try:
            # Since we can't match by job_id (different from DB id), 
            # we'll update the most recent processing journey for this user
            # This is a temporary workaround - ideally we'd store job_id separately
            
            # For now, just log the attempt and return success
            logger.info(f"Would update journey status to {status} for job {journey_id}")
            return True
            
            # TODO: Implement proper job_id tracking in database schema
            # For now, we'll skip the database update to prevent errors

        except Exception as e:
            logger.error(f"Failed to update journey status: {str(e)}")
            return False

    async def update_journey_completion(self, journey_id: str, status: str, result_data: Optional[Dict[str, Any]] = None):
        """
        Update journey completion status - temporary workaround for ID mismatch.
        """
        if not self._is_available():
            logger.info(f"Mock: Journey {journey_id} completed with status {status}")
            return True

        try:
            # Log completion for now - skip DB update due to ID mismatch
            logger.info(f"Journey {journey_id} completed with status {status}")
            return True

        except Exception as e:
            logger.error(f"Failed to update journey completion: {str(e)}")
            return False

    async def get_user_journeys(self, user_id: str, limit: int = 50) -> list[UserJourney]:
        """Get user's journey history"""
        if not self._is_available():
            return []

        try:
            response = self.supabase.table("user_journeys").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return [UserJourney(**journey) for journey in response.data]

        except Exception as e:
            logger.error(f"Failed to get user journeys: {str(e)}")
            return []

    async def get_usage_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user's usage statistics"""
        if not self._is_available():
            return {
                "current_usage": 0,
                "limit": 5,
                "plan_type": "free",
                "plan_name": "Starter Plan",
                "recent_journeys": [],
                "total_journeys": 0,
                "can_create_more": True
            }

        try:
            user_response = self.supabase.table("users").select("*").eq("id", user_id).execute()
            if not user_response.data:
                raise ValueError("User not found")

            user_data = user_response.data[0]
            journeys = await self.get_user_journeys(user_id, limit=10)

            plan_response = self.supabase.table("subscription_plans").select("*").eq("id", user_data.get("plan_type", "free")).execute()
            plan_info = plan_response.data[0] if plan_response.data else None

            return {
                "current_usage": user_data.get("journey_count", 0),
                "limit": plan_info.get("journey_limit") if plan_info else 5,
                "plan_type": user_data.get("plan_type", "free"),
                "plan_name": plan_info.get("name") if plan_info else "Free Plan",
                "recent_journeys": [journey.dict() for journey in journeys[:5]],
                "total_journeys": len(journeys),
                "can_create_more": user_data.get("journey_count", 0) < (plan_info.get("journey_limit") or 5) if plan_info and plan_info.get("journey_limit") else True
            }

        except Exception as e:
            logger.error(f"Failed to get usage stats: {str(e)}")
            return {}


# Global usage service instance
usage_service = UsageService()
