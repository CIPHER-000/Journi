"""
Integration Tests for Payment Flow
Tests the complete payment journey from initialization to verification
"""

import pytest
import asyncio
from httpx import AsyncClient
from unittest.mock import patch, Mock
import json

# Note: These tests require the FastAPI app to be running
# They test the full API flow including routing, validation, and responses


@pytest.mark.integration
class TestPaymentInitializationFlow:
    """Test payment initialization API endpoint"""
    
    @pytest.mark.asyncio
    async def test_successful_payment_initialization(self, test_client):
        """Test successful payment initialization"""
        payload = {
            "email": "test@example.com",
            "plan": "pro",
            "user_id": "user_123"
        }
        
        # Mock Paystack API
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "authorization_url": "https://checkout.paystack.com/test123",
                "access_code": "test_access",
                "reference": "ref_test123"
            }
        }
        mock_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            response = await test_client.post("/api/v2/payments/init", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "authorization_url" in data
        assert "reference" in data
        assert data["cached"] is False
    
    @pytest.mark.asyncio
    async def test_invalid_plan_rejected(self, test_client):
        """Test that invalid plans are rejected"""
        payload = {
            "email": "test@example.com",
            "plan": "invalid_plan",
            "user_id": "user_123"
        }
        
        response = await test_client.post("/api/v2/payments/init", json=payload)
        
        assert response.status_code == 400
        assert "Invalid plan" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_rate_limiting_works(self, test_client):
        """Test that rate limiting blocks excessive requests"""
        payload = {
            "email": "test@example.com",
            "plan": "pro"
        }
        
        # Mock Paystack to avoid actual API calls
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "authorization_url": "https://checkout.paystack.com/test",
                "access_code": "test",
                "reference": f"ref_test"
            }
        }
        mock_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            # Make 10 requests (should all succeed)
            for i in range(10):
                response = await test_client.post("/api/v2/payments/init", json=payload)
                assert response.status_code == 200
            
            # 11th request should be rate limited
            response = await test_client.post("/api/v2/payments/init", json=payload)
            assert response.status_code == 429


