"""
Pytest configuration and shared fixtures for backend tests.
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_client():
    """Create a test client for FastAPI app."""
    from main import app
    
    with TestClient(app) as client:
        yield client


@pytest.fixture
async def async_test_client() -> AsyncGenerator:
    """Create an async test client for FastAPI app."""
    from main import app
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def mock_user():
    """Create a mock user for testing."""
    return {
        "id": "test-user-123",
        "email": "test@example.com",
        "name": "Test User",
        "openai_api_key": None
    }


@pytest.fixture
def mock_journey_form_data():
    """Create mock journey form data for testing."""
    return {
        "title": "Test Journey",
        "industry": "Technology",
        "business_goals": "Improve user onboarding",
        "journey_phases": ["Awareness", "Consideration", "Purchase"],
        "additional_context": "Testing context"
    }


@pytest.fixture
def mock_job_id():
    """Create a mock job ID for testing."""
    return "550e8400-e29b-41d4-a716-446655440000"


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )
    config.addinivalue_line(
        "markers", "agents: tests for CrewAI agents"
    )
    config.addinivalue_line(
        "markers", "api: API endpoint tests"
    )
