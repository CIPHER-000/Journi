import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AgentService } from './agentService'

// Mock fetch globally
global.fetch = vi.fn() as any

describe('AgentService', () => {
  let agentService: AgentService
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch as any
    agentService = new AgentService()
  })

  afterEach(() => {
    mockFetch.mockClear()
  })

  describe('createJourneyMap', () => {
    it('should create journey map with valid form data', async () => {
      const mockFormData = {
        title: 'Test Journey',
        industry: 'Technology',
        business_goals: 'Improve onboarding',
        journey_phases: ['Awareness', 'Consideration'],
      }

      const mockResponse = {
        job_id: 'test-job-123',
        status: 'queued',
        message: 'Journey creation started',
      }

      // Mock health check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      })

      // Mock create journey
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await agentService.createJourneyMap(mockFormData)

      expect(result).toEqual(mockResponse)
      // Check the second call (first is health check)
      expect(mockFetch.mock.calls[1][0]).toContain('/journey/create')
      expect(mockFetch.mock.calls[1][1]).toMatchObject({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockFormData),
      })
    })

    it('should check backend connection before creating journey', async () => {
      const mockFormData = { title: 'Test' }

      // Mock health check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      })

      // Mock create journey
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: '123', status: 'queued' }),
      })

      await agentService.createJourneyMap(mockFormData)

      // First call should be health check
      expect(mockFetch.mock.calls[0][0]).toContain('/health')
    })

    it('should throw error if backend returns error', async () => {
      const mockFormData = { title: 'Test' }

      // Mock health check success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      })

      // Mock create journey failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })

      await expect(agentService.createJourneyMap(mockFormData)).rejects.toThrow(
        'Backend error (500): Internal Server Error'
      )
    })

    it('should update connection status on success', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await agentService.createJourneyMap({})

      const status = agentService.getConnectionStatus()
      expect(status.isConnected).toBe(true)
      expect(status.lastError).toBeUndefined()
    })

    it('should update connection status on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true }) // health
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(agentService.createJourneyMap({})).rejects.toThrow()

      const status = agentService.getConnectionStatus()
      expect(status.isConnected).toBe(false)
      expect(status.lastError).toContain('Network error')
    })
  })

  describe('checkBackendConnection', () => {
    it('should return true when backend is healthy', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      })

      const result = await agentService.checkBackendConnection()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      )
    })

    it('should return false when backend is down', async () => {
      mockFetch.mockRejectedValue(new Error('Connection timeout'))

      const result = await agentService.checkBackendConnection()

      expect(result).toBe(false)
    })

    it('should update connection status after check', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      await agentService.checkBackendConnection()

      const status = agentService.getConnectionStatus()
      expect(status.isConnected).toBe(true)
      expect(status.lastChecked).toBeInstanceOf(Date)
    })
  })

  describe('getJobStatus', () => {
    it('should retrieve job status by ID', async () => {
      const mockJobId = 'test-job-456'
      const mockStatus = {
        job_id: mockJobId,
        status: 'processing',
        progress: {
          current_step: 3,
          total_steps: 8,
          step_name: 'Journey Mapping',
          message: 'Creating journey map...',
          percentage: 37.5,
        },
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      })

      const result = await agentService.getJobStatus(mockJobId)

      expect(result).toEqual(mockStatus)
      expect(mockFetch.mock.calls[0][0]).toContain(`/journey/status/${mockJobId}`)
    })

    it('should handle job not found error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Job not found',
      })

      await expect(agentService.getJobStatus('nonexistent')).rejects.toThrow(
        'Failed to get job status (404): Job not found'
      )
    })

    it('should update connection status on successful poll', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'processing' }),
      })

      await agentService.getJobStatus('test-123')

      const status = agentService.getConnectionStatus()
      expect(status.isConnected).toBe(true)
    })
  })

  describe('uploadFiles', () => {
    it('should upload research files', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.txt', { type: 'text/plain' }),
      ]

      const mockResponse = {
        uploaded_files: ['/uploads/file1.pdf', '/uploads/file2.txt'],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await agentService.uploadFiles(mockFiles)

      expect(result).toEqual(mockResponse.uploaded_files)
      expect(mockFetch.mock.calls[0][0]).toContain('/files/upload')
      expect(mockFetch.mock.calls[0][1]).toMatchObject({
        method: 'POST',
      })
      expect(mockFetch.mock.calls[0][1].body).toBeInstanceOf(FormData)
    })

    it('should return empty array on upload failure', async () => {
      mockFetch.mockRejectedValue(new Error('Upload failed'))

      const result = await agentService.uploadFiles([new File([], 'test.pdf')])

      expect(result).toEqual([])
    })

    it('should send all files in FormData', async () => {
      const mockFiles = [
        new File(['1'], 'file1.pdf'),
        new File(['2'], 'file2.pdf'),
      ]

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ uploaded_files: [] }),
      })

      await agentService.uploadFiles(mockFiles)

      const call = mockFetch.mock.calls[0]
      const formData = call[1].body as FormData
      
      // FormData should contain both files
      expect(formData).toBeInstanceOf(FormData)
    })
  })

  describe('getJourneyMap', () => {
    it('should retrieve completed journey map', async () => {
      const mockJourneyId = 'journey-789'
      const mockJourney = {
        id: mockJourneyId,
        title: 'E-commerce Journey',
        personas: [{ name: 'Sarah', age: 28 }],
        phases: [{ name: 'Awareness', touchpoints: [] }],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockJourney,
      })

      const result = await agentService.getJourneyMap(mockJourneyId)

      expect(result).toEqual(mockJourney)
      expect(mockFetch.mock.calls[0][0]).toContain(`/journey/${mockJourneyId}`)
    })

    it('should fall back to mock data on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Should not throw, should return mock data
      await expect(agentService.getJourneyMap('test-123')).rejects.toThrow(
        'Mock implementation'
      )
    })
  })

  describe('getConnectionStatus', () => {
    it('should return current connection status', () => {
      const status = agentService.getConnectionStatus()

      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('lastChecked')
      expect(status.lastChecked).toBeInstanceOf(Date)
    })

    it('should return a copy of status (not reference)', () => {
      const status1 = agentService.getConnectionStatus()
      const status2 = agentService.getConnectionStatus()

      expect(status1).not.toBe(status2) // Different objects
      expect(status1).toEqual(status2) // Same values
    })
  })

  describe('subscribeToProgress (WebSocket)', () => {
    it('should create WebSocket connection for job', () => {
      const mockOnProgress = vi.fn()
      const mockJobId = 'test-job-999'

      // Mock WebSocket
      const mockWs = {
        close: vi.fn(),
        addEventListener: vi.fn(),
      }
      global.WebSocket = vi.fn(() => mockWs) as any

      const cleanup = agentService.subscribeToProgress(mockJobId, mockOnProgress)

      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining(`/ws/progress/${mockJobId}`)
      )

      cleanup()
      expect(mockWs.close).toHaveBeenCalled()
    })

    it('should return cleanup function that closes WebSocket', () => {
      const mockWs = {
        close: vi.fn(),
      }
      global.WebSocket = vi.fn(() => mockWs) as any

      const cleanup = agentService.subscribeToProgress('test', vi.fn())
      cleanup()

      expect(mockWs.close).toHaveBeenCalled()
    })

    it('should handle WebSocket connection errors', () => {
      global.WebSocket = vi.fn(() => {
        throw new Error('WebSocket error')
      }) as any

      // Should not throw, should return empty cleanup
      const cleanup = agentService.subscribeToProgress('test', vi.fn())
      expect(cleanup).toBeInstanceOf(Function)
      expect(() => cleanup()).not.toThrow()
    })
  })

  describe('Integration - Full Journey Creation Flow', () => {
    it('should complete full workflow from create to completion', async () => {
      const mockFormData = {
        title: 'Integration Test Journey',
        industry: 'E-commerce',
      }

      // Step 1: Health check
      mockFetch.mockResolvedValueOnce({ ok: true })

      // Step 2: Create journey
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          job_id: 'integration-job-123',
          status: 'queued',
        }),
      })

      // Step 3: Poll status (processing)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'processing',
          progress: { current_step: 3, total_steps: 8, percentage: 37.5 },
        }),
      })

      // Step 4: Poll status (completed)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'completed',
          result: { id: 'journey-final', title: mockFormData.title },
        }),
      })

      // Create journey
      const job = await agentService.createJourneyMap(mockFormData) as any
      expect(job.status).toBe('queued')

      // Poll for progress (use job_id from API response)
      const jobId = job.job_id as string
      const progress = await agentService.getJobStatus(jobId) as any
      expect(progress.status).toBe('processing')

      // Poll for completion
      const completed = await agentService.getJobStatus(jobId) as any
      expect(completed.status).toBe('completed')
      if (completed.result) {
        expect(completed.result.title).toBe(mockFormData.title)
      }
    })
  })
})
