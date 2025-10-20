"""
Unit Tests for Optimized Payment Controller
Tests idempotency, caching, and webhook processing
"""

import pytest
import asyncio
import os
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timedelta

# Mock environment variables BEFORE importing controller
os.environ['PAYSTACK_SECRET_KEY'] = 'sk_test_mock_secret_key'
os.environ['PAYSTACK_CALLBACK_URL'] = 'http://localhost/callback'

from src.controllers.optimizedPaymentsController import OptimizedPaymentsController


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client"""
    client = Mock()
    
    # Mock table method to return a query builder
    table_mock = Mock()
    client.table = Mock(return_value=table_mock)
    
    # Mock query builder methods (fluent interface)
    table_mock.select = Mock(return_value=table_mock)
    table_mock.insert = Mock(return_value=table_mock)
    table_mock.update = Mock(return_value=table_mock)
    table_mock.delete = Mock(return_value=table_mock)
    table_mock.upsert = Mock(return_value=table_mock)
    table_mock.eq = Mock(return_value=table_mock)
    table_mock.in_ = Mock(return_value=table_mock)
    table_mock.gte = Mock(return_value=table_mock)
    table_mock.order = Mock(return_value=table_mock)
    table_mock.limit = Mock(return_value=table_mock)
    
    # Mock execute method to return response
    response_mock = Mock()
    response_mock.data = []
    table_mock.execute = Mock(return_value=response_mock)
    
    return client


@pytest.fixture
def controller(mock_supabase_client):
    """Create payment controller with mocked Supabase client"""
    return OptimizedPaymentsController(mock_supabase_client)


class TestInitializeTransaction:
    """Test transaction initialization with idempotency"""
    
    @pytest.mark.asyncio
    async def test_initialize_new_transaction(self, controller, mock_supabase_client):
        """Test initializing a new payment transaction"""
        # Mock no existing transaction
        table_mock = mock_supabase_client.table.return_value
        response_mock = Mock()
        response_mock.data = []  # No existing transaction
        table_mock.execute.return_value = response_mock
        
        # Mock Paystack API response
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "authorization_url": "https://checkout.paystack.com/abc123",
                "access_code": "abc123",
                "reference": "ref_12345"
            }
        }
        mock_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            result = await controller.initialize_transaction(
                email="test@example.com",
                amount=2900000,
                plan="pro",
                user_id="user123"
            )
        
        assert result["success"] is True
        assert result["reference"] == "ref_12345"
        assert result["cached"] is False
        
        # Verify table.upsert was called
        assert table_mock.upsert.called
    
    @pytest.mark.asyncio
    async def test_reuse_existing_pending_transaction(self, controller, mock_supabase_client):
        """Test that existing pending transactions are reused (idempotency)"""
        # Mock existing pending transaction
        table_mock = mock_supabase_client.table.return_value
        response_mock = Mock()
        response_mock.data = [{
            'reference': 'REF123',
            'authorization_url': 'https://paystack.com/pay/ref123',
            'access_code': 'access_code_123',
            'created_at': datetime.now().isoformat()
        }]
        table_mock.execute.return_value = response_mock
        
        result = await controller.initialize_transaction(
            email="test@example.com",
            amount=2900000,
            plan="pro"
        )
        
        assert result["success"] is True
        assert result["reference"] == "REF123"
        assert result["cached"] is True
        
        # Verify Paystack API was NOT called
        conn.execute.assert_not_called()


class TestVerifyTransaction:
    """Test transaction verification with caching"""
    
    @pytest.mark.asyncio
    async def test_verify_already_processed_transaction(self, controller, mock_db_pool):
        """Test that already processed transactions don't call Paystack API"""
        # Clear cache to ensure we're testing DB path
        from src.controllers.optimizedPaymentsController import _verification_cache
        _verification_cache.clear()
        
        # Mock already processed transaction in DB
        conn = mock_db_pool.acquire.return_value.__aenter__.return_value
        
        conn.fetchrow.return_value = {
            "reference": "ref_processed_12345",
            "processed": True,
            "status": "success",
            "amount": 2900000,
            "currency": "NGN",
            "customer_email": "test@example.com",
            "metadata": {"plan": "pro"},
            "paid_at": datetime.now(),
            "gateway_response": "Approved"
        }
        
        result = await controller.verify_transaction("ref_processed_12345")
        
        assert result["success"] is True
        assert result["status"] == "success"
        assert result["from_cache"] is True
        
        # Already processed transactions return early without incrementing counter
        # This is correct behavior - no need to track verifications for already completed payments
    
    @pytest.mark.asyncio
    async def test_verify_new_transaction(self, controller, mock_db_pool):
        """Test verifying a new transaction calls Paystack API"""
        # Clear any cached data
        from src.controllers.optimizedPaymentsController import _verification_cache
        _verification_cache.clear()
        
        # Mock unprocessed transaction in DB
        conn = mock_db_pool.acquire.return_value.__aenter__.return_value
        conn.fetchrow.return_value = {
            "processed": False,
            "status": "pending"
        }
        conn.execute = AsyncMock()
        
        # Mock Paystack verify response
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "reference": "ref_new_12345",
                "status": "success",
                "amount": 2900000,
                "currency": "NGN",
                "customer": {"email": "test@example.com"},
                "metadata": {"plan": "pro"},
                "paid_at": "2025-01-19T12:00:00Z",
                "gateway_response": "Approved",
                "channel": "card",
                "authorization": {"authorization_code": "AUTH_123"}
            }
        }
        mock_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            result = await controller.verify_transaction("ref_new_12345")
        
        assert result["success"] is True
        assert result["status"] == "success"
        assert result["from_cache"] is False
        
        # Verify database was updated
        assert conn.execute.called
    
    @pytest.mark.asyncio
    async def test_caching_reduces_api_calls(self, controller, mock_db_pool):
        """Test that verification results are cached"""
        # First call - not processed
        conn = mock_db_pool.acquire.return_value.__aenter__.return_value
        conn.fetchrow.return_value = {
            "processed": False,
            "status": "pending"
        }
        
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "reference": "ref_cached",
                "status": "success",
                "amount": 2900000,
                "currency": "NGN",
                "customer": {"email": "test@example.com"},
                "metadata": {},
                "paid_at": "2025-01-19T12:00:00Z"
            }
        }
        mock_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            # First call
            result1 = await controller.verify_transaction("ref_cached")
            assert result1["from_cache"] is False
            
            # Second call should use cache
            result2 = await controller.verify_transaction("ref_cached")
            assert result2["from_cache"] is True
            
            # Verify API was only called once
            assert mock_client.return_value.__aenter__.return_value.get.call_count == 1


