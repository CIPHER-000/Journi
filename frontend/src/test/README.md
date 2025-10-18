# Frontend Testing Guide

This directory contains test utilities and setup for the Journi frontend.

## Test Structure

```
frontend/src/
├── test/
│   ├── setup.ts (test environment setup)
│   ├── utils.tsx (testing utilities)
│   └── README.md (this file)
├── hooks/
│   └── useJobProgress.test.ts ✅ (CRITICAL - polling logic)
├── services/
│   └── agentService.test.ts ✅ (API integration)
└── components/
    └── ui/
        └── button.test.tsx ✅ (component example)
```

---

## Running Tests

### All Tests
```bash
npm run test
```

### Watch Mode (Development)
```bash
npm run test -- --watch
```

### With UI
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm run test -- useJobProgress.test.ts
```

### Run Only Changed Tests
```bash
npm run test -- --changed
```

---

## Test Priorities

### ✅ Already Tested (CRITICAL)
1. **useJobProgress** - HTTP polling hook (1000ms interval, 8 steps)
2. **agentService** - API integration (create, status, upload, WebSocket)
3. **Button** - Component example

### 🎯 Next to Test (HIGH PRIORITY)
1. **Components** (Large Pages):
   - HomePage sections
   - JourneyMapPage components
   - CreateJourneyPage form components
   - DashboardPage

2. **Hooks**:
   - useActiveJourney
   - useAuth (if exists)

3. **Context**:
   - AuthContext
   - Any other context providers

4. **Utils**:
   - Form validation
   - Data transformation
   - Export functions (PDF, image)

---

## Writing Tests

### Test Template for Components

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<ComponentName onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Test Template for Hooks

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCustomHook } from './useCustomHook'

describe('useCustomHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current).toBeDefined()
  })

  it('should update on dependency change', async () => {
    const { result, rerender } = renderHook(
      ({ dep }) => useCustomHook(dep),
      { initialProps: { dep: 'initial' } }
    )
    
    rerender({ dep: 'updated' })
    
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
```

### Test Template for Services

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServiceClass } from './ServiceClass'

global.fetch = vi.fn()

describe('ServiceClass', () => {
  let service: ServiceClass
  
  beforeEach(() => {
    service = new ServiceClass()
    vi.clearAllMocks()
  })

  it('should make API call with correct params', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    } as Response)

    await service.apiMethod()
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/endpoint'),
      expect.any(Object)
    )
  })
})
```

---

## Testing Best Practices

### DO ✅
- Test user behavior, not implementation details
- Use `screen` queries for better error messages
- Test accessibility (roles, labels)
- Mock external dependencies (fetch, WebSocket)
- Use `waitFor` for async operations
- Clean up after tests (unmount, clear mocks)
- Test error states and edge cases

### DON'T ❌
- Don't test internal component state directly
- Don't test styling/CSS
- Don't test third-party libraries
- Don't make real API calls in tests
- Don't skip cleanup functions
- Don't test everything - focus on critical paths

---

## Mocking Strategies

### Mock Fetch
```typescript
global.fetch = vi.fn()

beforeEach(() => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'test' }),
  } as Response)
})
```

### Mock WebSocket
```typescript
const mockWs = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
}
global.WebSocket = vi.fn(() => mockWs) as any
```

### Mock LocalStorage
```typescript
Storage.prototype.getItem = vi.fn()
Storage.prototype.setItem = vi.fn()
```

### Mock useNavigate (React Router)
```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))
```

---

## Test Coverage Goals

| Area | Target | Current |
|------|--------|---------|
| **Hooks** | 80% | 50% (1/2) |
| **Services** | 80% | 100% (1/1) |
| **Components** | 60% | 5% (1/20+) |
| **Utils** | 70% | 0% |
| **Overall** | 60%+ | ~10% |

---

## Critical Tests (DO NOT SKIP)

### ⚠️ Polling Mechanism (useJobProgress)
- **Priority**: CRITICAL
- **Why**: Core functionality for real-time progress
- **Tests**: ✅ Complete (12 test cases)
- **Coverage**: 100%

### ⚠️ API Integration (agentService)
- **Priority**: CRITICAL
- **Why**: All backend communication
- **Tests**: ✅ Complete (17 test cases)
- **Coverage**: 100%

### 🎯 Large Page Components
- **Priority**: HIGH
- **Why**: Complex, prone to bugs
- **Tests**: ⏳ Pending
- **Next**: Extract components first, then test

---

## Continuous Integration

Tests run automatically on:
- Every commit (local)
- Pull requests (GitHub Actions - planned)
- Before deployment (staging)

**Pre-commit Hook** (planned):
```bash
npm run test -- --run --reporter=verbose
```

---

## Debugging Failed Tests

### View Test Output
```bash
npm run test -- --reporter=verbose
```

### Debug Specific Test
```bash
npm run test -- --reporter=verbose button.test.tsx
```

### Run in Browser (UI Mode)
```bash
npm run test:ui
```

### Check Coverage
```bash
npm run test:coverage
open coverage/index.html
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Vitest UI](https://vitest.dev/guide/ui.html)

---

**Created**: 2025-01-18  
**Last Updated**: 2025-01-18  
**Status**: Active Development
