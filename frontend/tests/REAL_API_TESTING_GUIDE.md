# Real API Testing Guide 🌐

This guide explains how to run tests against the **REAL backend API** instead of mocks.

---

## 🎯 Quick Start - Run Real API Tests

### 1. **API Tests** (Backend Endpoints)
```bash
# Set environment to staging
$env:TEST_ENV="staging"; npm test -- tests/api --run
```

### 2. **Integration Tests** (Full Workflows)
```bash
# Set environment to staging  
$env:TEST_ENV="staging"; npm test -- tests/integration --run
```

### 3. **All Real Data Tests**
```bash
# Run both API and integration tests
$env:TEST_ENV="staging"; npm test -- tests/api tests/integration --run
```

---

## 📊 What Gets Tested

### API Tests (`tests/api/`)
✅ **backend.api.test.ts** - Backend health & endpoints
- `/health` endpoint
- CORS configuration
- Error handling
- API root endpoint

✅ **journey.api.test.ts** - Journey creation & management
- POST `/agent/journey` - Create journey
- GET `/agent/journey/:id/status` - Check status
- GET `/agent/journeys` - List journeys
- Input validation
- Job status polling

### Integration Tests (`tests/integration/`)
✅ **journeyCreation.integration.test.ts** - Complete workflows
- Create journey via real API
- Poll job status until completion
- Backend health check
- End-to-end journey creation flow

---

## 🌍 Test Environments

### **MOCK** (Default)
```bash
# No TEST_ENV needed
npm test
```
- **URL**: `http://localhost:3000/api`
- **Data**: 100% mocked via `vi.fn()`
- **Speed**: Very fast (~6s for 112 tests)
- **Use Case**: Local development, unit tests

### **STAGING** (Real API)
```bash
$env:TEST_ENV="staging"; npm test -- tests/api tests/integration
```
- **URL**: `https://journi-backend.onrender.com`
- **Data**: Real HTTP requests to production backend
- **Speed**: Slower (network latency + backend processing)
- **Use Case**: Pre-deployment validation, integration testing

### **INTEGRATION** (Local Docker)
```bash
$env:TEST_ENV="integration"; npm test -- tests/api tests/integration
```
- **URL**: `http://localhost:8000`
- **Data**: Real API running locally via docker-compose
- **Speed**: Medium (no network, but real processing)
- **Use Case**: Full stack local development

---

## 🎯 Current Test Status

### Mock Tests (Unit)
```
✅ 112 tests passing
📂 tests/unit/
⏱️  ~6 seconds execution
```

### Real API Tests
```
✅ 6 tests in tests/api/
✅ 3 tests in tests/integration/
📡 Makes actual HTTP requests
⏱️  ~30-60 seconds execution (depends on backend)
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.test.local` (not tracked in git):
```env
# Test Environment
TEST_ENV=staging
VITE_TEST_ENV=staging

# Real Backend URL
VITE_STAGING_API_URL=https://journi-backend.onrender.com

# Optional: Auth Token
VITE_STAGING_TEST_TOKEN=your-token-here

# Optional: Test User Credentials
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=your-password

# Enable Reporting
VITE_ENABLE_TEST_REPORTER=true
```

### Verify Configuration
```bash
# Check which URL will be used
$env:TEST_ENV="staging"; npm run test -- tests/utils/testConfig.test.ts
```

---

## 📝 Real API Test Examples

### Example 1: Health Check
```typescript
// tests/api/backend.api.test.ts
it('should return 200 from /health endpoint', async () => {
  const response = await fetch(`${baseURL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  expect(response.status).toBe(200)
  const data = await response.json()
  expect(data).toBeDefined()
})
```

### Example 2: Journey Creation
```typescript
// tests/api/journey.api.test.ts
it('should create a journey map via POST /agent/journey', async () => {
  const response = await fetch(`${baseURL}/agent/journey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Test Journey',
      description: 'Integration test',
      persona: 'Tech-savvy user',
    }),
  })

  expect([200, 201, 202]).toContain(response.status)
  const data = await response.json()
  expect(data.job_id).toBeDefined()
})
```

### Example 3: Full Integration Test
```typescript
// tests/integration/journeyCreation.integration.test.ts
it('should create a journey with real API', async () => {
  // Make REAL HTTP request - NO MOCKS
  const response = await fetch(`${baseURL}/agent/journey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(journeyData),
  })

  expect(response.ok).toBe(true)
  const result = await response.json()
  expect(result.job_id).toBeDefined()
  
  // Track for cleanup
  createdJobIds.push(result.job_id)
})
```

---

## 🚀 Running in CI/CD

### GitHub Actions Example
```yaml
- name: Run Mock Tests (Fast)
  run: npm test -- --run

