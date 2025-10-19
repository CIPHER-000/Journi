"""
Optimized Paystack Payment Controller
Implements idempotency, caching, and best practices from Paystack docs
"""

import os
import hmac
import hashlib
import logging
from fastapi import HTTPException
import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncpg
from functools import lru_cache

logger = logging.getLogger(__name__)

# Paystack API Configuration
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
PAYSTACK_BASE_URL = "https://api.paystack.co"
PAYSTACK_CALLBACK_URL = os.getenv("PAYSTACK_CALLBACK_URL")

# Cache configuration
VERIFICATION_CACHE_TTL = 300  # 5 minutes
_verification_cache = {}  # In-memory cache {reference: (result, timestamp)}


class OptimizedPaymentsController:
    """Optimized controller for Paystack payment operations with idempotency"""

    def __init__(self, db_pool: asyncpg.Pool):
        """
        Initialize controller with database connection pool
        
        Args:
            db_pool: AsyncPG connection pool for Supabase
        """
        self.db_pool = db_pool

    async def initialize_transaction(
        self,
        email: str,
        amount: int,
        plan: str,
        user_id: Optional[str] = None,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Initialize a Paystack transaction with idempotency check
        
        Args:
            email: Customer's email address
            amount: Amount in kobo
            plan: Plan type ('pro', 'enterprise')
            user_id: User UUID
            metadata: Additional metadata
            
        Returns:
            Dict containing authorization_url, access_code, and reference
        """
        if not PAYSTACK_SECRET_KEY:
            raise HTTPException(status_code=500, detail="Paystack secret key not configured")

        # Check for existing pending transaction for this user/plan combo
        # This prevents duplicate initialization if user clicks button multiple times
        async with self.db_pool.acquire() as conn:
            existing = await conn.fetchrow(
                """
                SELECT reference, authorization_url, access_code, created_at
                FROM payment_transactions
                WHERE customer_email = $1 
                  AND plan_type = $2
                  AND status IN ('pending', 'processing')
                  AND created_at > NOW() - INTERVAL '30 minutes'
                ORDER BY created_at DESC
                LIMIT 1
                """,
                email, plan
            )

            if existing:
                logger.info(f"Reusing existing pending transaction: {existing['reference']}")
                return {
                    "success": True,
                    "authorization_url": existing["authorization_url"],
                    "access_code": existing["access_code"],
                    "reference": existing["reference"],
                    "cached": True
                }

        # Prepare request payload
        payload = {
            "email": email,
            "amount": amount,
            "currency": "NGN",
            "callback_url": PAYSTACK_CALLBACK_URL,
            "metadata": metadata or {"plan": plan, "user_id": user_id}
        }

        # Make API request to Paystack
        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{PAYSTACK_BASE_URL}/transaction/initialize",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                result = response.json()

                if not result.get("status"):
                    raise HTTPException(
                        status_code=400,
                        detail=result.get("message", "Transaction initialization failed")
                    )

                data = result["data"]

                # Store transaction in database for idempotency
                async with self.db_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO payment_transactions 
                        (reference, user_id, customer_email, amount, currency, status, 
                         plan_type, access_code, authorization_url, metadata)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT (reference) DO NOTHING
                        """,
                        data["reference"],
                        user_id,
                        email,
                        amount,
                        "NGN",
                        "pending",
                        plan,
                        data["access_code"],
                        data["authorization_url"],
                        payload["metadata"]
                    )

                logger.info(f"Payment initialized: {email} - Reference: {data['reference']}")

                return {
                    "success": True,
                    "authorization_url": data["authorization_url"],
                    "access_code": data["access_code"],
                    "reference": data["reference"],
                    "cached": False
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

    async def verify_transaction(
        self,
        reference: str,
        skip_cache: bool = False
    ) -> Dict[str, Any]:
        """
        Verify a Paystack transaction with caching to reduce API calls
        
        Args:
            reference: Paystack transaction reference
            skip_cache: Force fresh verification from Paystack
            
        Returns:
            Dict containing transaction status and details
        """
        # Check cache first (unless skipping)
        if not skip_cache:
            cached_result = self._get_cached_verification(reference)
            if cached_result:
                logger.info(f"Using cached verification for: {reference}")
                return cached_result

        # Check database first for already processed transactions
        async with self.db_pool.acquire() as conn:
            db_transaction = await conn.fetchrow(
                """
                SELECT * FROM payment_transactions
                WHERE reference = $1
                """,
                reference
            )

            # If already processed successfully, don't call Paystack again
            if db_transaction and db_transaction["processed"] and db_transaction["status"] == "success":
                logger.info(f"Transaction already processed: {reference}")
                result = {
                    "success": True,
                    "status": "success",
                    "reference": reference,
                    "amount": db_transaction["amount"],
                    "currency": db_transaction["currency"],
                    "customer": {"email": db_transaction["customer_email"]},
                    "metadata": db_transaction["metadata"],
                    "paid_at": db_transaction["paid_at"].isoformat() if db_transaction["paid_at"] else None,
                    "gateway_response": db_transaction["gateway_response"],
                    "from_cache": True
                }
                self._cache_verification(reference, result)
                return result

            # Increment verification count
            await conn.execute(
                """
                UPDATE payment_transactions
                SET verification_count = verification_count + 1,
                    last_verified_at = NOW()
                WHERE reference = $1
                """,
                reference
            )

        # Call Paystack API to verify
        if not PAYSTACK_SECRET_KEY:
            raise HTTPException(status_code=500, detail="Paystack secret key not configured")

        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
                    headers=headers
                )
                response.raise_for_status()
                result = response.json()

                if not result.get("status"):
                    raise HTTPException(
                        status_code=400,
                        detail=result.get("message", "Transaction verification failed")
                    )

                transaction_data = result["data"]

                # Update database with verification result
                async with self.db_pool.acquire() as conn:
                    await conn.execute(
                        """
                        UPDATE payment_transactions
                        SET status = $1,
                            channel = $2,
                            gateway_response = $3,
                            paid_at = $4,
                            authorization_code = $5,
                            updated_at = NOW()
                        WHERE reference = $6
                        """,
                        transaction_data["status"],
                        transaction_data.get("channel"),
                        transaction_data.get("gateway_response"),
                        transaction_data.get("paid_at"),
                        transaction_data.get("authorization", {}).get("authorization_code"),
                        reference
                    )

                logger.info(f"Payment verified - Reference: {reference}, Status: {transaction_data['status']}")

                result_dict = {
                    "success": True,
                    "status": transaction_data["status"],
                    "reference": transaction_data["reference"],
                    "amount": transaction_data["amount"],
                    "currency": transaction_data["currency"],
                    "customer": transaction_data["customer"],
                    "metadata": transaction_data.get("metadata", {}),
                    "paid_at": transaction_data.get("paid_at"),
                    "gateway_response": transaction_data.get("gateway_response"),
                    "from_cache": False
                }

                # Cache successful verifications
                if transaction_data["status"] == "success":
                    self._cache_verification(reference, result_dict)

                return result_dict

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

    async def process_webhook_event(
        self,
        event_data: Dict[str, Any],
        signature: str
    ) -> Dict[str, Any]:
        """
        Process Paystack webhook event with idempotency
        Critical: Prevents duplicate plan upgrades even if webhook sent multiple times
        
        Args:
            event_data: Webhook event payload
            signature: x-paystack-signature header value
            
        Returns:
            Dict with processing result
        """
        event_type = event_data.get("event")
        data = event_data.get("data", {})
        reference = data.get("reference")

        if not reference:
            logger.warning("Webhook received without reference")
            return {"success": False, "error": "No reference in webhook"}

        # IDEMPOTENCY CHECK: Has this event already been processed?
        async with self.db_pool.acquire() as conn:
            transaction = await conn.fetchrow(
                """
                SELECT id, processed, status, webhook_received_count
                FROM payment_transactions
                WHERE reference = $1
                FOR UPDATE  -- Lock row to prevent race conditions
                """,
                reference
            )

            if not transaction:
                logger.warning(f"Webhook for unknown transaction: {reference}")
                return {"success": False, "error": "Transaction not found"}

            # Increment webhook counter
            new_count = transaction["webhook_received_count"] + 1
            await conn.execute(
                """
                UPDATE payment_transactions
                SET webhook_received_count = $1,
                    last_webhook_at = NOW()
                WHERE reference = $2
                """,
                new_count,
                reference
            )

            # If already processed, log and return success (idempotent)
            if transaction["processed"]:
                logger.info(
                    f"Webhook for already processed transaction: {reference} "
                    f"(count: {new_count})"
                )
                return {
                    "success": True,
                    "already_processed": True,
                    "reference": reference,
                    "webhook_count": new_count
                }

        logger.info(f"Processing webhook event: {event_type} for {reference}")

        # Handle charge.success event
        if event_type == "charge.success":
            customer_email = data.get("customer", {}).get("email")
            amount = data.get("amount")
            metadata = data.get("metadata", {})
            plan = metadata.get("plan", "pro")
            user_id = metadata.get("user_id")

            # Use database transaction to ensure atomicity
            async with self.db_pool.acquire() as conn:
                async with conn.transaction():
                    # Mark as processed FIRST (idempotency)
                    await conn.execute(
                        """
                        UPDATE payment_transactions
                        SET processed = TRUE,
                            processed_at = NOW(),
                            status = 'success'
                        WHERE reference = $1 AND processed = FALSE
                        """,
                        reference
                    )

                    # Check if update actually happened (race condition protection)
                    check = await conn.fetchval(
                        "SELECT processed_at FROM payment_transactions WHERE reference = $1",
                        reference
                    )

                    if not check:
                        logger.warning(f"Race condition detected for {reference}")
                        return {
                            "success": True,
                            "already_processed": True,
                            "reference": reference
                        }

                    # Update user plan
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

                    if not updated_user:
                        logger.warning(f"User not found for email: {customer_email}")
                    else:
                        logger.info(
                            f"User plan updated via webhook - "
                            f"User: {updated_user['id']}, Plan: {updated_user['plan_type']}"
                        )

            return {
                "success": True,
                "event": event_type,
                "reference": reference,
                "processed": True
            }

        # Handle other events
        logger.info(f"Unhandled webhook event: {event_type}")
        return {"success": True, "event": event_type, "action_required": "none"}

    @staticmethod
    def verify_webhook_signature(payload: bytes, signature: str) -> bool:
        """Verify Paystack webhook signature"""
        if not PAYSTACK_SECRET_KEY:
            return False

        computed_signature = hmac.new(
            PAYSTACK_SECRET_KEY.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()

        return hmac.compare_digest(computed_signature, signature)

    def _get_cached_verification(self, reference: str) -> Optional[Dict[str, Any]]:
        """Get cached verification result if still valid"""
        if reference in _verification_cache:
            result, timestamp = _verification_cache[reference]
            if datetime.now() - timestamp < timedelta(seconds=VERIFICATION_CACHE_TTL):
                return {**result, "from_cache": True}
            else:
                # Expired, remove from cache
                del _verification_cache[reference]
        return None

    def _cache_verification(self, reference: str, result: Dict[str, Any]):
        """Cache verification result"""
        _verification_cache[reference] = (result, datetime.now())

        # Simple cache cleanup: remove old entries if cache gets too large
        if len(_verification_cache) > 1000:
            # Remove oldest 20% of entries
            sorted_items = sorted(
                _verification_cache.items(),
                key=lambda x: x[1][1]
            )
            for key, _ in sorted_items[:200]:
                del _verification_cache[key]