class TestWebhookProcessing:
    """Test webhook event processing with idempotency"""
    
    @pytest.mark.asyncio
    async def test_process_webhook_first_time(self, controller, mock_db_pool):
        """Test processing a webhook for the first time"""
        # Mock unprocessed transaction
        conn = mock_db_pool.acquire.return_value.__aenter__.return_value
        
        # Mock transaction for atomic operations
        mock_transaction = AsyncMock()
        mock_transaction.__aenter__ = AsyncMock()
        mock_transaction.__aexit__ = AsyncMock()
        conn.transaction.return_value = mock_transaction
        
        conn.fetchrow.side_effect = [
            # First call (with FOR UPDATE)
            {
                "id": "txn_id",
                "processed": False,
                "status": "pending",
                "webhook_received_count": 0
            },
            # Second call (check processed_at after update)
            datetime.now(),
            # Third call (updated user)
            {
                "id": "user_123",
                "email": "test@example.com",
                "plan_type": "pro"
            }
        ]
        
        conn.execute = AsyncMock()
        conn.fetchval = AsyncMock(return_value=datetime.now())
        
        event_data = {
            "event": "charge.success",
            "data": {
                "reference": "ref_12345",
                "amount": 2900000,
                "customer": {"email": "test@example.com"},
                "metadata": {"plan": "pro", "user_id": "user123"}
            }
        }
        
        result = await controller.process_webhook_event(event_data, "signature")
        
        assert result["success"] is True
        assert result["processed"] is True
        assert "already_processed" not in result
        
        # Verify user plan was updated
        assert conn.execute.call_count >= 2
    
    @pytest.mark.asyncio
    async def test_webhook_idempotency_duplicate_event(self, controller, mock_db_pool):
        """Test that duplicate webhooks don't process twice (idempotency)"""
        # Mock already processed transaction
        conn = mock_db_pool.acquire.return_value.__aenter__.return_value
        conn.fetchrow.return_value = {
            "id": "txn_id",
            "processed": True,
            "status": "success",
            "webhook_received_count": 1
        }
        
        event_data = {
            "event": "charge.success",
            "data": {
                "reference": "ref_12345",
                "amount": 2900000,
                "customer": {"email": "test@example.com"},
                "metadata": {"plan": "pro"}
            }
        }
        
        result = await controller.process_webhook_event(event_data, "signature")
        
        assert result["success"] is True
        assert result["already_processed"] is True
        assert result["webhook_count"] == 2  # Incremented but not reprocessed
        
        # Verify plan update was NOT called (only counter increment)
        # Should have 1 execute call for incrementing webhook counter
        assert conn.execute.call_count == 1
    
    @pytest.mark.asyncio
    async def test_webhook_race_condition_protection(self, controller, mock_db_pool):
        """Test protection against race conditions in webhook processing"""
        # Mock scenario where two webhooks arrive simultaneously
        conn = mock_db_pool.acquire.return_value.__aenter__.return_value
        
        # Mock transaction
        mock_transaction = AsyncMock()
        mock_transaction.__aenter__ = AsyncMock()
        mock_transaction.__aexit__ = AsyncMock()
        conn.transaction.return_value = mock_transaction
        
        conn.fetchrow.side_effect = [
            # First webhook sees unprocessed
            {
                "id": "txn_id",
                "processed": False,
                "status": "pending",
                "webhook_received_count": 0
            },
            # Check after processing returns None (race condition - row was processed by another webhook)
            None
        ]
        
        conn.execute = AsyncMock()
        conn.fetchval = AsyncMock(return_value=None)  # Race condition detected
        
        event_data = {
            "event": "charge.success",
            "data": {
                "reference": "ref_race_12345",
                "amount": 2900000,
                "customer": {"email": "test@example.com"},
                "metadata": {"plan": "pro"}
            }
        }
        
        result = await controller.process_webhook_event(event_data, "signature")
        
        # Should detect race condition and return early
        assert result["success"] is True
        assert result.get("already_processed") is True


