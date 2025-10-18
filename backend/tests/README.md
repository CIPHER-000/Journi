# Backend Tests

This directory contains all backend tests for the Journi application.

## Test Structure

```
tests/
├── README.md (this file)
├── test_job_manager.py (Job manager tests)
├── test_agents.py (CrewAI agent tests)
├── test_api_routes.py (API endpoint tests)
└── __init__.py
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run with coverage
```bash
pytest --cov=src --cov-report=html
```

### Run specific test file
```bash
pytest tests/test_job_manager.py
```

### Run specific test
```bash
pytest tests/test_job_manager.py::test_create_job
```

### Run by marker
```bash
# Unit tests only
pytest -m unit

# Skip slow tests
pytest -m "not slow"

# Integration tests
pytest -m integration
```

## Test Coverage

View coverage report:
```bash
pytest --cov --cov-report=html
open htmlcov/index.html
```

## Test Markers

- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.slow` - Slow-running tests
- `@pytest.mark.agents` - CrewAI agent tests
- `@pytest.mark.api` - API endpoint tests

## Writing Tests

### Example Test Structure

```python
import pytest
from src.services.job_manager import JobManager

@pytest.mark.unit
async def test_create_job(mock_user, mock_journey_form_data):
    """Test job creation."""
    job_manager = JobManager()
    
    job = await job_manager.create_job(
        form_data=mock_journey_form_data,
        user=mock_user
    )
    
    assert job.id is not None
    assert job.status == "queued"
```

## Important Notes

- Always use `@pytest.mark.asyncio` for async tests
- Use fixtures from `conftest.py` for common test data
- Mock external services (OpenAI, Supabase) in tests
- Test both success and failure cases
- Keep tests fast - mock slow operations

## CI/CD

Tests run automatically on:
- Pull requests
- Pushes to main
- Before deployment

Target coverage: 60%+
