import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Bot, AlertTriangle, Wifi, WifiOff, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Define the 8 CrewAI agent steps with realistic time estimates
const AGENT_STEPS = [
  { 
    id: 'context_agent', 
    name: 'Context Analysis Agent',
    description: 'Analyzing business context, industry specifics, and strategic goals',
    icon: '🎯',
    estimatedDuration: 45 // seconds
  },
  { 
    id: 'persona_agent', 
    name: 'Persona Creation Agent',
    description: 'Creating detailed customer personas with demographics and motivations',
    icon: '👥',
    estimatedDuration: 60
  },
  { 
    id: 'journey_agent', 
    name: 'Journey Mapping Agent',
    description: 'Mapping customer journey phases, touchpoints, and interactions',
    icon: '🗺️',
    estimatedDuration: 75
  },
  { 
    id: 'research_agent', 
    name: 'Research Integration Agent',
    description: 'Processing uploaded research materials and extracting insights',
    icon: '📊',
    estimatedDuration: 30
  },
  { 
    id: 'quote_agent', 
    name: 'Quote Generation Agent',
    description: 'Generating authentic customer quotes and voice insights',
    icon: '💬',
    estimatedDuration: 45
  },
  { 
    id: 'emotion_agent', 
    name: 'Emotion Validation Agent',
    description: 'Validating emotions, pain points, and psychological drivers',
    icon: '❤️',
    estimatedDuration: 40
  },
  { 
    id: 'formatting_agent', 
    name: 'Output Formatting Agent',
    description: 'Formatting professional outputs and visualizations',
    icon: '🎨',
    estimatedDuration: 35
  },
  { 
    id: 'qa_agent', 
    name: 'Quality Assurance Agent',
    description: 'Final quality check, validation, and refinement',
    icon: '✅',
    estimatedDuration: 30
  }
];

interface ProgressData {
  current_step: number;
  total_steps: number;
  step_name: string;
  message: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}

interface JourneyProgressProps {
  jobId: string;
  title: string;
  onComplete?: () => void;
}

