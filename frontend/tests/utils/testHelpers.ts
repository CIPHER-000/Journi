/**
 * Test Helper Utilities
 * 
 * Common utilities for all test types
 */

import { vi } from 'vitest'
import { getAPIConfig, shouldUseRealAPI, getTestToken } from './testConfig'

/**
 * Setup fetch mock or real fetch based on environment
 */
export function setupFetch() {
  if (shouldUseRealAPI()) {
    // Use real fetch with configured base URL
    const config = getAPIConfig()
    const originalFetch = global.fetch
    
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const fullURL = url.startsWith('http') ? url : `${config.baseURL}${url}`
      
      return originalFetch(fullURL, {
        ...init,
        headers: {
          ...init?.headers,
          'Authorization': `Bearer ${getTestToken()}`,
        },
      })
    }
  } else {
    // Use mocked fetch
    global.fetch = vi.fn() as any
  }
}

/**
 * Reset fetch to original state
 */
export function resetFetch() {
  if (shouldUseRealAPI()) {
    // Restore original fetch
    delete (global as any).fetch
  } else {
    vi.clearAllMocks()
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Create mock file for upload tests
 */
export function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const content = new Array(size).fill('a').join('')
  return new File([content], name, { type })
}

/**
 * Setup localStorage with test data
 */
export function setupLocalStorage(data: Record<string, string> = {}) {
  const mockStorage: Record<string, string> = { ...data }
  
  Storage.prototype.getItem = vi.fn((key: string) => mockStorage[key] || null)
  Storage.prototype.setItem = vi.fn((key: string, value: string) => {
    mockStorage[key] = value
  })
  Storage.prototype.removeItem = vi.fn((key: string) => {
    delete mockStorage[key]
  })
  Storage.prototype.clear = vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  })
}

/**
 * Clean up test data (for real API tests)
 */
export async function cleanupTestData(endpoint: string, id: string) {
  if (!shouldUseRealAPI()) return
  
  const config = getAPIConfig()
  const token = getTestToken()
  
  try {
    await fetch(`${config.baseURL}${endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.warn(`Failed to cleanup test data: ${id}`, error)
  }
}

/**
 * Generate unique test ID
 */
export function generateTestID(prefix: string = 'test'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function until it succeeds or max attempts reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await sleep(delayMs)
      }
    }
  }
  
  throw lastError
}

/**
 * Skip test if not in specified environment
 */
export function skipIfNotEnvironment(env: string, testFn: () => void) {
  const currentEnv = process.env.VITE_TEST_ENV || process.env.TEST_ENV || 'mock'
  
  if (currentEnv !== env) {
    return () => {
      console.log(`Skipping test - requires ${env} environment`)
    }
  }
  
  return testFn
}

/**
 * Mark test as using mock data
 */
export function useMockData() {
  // This is a marker function for test reporting
  // The test reporter will detect this and categorize the test
  return { dataSource: 'mock' as const }
}

/**
 * Mark test as using real data
 */
export function useRealData() {
  // This is a marker function for test reporting
  return { dataSource: 'real' as const }
}

/**
 * Check if test should run (based on feature flags)
 */
export function shouldRunTest(feature?: string): boolean {
  if (!feature) return true
  
  const skipSlow = process.env.VITE_SKIP_SLOW_TESTS === 'true'
  if (skipSlow && feature === 'slow') return false
  
  return true
}
