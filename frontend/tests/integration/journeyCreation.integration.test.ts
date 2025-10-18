/**
 * Integration Test: Journey Creation Flow
 * 
 * Tests the complete journey creation flow with REAL API calls
 * 
 * Environment: STAGING or INTEGRATION
 * Data Source: Real backend API
 * 
 * Run with: TEST_ENV=staging npm test -- integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { shouldUseRealAPI, getAPIConfig, TEST_DATA, TEST_TIMEOUTS } from '../utils/testConfig'
import { setupFetch, resetFetch, cleanupTestData, generateTestID, retry } from '../utils/testHelpers'
import { TestReporter } from '../utils/testReporter'
import { agentService } from '../../src/services/agentService'

describe('Journey Creation Integration Tests', () => {
  let createdJourneyIds: string[] = []
  
  beforeAll(() => {
    setupFetch()
    
    if (!shouldUseRealAPI()) {
      console.warn('⚠️  Running in MOCK mode - switch to TEST_ENV=staging for real API tests')
    }
  })

  afterAll(async () => {
    // Cleanup created test data
    for (const id of createdJourneyIds) {
      await cleanupTestData('/journey', id)
    }
    resetFetch()
    
    // Print test report
    if (process.env.VITE_ENABLE_TEST_REPORTER === 'true') {
      TestReporter.printReport()
    }
  })

  it('should create a journey with real API', async () => {
    if (!shouldUseRealAPI()) {
      console.log('⏭️  Skipping - requires real API')
      return
    }

    const testID = generateTestID('integration')
    const startTime = Date.now()

    try {
      // Create journey with real API call
      const journeyData = {
        title: `${TEST_DATA.sampleJourney.title} - ${testID}`,
        description: TEST_DATA.sampleJourney.description,
        persona: TEST_DATA.sampleJourney.persona,
      }

      const result = await retry(
        () => agentService.createJourneyMap(journeyData as any),
        3,
        2000
      )

      // Verify response
      expect(result).toBeDefined()
      expect(result.job_id).toBeDefined()
      expect(result.status).toMatch(/queued|processing/)

      // Track for cleanup
      if (result.job_id) {
        createdJourneyIds.push(result.job_id)
      }

      // Record test execution
      TestReporter.record({
        testName: 'should create a journey with real API',
        testFile: 'journeyCreation.integration.test.ts',
        dataSource: 'real',
        duration: Date.now() - startTime,
        status: 'passed',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      // Record failure
      TestReporter.record({
        testName: 'should create a journey with real API',
        testFile: 'journeyCreation.integration.test.ts',
        dataSource: 'real',
        duration: Date.now() - startTime,
        status: 'failed',
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }, TEST_TIMEOUTS.integration)

  it('should poll job status until completion', async () => {
    if (!shouldUseRealAPI()) {
      console.log('⏭️  Skipping - requires real API')
      return
    }

    const testID = generateTestID('integration')
    const startTime = Date.now()

    try {
      // Create journey first
      const journeyData = {
        title: `Poll Test Journey - ${testID}`,
        description: 'Testing status polling',
        persona: 'Test user',
      }

      const createResult = await agentService.createJourneyMap(journeyData as any)
      expect(createResult.job_id).toBeDefined()

      const jobId = createResult.job_id as string
      createdJourneyIds.push(jobId)

      // Poll status multiple times
      let attempts = 0
      let status = 'queued'
      const maxAttempts = 10

      while (attempts < maxAttempts && status !== 'completed' && status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const statusResult = await agentService.getJobStatus(jobId)
        status = statusResult.status
        
        console.log(`📊 Attempt ${attempts + 1}: Status = ${status}`)
        attempts++

        // Verify status is valid
        expect(['queued', 'processing', 'completed', 'failed']).toContain(status)
      }

      // Should have polled at least twice
      expect(attempts).toBeGreaterThanOrEqual(2)

      TestReporter.record({
        testName: 'should poll job status until completion',
        testFile: 'journeyCreation.integration.test.ts',
        dataSource: 'real',
        duration: Date.now() - startTime,
        status: 'passed',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      TestReporter.record({
        testName: 'should poll job status until completion',
        testFile: 'journeyCreation.integration.test.ts',
        dataSource: 'real',
        duration: Date.now() - startTime,
        status: 'failed',
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }, TEST_TIMEOUTS.api)

  it('should handle backend connection health check', async () => {
    if (!shouldUseRealAPI()) {
      console.log('⏭️  Skipping - requires real API')
      return
    }

    const startTime = Date.now()

    try {
      const isHealthy = await retry(
        () => agentService.checkBackendConnection(),
        3,
        1000
      )

      // Backend should be healthy in staging/integration
      expect(isHealthy).toBe(true)

      const connectionStatus = agentService.getConnectionStatus()
      expect(connectionStatus.isConnected).toBe(true)

      TestReporter.record({
        testName: 'should handle backend connection health check',
        testFile: 'journeyCreation.integration.test.ts',
        dataSource: 'real',
        duration: Date.now() - startTime,
        status: 'passed',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      TestReporter.record({
        testName: 'should handle backend connection health check',
        testFile: 'journeyCreation.integration.test.ts',
        dataSource: 'real',
        duration: Date.now() - startTime,
        status: 'failed',
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }, TEST_TIMEOUTS.integration)
})
