# OpenRouter AI Service Integration Guide

## 🎯 Overview
The OpenRouter service provides a **dedicated, environment-aware AI integration** for the Journi platform, enabling seamless development without exhausting OpenAI credits.

### Key Features
- ✅ **Environment-based switching**: Automatic selection between OpenAI (production) and OpenRouter (development)
- ✅ **Structured error responses**: User-friendly error messages for all failure scenarios
- ✅ **Full OpenRouter API support**: Chat completions, streaming, and model customization
- ✅ **CrewAI compatibility**: Drop-in replacement for OpenAI LLM instances
- ✅ **Best practices**: Implements OpenRouter's recommended headers and error handling

---

## 📁 Architecture

### File Structure
```
backend/
├── src/
│   ├── services/
│   │   ├── openai_service.py         # Production OpenAI service (unchanged)
│   │   └── openrouter_service.py     # ✨ NEW: Development OpenRouter service
│   └── agents/
│       └── crew_coordinator.py       # Updated with environment switching
├── .env                              # ENVIRONMENT=development
└── .env.example                      # Updated with OpenRouter config
```

### Environment Variables
```bash
# .env configuration

# OpenAI (Production)
OPENAI_API_KEY=sk-proj-xxx
OPENAI_MODEL=gpt-4o

# OpenRouter (Development/Fallback)
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-3.5-turbo
SITE_URL=https://getjourni.netlify.app
SITE_NAME=Journi

# Environment Selection
ENVIRONMENT=development  # Use 'production' for OpenAI
```

---

## 🔄 How It Works

### 1. Environment-Based Service Selection
```python
# In crew_coordinator.py

env = os.getenv("ENVIRONMENT", "production").lower()

if env == "development":
    # Use OpenRouter for development
    from ..services.openrouter_service import openrouter_service
    self.llm = openrouter_service.get_llm_for_crewai(
        model="openai/gpt-3.5-turbo",
        temperature=0.7
    )
    self.ai_service = "openrouter"
else:
    # Use OpenAI for production
    self.llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.7,
        openai_api_key=user.openai_api_key
    )
    self.ai_service = "openai"
```

### 2. OpenRouter Service API

#### Basic Completion
```python
from src.services.openrouter_service import openrouter_service

result = await openrouter_service.generate_completion(
    prompt="What is customer journey mapping?",
    model="openai/gpt-3.5-turbo",
    max_tokens=1000,
    temperature=0.7
)

if result['success']:
    print(result['content'])
else:
    print(f"Error: {result['error']}")
```

#### Chat Completion
```python
messages = [
    {"role": "system", "content": "You are a customer journey expert."},
    {"role": "user", "content": "Explain the awareness phase."}
]

result = await openrouter_service.generate_chat_completion(
    messages=messages,
    model="openai/gpt-4o",
    temperature=0.7
)
```

#### CrewAI Integration
```python
# Get LLM instance for CrewAI agents
llm = openrouter_service.get_llm_for_crewai(
    model="openai/gpt-3.5-turbo",
    temperature=0.7
)

# Use with agents
context_agent = ContextAgent(llm)
```

---

## 🛡️ Error Handling

### Structured Error Responses
All errors return a consistent format:
```python
{
    "success": False,
    "error": "User-friendly error message",
    "status_code": 401  # HTTP status if applicable
}
```

### Common Error Scenarios

| Error Code | Message | User Action |
|------------|---------|-------------|
| **401** | Invalid or expired OpenRouter API key | Check API key in Settings |
| **429** | Rate limit exceeded | Wait before trying again |
| **402** | Insufficient credits | Add credits to OpenRouter account |
| **503** | Service temporarily unavailable | Try again later |
| **Timeout** | Request timed out | Retry the request |

### Example Error Handling
```python
try:
    result = await openrouter_service.generate_completion(prompt)
    if not result['success']:
        # Handle error gracefully
        error_message = result['error']
        status_code = result.get('status_code')
        
        # Log and display to user
        logger.error(f"OpenRouter error ({status_code}): {error_message}")
        raise HTTPException(
            status_code=status_code or 500,
            detail=error_message
        )
except Exception as e:
    # Handle unexpected errors
    logger.error(f"Unexpected error: {str(e)}")
    raise
```

---

## 🧪 Testing

### Validate API Key
```python
validation = await openrouter_service.validate_api_key()

if validation['is_valid']:
    print("API key is valid!")
else:
    print(f"Validation failed: {validation['error_message']}")
```

### Test Journey Creation
```bash
# Set environment to development
export ENVIRONMENT=development

# Start backend
cd backend
python -m uvicorn main:app --reload

# Frontend will automatically use OpenRouter in development mode
```

### Test Error Scenarios
```python
# Test with invalid API key
os.environ['OPENROUTER_API_KEY'] = 'invalid-key'
result = await openrouter_service.generate_completion("Test")
assert not result['success']
assert 'Invalid or expired' in result['error']

# Test with valid key
os.environ['OPENROUTER_API_KEY'] = 'sk-or-v1-valid-key'
result = await openrouter_service.generate_completion("Test")
assert result['success']
```

