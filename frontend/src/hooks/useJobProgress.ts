import { useEffect, useRef } from 'react'

export interface ProgressMessage {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress?: {
    current_step: number
    total_steps: number
    step_name: string
    message: string
    percentage: number
    estimatedTimeRemaining?: number
  }
  step_name?: string
  message?: string
  cancelled?: boolean
  result?: any
  error?: string
  timestamp?: string
}

export function useJobProgress(
  jobId: string, 
  onMessage: (message: ProgressMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null)
  const pollRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const completedRef = useRef(false)
  const reconnectAttemptsRef = useRef(0)
  const destroyedRef = useRef(false)

  useEffect(() => {
    if (!jobId) return

    // Reset state for new job
    destroyedRef.current = false
    completedRef.current = false
    reconnectAttemptsRef.current = 0

    const WS_URL = `wss://journi-backend.onrender.com/ws/progress/${jobId}`
    const HTTP_URL = `${import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'}/api/journey/status/${jobId}`

    const startPolling = () => {
      console.log('🔄 Starting polling for job:', jobId)
      
      // Clear any prior WebSocket
      try { 
        wsRef.current?.close(1000, 'switching-to-polling')
      } catch (e) {
        console.log('Error closing WebSocket:', e)
      }
      wsRef.current = null

      // Prevent duplicate polling
      if (pollRef.current) {
        console.log('Polling already active, skipping')
        return
      }

      const poll = async () => {
        if (destroyedRef.current || completedRef.current) {
          console.log('Polling stopped: destroyed or completed')
          return
        }

        // Abort previous request
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        try {
          const token = localStorage.getItem('auth_token')
          const headers: HeadersInit = {
            'Content-Type': 'application/json'
          }
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const res = await fetch(HTTP_URL, { 
            signal: controller.signal,
            headers,
            method: 'GET'
          })
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          }
          
          const data = await res.json()
          console.log('📊 Poll response:', data)
          
          // Transform backend response to match our interface
          const progressMessage: ProgressMessage = {
            job_id: jobId,
            status: data.status,
            progress: data.progress,
            result: data.result,
            error: data.error || data.error_message,
            timestamp: new Date().toISOString()
          }
          
          onMessage(progressMessage)
          
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            console.log('Job finished, stopping polling')
            completedRef.current = true
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Poll request aborted')
            return
          }
          console.error('Polling error:', error)
          // Continue polling on error unless destroyed
        }
      }

      // Start immediate poll, then set interval
      poll()
      pollRef.current = window.setInterval(poll, 8000) // 8 second intervals
    }

    const startWebSocket = () => {
      console.log('🔌 Attempting WebSocket connection for job:', jobId)
      
      // Ensure only 1 WebSocket instance
      if (wsRef.current) {
        console.log('WebSocket already exists, skipping')
        return
      }

      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        // Connection timeout
        const connectionTimeout = setTimeout(() => {
          console.log('WebSocket connection timeout, falling back to polling')
          try {
            ws.close(1000, 'timeout')
          } catch (e) {
            console.log('Error closing timed out WebSocket:', e)
          }
          startPolling()
        }, 10000) // 10 second timeout

        ws.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log('✅ WebSocket connected for job:', jobId)
          reconnectAttemptsRef.current = 0
          
          // Send ping to keep connection alive
          try {
            ws.send('ping')
          } catch (e) {
            console.log('Error sending ping:', e)
          }
        }

        ws.onmessage = (event) => {
          if (destroyedRef.current) return
          
          try {
            if (event.data === 'pong') {
              console.log('🏓 Received pong')
              return
            }
            
            const data = JSON.parse(event.data)
            console.log('📩 WebSocket message:', data)
            
            // Validate message is for this job
            if (data.job_id && data.job_id !== jobId) {
              console.warn(`Received message for different job: ${data.job_id} (expected: ${jobId})`)
              return
            }

            onMessage(data)
            
            if (['completed', 'failed', 'cancelled'].includes(data.status)) {
              console.log('Job finished via WebSocket, closing connection')
              completedRef.current = true
              try {
                ws.close(1000, 'job-completed')
              } catch (e) {
                console.log('Error closing completed WebSocket:', e)
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error('❌ WebSocket error:', error)
        }

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`)
          wsRef.current = null
          
          if (destroyedRef.current || completedRef.current) {
            console.log('WebSocket closed: component destroyed or job completed')
            return
          }

          // Exponential backoff for reconnection
          const attempts = ++reconnectAttemptsRef.current
          if (attempts <= 3) {
            const delay = Math.min(1000 * Math.pow(2, attempts), 8000)
            console.log(`🔄 Reconnecting WebSocket in ${delay}ms (attempt ${attempts}/3)`)
            
            setTimeout(() => {
              if (!destroyedRef.current && !completedRef.current) {
                startWebSocket()
              }
            }, delay)
          } else {
            console.log('Max WebSocket reconnection attempts reached, falling back to polling')
            startPolling()
          }
        }
      } catch (error) {
        console.error('WebSocket setup failed:', error)
        startPolling()
      }
    }

    // Start with WebSocket, fallback to polling if needed
    startWebSocket()

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up job progress for:', jobId)
      destroyedRef.current = true
      
      // Close WebSocket
      try {
        if (wsRef.current) {
          wsRef.current.close(1000, 'cleanup')
          wsRef.current = null
        }
      } catch (e) {
        console.log('Error closing WebSocket during cleanup:', e)
      }

      // Clear polling
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }

      // Abort any pending requests
      abortRef.current?.abort()
    }
  }, [jobId, onMessage])

  // Return cleanup function for manual cleanup if needed
  return () => {
    destroyedRef.current = true
    try { wsRef.current?.close(1000, 'manual-cleanup') } catch {}
    wsRef.current = null
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    abortRef.current?.abort()
  }
}