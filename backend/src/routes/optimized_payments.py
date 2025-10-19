"""
Optimized Payments API Routes
With idempotency, caching, rate limiting, and best practices
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timedelta
from collections import defaultdict
import asyncpg

from src.controllers.optimizedPaymentsController import OptimizedPaymentsController
from src.database import get_db_pool

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v2/payments", tags=["payments-v2"])

# Simple in-memory rate limiter
# Format: {ip_address: [(timestamp1, endpoint1), (timestamp2, endpoint2), ...]}
_rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 10  # requests per window


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
    message: str = "Payment initialized successfully"
    cached: bool = False  # Whether response was from cache


class PaymentVerifyResponse(BaseModel):
    """Response model for payment verification"""
    success: bool
    status: str
    reference: str
    amount: int
    currency: str
    message: str
    from_cache: bool = False


# Dependency: Get payment controller
async def get_payment_controller(
    db_pool: asyncpg.Pool = Depends(get_db_pool)
) -> OptimizedPaymentsController:
    """Dependency to get payment controller with DB pool"""
    return OptimizedPaymentsController(db_pool)


# Rate limiting middleware
def check_rate_limit(request: Request, endpoint: str):
    """
    Simple rate limiter to prevent abuse
    
    Args:
        request: FastAPI request object
        endpoint: Endpoint name for tracking
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    client_ip = request.client.host
    now = datetime.now()
    
    # Clean old entries
    _rate_limit_store[client_ip] = [
        (ts, ep) for ts, ep in _rate_limit_store[client_ip]
        if now - ts < timedelta(seconds=RATE_LIMIT_WINDOW)
    ]
    
    # Check limit
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning(f"Rate limit exceeded for {client_ip} on {endpoint}")
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please wait {RATE_LIMIT_WINDOW} seconds."
        )
    
    # Add current request
    _rate_limit_store[client_ip].append((now, endpoint))


