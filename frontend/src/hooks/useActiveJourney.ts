import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

export function useActiveJourney() {
  const { token } = useAuth()
  const [hasActiveJourney, setHasActiveJourney] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkActiveJourneys = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/auth/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Check if any recent journeys are in processing/queued state
        const activeJourneys = data.usage?.recent_journeys?.filter(
          (j: any) => j.status === 'processing' || j.status === 'queued'
        )
        setHasActiveJourney(activeJourneys && activeJourneys.length > 0)
      } else {
        setError('Failed to check journey status')
      }
    } catch (err) {
      console.error('Error checking active journeys:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkActiveJourneys()
  }, [token])

  // Refetch function for manual checks
  const refetch = () => {
    checkActiveJourneys()
  }

  return {
    hasActiveJourney,
    loading,
    error,
    refetch
  }
}