export default function JourneyProgress({ jobId, title, onComplete }: JourneyProgressProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("connecting");
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  // Calculate total estimated duration
  const totalEstimatedDuration = AGENT_STEPS.reduce((sum, step) => sum + step.estimatedDuration, 0);

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime || status === 'completed' || status === 'failed') return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, status]);

  // Calculate estimated completion time
  useEffect(() => {
    if (progress && startTime) {
      const currentStepIndex = progress.current_step - 1;
      const remainingSteps = AGENT_STEPS.slice(currentStepIndex + 1);
      const remainingTime = remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
      
      // Add current step remaining time (estimate based on progress)
      const currentStep = AGENT_STEPS[currentStepIndex];
      if (currentStep) {
        const currentStepRemaining = currentStep.estimatedDuration * (1 - (progress.percentage / 100));
        const totalRemaining = remainingTime + currentStepRemaining;
        setEstimatedCompletion(new Date(Date.now() + totalRemaining * 1000));
      }
    }
  }, [progress, startTime]);

  // Polling fallback function
  const pollJobStatus = useCallback(async (jobId: string) => {
    // Prevent excessive polling if already completed/failed
    if (status === 'completed' || status === 'failed') {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'}/api/journey/status/${jobId}`,
        { 
          headers,
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error fetching job status:', response.status, response.statusText, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      } else {
        const data = await response.json()
        console.log('Job status polling result:', data)
        
        setStatus(data.status)
        
        // Update progress state properly
        if (data.progress) {
          setProgress(data.progress)
          setCurrentStep(data.progress.current_step || 0)
          setStepProgress(data.progress.percentage || 0)
        }
        
        if (data.status === 'completed') {
          const completedProgress = {
            current_step: 8,
            total_steps: 8,
            step_name: 'Completed',
            message: 'Journey map generated successfully!',
            percentage: 100
          }
          setProgress(completedProgress)
          setCurrentStep(8)
          setStepProgress(100)
          
          if (onComplete) {
            setTimeout(() => onComplete(), 1500)
          }
          
          // Navigate to the completed journey
          if (data.result?.id) {
            setTimeout(() => {
              navigate(`/journey/${data.result.id}`)
            }, 2000)
          }
          return // Stop polling
        } else if (data.status === 'failed') {
          setError('Journey map generation failed')
          return // Stop polling
        }
        
        // Continue polling if still processing
        if ((data.status === 'processing' || data.status === 'queued') && status !== 'completed' && status !== 'failed') {
          // Increase polling interval to reduce resource usage
          setTimeout(() => pollJobStatus(jobId), 8000) // Changed from 3s to 8s
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
      
      // Only retry if not completed/failed and haven't exceeded attempts
      if (status !== 'completed' && status !== 'failed' && reconnectAttempts < 5) {
        setReconnectAttempts(prev => prev + 1)
        setTimeout(() => pollJobStatus(jobId), 10000) // Longer delay on error
      } else {
        setError('Unable to connect to backend. Please refresh the page.')
      }
    } finally {
      // Don't set loading to false here since we're polling
    }
  }, [onComplete, navigate])

  // WebSocket connection function
  const connectWebSocket = useCallback(() => {
    if (!jobId) {
      console.error('No jobId provided for WebSocket connection');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com';
      const wsProtocol = baseUrl.startsWith('https') ? 'wss://' : 'ws://';
      const host = baseUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}${host}/ws/progress/${jobId}`;
      
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      const newWs = new WebSocket(wsUrl);

      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log('WebSocket connection timeout, falling back to polling');
        newWs.close();
        setConnectionStatus('disconnected');
        // Only start polling if not already polling
        if (!pollIntervalRef.current) {
          pollJobStatus(jobId);
        }
      }, 15000); // Increased timeout

      newWs.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("✅ WebSocket Connected");
        setConnectionStatus('connected');
        setError(null);
        setReconnectAttempts(0);
        
        // Send ping to keep connection alive
        newWs.send('ping');
      };

      newWs.onmessage = (event) => {
        try {
          if (event.data === 'pong') return; // Handle ping/pong
          
          console.log("📩 WebSocket message:", event.data);
          const data = JSON.parse(event.data);
          
          if (data.job_id && data.job_id !== jobId) {
            console.warn(`Received message for different job: ${data.job_id} (expected: ${jobId})`);
            return;
          }

          // Handle progress updates
          if (data.progress) {
            setProgress(data.progress);
            setCurrentStep(data.progress.current_step || 0);
            setStepProgress(data.progress.percentage || 0);
            setStatus(data.status || 'processing');
            
            // Set start time on first progress update
            if (!startTime) {
              setStartTime(new Date());
            }
          }

          // Handle completion
          if (data.status === 'completed') {
            const completedProgress = {
              current_step: 8,
              total_steps: 8,
              step_name: 'Completed',
              message: 'Journey map generated successfully!',
              percentage: 100
            };
            setProgress(completedProgress);
            setCurrentStep(8);
            setStepProgress(100);
            
            if (onComplete) {
              setTimeout(() => onComplete(), 1500);
            }
            
            // Navigate to the completed journey
            if (data.result?.id) {
              setTimeout(() => {
                navigate(`/journey/${data.result.id}`);
              }, 2000);
            }
            
            newWs.close();
          } else if (data.status === 'failed') {
            setError('Journey map generation failed');
            newWs.close();
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
        }
      };

      newWs.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error("❌ WebSocket error:", error);
        setConnectionStatus('disconnected');
        setError("Connection error. Falling back to polling...");
        
        // Fallback to polling only if not already polling
        if (!pollIntervalRef.current) {
          pollJobStatus(jobId);
        }
      };

      newWs.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`🔌 WebSocket closed:`, event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Only try to reconnect if not completed/failed and haven't exceeded attempts
        if (status !== 'completed' && status !== 'failed' && reconnectAttempts < 3) {
          const timeout = Math.min(2000 * Math.pow(2, reconnectAttempts), 20000);
          console.log(`🔄 Reconnecting in ${timeout}ms... (attempt ${reconnectAttempts + 1}/3)`);
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, timeout);
        } else if (reconnectAttempts >= 3) {
          console.log('Max reconnection attempts reached, falling back to polling');
          // Only start polling if not already polling
          if (!pollIntervalRef.current) {
            pollJobStatus(jobId);
          }
        }
      };

      wsRef.current = newWs;
      return newWs;
    } catch (error) {
      console.error('WebSocket setup failed:', error);
      setConnectionStatus('disconnected');
      // Only start polling if not already polling
      if (!pollIntervalRef.current) {
        pollJobStatus(jobId);
      }
    }
  }, [jobId, reconnectAttempts, status, onComplete, pollJobStatus, startTime, navigate]);

  // Initialize connection
  useEffect(() => {
    if (!jobId) return;
    
    console.log(`🔄 Initializing connection for job ${jobId}`);
    setStartTime(new Date());
    
    // Start with polling since WebSocket is failing
    pollJobStatus(jobId);
    
    // Try WebSocket as secondary option
    setTimeout(() => {
      if (connectionStatus === 'disconnected') {
        connectWebSocket();
      }
    }, 5000);
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [jobId, connectWebSocket]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} min${minutes !== 1 ? 's' : ''} remaining`;
  };

  // Get current step info
  const getCurrentStepInfo = () => {
    if (!currentStep) return AGENT_STEPS[0];
    const stepIndex = Math.max(0, Math.min(currentStep - 1, AGENT_STEPS.length - 1));
    return AGENT_STEPS[stepIndex];
  };

  const currentStepInfo = getCurrentStepInfo();
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const percentage = stepProgress;

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isCompleted ? '🎉 Journey Map Complete!' : 
                 isFailed ? '❌ Generation Failed' : 
                 '🤖 CrewAI Agents Working'}
              </h2>
              <p className="text-gray-600">{title}</p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'connecting'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live Updates</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Polling Mode</span>
              </>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(stepProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : 
                isFailed ? 'bg-red-500' : 
                'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${stepProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {currentStep ? `Step ${currentStep} of 8` : 'Initializing...'}
            </span>
            <span>
              {startTime && !isCompleted && !isFailed ? formatTime(elapsedTime) : ''}
            </span>
          </div>
        </div>

        {/* Current Agent Status */}
        {!isCompleted && !isFailed && currentStep > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{currentStepInfo.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">{currentStepInfo.name}</h3>
                <p className="text-blue-700 mb-2">{currentStepInfo.description}</p>
                <p className="text-sm text-blue-600 font-medium">{progress?.message || 'Processing...'}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{Math.round(stepProgress)}%</div>
                {estimatedCompletion && (
                  <div className="text-xs text-blue-600">
                    {formatTimeRemaining((estimatedCompletion.getTime() - Date.now()) / 1000)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Time Information */}
        {!isCompleted && !isFailed && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-gray-900">
                {startTime ? formatTime(elapsedTime) : '0:00'}
              </div>
              <div className="text-sm text-gray-600">Elapsed Time</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-gray-900">
                {estimatedCompletion 
                  ? formatTimeRemaining((estimatedCompletion.getTime() - Date.now()) / 1000) || '~0 mins'
                  : `~${Math.ceil(totalEstimatedDuration / 60)} mins`
                }
              </div>
              <div className="text-sm text-gray-600">Est. Remaining</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Connection Issue</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Journey Map Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your AI-powered customer journey map has been generated successfully.
            </p>
            <p className="text-sm text-gray-500">
              Total time: {startTime ? formatTime(elapsedTime) : 'Unknown'}
            </p>
          </div>
        )}

        {isFailed && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Generation Failed</h3>
            <p className="text-gray-600">Something went wrong during the AI agent workflow.</p>
          </div>
        )}
      </motion.div>

      {/* Agent Steps Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">CrewAI Agent Workflow</h3>
        
        <div className="space-y-3">
          {AGENT_STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isStepCompleted = currentStep > stepNumber;
            const isStepCurrent = currentStep === stepNumber;
            const isStepPending = currentStep < stepNumber;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                  isStepCurrent 
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                    : isStepCompleted 
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {/* Step Icon/Status */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  isStepCompleted 
                    ? 'bg-green-500 text-white' 
                    : isStepCurrent 
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {isStepCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : isStepCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 bg-white rounded-full"
                    />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{step.icon}</span>
                    <h4 className={`font-semibold ${
                      isStepCurrent ? 'text-blue-900' : isStepCompleted ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      {step.name}
                    </h4>
                  </div>
                  <p className={`text-sm ${
                    isStepCurrent ? 'text-blue-700' : isStepCompleted ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Current step progress message */}
                  {isStepCurrent && progress && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {progress.message}
                    </p>
                  )}
                </div>

                {/* Duration/Status */}
                <div className="text-right">
                  {isStepCompleted ? (
                    <span className="text-xs text-green-600 font-medium">✓ Complete</span>
                  ) : isStepCurrent ? (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-blue-600">
                        ~{Math.ceil(step.estimatedDuration / 60)}m
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      ~{Math.ceil(step.estimatedDuration / 60)}m
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Workflow Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {currentStep || 0}/{AGENT_STEPS.length}
              </div>
              <div className="text-sm text-gray-600">Agents Complete</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.ceil(totalEstimatedDuration / 60)} mins
              </div>
              <div className="text-sm text-gray-600">Total Est. Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {connectionStatus === 'connected' ? 'Live' : 'Polling'}
              </div>
              <div className="text-sm text-gray-600">Update Mode</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}