---

## 📊 API Response Format

### Success Response
```python
{
    "success": True,
    "content": "Generated response text...",
    "model": "openai/gpt-3.5-turbo",
    "finish_reason": "stop",
    "usage": {
        "prompt_tokens": 15,
        "completion_tokens": 120,
        "total_tokens": 135
    }
}
```

### Error Response
```python
{
    "success": False,
    "error": "Invalid or expired OpenRouter API key. Please check your API key in Settings.",
    "status_code": 401
}
```

---

## 🔐 Security Best Practices

### API Key Management
- ✅ Store API keys in environment variables, never hardcode
- ✅ Use `.env` for local development, environment variables in production
- ✅ Never commit `.env` files to version control
- ✅ Rotate API keys regularly

### Headers Configuration
The service automatically includes:
- `Authorization: Bearer <API_KEY>` - Required authentication
- `HTTP-Referer: <SITE_URL>` - Optional, for OpenRouter rankings
- `X-Title: <SITE_NAME>` - Optional, site attribution

---

## 🚀 Deployment

### Development Mode
```bash
# .env
ENVIRONMENT=development
OPENROUTER_API_KEY=sk-or-v1-your-dev-key
```

### Production Mode
```bash
# .env or Environment Variables
ENVIRONMENT=production
OPENAI_API_KEY=sk-proj-your-prod-key
OPENAI_MODEL=gpt-4o
```

### Switching Between Environments
```bash
# Development (uses OpenRouter)
export ENVIRONMENT=development

# Production (uses OpenAI)
export ENVIRONMENT=production

# Restart backend to apply changes
```

---

## 🔍 Monitoring & Logging

### Logs to Watch
```python
# Service initialization
logger.info("OpenRouter service initialized with base URL: https://openrouter.ai/api/v1")

# Request logging
logger.info(f"Generating completion with model: openai/gpt-3.5-turbo")
logger.info(f"Completion successful, 250 characters generated")

# Error logging
logger.error(f"OpenRouter HTTP error (401): Invalid or expired API key")
```

### Metrics
- Request count by model
- Success/failure rates
- Average response times
- Token usage (available in response)

---

## 📚 Additional Resources

### OpenRouter Documentation
- **Quickstart**: https://openrouter.ai/docs/quickstart
- **API Reference**: https://openrouter.ai/docs/api-reference/overview
- **Error Codes**: https://openrouter.ai/docs/api-reference/errors
- **Models**: https://openrouter.ai/models

### Model Selection
Common models available via OpenRouter:
- `openai/gpt-3.5-turbo` - Fast, cost-effective
- `openai/gpt-4o` - High quality, slower
- `openai/gpt-4-turbo` - Balance of speed/quality
- `anthropic/claude-3-opus` - Alternative provider
- `meta-llama/llama-3-70b` - Open source option

### Cost Optimization
- Use `gpt-3.5-turbo` for development/testing
- Reserve `gpt-4o` for production
- Set appropriate `max_tokens` limits
- Cache responses when possible

---

## ✅ Checklist for Integration

- [x] OpenRouter service file created (`openrouter_service.py`)
- [x] Environment-based switching implemented
- [x] `.env.example` updated with OpenRouter config
- [x] `.env` configured for development mode
- [x] Error handling implemented with structured responses
- [x] Logging added for debugging
- [x] Documentation created
- [ ] Frontend error display updated
- [ ] Real-time status updates implemented
- [ ] Integration tests written
- [ ] Production deployment tested

---

## 🎓 Usage Examples

### Simple Prompt
```python
result = await openrouter_service.generate_completion(
    prompt="Explain customer journey mapping in 2 sentences."
)
print(result['content'])
```

### Multi-turn Conversation
```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is a persona?"},
    {"role": "assistant", "content": "A persona is a..."},
    {"role": "user", "content": "Give me an example."}
]

result = await openrouter_service.generate_chat_completion(messages)
```

### Model Comparison
```python
models = [
    "openai/gpt-3.5-turbo",
    "openai/gpt-4o",
    "anthropic/claude-3-opus"
]

for model in models:
    result = await openrouter_service.generate_completion(
        prompt="What is AI?",
        model=model
    )
    print(f"{model}: {result['content'][:100]}...")
```

---

## 📝 Notes

1. **No Breaking Changes**: The original `openai_service.py` remains unchanged for production use
2. **Automatic Switching**: Environment variable `ENVIRONMENT` controls which service is used
3. **Consistent Responses**: Both services return identical response formats
4. **Development First**: OpenRouter enables unlimited free development testing
5. **Production Ready**: Switch to `ENVIRONMENT=production` for live deployment

---

**Status**: ✅ Fully Implemented and Ready for Testing  
**Date**: 2025-01-20  
**Version**: 1.0.0