@router.post("/init", response_model=PaymentInitResponse)
async def initialize_payment(
    payload: PaymentInitRequest,
    request: Request,
    controller: OptimizedPaymentsController = Depends(get_payment_controller)
):
    """
    Initialize a Paystack payment transaction
    
    **Optimizations:**
    - Checks for existing pending transactions (prevents duplicate init)
    - Rate limiting to prevent abuse
    - Stores in database for idempotency
    
    **Flow:**
    1. Check rate limit
    2. Check for existing pending transaction
    3. Initialize with Paystack (if needed)
    4. Store in database
    5. Return authorization URL
    """
    try:
        # Rate limiting
        check_rate_limit(request, "payment_init")
        
        # Validate plan
        plan_prices = {
            "pro": 2900000,  # NGN 29,000 = 2,900,000 kobo
            "enterprise": 0  # Custom pricing
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
            "initiated_at": datetime.utcnow().isoformat(),
            "custom_fields": [
                {
                    "display_name": "Plan Type",
                    "variable_name": "plan_type",
                    "value": payload.plan
                }
            ]
        }

        # Initialize transaction (with idempotency check)
        result = await controller.initialize_transaction(
            email=payload.email,
            amount=amount,
            plan=payload.plan,
            user_id=payload.user_id,
            metadata=metadata
        )

        logger.info(
            f"Payment init - Email: {payload.email}, Plan: {payload.plan}, "
            f"Reference: {result['reference']}, Cached: {result.get('cached', False)}"
        )

        return PaymentInitResponse(
            success=True,
            authorization_url=result["authorization_url"],
            access_code=result["access_code"],
            reference=result["reference"],
            cached=result.get("cached", False),
            message="Redirecting to Paystack..." if not result.get("cached") else "Reusing existing payment session"
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
async def verify_payment(
    reference: str,
    request: Request,
    skip_cache: bool = False,
    controller: OptimizedPaymentsController = Depends(get_payment_controller)
):
    """
    Verify a Paystack payment transaction
    
    **Optimizations:**
    - Caching to reduce Paystack API calls
    - Checks database first for processed transactions
    - Tracks verification count for analytics
    - Idempotent plan updates
    
    **Query Parameters:**
    - skip_cache: Force fresh verification from Paystack (default: false)
    
    **Flow:**
    1. Check rate limit
    2. Check cache (if not skipped)
    3. Check database for processed transaction
    4. Call Paystack API (if needed)
    5. Update user plan (if successful and not already processed)
    6. Return result
    """
    try:
        # Rate limiting
        check_rate_limit(request, "payment_verify")
        
        # Verify transaction (with caching)
        result = await controller.verify_transaction(reference, skip_cache=skip_cache)

        # Update user plan if payment successful and not already processed
        if result["status"] == "success" and not result.get("from_cache"):
            try:
                metadata = result.get("metadata", {})
                plan = metadata.get("plan", "pro")
                customer_email = result["customer"]["email"]

                # Use controller's DB pool
                async with controller.db_pool.acquire() as conn:
                    # Check if already processed
                    processed = await conn.fetchval(
                        "SELECT processed FROM payment_transactions WHERE reference = $1",
                        reference
                    )

                    if not processed:
                        # Mark as processed and update user
                        async with conn.transaction():
                            await conn.execute(
                                """
                                UPDATE payment_transactions
                                SET processed = TRUE, processed_at = NOW()
                                WHERE reference = $1 AND processed = FALSE
                                """,
                                reference
                            )

                            updated_user = await conn.fetchrow(
                                """
                                UPDATE users
                                SET plan_type = $1,
                                    payment_status = 'active',
                                    last_payment_ref = $2,
                                    updated_at = NOW()
                                WHERE email = $3
                                RETURNING id, email, plan_type
                                """,
                                plan,
                                reference,
                                customer_email
                            )

                            if updated_user:
                                logger.info(
                                    f"User plan updated via verify - "
                                    f"User: {updated_user['id']}, Plan: {updated_user['plan_type']}"
                                )
                    else:
                        logger.info(f"Transaction {reference} already processed, skipping update")

            except Exception as db_error:
                logger.error(f"Database error updating user plan: {str(db_error)}")
                # Don't fail the request - webhook will handle it

        return PaymentVerifyResponse(
            success=True,
            status=result["status"],
            reference=reference,
            amount=result["amount"],
            currency=result["currency"],
            from_cache=result.get("from_cache", False),
            message=f"Payment {result['status']}" + 
                   (f" - Your {result.get('metadata', {}).get('plan', 'Pro')} plan is now active!" 
                    if result["status"] == "success" else "")
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
    x_paystack_signature: Optional[str] = Header(None),
    controller: OptimizedPaymentsController = Depends(get_payment_controller)
):
    """
    Handle Paystack webhook events with idempotency
    
    **Security:**
    - Validates x-paystack-signature header (HMAC SHA512)
    - Rejects webhooks without valid signature
    
    **Idempotency:**
    - Checks if transaction already processed
    - Uses database transaction for atomicity
    - Prevents duplicate plan upgrades
    - Tracks webhook call count
    
    **Events Handled:**
    - charge.success: Payment completed successfully
    - charge.failed: Payment failed
    - Other events logged but not processed
    """
    try:
        # Get raw request body for signature verification
        body = await request.body()
        
        # Verify webhook signature
        if not x_paystack_signature:
            logger.warning("Webhook received without signature")
            raise HTTPException(
                status_code=400,
                detail="Missing x-paystack-signature header"
            )

        is_valid = OptimizedPaymentsController.verify_webhook_signature(
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
        
        # Process webhook event (with idempotency)
        result = await controller.process_webhook_event(event_data, x_paystack_signature)

        # Always return 200 OK (Paystack best practice)
        return {
            "status": "success",
            "message": "Webhook processed",
            **result
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        # Still return 200 to prevent Paystack retries
        return {
            "status": "error",
            "message": "Webhook processing failed",
            "error": str(e)
        }


@router.get("/status/{reference}")
async def get_payment_status(
    reference: str,
    request: Request,
    controller: OptimizedPaymentsController = Depends(get_payment_controller)
):
    """
    Get payment status by reference (lightweight endpoint for polling)
    
    **Optimizations:**
    - Uses cache if available
    - Checks database first
    - Rate limited
    """
    try:
        # Rate limiting
        check_rate_limit(request, "payment_status")
        
        result = await controller.verify_transaction(reference, skip_cache=False)
        
        return {
            "success": True,
            "status": result["status"],
            "reference": reference,
            "amount": result["amount"] / 100,  # Convert kobo to Naira
            "currency": result["currency"],
            "from_cache": result.get("from_cache", False)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching payment status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch payment status"
        )


@router.get("/history")
async def get_payment_history(
    request: Request,
    limit: int = 10,
    offset: int = 0,
    controller: OptimizedPaymentsController = Depends(get_payment_controller)
):
    """
    Get payment history for authenticated user
    
    **Query Parameters:**
    - limit: Number of records to return (default: 10, max: 50)
    - offset: Number of records to skip (default: 0)
    """
    try:
        # Rate limiting
        check_rate_limit(request, "payment_history")
        
        # Validate limits
        limit = min(limit, 50)
        
        # TODO: Extract user_id from authentication token
        # For now, return empty list
        
        return {
            "success": True,
            "payments": [],
            "limit": limit,
            "offset": offset,
            "total": 0
        }

    except Exception as e:
        logger.error(f"Error fetching payment history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch payment history"
        )