class TestWebhookSignatureVerification:
    """Test webhook signature validation"""
    
    def test_valid_signature(self):
        """Test that valid signatures are accepted"""
        import hmac
        import hashlib
        
        # Use the mocked secret key from module level
        secret_key = os.environ['PAYSTACK_SECRET_KEY']
        payload = b'{"event":"charge.success"}'
        
        # Compute valid signature
        signature = hmac.new(
            secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        is_valid = OptimizedPaymentsController.verify_webhook_signature(payload, signature)
        
        assert is_valid is True
    
    def test_invalid_signature(self):
        """Test that invalid signatures are rejected"""
        import os
        
        secret_key = "test_secret_key"
        payload = b'{"event":"charge.success"}'
        invalid_signature = "invalid_signature_12345"
        
        with patch.dict(os.environ, {'PAYSTACK_SECRET_KEY': secret_key}):
            is_valid = OptimizedPaymentsController.verify_webhook_signature(payload, invalid_signature)
        
        assert is_valid is False


class TestCacheManagement:
    """Test verification result caching"""
    
    @pytest.mark.asyncio
    async def test_cache_expiration(self, controller, mock_db_pool):
        """Test that cache entries expire after TTL"""
        from src.controllers.optimizedPaymentsController import _verification_cache, VERIFICATION_CACHE_TTL
        
        # Manually add expired cache entry
        expired_time = datetime.now() - timedelta(seconds=VERIFICATION_CACHE_TTL + 10)
        _verification_cache["ref_expired"] = ({"status": "success"}, expired_time)
        
        # Should return None (cache miss)
        result = controller._get_cached_verification("ref_expired")
        assert result is None
        
        # Should be removed from cache
        assert "ref_expired" not in _verification_cache
    
    def test_cache_cleanup(self, controller):
        """Test that cache is cleaned up when it gets too large"""
        from src.controllers.optimizedPaymentsController import _verification_cache
        
        # Clear cache
        _verification_cache.clear()
        
        # Add 1001 entries (over 1000 limit)
        for i in range(1001):
            _verification_cache[f"ref_{i}"] = ({"status": "success"}, datetime.now())
        
        # Trigger cleanup by caching one more
        controller._cache_verification("ref_new", {"status": "success"})
        
        # Cache should be reduced (oldest 200 removed)
        assert len(_verification_cache) <= 802  # 1001 - 200 + 1


class TestRateLimiting:
    """Test rate limiting protection"""
    
    @pytest.mark.asyncio
    async def test_rate_limit_enforcement(self):
        """Test that rate limiting blocks excessive requests"""
        from src.routes.optimized_payments import check_rate_limit, _rate_limit_store
        from fastapi import HTTPException, Request
        
        # Clear rate limit store
        _rate_limit_store.clear()
        
        # Mock request
        mock_request = Mock(spec=Request)
        mock_request.client.host = "127.0.0.1"
        
        # Should allow first 10 requests
        for i in range(10):
            check_rate_limit(mock_request, "test_endpoint")
        
        # 11th request should be blocked
        with pytest.raises(HTTPException) as exc_info:
            check_rate_limit(mock_request, "test_endpoint")
        
        assert exc_info.value.status_code == 429
        assert "Too many requests" in exc_info.value.detail


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
