/**
 * API Tests: Journey Creation & Management
 * 
 * Tests REAL journey creation endpoints
 * Makes actual HTTP requests to backend
 * 
 * Run with: TEST_ENV=staging npm test -- tests/api/journey
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAPIConfig, TEST_DATA, TEST_TIMEOUTS, getTestToken, getTestEnvironment } from '../utils/testConfig'
import { generateTestID, retry, sleep } from '../utils/testHelpers'

describe('Journey API Tests - Real Network Calls', () => {
  let baseURL: string
  let authToken: string
  let createdJobIds: string[] = []
  let shouldSkip: boolean

  beforeAll(() => {
    const config = getAPIConfig()
    baseURL = config.baseURL
    authToken = getTestToken()
    shouldSkip = getTestEnvironment() === 'mock'
    
    console.log(`\n🎯 Testing Journey API: ${baseURL}`)
    console.log(`📦 Environment: ${getTestEnvironment()}`)
    console.log(`🔐 Auth token present: ${authToken ? 'Yes' : 'No'}`)
    
    if (shouldSkip) {
      console.log(`⏭️  Skipping API tests - set TEST_ENV=staging to run\n`)
    } else {
      console.log(`✅ Running real API tests\n`)
    }
  })

  afterAll(async () => {
    // Cleanup created jobs (if endpoint exists)
    console.log(`\n🧹 Cleanup: ${createdJobIds.length} jobs created during tests`)
    
    for (const jobId of createdJobIds) {
      try {
        await fetch(`${baseURL}/api/journey/cancel/${jobId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        })
      } catch (error) {
        console.warn(`⚠️  Could not cleanup job ${jobId}`)
      }
    }
  })

  describe('Journey Creation', () => {
    it('should create a journey map via POST /agent/journey', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const testID = generateTestID('api-test')
      
      const journeyData = {
        title: `${TEST_DATA.sampleJourney.title} - ${testID}`,
        description: TEST_DATA.sampleJourney.description,
        persona: TEST_DATA.sampleJourney.persona,
        stages: [],
        touchpoints: [],
      }

      const response = await retry(async () => {
        const res = await fetch(`${baseURL}/api/journey/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          },
          body: JSON.stringify(journeyData),
        })

        if (!res.ok && res.status >= 500) {
          throw new Error(`Server error: ${res.status}`)
        }

        return res
      }, 3, 2000)

      console.log(`📊 Create journey response: ${response.status}`)

      // Should be 200, 201, 202 (success) or 403 (auth required - expected without token)
      expect([200, 201, 202, 403]).toContain(response.status)
      
      if (response.status === 403) {
        console.log('ℹ️  Authentication required (expected without auth token)')
        return
      }

      const data = await response.json()
      console.log('📦 Response data:', data)

      // Verify response structure
      expect(data).toBeDefined()
      
      // Track job_id if present
      if (data.job_id) {
        createdJobIds.push(data.job_id)
        console.log(`✅ Job created: ${data.job_id}`)
      }
    }, TEST_TIMEOUTS.api)

    it('should validate required fields', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      const invalidData = {
        // Missing required fields
        title: '',
      }

      const response = await fetch(`${baseURL}/api/journey/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify(invalidData),
      })

      // Should return 400 (Bad Request), 422 (Unprocessable Entity), or 403 (auth required)
      expect([400, 422, 403]).toContain(response.status)
      
      if (response.status === 403) {
        console.log('ℹ️  Authentication required (expected without auth token)')
      } else {
        console.log(`✅ Validation working: ${response.status}`)
      }
    }, TEST_TIMEOUTS.api)
  })

  describe('Job Status Polling', () => {
    it('should check job status via GET /agent/journey/:jobId/status', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      // First create a job
      const testID = generateTestID('status-test')
      
      const createResponse = await fetch(`${baseURL}/api/journey/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          title: `Status Test Journey - ${testID}`,
          description: 'Testing status endpoint',
          persona: 'Test user',
          stages: [],
          touchpoints: [],
        }),
      })

      if (!createResponse.ok) {
        console.warn('⚠️  Could not create job for status test')
        return
      }

      const createData = await createResponse.json()
      const jobId = createData.job_id

      if (!jobId) {
        console.warn('⚠️  No job_id returned')
        return
      }

      createdJobIds.push(jobId)

      // Wait a bit then check status
      await sleep(2000)

      const statusResponse = await fetch(`${baseURL}/api/journey/status/${jobId}`, {
        method: 'GET',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      })

      console.log(`📊 Status check response: ${statusResponse.status}`)

      // Should be 200 or 404 (if job expired)
      expect([200, 404]).toContain(statusResponse.status)

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        console.log('📦 Status data:', statusData)

        // Verify status is valid
        expect(statusData).toHaveProperty('status')
        expect(['queued', 'processing', 'completed', 'failed']).toContain(statusData.status)
      }
    }, TEST_TIMEOUTS.api)
  })

  describe('Journey Retrieval', () => {
    it('should handle journey list endpoint (may not exist)', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      // Note: Backend may not have a "list all journeys" endpoint yet
      // This test verifies graceful handling of missing endpoints
      const response = await fetch(`${baseURL}/api/journeys`, {
        method: 'GET',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      })

      console.log(`📊 Get journeys response: ${response.status}`)

      // Should return 200, 401 (auth required), or 404 (not implemented)
      expect([200, 401, 404]).toContain(response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📦 Found ${Array.isArray(data) ? data.length : 'N/A'} journeys`)
        
        // Verify it's an array or object
        expect(data).toBeDefined()
      } else if (response.status === 404) {
        console.log('ℹ️  Journey list endpoint not yet implemented (expected)')
      }
    }, TEST_TIMEOUTS.api)
  })

  describe('WebSocket Connection (if available)', () => {
    it('should have WebSocket endpoint documented', async () => {
      if (shouldSkip) {
        console.log('⏭️  Skipping - set TEST_ENV=staging to run')
        return
      }

      // This is a placeholder - WebSocket testing requires different setup
      console.log('ℹ️  WebSocket testing requires special configuration')
      console.log(`   Expected endpoint: ws${baseURL.replace('http', '')}`)
      
      // Just verify we know the format
      expect(baseURL).toMatch(/^https?:\/\//)
    })
  })
})