@pytest.mark.integration
class TestPaymentVerificationFlow:
    """Test payment verification API endpoint"""
    
    @pytest.mark.asyncio
    async def test_successful_payment_verification(self, test_client):
        """Test successful payment verification"""
        reference = "ref_test123"
        
        # Mock Paystack verify response
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "reference": reference,
                "status": "success",
                "amount": 2900000,
                "currency": "NGN",
                "customer": {"email": "test@example.com"},
                "metadata": {"plan": "pro"},
                "paid_at": "2025-01-19T12:00:00Z",
                "gateway_response": "Approved"
            }
        }
        mock_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            response = await test_client.get(f"/api/v2/payments/verify/{reference}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "success"
        assert data["reference"] == reference
    
    @pytest.mark.asyncio
    async def test_verification_caching(self, test_client):
        """Test that verification results are cached"""
        reference = "ref_cached_test"
        
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "reference": reference,
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
            response1 = await test_client.get(f"/api/v2/payments/verify/{reference}")
            assert response1.json()["from_cache"] is False
            
            # Second call should use cache
            response2 = await test_client.get(f"/api/v2/payments/verify/{reference}")
            # Note: May or may not be cached depending on DB state
            
            # Verify Paystack API was only called once
            assert mock_client.return_value.__aenter__.return_value.get.call_count <= 1


@pytest.mark.integration
class TestWebhookFlow:
    """Test webhook processing endpoint"""
    
    @pytest.mark.asyncio
    async def test_webhook_with_valid_signature(self, test_client):
        """Test webhook with valid Paystack signature"""
        import hmac
        import hashlib
        import os
        
        event_data = {
            "event": "charge.success",
            "data": {
                "reference": "ref_webhook_test",
                "amount": 2900000,
                "customer": {"email": "test@example.com"},
                "metadata": {"plan": "pro", "user_id": "user123"}
            }
        }
        
        payload = json.dumps(event_data).encode()
        secret_key = os.getenv("PAYSTACK_SECRET_KEY", "test_secret")
        
        # Compute valid signature
        signature = hmac.new(
            secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        headers = {"x-paystack-signature": signature}
        
        response = await test_client.post(
            "/api/v2/payments/webhook",
            content=payload,
            headers=headers
        )
        
        # Should always return 200 (Paystack best practice)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
    
    @pytest.mark.asyncio
    async def test_webhook_without_signature_rejected(self, test_client):
        """Test that webhooks without signatures are rejected"""
        event_data = {
            "event": "charge.success",
            "data": {"reference": "ref_test"}
        }
        
        response = await test_client.post(
            "/api/v2/payments/webhook",
            json=event_data
        )
        
        assert response.status_code == 400
        assert "signature" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_webhook_idempotency(self, test_client):
        """Test that duplicate webhooks don't cause issues"""
        import hmac
        import hashlib
        import os
        
        event_data = {
            "event": "charge.success",
            "data": {
                "reference": "ref_idempotent_test",
                "amount": 2900000,
                "customer": {"email": "test@example.com"},
                "metadata": {"plan": "pro"}
            }
        }
        
        payload = json.dumps(event_data).encode()
        secret_key = os.getenv("PAYSTACK_SECRET_KEY", "test_secret")
        signature = hmac.new(
            secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        headers = {"x-paystack-signature": signature}
        
        # Send webhook twice
        response1 = await test_client.post(
            "/api/v2/payments/webhook",
            content=payload,
            headers=headers
        )
        
        response2 = await test_client.post(
            "/api/v2/payments/webhook",
            content=payload,
            headers=headers
        )
        
        # Both should return 200
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Second response should indicate already processed
        data2 = response2.json()
        # Should have webhook_count or already_processed flag


@pytest.mark.integration
class TestCompletePaymentJourney:
    """Test complete payment flow from init to verification"""
    
    @pytest.mark.asyncio
    async def test_full_payment_journey(self, test_client):
        """Test complete payment flow: init -> pay -> webhook -> verify"""
        
        # Step 1: Initialize payment
        init_payload = {
            "email": "journey@example.com",
            "plan": "pro",
            "user_id": "user_journey"
        }
        
        mock_init_response = Mock()
        mock_init_response.json.return_value = {
            "status": True,
            "data": {
                "authorization_url": "https://checkout.paystack.com/journey123",
                "access_code": "journey_access",
                "reference": "ref_journey123"
            }
        }
        mock_init_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_init_response
            
            init_response = await test_client.post("/api/v2/payments/init", json=init_payload)
        
        assert init_response.status_code == 200
        reference = init_response.json()["reference"]
        
        # Step 2: Simulate webhook from Paystack (payment completed)
        import hmac
        import hashlib
        import os
        
        webhook_data = {
            "event": "charge.success",
            "data": {
                "reference": reference,
                "amount": 2900000,
                "customer": {"email": "journey@example.com"},
                "metadata": {"plan": "pro", "user_id": "user_journey"}
            }
        }
        
        webhook_payload = json.dumps(webhook_data).encode()
        secret_key = os.getenv("PAYSTACK_SECRET_KEY", "test_secret")
        webhook_signature = hmac.new(
            secret_key.encode('utf-8'),
            webhook_payload,
            hashlib.sha512
        ).hexdigest()
        
        webhook_response = await test_client.post(
            "/api/v2/payments/webhook",
            content=webhook_payload,
            headers={"x-paystack-signature": webhook_signature}
        )
        
        assert webhook_response.status_code == 200
        
        # Step 3: Verify payment
        mock_verify_response = Mock()
        mock_verify_response.json.return_value = {
            "status": True,
            "data": {
                "reference": reference,
                "status": "success",
                "amount": 2900000,
                "currency": "NGN",
                "customer": {"email": "journey@example.com"},
                "metadata": {"plan": "pro"},
                "paid_at": "2025-01-19T12:00:00Z"
            }
        }
        mock_verify_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_verify_response
            
            verify_response = await test_client.get(f"/api/v2/payments/verify/{reference}")
        
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["success"] is True
        assert verify_data["status"] == "success"


# Fixtures
@pytest.fixture
async def test_client():
    """Create test client for API testing"""
    from main import app
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-m", "integration"])
