import { useEffect, useRef, useCallback } from 'react'

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
  const pollIntervalRef = useRef<number | null>(null)
  const pollControllerRef = useRef<AbortController | null>(null)
  const completedRef = useRef(false)
  const reconnectAttemptsRef = useRef(0)
  const destroyedRef = useRef(false)
  const isPollingRef = useRef(false)
  const wsAttemptingRef = useRef(false)
  const pingIntervalRef = useRef<number | null>(null)
  const lastPongRef = useRef<number>(Date.now())
  const keepAliveIntervalRef = useRef<number | null>(null)
  
  // Store onMessage in a ref to avoid re-running effect
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

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
      if (wsRef.current) {
        try { 
          wsRef.current.close(1000, 'switching-to-polling')
        } catch (e) {
          console.log('Error closing WebSocket:', e)
        }
        wsRef.current = null
      }

      // Prevent duplicate polling
      if (isPollingRef.current) {
        console.log('Polling already active, skipping')
        return
      }
      
      isPollingRef.current = true

      const poll = async () => {
        if (destroyedRef.current || completedRef.current) {
          console.log('Polling stopped: destroyed or completed')
          isPollingRef.current = false
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          return
        }

        // Don't abort if we're already polling
        if (pollControllerRef.current?.signal?.aborted === false) {
          // A poll is already in progress, skip this one
          return
        }

        // Create new controller for this poll
        const controller = new AbortController()
        pollControllerRef.current = controller

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
            error: data.error_message || data.error,
            timestamp: new Date().toISOString()
          }
          
          onMessageRef.current(progressMessage)
          
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            console.log('Job finished, stopping polling')
            completedRef.current = true
            isPollingRef.current = false
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
              pollIntervalRef.current = null
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            // Silently ignore abort errors - they're expected during cleanup
            return
          }
          if (!destroyedRef.current && !completedRef.current) {
            console.error('Polling error:', error)
            // Continue polling on error unless destroyed
          }
        } finally {
          // Clear the controller reference if this was our request
          if (pollControllerRef.current === controller) {
            pollControllerRef.current = null
          }
        }
      }

      // Start immediate poll
      poll()
      
      // Set interval for continuous polling
      if (!pollIntervalRef.current && !completedRef.current && !destroyedRef.current) {
        pollIntervalRef.current = window.setInterval(poll, 3000) // 3 second intervals for better UX
      }
    }

    const startWebSocket = () => {
      console.log('🔌 Attempting WebSocket connection for job:', jobId)
      
      // Ensure only 1 WebSocket instance and no concurrent attempts
      if (wsRef.current || wsAttemptingRef.current) {
        console.log('WebSocket already exists or connection in progress, skipping')
        return
      }
      
      wsAttemptingRef.current = true

      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        // Connection timeout - Render may take longer to establish connection
        const connectionTimeout = setTimeout(() => {
          console.log('WebSocket connection timeout, falling back to polling')
          wsAttemptingRef.current = false
          wsRef.current = null
          try {
            ws.close(1000, 'timeout')
          } catch (e) {
            console.log('Error closing timed out WebSocket:', e)
          }
          startPolling()
        }, 5000) // 5 second timeout - shorter to fallback quicker on Render

        ws.onopen = () => {
          clearTimeout(connectionTimeout)
          wsAttemptingRef.current = false
          console.log('✅ WebSocket connected for job:', jobId)
          reconnectAttemptsRef.current = 0
          lastPongRef.current = Date.now()
          
          // Start HTTP keep-alive to prevent Render from sleeping
          if (keepAliveIntervalRef.current) {
            clearInterval(keepAliveIntervalRef.current)
          }
          
          // Send HTTP request every 5 minutes to keep Render service awake
          keepAliveIntervalRef.current = window.setInterval(async () => {
            try {
              const healthUrl = `${import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'}/health`
              await fetch(healthUrl, { method: 'GET' })
              console.log('💓 Sent keep-alive ping to prevent service sleep')
            } catch (e) {
              console.log('Keep-alive ping failed:', e)
            }
          }, 4 * 60 * 1000) // Every 4 minutes (before the 5-minute timeout)
          
          // Start ping-pong mechanism
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current)
          }
          
          pingIntervalRef.current = window.setInterval(() => {
            if (destroyedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
                pingIntervalRef.current = null
              }
              return
            }
            
            // Check if we've received a pong recently
            const timeSinceLastPong = Date.now() - lastPongRef.current
            if (timeSinceLastPong > 30000) { // 30 seconds without pong - more aggressive for Render
              console.log('⚠️ No pong received for 30s, reconnecting...')
              ws.close(1000, 'pong-timeout')
              return
            }
            
            // Send ping more frequently to keep connection alive on Render
            try {
              ws.send(JSON.stringify({ type: 'ping' }))
              console.log('🏓 Sent ping')
            } catch (e) {
              console.log('Error sending ping:', e)
            }
          }, 10000) // Send ping every 10 seconds - more frequent for Render free tier
        }

        ws.onmessage = (event) => {
          if (destroyedRef.current) return
          
          try {
            // Handle plain text pong for backward compatibility
            if (event.data === 'pong') {
              console.log('🏓 Received pong (plain text)')
              lastPongRef.current = Date.now()
              return
            }
            
            const data = JSON.parse(event.data)
            
            // Handle structured messages
            if (data.type === 'ping') {
              // Server is pinging us, respond with pong
              try {
                ws.send(JSON.stringify({ type: 'pong' }))
                console.log('🏓 Responded to server ping')
              } catch (e) {
                console.log('Error sending pong:', e)
              }
              return
            }
            
            if (data.type === 'pong') {
              console.log('🏓 Received pong (structured)')
              lastPongRef.current = Date.now()
              return
            }
            
            console.log('📩 WebSocket message:', data)
            
            // Handle status updates
            if (data.type === 'status' || data.job_id) {
              // Validate message is for this job
              if (data.job_id && data.job_id !== jobId) {
                console.warn(`Received message for different job: ${data.job_id} (expected: ${jobId})`)
                return
              }

              onMessageRef.current(data)
              
              if (['completed', 'failed', 'cancelled'].includes(data.status)) {
                console.log('Job finished via WebSocket, closing connection')
                completedRef.current = true
                
                // Clear ping interval
                if (pingIntervalRef.current) {
                  clearInterval(pingIntervalRef.current)
                  pingIntervalRef.current = null
                }
                
                try {
                  ws.close(1000, 'job-completed')
                } catch (e) {
                  console.log('Error closing completed WebSocket:', e)
                }
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          wsAttemptingRef.current = false
          console.error('❌ WebSocket error:', error)
        }

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          wsAttemptingRef.current = false
          console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`)
          wsRef.current = null
          
          if (destroyedRef.current || completedRef.current) {
            console.log('WebSocket closed: component destroyed or job completed')
            return
          }

          // More aggressive reconnection for Render's 5-minute timeout issue
          const attempts = ++reconnectAttemptsRef.current
          if (attempts <= 5) { // More attempts before giving up
            const delay = Math.min(500 * Math.pow(1.5, attempts), 3000) // Faster reconnect
            console.log(`🔄 Reconnecting WebSocket in ${delay}ms (attempt ${attempts}/5)`)
            
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
        wsAttemptingRef.current = false
        console.error('WebSocket setup failed:', error)
        startPolling()
      }
    }

    // Start with WebSocket, fallback to polling if needed
    startWebSocket()

    // Cleanup function
    return () => {
      console.log('🧽 Cleaning up job progress for:', jobId)
      destroyedRef.current = true
      wsAttemptingRef.current = false
      isPollingRef.current = false
      
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }
      
      // Clear keep-alive interval
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current)
        keepAliveIntervalRef.current = null
      }
      
      // Close WebSocket
      try {
        if (wsRef.current) {
          wsRef.current.close(1000, 'cleanup')
          wsRef.current = null
        }
      } catch (e) {
        console.log('Error closing WebSocket during cleanup:', e)
      }

      // Clear polling interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }

      // Abort any pending requests
      if (pollControllerRef.current) {
        pollControllerRef.current.abort()
        pollControllerRef.current = null
      }
    }
  }, [jobId]) // Only re-run when jobId changes

  // Return cleanup function for manual cleanup if needed
  return () => {
    destroyedRef.current = true
    wsAttemptingRef.current = false
    isPollingRef.current = false
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    
    try { wsRef.current?.close(1000, 'manual-cleanup') } catch {}
    wsRef.current = null
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    
    if (pollControllerRef.current) {
      pollControllerRef.current.abort()
      pollControllerRef.current = null
    }
  }
}