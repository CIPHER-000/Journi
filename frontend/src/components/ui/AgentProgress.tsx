import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  progress?: number;
}

interface AgentProgressProps {
  steps: AgentStep[];
  isPolling?: boolean;
  onPoll?: () => void;
  pollInterval?: number;
  className?: string;
}

export function AgentProgress({
  steps,
  isPolling = false,
  onPoll,
  pollInterval = 3000,
  className = ''
}: AgentProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [polling, setPolling] = useState(isPolling);

  useEffect(() => {
    let pollTimer: NodeJS.Timeout;

    if (polling && onPoll) {
      pollTimer = setInterval(() => {
        onPoll();
      }, pollInterval);
    }

    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [polling, onPoll, pollInterval]);

  useEffect(() => {
    // Find the first non-completed step
    const firstIncompleteStep = steps.findIndex(step => step.status !== 'completed');
    if (firstIncompleteStep !== -1) {
      setCurrentStep(firstIncompleteStep);
    } else {
      setCurrentStep(steps.length - 1);
    }
  }, [steps]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: string, index: number) => {
    if (status === 'completed') return 'border-green-200 bg-green-50';
    if (status === 'running') return 'border-blue-200 bg-blue-50';
    if (status === 'failed') return 'border-red-200 bg-red-50';
    if (index < currentStep) return 'border-green-200 bg-green-50';
    return 'border-gray-200 bg-gray-50';
  };

  const overallProgress = steps.reduce((acc, step) => {
    if (step.status === 'completed') return acc + 1;
    if (step.status === 'running' && step.progress) return acc + (step.progress / 100);
    return acc;
  }, 0) / steps.length * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Processing Journey</h3>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(overallProgress)}% Complete
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Polling Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {polling && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Live updates</span>
              </>
            )}
          </div>
          <button
            onClick={() => setPolling(!polling)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {polling ? 'Pause updates' : 'Resume updates'}
          </button>
        </div>
      </div>

      {/* Step-by-step Progress */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Processing Steps
        </h4>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200">
            <motion.div
              className="w-full bg-gradient-to-b from-primary-600 to-secondary-600"
              initial={{ height: 0 }}
              animate={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start space-x-4"
              >
                {/* Step Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 ${getStepColor(step.status, index)} flex items-center justify-center`}>
                  {getStepIcon(step.status)}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-semibold text-gray-900">
                      {step.name}
                    </h5>
                    <div className="flex items-center space-x-2">
                      {step.duration && (
                        <span className="text-xs text-gray-500">
                          {step.duration}s
                        </span>
                      )}
                      {step.status === 'running' && step.progress && (
                        <span className="text-xs font-medium text-blue-600">
                          {Math.round(step.progress)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {step.description}
                  </p>

                  {/* Step Progress (for running steps) */}
                  {step.status === 'running' && step.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Step Error (for failed steps) */}
                  {step.status === 'failed' && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        This step encountered an error. Please try again or contact support.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Summary */}
      {overallProgress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">Journey Complete!</h4>
              <p className="text-sm text-green-700">
                Your customer journey map is ready to view.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}