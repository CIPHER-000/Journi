import os
from typing import Optional, Dict, Any, Tuple
from langchain_openai import ChatOpenAI
from ..models.auth import UserProfile, OpenAIKeyValidation
import logging
import openai

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.default_api_key = os.getenv("OPENAI_API_KEY")
        self.default_model = os.getenv("OPENAI_MODEL", "gpt-4o")
    
    def get_llm_for_user(self, user: Optional[UserProfile] = None, model: Optional[str] = None) -> ChatOpenAI:
        """Get OpenAI LLM instance with user's API key or fallback to default"""
        api_key = None
        
        # Use user's BYOK if available and user is on Pro plan
        if user and user.plan_type == 'pro' and user.openai_api_key:
            api_key = user.openai_api_key
            logger.info(f"Using BYOK for Pro user {user.id}")
        elif user and user.plan_type == 'starter':
            api_key = self.default_api_key
            logger.info(f"Using platform API key for Starter user {user.id}")
        else:
            api_key = self.default_api_key
            logger.info("Using default OpenAI API key")
        
        if not api_key:
            raise ValueError("No OpenAI API key available")
        
        return ChatOpenAI(
            model=model or self.default_model,
            temperature=0.7,
            openai_api_key=api_key
        )
    
    async def validate_openai_key(self, api_key: str) -> OpenAIKeyValidation:
        """Validate an OpenAI API key by making a test request"""
        try:
            # Create a test client
            client = openai.OpenAI(api_key=api_key)
            
            # Make a minimal test request
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            
            if response and response.choices:
                return OpenAIKeyValidation(
                    api_key=api_key,
                    is_valid=True,
                    error_message=None
                )
            else:
                return OpenAIKeyValidation(
                    api_key=api_key,
                    is_valid=False,
                    error_message="Invalid response from OpenAI API"
                )
                
        except openai.AuthenticationError:
            return OpenAIKeyValidation(
                api_key=api_key,
                is_valid=False,
                error_message="Invalid API key. Please check your OpenAI API key."
            )
        except openai.RateLimitError:
            # Rate limit means the key is valid but quota exceeded
            return OpenAIKeyValidation(
                api_key=api_key,
                is_valid=True,
                error_message="API key is valid but rate limited"
            )
        except openai.APIError as e:
            return OpenAIKeyValidation(
                api_key=api_key,
                is_valid=False,
                error_message=f"OpenAI API error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error validating OpenAI key: {str(e)}")
            return OpenAIKeyValidation(
                api_key=api_key,
                is_valid=False,
                error_message=f"Validation failed: {str(e)}"
            )
    
    def can_user_create_journey(self, user: UserProfile) -> bool:
        """Check if user can create a journey based on their plan and setup"""
        if user.plan_type == 'starter':
            return user.journey_count < 5
        elif user.plan_type == 'pro':
            return bool(user.openai_api_key)  # Pro users need their own API key
        else:
            return False

# Global OpenAI service instance
openai_service = OpenAIService()