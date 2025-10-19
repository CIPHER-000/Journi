import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface Journey {
  id: string
  title: string
  industry?: string
  createdAt: Date | string
  status: 'completed' | 'processing' | 'failed' | 'queued' | 'running'
}

interface JourneysData {
  journeys: Journey[]
  totalCount: number
}

async function fetchJourneys(token: string): Promise<JourneysData> {
  const response = await fetch(`${API_BASE_URL}/auth/usage`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch journeys')
  }

  const data = await response.json()

  if (data.usage && data.usage.recent_journeys) {
    const transformedJourneys = data.usage.recent_journeys.map((journey: any) => ({
      id: journey.id,
      title: journey.title,
      industry: journey.industry || 'Unknown',
      createdAt: new Date(journey.created_at),
      status: journey.status as 'completed' | 'processing' | 'failed' | 'queued' | 'running'
    }))

    return {
      journeys: transformedJourneys,
      totalCount: transformedJourneys.length
    }
  }

  return {
    journeys: [],
    totalCount: 0
  }
}

/**
 * Hook to fetch and cache journeys data
 */
export function useJourneysData() {
  const { user, token } = useAuth()

  return useQuery({
    queryKey: ['journeys', user?.id],
    queryFn: () => fetchJourneys(token!),
    enabled: !!user && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  })
}

/**
 * Hook to invalidate journeys cache when data changes
 * Call this after creating, updating, or deleting a journey
 */
export function useInvalidateJourneys() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return {
    invalidate: () => {
      // Invalidate both journeys and dashboard cache
      queryClient.invalidateQueries({ queryKey: ['journeys', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] })
    },
    refetch: () => {
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['journeys', user?.id] })
      queryClient.refetchQueries({ queryKey: ['dashboard', user?.id] })
    }
  }
}

/**
 * Hook for journey mutations (create, update, delete)
 * Automatically invalidates cache on success
 */
export function useJourneyMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (journeyData: any) => {
      // This is a placeholder - implement actual API call
      return journeyData
    },
    onSuccess: () => {
      // Automatically invalidate and refetch queries when mutation succeeds
      queryClient.invalidateQueries({ queryKey: ['journeys', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] })
    },
  })
}
