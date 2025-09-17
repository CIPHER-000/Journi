import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import JourneyProgress from '../components/JourneyProgress'
import JourneyMapPage from './JourneyMapPage'
import { useJobProgress, ProgressMessage } from '../hooks/useJobProgress'

interface Journey {
  id: string
  title: string
  status: 'completed' | 'processing' | 'failed' | 'queued'
  job_id?: string
  industry?: string
  created_at: string
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

export default function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [journey, setJourney] = useState<Journey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  // Log when JourneyDetailPage mounts
  useEffect(() => {
    console.log('📍 JourneyDetailPage mounted with id:', id);
  }, [id]);

  const refreshJourney = useCallback(async () => {
    if (!id || !token) return

    try {
      console.log('🔄 Refreshing journey data for:', id);
      // Use the unified endpoint that works for both running and completed journeys
      const response = await fetch(`${API_BASE_URL}/api/journey/${id}/info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Journey data received:', data);
        setJourney(data)
        setError(null)
      } else if (response.status === 404) {
        console.log('❌ Journey not found:', id);
        setError('Journey not found')
      } else {
        console.log('❌ Failed to load journey:', response.status);
        setError('Failed to load journey')
      }
    } catch (err) {
      console.error('Error fetching journey:', err)
      setError('Failed to load journey')
    }
  }, [id, token])

  // Retry failed journey lookups
  const handleRetry = useCallback(async () => {
    setError(null)
    setLoading(true)
    await refreshJourney()
    setLoading(false)
  }, [refreshJourney])

  // Handle progress messages for journey polling
  const handleProgressMessage = useCallback(async (message: ProgressMessage) => {
    console.log('📩 Journey progress message:', message);

    if (['completed', 'failed'].includes(message.status)) {
      // Journey completed or failed, refresh the journey data
      setIsPolling(false);
      await refreshJourney();
    }
  }, [refreshJourney]);

  // Setup polling for processing journeys
  useEffect(() => {
    console.log('🔄 Journey data updated:', journey);
    if (!journey || journey.status === 'completed' || journey.status === 'failed') {
      console.log('🛑 Journey completed or failed, no polling needed');
      return;
    }

    if (journey.status === 'processing' || journey.status === 'queued') {
      const jobId = journey.job_id || journey.id;
      console.log('🔄 Setting up polling for journey:', journey.id, 'with jobId:', jobId);
      setIsPolling(true);

      const cleanup = useJobProgress(jobId, handleProgressMessage);

      return () => {
        console.log('🧽 Cleaning up polling for journey:', journey.id);
        setIsPolling(false);
        if (cleanup) cleanup();
      };
    }
  }, [journey, handleProgressMessage]);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!id || !token) return

      try {
        await refreshJourney()
      } finally {
        setLoading(false)
      }
    }

    fetchJourney()
  }, [id, token])

  if (loading || isCompleting || isPolling) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {isCompleting ? 'Finalizing journey...' :
             isPolling ? 'Monitoring journey progress...' :
             'Loading journey...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !journey) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Journey not found'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/journeys')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Journeys
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show progress view for processing/queued journeys
  if (journey.status === 'processing' || journey.status === 'queued') {
    // Use journey ID as fallback for job_id if not provided
    const jobId = journey.job_id || journey.id

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => navigate('/journeys')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journeys
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{journey.title}</h1>
            <p className="text-gray-600">
              {journey.industry && `${journey.industry} • `}
              Status: <span className="font-medium">{journey.status}</span>
            </p>
          </div>
        </motion.div>

        {/* Progress view */}
        <JourneyProgress
          jobId={jobId}
          title={journey.title}
          onComplete={async () => {
            // Refresh journey data after completion
            setIsCompleting(true)
            await refreshJourney()
            setIsCompleting(false)
          }}
        />
      </div>
    )
  }

  // Show completed/failed journey map
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/journeys')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journeys
        </button>
      </motion.div>

      {/* Journey map view */}
      <JourneyMapPage journeyData={journey} />
    </div>
  )
}