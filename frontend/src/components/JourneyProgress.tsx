import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Bot, AlertTriangle, Wifi, WifiOff, Loader2, X, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useJobProgress, ProgressMessage } from '../hooks/useJobProgress';

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

interface JourneyProgressProps {
  jobId: string;
  title: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function JourneyProgress({ jobId, title, onComplete, onCancel }: JourneyProgressProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("connecting");
  const [progress, setProgress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Prevent duplicate navigation
  const handledNavRef = useRef(false);

  // Handle progress messages from the hook
  const handleProgressMessage = useCallback((message: ProgressMessage) => {
    console.log('📩 Progress message received:', message);
    
    setStatus(message.status);
    setConnectionStatus('connected');
    setError(null);
    
    if (message.progress) {
      setProgress(message.progress);
      setCurrentStep(message.progress.current_step || 0);
      setStepProgress(message.progress.percentage || 0);
      
      // Set start time on first progress update
      if (!startTime && message.progress.current_step > 0) {
        setStartTime(new Date());
      }
    }
    
    // Handle completion - navigate only once
    if ((message.status === 'completed' || message.status === 'failed') && !handledNavRef.current) {
      handledNavRef.current = true;
      
      if (message.status === 'completed' && message.result?.id) {
        console.log('🎉 Job completed, navigating to result:', message.result.id);
        if (onComplete) {
          onComplete();
        }
        setTimeout(() => {
          navigate(`/journey/${message.result.id}`, { replace: true });
        }, 2000);
      } else if (message.status === 'failed') {
        setError('Journey map generation failed');
      }
    }
  }, [navigate, onComplete, startTime]);

  // Use the custom hook for connection management
  const cleanup = useJobProgress(jobId, handleProgressMessage);

  // Update elapsed time every second
  React.useEffect(() => {
    if (!startTime || status === 'completed' || status === 'failed' || status === 'cancelled') return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, status]);

  // Calculate estimated completion time
  React.useEffect(() => {
    if (progress && startTime) {
      const currentStepIndex = progress.current_step - 1;
      const remainingSteps = AGENT_STEPS.slice(currentStepIndex + 1);
      const remainingTime = remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
      
      // Add current step remaining time (estimate based on progress)
      const currentStepInfo = AGENT_STEPS[currentStepIndex];
      if (currentStepInfo) {
        const currentStepRemaining = currentStepInfo.estimatedDuration * (1 - (progress.percentage / 100));
        const totalRemaining = remainingTime + currentStepRemaining;
        setEstimatedCompletion(new Date(Date.now() + totalRemaining * 1000));
      }
    }
  }, [progress, startTime]);

  // Handle cancellation
  const handleCancel = async () => {
    if (!showCancelConfirm) {
      setShowCancelConfirm(true);
      return;
    }

    setIsCancelling(true);
    setShowCancelConfirm(false);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'}/api/journey/cancel/${jobId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setStatus('cancelled');
        cleanup(); // Clean up connections
        if (onCancel) {
          onCancel();
        }
      } else {
        throw new Error('Failed to cancel job');
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      setError('Failed to cancel job');
    } finally {
      setIsCancelling(false);
    }
  };

  // Calculate total estimated duration
  const totalEstimatedDuration = AGENT_STEPS.reduce((sum, step) => sum + step.estimatedDuration, 0);

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
  const isCancelled = status === "cancelled";
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
                 isCancelled ? '🛑 Process Cancelled' :
                 '🤖 CrewAI Agents Working'}
              </h2>
              <p className="text-gray-600">{title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
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
                  <span>Connected</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Polling</span>
                </>
              )}
            </div>

            {/* Stop Button */}
            {status !== 'completed' && status !== 'failed' && status !== 'cancelled' && (
              <div className="relative">
                {showCancelConfirm ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Are you sure?</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      disabled={isCancelling || status === 'cancelled'}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Stopping...
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          Yes, Stop
                        </>
                      )}
                    </motion.button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={status === 'cancelled'}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Stop Process
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : 
                isFailed ? 'bg-red-500' :
                isCancelled ? 'bg-gray-500' :
                'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {currentStep ? `Step ${currentStep} of 8` : 'Initializing...'}
            </span>
            <span>
              {startTime && !isCompleted && !isFailed && !isCancelled ? formatTime(elapsedTime) : ''}
            </span>
          </div>
        </div>

        {/* Current Agent Status */}
        {status !== 'completed' && status !== 'failed' && status !== 'cancelled' && currentStep > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{currentStepInfo.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">{currentStepInfo.name}</h3>
                <p className="text-blue-700 mb-2">{currentStepInfo.description}</p>
                <p className="text-sm text-blue-600 font-medium">{progress?.message || 'Processing...'}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{Math.round(percentage)}%</div>
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
        {status !== 'completed' && status !== 'failed' && status !== 'cancelled' && (
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
        {status === 'completed' && (
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

        {status === 'failed' && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Generation Failed</h3>
            <p className="text-gray-600">Something went wrong during the AI agent workflow.</p>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🛑</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Process Cancelled</h3>
            <p className="text-gray-600 mb-4">The journey map generation was stopped to save resources.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Create New Journey
            </motion.button>
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