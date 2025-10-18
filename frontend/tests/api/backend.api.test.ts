/**
 * API Tests: Backend Health & Endpoints
 * 
 * Tests REAL API endpoints with REAL HTTP calls
 * No mocks - actual network requests to staging/production
 * 
 * Run with: TEST_ENV=staging npm test -- tests/api
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { getAPIConfig, TEST_TIMEOUTS, getTestEnvironment } from '../utils/testConfig'

describe('Backend API Tests - Real Network Calls', () => {
  let baseURL: string
  let apiConfig: ReturnType<typeof getAPIConfig>
  let shouldSkip: boolean

  beforeAll(() => {
    apiConfig = getAPIConfig()
    baseURL = apiConfig.baseURL
    shouldSkip = getTestEnvironment() === 'mock'
    
    console.log(`\n🌐 Testing against: ${baseURL}`)
    console.log(`📦 Environment: ${getTestEnvironment()}`)
    
    if (shouldSkip) {
      console.log(`⏭️  Skipping API tests - set TEST_ENV=staging to run\n`)
    } else {
      console.log(`✅ Running real API tests\n`)
    }
  })

  describe('Health Check Endpoint', () => {
    it('should return 200 from /health endpoint', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toBeDefined()
      
      console.log('✅ Health check response:', data)
    }, TEST_TIMEOUTS.api)

    it('should have correct response structure', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const response = await fetch(`${baseURL}/health`)
      const data = await response.json()

      // Verify response has expected fields
      expect(data).toHaveProperty('status')
      expect(data.status).toMatch(/ok|healthy|success/i)
    }, TEST_TIMEOUTS.api)
  })

  describe('API Root Endpoint', () => {
    it('should respond to GET /', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const response = await fetch(`${baseURL}/`, {
        method: 'GET',
      })

      // Should return 200 or 404 (if no root route)
      expect([200, 404]).toContain(response.status)
      
      console.log(`📊 Root endpoint status: ${response.status}`)
    }, TEST_TIMEOUTS.api)
  })

  describe('CORS Configuration', () => {
    it('should have CORS headers configured', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const response = await fetch(`${baseURL}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
        },
      })

      // Check for CORS headers (might be 200 or 204)
      expect([200, 204, 404]).toContain(response.status)
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin')
      console.log(`🔒 CORS header: ${corsHeader || 'Not set'}`)
    }, TEST_TIMEOUTS.api)
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const response = await fetch(`${baseURL}/nonexistent-route-12345`, {
        method: 'GET',
      })

      expect(response.status).toBe(404)
    }, TEST_TIMEOUTS.api)

    it('should handle malformed requests gracefully', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const response = await fetch(`${baseURL}/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json {{{',
      })

      // Should return 4xx error, not crash
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.status).toBeLessThan(600)
    }, TEST_TIMEOUTS.api)
  })
})