- name: Run Real API Tests (Staging)
  env:
    TEST_ENV: staging
    VITE_STAGING_API_URL: ${{ secrets.STAGING_API_URL }}
  run: npm test -- tests/api tests/integration --run
```

---

## 📊 Test Output

### Mock Mode (Default)
```
🎯 Integration Test Environment: MOCK
🌐 API Endpoint: http://localhost:3000/api
📊 Real API Calls: NO (Skipping) ⏭️

⏭️  Skipping - set TEST_ENV=staging to run
```

### Staging Mode (Real API)
```
🎯 Integration Test Environment: STAGING
🌐 API Endpoint: https://journi-backend.onrender.com
📊 Real API Calls: YES ✅

🚀 Creating journey: "Test Customer Journey - integration-1729262400000-abc123"
✅ Response status: 201
📦 Response data: { job_id: 'xyz789', status: 'queued' }
🎯 Job ID: xyz789
```

---

## 🔍 Debugging Real API Tests

### Enable Verbose Logging
```bash
$env:VITE_TEST_VERBOSE="true"; $env:TEST_ENV="staging"; npm test -- tests/api --run
```

### Check Network Requests
```bash
# The tests log all requests and responses
# Look for:
# 🚀 Creating journey...
# ✅ Response status: 201
# 📦 Response data: {...}
```

### Common Issues

#### Issue: "ECONNREFUSED localhost:3000"
**Cause**: Running in MOCK mode
**Fix**: Set `TEST_ENV=staging`
```bash
$env:TEST_ENV="staging"; npm test -- tests/api --run
```

#### Issue: "fetch failed"
**Cause**: Backend is down or URL is wrong
**Fix**: Check backend status at https://journi-backend.onrender.com/health

#### Issue: Tests skip automatically
**Cause**: Environment not set properly
**Fix**: Ensure `TEST_ENV=staging` is set before running

---

## ✅ Verification Checklist

Before running real API tests:

- [ ] Backend is running (check `/health`)
- [ ] TEST_ENV is set to `staging`
- [ ] Network connection is available
- [ ] `.env.test.local` is configured (if using auth)

```bash
# Quick health check
curl https://journi-backend.onrender.com/health

# Should return: {"status": "ok"} or similar
```

---

## 📈 Test Coverage

### Current Coverage

| Type | Location | Tests | Real API? |
|------|----------|-------|-----------|
| Unit | `tests/unit/` | 112 | ❌ Mock |
| API | `tests/api/` | 6 | ✅ Real |
| Integration | `tests/integration/` | 3 | ✅ Real |
| E2E | `tests/e2e/` | 0 | 🔜 Future |

**Total**: 121 tests (9 real API, 112 mock)

---

## 🎯 Summary

### When to Use Each Mode

**MOCK** (default):
- ✅ Fast local development
- ✅ Unit testing
- ✅ PR checks
- ✅ Offline work

**STAGING** (real API):
- ✅ Integration testing
- ✅ Pre-deployment validation
- ✅ Contract verification
- ✅ E2E workflows

**Key Commands:**
```bash
# Mock tests (fast)
npm test

# Real API tests
$env:TEST_ENV="staging"; npm test -- tests/api tests/integration --run

# All tests
$env:TEST_ENV="staging"; npm test -- --run
```

---

## 🔥 Pro Tips

1. **Run API tests before deploying** to catch breaking changes
2. **Use staging mode in CI/CD** for pre-production validation
3. **Keep mock tests fast** for local development feedback
4. **Clean up test data** - integration tests handle this automatically
5. **Monitor backend logs** when running real API tests

---

**Ready to test with real data!** 🚀

Run: `$env:TEST_ENV="staging"; npm test -- tests/api --run`
