import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useActiveJourney } from '../../../src/hooks/useActiveJourney'

// Mock AuthContext
vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: 'test-token' }))
}))

// Mock fetch
global.fetch = vi.fn() as any

describe('useActiveJourney Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockClear()
  })

  it('should initialize with loading state', () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ usage: { recent_journeys: [] } }),
    } as Response)

    const { result } = renderHook(() => useActiveJourney())

    expect(result.current.loading).toBe(true)
    expect(result.current.hasActiveJourney).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should detect active journeys', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        usage: {
          recent_journeys: [
            { id: '1', status: 'processing' },
            { id: '2', status: 'completed' }
          ]
        }
      }),
    } as Response)

    const { result } = renderHook(() => useActiveJourney())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.hasActiveJourney).toBe(true)
  })

  it('should not detect active journeys when all are completed', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        usage: {
          recent_journeys: [
            { id: '1', status: 'completed' },
            { id: '2', status: 'completed' }
          ]
        }
      }),
    } as Response)

    const { result } = renderHook(() => useActiveJourney())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.hasActiveJourney).toBe(false)
  })

  it('should detect queued journeys', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        usage: {
          recent_journeys: [
            { id: '1', status: 'queued' }
          ]
        }
      }),
    } as Response)

    const { result } = renderHook(() => useActiveJourney())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.hasActiveJourney).toBe(true)
  })

  it('should handle API errors', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useActiveJourney())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to check journey status')
  })

  it('should handle network errors', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useActiveJourney())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
  })

  it('should provide refetch function', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ usage: { recent_journeys: [] } }),
    } as Response)

    const { result } = renderHook(() => useActiveJourney())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.refetch).toBeInstanceOf(Function)
  })

  it('should refetch when refetch is called', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ usage: { recent_journeys: [] } }),
    } as Response)

    const { result } = renderHook(() => useActiveJourney())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialCallCount = vi.mocked(global.fetch).mock.calls.length

    result.current.refetch()

    await waitFor(() => {
      expect(vi.mocked(global.fetch).mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })
})
