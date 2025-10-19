import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface JourneyMap {
  id: string
  title: string
  industry?: string
  createdAt: Date | string
  status: 'completed' | 'processing' | 'failed' | 'queued' | 'running'
}

interface DashboardData {
  journeys: JourneyMap[]
  journeyCount: number
}

async function fetchDashboardData(token: string): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/auth/usage`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
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
      journeyCount: transformedJourneys.length
    }
  }

  return {
    journeys: [],
    journeyCount: 0
  }
}

export function useDashboardData() {
  const { user, token } = useAuth()

  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => fetchDashboardData(token!),
    enabled: !!user && !!token, // Only run if user and token exist
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists in memory (was cacheTime)
    refetchOnMount: false, // Don't refetch when component mounts if data is fresh
  })
}
