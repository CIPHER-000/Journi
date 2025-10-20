"""
OpenRouter AI Service
Development-mode AI service using OpenRouter as a fallback/alternative to OpenAI.
This service is used when ENV=development or when OpenAI credits are unavailable.

Reference: https://openrouter.ai/docs/quickstart
Best Practices: https://openrouter.ai/docs/api-reference/errors
"""

import os
import logging
import httpx
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


class OpenRouterService:
    """
    Dedicated service for OpenRouter API integration.
    Provides AI completions with consistent response formats for seamless frontend consumption.
    """
    
    def __init__(self):
        """Initialize OpenRouter service with API credentials and configuration"""
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.default_model = os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo")
        
        # Optional: Site info for OpenRouter rankings
        self.site_url = os.getenv("SITE_URL", "https://getjourni.netlify.app")
        self.site_name = os.getenv("SITE_NAME", "Journi")
        
        # Validate configuration
        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY not configured. Service may fail.")
        else:
            logger.info(f"OpenRouter service initialized with base URL: {self.base_url}")
    
    def get_headers(self) -> Dict[str, str]:
        """
        Get properly formatted headers for OpenRouter API requests.
        Includes authentication and optional site attribution for rankings.
        """
        if not self.api_key:
            raise ValueError(
                "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in environment."
            )
        
        return {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.site_url,  # Optional: for rankings on openrouter.ai
            "X-Title": self.site_name,       # Optional: site title for rankings
            "Content-Type": "application/json"
        }
    
    async def generate_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate a text completion using OpenRouter API.
        
        Args:
            prompt: The text prompt to complete
            model: Model to use (defaults to gpt-3.5-turbo)
            max_tokens: Maximum tokens in response
            temperature: Randomness (0.0 to 1.0)
        
        Returns:
            Dict with 'success', 'content', and optional 'error' fields
        
        Example:
            result = await service.generate_completion("What is AI?")
            if result['success']:
                print(result['content'])
            else:
                print(result['error'])
        """
        try:
            headers = self.get_headers()
            model_to_use = model or self.default_model
            
            # Convert simple prompt to messages format
            payload = {
                "model": model_to_use,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            logger.info(f"Generating completion with model: {model_to_use}")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                response.raise_for_status()
                data = response.json()
                
                # Extract content from response
                if data.get("choices") and len(data["choices"]) > 0:
                    content = data["choices"][0]["message"]["content"]
                    logger.info(f"Completion successful, {len(content)} characters generated")
                    
                    return {
                        "success": True,
                        "content": content,
                        "model": model_to_use,
                        "usage": data.get("usage", {})
                    }
                else:
                    logger.error("No choices in OpenRouter response")
                    return {
                        "success": False,
                        "error": "Invalid response structure from OpenRouter API"
                    }
        
        except httpx.HTTPStatusError as e:
            error_msg = self._parse_error_response(e.response)
            logger.error(f"OpenRouter HTTP error ({e.response.status_code}): {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "status_code": e.response.status_code
            }
        
        except httpx.TimeoutException:
            logger.error("OpenRouter request timed out")
            return {
                "success": False,
                "error": "Request timed out. Please try again."
            }
        
        except Exception as e:
            logger.error(f"Unexpected error in generate_completion: {str(e)}")
            return {
                "success": False,
                "error": f"Completion failed: {str(e)}"
            }
    
    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Generate a chat completion using OpenRouter API.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (defaults to gpt-3.5-turbo)
            max_tokens: Maximum tokens in response
            temperature: Randomness (0.0 to 1.0)
            stream: Whether to stream the response
        
        Returns:
            Dict with 'success', 'content', and optional 'error' fields
        
        Example:
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "What is customer journey mapping?"}
            ]
            result = await service.generate_chat_completion(messages)
        """
        try:
            headers = self.get_headers()
            model_to_use = model or self.default_model
            
            payload = {
                "model": model_to_use,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            if stream:
                payload["stream"] = True
            
            logger.info(f"Generating chat completion with model: {model_to_use}, messages: {len(messages)}")
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                response.raise_for_status()
                data = response.json()
                
                # Extract content from response
                if data.get("choices") and len(data["choices"]) > 0:
                    content = data["choices"][0]["message"]["content"]
                    finish_reason = data["choices"][0].get("finish_reason", "stop")
                    
                    logger.info(f"Chat completion successful: {finish_reason}, {len(content)} characters")
                    
                    return {
                        "success": True,
                        "content": content,
                        "model": model_to_use,
                        "finish_reason": finish_reason,
                        "usage": data.get("usage", {})
                    }
                else:
                    logger.error("No choices in OpenRouter response")
                    return {
                        "success": False,
                        "error": "Invalid response structure from OpenRouter API"
                    }
        
        except httpx.HTTPStatusError as e:
            error_msg = self._parse_error_response(e.response)
            logger.error(f"OpenRouter HTTP error ({e.response.status_code}): {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "status_code": e.response.status_code
            }
        
        except httpx.TimeoutException:
            logger.error("OpenRouter chat request timed out")
            return {
                "success": False,
                "error": "Chat request timed out. Please try again."
            }
        
        except Exception as e:
            logger.error(f"Unexpected error in generate_chat_completion: {str(e)}")
            return {
                "success": False,
                "error": f"Chat completion failed: {str(e)}"
            }
    
    def get_llm_for_crewai(
        self,
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> ChatOpenAI:
        """
        Get a LangChain ChatOpenAI instance configured for OpenRouter.
        Compatible with CrewAI agents.
        
        Args:
            model: Model to use (defaults to gpt-3.5-turbo)
            temperature: Randomness (0.0 to 1.0)
        
        Returns:
            ChatOpenAI instance ready for CrewAI integration
        
        Example:
            llm = service.get_llm_for_crewai(model="openai/gpt-4o", temperature=0.7)
            # Use with CrewAI agents
        """
        if not self.api_key:
            raise ValueError(
                "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in environment."
            )
        
        model_to_use = model or self.default_model
        
        logger.info(f"Creating ChatOpenAI instance for CrewAI with model: {model_to_use}")
        
        return ChatOpenAI(
            model=model_to_use,
            temperature=temperature,
            openai_api_key=self.api_key,
            openai_api_base=self.base_url,
            default_headers={
                "HTTP-Referer": self.site_url,
                "X-Title": self.site_name
            }
        )
    
    def _parse_error_response(self, response: httpx.Response) -> str:
        """
        Parse error response from OpenRouter API and return user-friendly message.
        
        Based on OpenRouter error documentation:
        https://openrouter.ai/docs/api-reference/errors
        """
        try:
            error_data = response.json()
            
            # OpenRouter error format: { "error": { "code": number, "message": string } }
            if "error" in error_data:
                error_obj = error_data["error"]
                
                if isinstance(error_obj, dict):
                    code = error_obj.get("code")
                    message = error_obj.get("message", "Unknown error")
                    
                    # Map common error codes to user-friendly messages
                    if code == 401 or response.status_code == 401:
                        return "Invalid or expired OpenRouter API key. Please check your API key in Settings."
                    elif code == 429 or response.status_code == 429:
                        return "Rate limit exceeded. Please wait before trying again."
                    elif code == 402 or response.status_code == 402:
                        return "Insufficient credits. Please add credits to your OpenRouter account."
                    elif code == 503 or response.status_code == 503:
                        return "Service temporarily unavailable. Please try again later."
                    else:
                        return f"OpenRouter API error: {message}"
                else:
                    return str(error_obj)
            
            return error_data.get("message", f"HTTP {response.status_code} error")
        
        except Exception:
            return f"HTTP {response.status_code}: {response.text[:200]}"
    
    async def validate_api_key(self) -> Dict[str, Any]:
        """
        Validate the OpenRouter API key by making a minimal test request.
        
        Returns:
            Dict with 'is_valid' bool and optional 'error_message'
        """
        try:
            if not self.api_key:
                return {
                    "is_valid": False,
                    "error_message": "No API key configured"
                }
            
            # Make a minimal test request
            result = await self.generate_completion(
                prompt="Test",
                max_tokens=5
            )
            
            if result["success"]:
                logger.info("OpenRouter API key validation successful")
                return {
                    "is_valid": True,
                    "error_message": None
                }
            else:
                logger.error(f"OpenRouter API key validation failed: {result.get('error')}")
                return {
                    "is_valid": False,
                    "error_message": result.get("error", "Validation failed")
                }
        
        except Exception as e:
            logger.error(f"Error validating OpenRouter API key: {str(e)}")
            return {
                "is_valid": False,
                "error_message": f"Validation error: {str(e)}"
            }


# Global OpenRouter service instance
# Note: This is used for development fallback or free-tier testing only
openrouter_service = OpenRouterService()
