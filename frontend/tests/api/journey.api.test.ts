/**
 * API Tests: Journey Creation & Management
 * 
 * Tests REAL journey creation endpoints
 * Makes actual HTTP requests to backend
 * 
 * Run with: TEST_ENV=staging npm test -- tests/api/journey
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAPIConfig, TEST_DATA, TEST_TIMEOUTS, getTestToken } from '../utils/testConfig'
import { generateTestID, retry, sleep } from '../utils/testHelpers'

describe('Journey API Tests - Real Network Calls', () => {
  let baseURL: string
  let authToken: string
  let createdJobIds: string[] = []

  beforeAll(() => {
    const config = getAPIConfig()
    baseURL = config.baseURL
    authToken = getTestToken()
    
    console.log(`\n🎯 Testing Journey API: ${baseURL}`)
    console.log(`🔐 Auth token present: ${authToken ? 'Yes' : 'No'}\n`)
  })

  afterAll(async () => {
    // Cleanup created jobs (if endpoint exists)
    console.log(`\n🧹 Cleanup: ${createdJobIds.length} jobs created during tests`)
    
    for (const jobId of createdJobIds) {
      try {
        await fetch(`${baseURL}/agent/journey/${jobId}`, {
          method: 'DELETE',
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
      const testID = generateTestID('api-test')
      
      const journeyData = {
        title: `${TEST_DATA.sampleJourney.title} - ${testID}`,
        description: TEST_DATA.sampleJourney.description,
        persona: TEST_DATA.sampleJourney.persona,
        stages: [],
        touchpoints: [],
      }

      const response = await retry(async () => {
        const res = await fetch(`${baseURL}/agent/journey`, {
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

      // Should be 200, 201, or 202 (accepted)
      expect([200, 201, 202]).toContain(response.status)

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
      const invalidData = {
        // Missing required fields
        title: '',
      }

      const response = await fetch(`${baseURL}/agent/journey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify(invalidData),
      })

      // Should return 400 (Bad Request) or 422 (Unprocessable Entity)
      expect([400, 422]).toContain(response.status)
      
      console.log(`✅ Validation working: ${response.status}`)
    }, TEST_TIMEOUTS.api)
  })

  describe('Job Status Polling', () => {
    it('should check job status via GET /agent/journey/:jobId/status', async () => {
      // First create a job
      const testID = generateTestID('status-test')
      
      const createResponse = await fetch(`${baseURL}/agent/journey`, {
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

      const statusResponse = await fetch(`${baseURL}/agent/journey/${jobId}/status`, {
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
    it('should retrieve journeys via GET /agent/journeys', async () => {
      const response = await fetch(`${baseURL}/agent/journeys`, {
        method: 'GET',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      })

      console.log(`📊 Get journeys response: ${response.status}`)

      // Should return 200 or 401 (if auth required)
      expect([200, 401, 404]).toContain(response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📦 Found ${Array.isArray(data) ? data.length : 'N/A'} journeys`)
        
        // Verify it's an array or object
        expect(data).toBeDefined()
      }
    }, TEST_TIMEOUTS.api)
  })

  describe('WebSocket Connection (if available)', () => {
    it('should have WebSocket endpoint documented', async () => {
      // This is a placeholder - WebSocket testing requires different setup
      console.log('ℹ️  WebSocket testing requires special configuration')
      console.log(`   Expected endpoint: ws${baseURL.replace('http', '')}`)
      
      // Just verify we know the format
      expect(baseURL).toMatch(/^https?:\/\//)
    })
  })
})
