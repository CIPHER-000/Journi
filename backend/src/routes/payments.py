"""
Payments API Routes
Handles payment initialization, verification, and webhooks
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
import logging
from src.controllers.paymentsController import PaymentsController
from src.database import get_db_connection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])


# Request/Response Models
class PaymentInitRequest(BaseModel):
    """Request model for payment initialization"""
    email: EmailStr = Field(..., description="Customer email address")
    plan: str = Field(..., description="Subscription plan (pro, enterprise)")
    user_id: Optional[str] = Field(None, description="User ID for tracking")


class PaymentInitResponse(BaseModel):
    """Response model for payment initialization"""
    success: bool
    authorization_url: str
    access_code: str
    reference: str
    message: str = "Payment initialized successfully. Redirecting to Paystack..."


class PaymentVerifyResponse(BaseModel):
    """Response model for payment verification"""
    success: bool
    status: str
    reference: str
    amount: int
    currency: str
    message: str


@router.post("/init", response_model=PaymentInitResponse)
async def initialize_payment(payload: PaymentInitRequest):
    """
    Initialize a Paystack payment transaction
    
    **Flow:**
    1. Client sends email, plan, and user_id
    2. Backend initializes payment with Paystack
    3. Returns authorization_url for redirect
    4. Client redirects user to Paystack checkout
    """
    try:
        # Calculate amount based on plan (in kobo)
        plan_prices = {
            "pro": 2900000,  # NGN 29,000 = 2,900,000 kobo
            "enterprise": 0  # Custom pricing - handled separately
        }

        amount = plan_prices.get(payload.plan.lower())
        if amount is None:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid plan: {payload.plan}. Must be 'pro' or 'enterprise'"
            )

        if payload.plan.lower() == "enterprise":
            raise HTTPException(
                status_code=400,
                detail="Please contact sales for Enterprise pricing"
            )

        # Prepare metadata
        metadata = {
            "plan": payload.plan,
            "user_id": payload.user_id,
            "custom_fields": [
                {
                    "display_name": "Plan Type",
                    "variable_name": "plan_type",
                    "value": payload.plan
                }
            ]
        }

        # Initialize transaction with Paystack
        result = await PaymentsController.initialize_transaction(
            email=payload.email,
            amount=amount,
            plan=payload.plan,
            metadata=metadata
        )

        logger.info(
            f"Payment initialized successfully - "
            f"Email: {payload.email}, Plan: {payload.plan}, Reference: {result['reference']}"
        )

        return PaymentInitResponse(
            success=True,
            authorization_url=result["authorization_url"],
            access_code=result["access_code"],
            reference=result["reference"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initializing payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to initialize payment. Please try again."
        )


@router.get("/verify/{reference}", response_model=PaymentVerifyResponse)
async def verify_payment(reference: str):
    """
    Verify a Paystack payment transaction
    
    **Flow:**
    1. User completes payment on Paystack
    2. Paystack redirects to callback URL
    3. Frontend calls this endpoint with reference
    4. Backend verifies payment with Paystack
    5. Updates user plan if payment successful
    """
    try:
        # Verify transaction with Paystack
        result = await PaymentsController.verify_transaction(reference)

        # Check if payment was successful
        if result["status"] != "success":
            return PaymentVerifyResponse(
                success=False,
                status=result["status"],
                reference=reference,
                amount=result["amount"],
                currency=result["currency"],
                message=f"Payment {result['status']}. Please try again or contact support."
            )

        # Extract metadata
        metadata = result.get("metadata", {})
        plan = metadata.get("plan", "pro")
        user_id = metadata.get("user_id")
        customer_email = result["customer"]["email"]

        # Update user's plan in database
        try:
            conn = await get_db_connection()
            
            update_query = """
                UPDATE users
                SET plan_type = $1,
                    payment_status = 'active',
                    last_payment_ref = $2,
                    updated_at = NOW()
                WHERE email = $3
                RETURNING id, email, plan_type
            """
            
            updated_user = await conn.fetchrow(
                update_query,
                plan,
                reference,
                customer_email
            )
            
            await conn.close()

            if not updated_user:
                logger.warning(
                    f"User not found for email: {customer_email}. "
                    f"Payment verified but plan not updated."
                )
            else:
                logger.info(
                    f"User plan updated successfully - "
                    f"User ID: {updated_user['id']}, Plan: {updated_user['plan_type']}"
                )

        except Exception as db_error:
            logger.error(f"Database error updating user plan: {str(db_error)}")
            # Payment was successful, but DB update failed
            # This should be handled by webhook as backup
            pass

        return PaymentVerifyResponse(
            success=True,
            status="success",
            reference=reference,
            amount=result["amount"],
            currency=result["currency"],
            message=f"Payment successful! Your {plan.title()} plan is now active."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to verify payment. Please contact support."
        )


@router.post("/webhook")
async def paystack_webhook(
    request: Request,
    x_paystack_signature: Optional[str] = Header(None)
):
    """
    Handle Paystack webhook events
    
    **Webhook Events:**
    - charge.success: Payment completed successfully
    - charge.failed: Payment failed
    - subscription.create: Subscription created
    - subscription.disable: Subscription cancelled
    
    **Security:**
    - Validates x-paystack-signature header
    - Uses HMAC SHA512 verification
    """
    try:
        # Get raw request body
        body = await request.body()
        
        # Verify webhook signature
        if not x_paystack_signature:
            logger.warning("Webhook received without signature")
            raise HTTPException(
                status_code=400,
                detail="Missing x-paystack-signature header"
            )

        is_valid = PaymentsController.verify_webhook_signature(
            body,
            x_paystack_signature
        )

        if not is_valid:
            logger.warning("Invalid webhook signature")
            raise HTTPException(
                status_code=400,
                detail="Invalid signature"
            )

        # Parse webhook event
        event_data = await request.json()
        
        # Process webhook event
        result = await PaymentsController.handle_webhook_event(event_data)

        # Handle action required
        if result.get("action_required") == "update_user_plan":
            # Update user plan in database
            try:
                customer_email = result.get("customer_email")
                metadata = result.get("metadata", {})
                plan = metadata.get("plan", "pro")
                reference = result.get("reference")

                conn = await get_db_connection()
                
                await conn.execute(
                    """
                    UPDATE users
                    SET plan_type = $1,
                        payment_status = 'active',
                        last_payment_ref = $2,
                        updated_at = NOW()
                    WHERE email = $3
                    """,
                    plan,
                    reference,
                    customer_email
                )
                
                await conn.close()
                
                logger.info(
                    f"User plan updated via webhook - "
                    f"Email: {customer_email}, Plan: {plan}"
                )

            except Exception as db_error:
                logger.error(f"Webhook DB error: {str(db_error)}")

        return {"status": "success", "message": "Webhook processed"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Webhook processing failed"
        )


@router.get("/status/{reference}")
async def get_payment_status(reference: str):
    """
    Get payment status by reference
    Lightweight endpoint for polling payment status
    """
    try:
        result = await PaymentsController.verify_transaction(reference)
        
        return {
            "success": True,
            "status": result["status"],
            "reference": reference,
            "amount": result["amount"] / 100,  # Convert kobo to Naira
            "currency": result["currency"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching payment status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch payment status"
        )
