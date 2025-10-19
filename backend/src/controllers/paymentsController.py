"""
Paystack Payment Controller
Handles all payment-related operations using Paystack API
"""

import os
import hmac
import hashlib
import logging
from fastapi import HTTPException
import httpx
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Paystack API Configuration
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
PAYSTACK_BASE_URL = "https://api.paystack.co"
PAYSTACK_CALLBACK_URL = os.getenv("PAYSTACK_CALLBACK_URL")


class PaymentsController:
    """Controller for Paystack payment operations"""

    @staticmethod
    async def initialize_transaction(
        email: str,
        amount: int,
        plan: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Initialize a Paystack transaction
        
        Args:
            email: Customer's email address
            amount: Amount in kobo (multiply Naira by 100)
            plan: Plan type ('pro', 'enterprise')
            metadata: Additional metadata to attach to transaction
            
        Returns:
            Dict containing authorization_url, access_code, and reference
        """
        if not PAYSTACK_SECRET_KEY:
            raise HTTPException(
                status_code=500,
                detail="Paystack secret key not configured"
            )

        # Prepare request payload
        payload = {
            "email": email,
            "amount": amount,  # Amount in kobo (e.g., 2900000 for NGN 29,000)
            "currency": "NGN",
            "callback_url": PAYSTACK_CALLBACK_URL,
            "metadata": metadata or {"plan": plan}
        }

        # Make API request to Paystack
        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{PAYSTACK_BASE_URL}/transaction/initialize",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )

                # Check for HTTP errors
                response.raise_for_status()
                
                result = response.json()
                
                # Validate Paystack response
                if not result.get("status"):
                    raise HTTPException(
                        status_code=400,
                        detail=result.get("message", "Transaction initialization failed")
                    )

                logger.info(f"Payment initialized for {email} - Reference: {result['data']['reference']}")
                
                return {
                    "success": True,
                    "authorization_url": result["data"]["authorization_url"],
                    "access_code": result["data"]["access_code"],
                    "reference": result["data"]["reference"]
                }

        except httpx.HTTPStatusError as e:
            logger.error(f"Paystack HTTP error: {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Payment gateway error: {e.response.text}"
            )
        except httpx.RequestError as e:
            logger.error(f"Paystack request error: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Payment gateway unavailable. Please try again later."
            )
        except Exception as e:
            logger.error(f"Unexpected error initializing payment: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while initializing payment"
            )

    @staticmethod
    async def verify_transaction(reference: str) -> Dict[str, Any]:
        """
        Verify a Paystack transaction
        
        Args:
            reference: Paystack transaction reference
            
        Returns:
            Dict containing transaction status and details
        """
        if not PAYSTACK_SECRET_KEY:
            raise HTTPException(
                status_code=500,
                detail="Paystack secret key not configured"
            )

        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
                    headers=headers,
                    timeout=30.0
                )

                response.raise_for_status()
                result = response.json()

                if not result.get("status"):
                    raise HTTPException(
                        status_code=400,
                        detail=result.get("message", "Transaction verification failed")
                    )

                transaction_data = result["data"]
                
                logger.info(f"Payment verified - Reference: {reference}, Status: {transaction_data['status']}")

                return {
                    "success": True,
                    "status": transaction_data["status"],
                    "reference": transaction_data["reference"],
                    "amount": transaction_data["amount"],
                    "currency": transaction_data["currency"],
                    "customer": transaction_data["customer"],
                    "metadata": transaction_data.get("metadata", {}),
                    "paid_at": transaction_data.get("paid_at"),
                    "gateway_response": transaction_data.get("gateway_response")
                }

        except httpx.HTTPStatusError as e:
            logger.error(f"Paystack verification HTTP error: {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Payment verification error: {e.response.text}"
            )
        except httpx.RequestError as e:
            logger.error(f"Paystack verification request error: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Payment gateway unavailable. Please try again later."
            )
        except Exception as e:
            logger.error(f"Unexpected error verifying payment: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while verifying payment"
            )

    @staticmethod
    def verify_webhook_signature(payload: bytes, signature: str) -> bool:
        """
        Verify Paystack webhook signature
        
        Args:
            payload: Request body as bytes
            signature: x-paystack-signature header value
            
        Returns:
            bool: True if signature is valid
        """
        if not PAYSTACK_SECRET_KEY:
            return False

        # Compute HMAC signature
        computed_signature = hmac.new(
            PAYSTACK_SECRET_KEY.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()

        # Compare signatures
        return hmac.compare_digest(computed_signature, signature)

    @staticmethod
    async def handle_webhook_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle Paystack webhook events
        
        Args:
            event_data: Webhook event payload
            
        Returns:
            Dict with processing result
        """
        event_type = event_data.get("event")
        data = event_data.get("data", {})

        logger.info(f"Processing webhook event: {event_type}")

        if event_type == "charge.success":
            # Payment successful
            reference = data.get("reference")
            customer_email = data.get("customer", {}).get("email")
            amount = data.get("amount")
            metadata = data.get("metadata", {})
            
            logger.info(
                f"Successful payment webhook - "
                f"Reference: {reference}, Email: {customer_email}, Amount: {amount}"
            )

            return {
                "success": True,
                "event": event_type,
                "reference": reference,
                "customer_email": customer_email,
                "amount": amount,
                "metadata": metadata,
                "action_required": "update_user_plan"
            }

        elif event_type == "charge.failed":
            # Payment failed
            reference = data.get("reference")
            logger.warning(f"Failed payment webhook - Reference: {reference}")
            
            return {
                "success": False,
                "event": event_type,
                "reference": reference,
                "action_required": "notify_user_of_failure"
            }

        else:
            # Other events (log but don't process)
            logger.info(f"Unhandled webhook event: {event_type}")
            return {
                "success": True,
                "event": event_type,
                "action_required": "none"
            }
