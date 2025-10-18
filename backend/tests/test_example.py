"""
Example test file demonstrating testing structure.
This file can be used as a template for writing actual tests.
"""
import pytest


@pytest.mark.unit
def test_example_sync():
    """Example synchronous test."""
    assert 1 + 1 == 2


@pytest.mark.unit
@pytest.mark.asyncio
async def test_example_async():
    """Example asynchronous test."""
    result = await async_add(1, 1)
    assert result == 2


async def async_add(a: int, b: int) -> int:
    """Helper function for async test."""
    return a + b


@pytest.mark.unit
def test_with_mock_user(mock_user):
    """Example test using mock_user fixture."""
    assert mock_user["id"] == "test-user-123"
    assert mock_user["email"] == "test@example.com"


@pytest.mark.unit
def test_with_mock_form_data(mock_journey_form_data):
    """Example test using mock_journey_form_data fixture."""
    assert mock_journey_form_data["title"] == "Test Journey"
    assert mock_journey_form_data["industry"] == "Technology"
    assert len(mock_journey_form_data["journey_phases"]) == 3


# TODO: Add actual tests for:
# - Job manager (create_job, get_job, cancel_job)
# - CrewAI agents (each agent's functionality)
# - API routes (POST /api/journey/create, GET /api/journey/status/:id)
# - Auth service
# - Usage service
