import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Zap, ArrowRight, Bot, X, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Job, AgentProgress } from '../types';
import { useJourney } from '../context/JourneyContext';

interface ProcessingStatusProps {
  job: Job;
}

const AGENT_STEPS = [
  { 
    id: 'context_agent', 
    label: 'Context Analysis Agent', 
    description: 'Analyzing business goals and industry context',
    icon: '🎯'
  },
  { 
    id: 'persona_agent', 
    label: 'Persona Creation Agent', 
    description: 'Generating detailed customer personas with demographics and motivations',
    icon: '👥'
  },
  { 
    id: 'journey_agent', 
    label: 'Journey Mapping Agent', 
    description: 'Mapping customer touchpoints and journey phases',
    icon: '🗺️'
  },
  { 
    id: 'research_agent', 
    label: 'Research Integration Agent', 
    description: 'Processing and analyzing uploaded research materials',
    icon: '📊'
  },
  { 
    id: 'quote_agent', 
    label: 'Quote Generation Agent', 
    description: 'Creating authentic customer quotes and testimonials',
    icon: '💬'
  },
  { 
    id: 'emotion_agent', 
    label: 'Emotion Validation Agent', 
    description: 'Analyzing emotional journey patterns and pain points',
    icon: '❤️'
  },
  { 
    id: 'formatting_agent', 
    label: 'Output Formatting Agent', 
    description: 'Creating professional visualizations and layouts',
    icon: '🎨'
  },
  { 
    id: 'qa_agent', 
    label: 'Quality Assurance Agent', 
    description: 'Final review, validation, and refinement',
    icon: '✅'
  }
];

export function ProcessingStatus({ job }: ProcessingStatusProps) {
  const navigate = useNavigate();
  const { agentProgress, connectionStatus, connectionError, clearConnectionError } = useJourney();

  const handleViewResult = () => {
    if (job.result) {
      navigate(`/journey/${job.result.id}`);
    }
  };

  // Connection Error Alert
  if (connectionError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-red-200 p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Backend Connection Failed
          </h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 font-mono">
              {connectionError}
            </p>
          </div>
          
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            The AI agents cannot process your request because the backend server is not running or accessible. 
            Please ensure the backend is started and try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={clearConnectionError}
              className="bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate('/create')}
              className="text-slate-600 hover:text-slate-900 px-6 py-3 rounded-xl font-semibold border border-slate-300 hover:border-slate-400 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  if (job.status === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Journey Map Complete!
        </h2>
        
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Your AI-powered customer journey map has been generated successfully. 
          Ready to explore the insights?
        </p>

        <button
          onClick={handleViewResult}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2 mx-auto"
        >
          <span>View Journey Map</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  if (job.status === 'failed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Agent Workflow Failed
        </h2>
        
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          The CrewAI agents encountered an issue while generating your journey map. Please try again or contact support if the problem persists.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-700 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
    >
      {/* Connection Status Indicator */}
      <div className="mb-6">
        <div className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
          connectionStatus.isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {connectionStatus.isConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Backend Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Backend Disconnected</span>
            </>
          )}
        </div>
        
        {connectionStatus.lastError && (
          <div className="mt-2 text-xs text-red-600 text-center">
            Last error: {connectionStatus.lastError}
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bot className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          {connectionStatus.isConnected ? 'CrewAI Agents at Work' : 'Waiting for Backend Connection'}
        </h2>
        
        <p className="text-slate-600 max-w-md mx-auto">
          {connectionStatus.isConnected 
            ? 'Our specialized AI agents are collaborating through the 8-step CrewAI workflow to create your comprehensive customer journey map.'
            : 'The AI agents are ready to work, but need a connection to the backend server to begin processing.'
          }
        </p>
        
        {agentProgress && connectionStatus.isConnected && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Overall Progress</span>
              <span>{Math.round((agentProgress.currentStep / agentProgress.totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(agentProgress.currentStep / agentProgress.totalSteps) * 100}%` }}
              />
            </div>
            <div className="text-sm text-slate-500">
              Estimated time remaining: {Math.ceil(agentProgress.estimatedTimeRemaining / 60)} minutes
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {AGENT_STEPS.map((step, index) => {
          // Only show progress if backend is connected
          const isCompleted = agentProgress && connectionStatus.isConnected ? index < agentProgress.currentStep : false;
          const isCurrent = agentProgress && connectionStatus.isConnected ? index === agentProgress.currentStep : false;
          const isPending = !connectionStatus.isConnected || (agentProgress ? index > agentProgress.currentStep : index >= 0);

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                isCurrent 
                  ? 'bg-blue-50 border border-blue-200' 
                  : isCompleted 
                    ? 'bg-green-50 border border-green-200'
                    : connectionStatus.isConnected 
                      ? 'bg-slate-50 border border-slate-200'
                      : 'bg-slate-100 border border-slate-300 opacity-60'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white'
                    : connectionStatus.isConnected
                      ? 'bg-slate-300 text-slate-600'
                      : 'bg-slate-400 text-slate-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-slate-600'
                }`}>
                  {step.label}
                </h3>
                <p className={`text-sm ${
                  isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-slate-500'
                }`}>
                  {step.description}
                </p>
                
                {isCurrent && agentProgress && connectionStatus.isConnected && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-600 font-medium">{agentProgress.currentTask}</p>
                  </div>
                )}
              </div>

              {isCurrent && connectionStatus.isConnected && (
                <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          {connectionStatus.isConnected 
            ? 'CrewAI agents working collaboratively • Estimated completion: 2-3 minutes'
            : 'Please start the backend server to begin agent processing'
          }
        </p>
      </div>
    </motion.div>
  );
}