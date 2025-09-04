import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Job, JourneyMap, AgentProgress } from '../types';
import { agentService, ConnectionStatus } from '../services/agentService';

interface JourneyContextType {
  journeys: JourneyMap[];
  currentJob: Job | null;
  agentProgress: AgentProgress | null;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  createJourney: (formData: any) => Promise<void>;
  getJourney: (id: string) => JourneyMap | undefined;
  clearConnectionError: () => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journeys, setJourneys] = useState<JourneyMap[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [agentProgress, setAgentProgress] = useState<AgentProgress | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date()
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const createJourney = async (formData: any) => {
    try {
      // Clear any previous errors
      setConnectionError(null);
      
      // Upload files first if any
      if (formData.files && formData.files.length > 0) {
        const uploadedFilePaths = await agentService.uploadFiles(formData.files);
        formData.files = uploadedFilePaths;
      }
      
      // Create journey using real CrewAI backend
      const job = await agentService.createJourneyMap(formData);
      setCurrentJob(job);
      setAgentProgress(job.agentProgress || null);
      
      // Update connection status
      setConnectionStatus(agentService.getConnectionStatus());

      // Subscribe to real-time CrewAI progress updates
      const unsubscribe = agentService.subscribeToProgress(job.id, (progress) => {
        setAgentProgress(progress);
        setCurrentJob(prev => prev ? { ...prev, agentProgress: progress } : null);
        setConnectionStatus(agentService.getConnectionStatus());
      });

      // Poll for job completion (in production, WebSocket would handle this)
      const pollInterval = setInterval(async () => {
        try {
          const updatedJob = await agentService.getJobStatus(job.id);
          setCurrentJob(updatedJob);
          setConnectionStatus(agentService.getConnectionStatus());
          
          if (updatedJob.status === 'completed' && updatedJob.result) {
            setJourneys(prev => [updatedJob.result!, ...prev]);
            setAgentProgress(null);
            unsubscribe();
            clearInterval(pollInterval);
          } else if (updatedJob.status === 'failed') {
            setAgentProgress(null);
            unsubscribe();
            clearInterval(pollInterval);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Polling failed';
          console.error('Error polling job status:', errorMessage);
          setConnectionError(errorMessage);
          setConnectionStatus(agentService.getConnectionStatus());
        }
      }, 5000); // Poll every 5 seconds

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to create journey:', errorMessage);
      setConnectionError(errorMessage);
      setCurrentJob(prev => prev ? { ...prev, status: 'failed' } : null);
      setAgentProgress(null);
      setConnectionStatus(agentService.getConnectionStatus());
    }
  };

  const getJourney = (id: string) => {
    return journeys.find(journey => journey.id === id);
  };

  const clearConnectionError = () => {
    setConnectionError(null);
  };
  return (
    <JourneyContext.Provider value={{
      journeys,
      currentJob,
      agentProgress,
      connectionStatus,
      connectionError,
      createJourney,
      getJourney,
      clearConnectionError
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
