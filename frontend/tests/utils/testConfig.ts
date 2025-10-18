/**
 * Test Configuration
 * 
 * Centralized configuration for all tests
 * - Environment detection
 * - API endpoints
 * - Test data management
 */

export const TEST_ENVIRONMENTS = {
  MOCK: 'mock',
  STAGING: 'staging',
  INTEGRATION: 'integration',
} as const

export type TestEnvironment = typeof TEST_ENVIRONMENTS[keyof typeof TEST_ENVIRONMENTS]

/**
 * Get current test environment from environment variables
 */
export function getTestEnvironment(): TestEnvironment {
  const env = process.env.VITE_TEST_ENV || process.env.TEST_ENV || TEST_ENVIRONMENTS.MOCK
  return env as TestEnvironment
}

/**
 * Check if tests should use real API
 */
export function shouldUseRealAPI(): boolean {
  return getTestEnvironment() !== TEST_ENVIRONMENTS.MOCK
}

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Mock API (local mocked responses)
  [TEST_ENVIRONMENTS.MOCK]: {
    baseURL: 'http://localhost:3000/api',
    timeout: 5000,
    useMocks: true,
  },
  
  // Staging API (real backend in staging environment)
  [TEST_ENVIRONMENTS.STAGING]: {
    baseURL: process.env.VITE_STAGING_API_URL || process.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com',
    timeout: 30000,
    useMocks: false,
  },
  
  // Integration API (docker-compose local setup)
  [TEST_ENVIRONMENTS.INTEGRATION]: {
    baseURL: process.env.VITE_INTEGRATION_API_URL || 'http://localhost:8000',
    timeout: 15000,
    useMocks: false,
  },
}

/**
 * Get API config for current environment
 */
export function getAPIConfig() {
  const env = getTestEnvironment()
  return API_CONFIG[env]
}

/**
 * Test tokens for different environments
 */
export const TEST_TOKENS = {
  [TEST_ENVIRONMENTS.MOCK]: 'mock-test-token-12345',
  [TEST_ENVIRONMENTS.STAGING]: process.env.VITE_STAGING_TEST_TOKEN || '',
  [TEST_ENVIRONMENTS.INTEGRATION]: process.env.VITE_INTEGRATION_TEST_TOKEN || '',
}

/**
 * Get test token for current environment
 */
export function getTestToken(): string {
  const env = getTestEnvironment()
  return TEST_TOKENS[env]
}

/**
 * Test data configuration
 */
export const TEST_DATA = {
  validUser: {
    email: process.env.VITE_TEST_USER_EMAIL || 'test@example.com',
    password: process.env.VITE_TEST_USER_PASSWORD || 'Test123!@#',
  },
  sampleJourney: {
    title: 'Test Customer Journey',
    description: 'Integration test journey',
    persona: 'Tech-savvy user',
  },
}

/**
 * Feature flags for tests
 */
export const TEST_FEATURES = {
  enableRealFileUpload: process.env.VITE_TEST_REAL_FILE_UPLOAD === 'true',
  enableWebSocketTests: process.env.VITE_TEST_WEBSOCKET === 'true',
  skipSlowTests: process.env.VITE_SKIP_SLOW_TESTS === 'true',
}

/**
 * Timeouts for different test types
 */
export const TEST_TIMEOUTS = {
  unit: 5000,
  integration: 30000,
  api: 45000,
  e2e: 60000,
}
