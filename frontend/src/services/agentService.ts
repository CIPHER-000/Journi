/**
 * Agent Service - Interface for CrewAI Backend Integration
 * 
 * This service will handle communication with the CrewAI-powered backend
 * Currently uses mock data but structured for easy CrewAI integration
 */

import { Job, JourneyMap, AgentProgress } from '../types';

export interface ConnectionStatus {
  isConnected: boolean;
  lastError?: string;
  lastChecked: Date;
}

export class AgentService {
  private baseUrl: string;
  private wsUrl: string;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastChecked: new Date()
  };

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  }

  /**
   * Create journey map using real CrewAI backend
   */
  async createJourneyMap(formData: any): Promise<Job> {
    try {
      // Test backend connection first
      await this.checkBackendConnection();
      
      const response = await fetch(`${this.baseUrl}/journey/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error (${response.status}): ${errorText}`);
      }
      
      this.connectionStatus.isConnected = true;
      this.connectionStatus.lastError = undefined;
      this.connectionStatus.lastChecked = new Date();
      
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create journey map:', errorMessage);
      
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastError = errorMessage;
      this.connectionStatus.lastChecked = new Date();
      
      // Throw the error instead of falling back to mock
      throw new Error(`Backend connection failed: ${errorMessage}`);
    }
  }

  /**
   * Check if backend is available
   */
  async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`, {
        method: 'GET',
        timeout: 5000
      } as any);
      
      if (response.ok) {
        this.connectionStatus.isConnected = true;
        this.connectionStatus.lastError = undefined;
        this.connectionStatus.lastChecked = new Date();
        return true;
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection timeout';
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastError = errorMessage;
      this.connectionStatus.lastChecked = new Date();
      return false;
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get current status of CrewAI job
   */
  async getJobStatus(jobId: string): Promise<Job> {
    try {
      const response = await fetch(`${this.baseUrl}/journey/status/${jobId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get job status (${response.status}): ${errorText}`);
      }
      
      this.connectionStatus.isConnected = true;
      this.connectionStatus.lastError = undefined;
      this.connectionStatus.lastChecked = new Date();
      
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get job status:', errorMessage);
      
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastError = errorMessage;
      this.connectionStatus.lastChecked = new Date();
      
      throw error;
    }
  }

  /**
   * Subscribe to real-time CrewAI progress updates via WebSocket
   */
  subscribeToProgress(jobId: string, onProgress: (progress: AgentProgress) => void): () => void {
    try {
      const ws = new WebSocket(`${this.wsUrl}/progress/${jobId}`);
      
      ws.onopen = () => {
        console.log(`WebSocket connected for job ${jobId}`);
        this.connectionStatus.isConnected = true;
        this.connectionStatus.lastError = undefined;
        this.connectionStatus.lastChecked = new Date();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.progress) {
            onProgress(data.progress);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
      
      ws.onerror = (error) => {
        const errorMessage = 'WebSocket connection failed';
        console.error('WebSocket error:', error);
        
        this.connectionStatus.isConnected = false;
        this.connectionStatus.lastError = errorMessage;
        this.connectionStatus.lastChecked = new Date();
      };
      
      return () => {
        ws.close();
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'WebSocket setup failed';
      console.error('Failed to establish WebSocket connection:', errorMessage);
      
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastError = errorMessage;
      this.connectionStatus.lastChecked = new Date();
      
      // Return empty cleanup function
      return () => {};
    }
  }

  /**
   * Upload research files to backend
   */
  async uploadFiles(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/api/files/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.uploaded_files || [];
      
    } catch (error) {
      console.error('Failed to upload files:', error);
      return []; // Return empty array on failure
    }
  }

  /**
   * Retrieve completed journey map from backend
   */
  async getJourneyMap(journeyId: string): Promise<JourneyMap> {
    try {
      const response = await fetch(`${this.baseUrl}/journey/${journeyId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get journey map:', error);
      // Fallback to mock
      return this.mockGetJourneyMap(journeyId);
    }
  }

  // Mock implementations for fallback/development
  private async mockCreateJourneyMap(formData: any): Promise<Job> {
    const job: Job = {
      id: `job_${Date.now()}`,
      status: 'queued',
      createdAt: new Date(),
      formData,
      currentAgent: 'context_agent',
      estimatedCompletion: new Date(Date.now() + 150000), // 2.5 minutes
      agentProgress: {
        currentStep: 0,
        totalSteps: 8,
        stepProgress: 0,
        currentAgent: 'context_agent',
        currentTask: 'Initializing workflow...',
        completedSteps: [],
        estimatedTimeRemaining: 150
      }
    };

    return job;
  }

  private async mockGetJobStatus(jobId: string): Promise<Job> {
    // This would query the actual job status from CrewAI
    throw new Error('Mock implementation - job status tracking not implemented');
  }

  private mockSubscribeToProgress(jobId: string, onProgress: (progress: AgentProgress) => void): () => void {
    // This simulates the real-time progress updates that would come from CrewAI
    let step = 0;
    const interval = setInterval(() => {
      if (step >= 8) {
        clearInterval(interval);
        return;
      }

      const progress: AgentProgress = {
        currentStep: step,
        totalSteps: 8,
        stepProgress: Math.random() * 100,
        currentAgent: this.getAgentForStep(step),
        currentTask: this.getTaskForStep(step),
        completedSteps: [],
        estimatedTimeRemaining: (8 - step) * 18
      };

      onProgress(progress);
      step++;
    }, 18000); // 18 seconds per step

    return () => clearInterval(interval);
  }

  private async mockGetJourneyMap(journeyId: string): Promise<JourneyMap> {
    // This would retrieve the completed journey map from CrewAI output
    throw new Error('Mock implementation - journey map retrieval not implemented');
  }

  private getAgentForStep(step: number): string {
    const agents = [
      'context_agent',
      'persona_agent', 
      'journey_agent',
      'research_agent',
      'quote_agent',
      'emotion_agent',
      'formatting_agent',
      'qa_agent'
    ];
    return agents[step] || 'unknown_agent';
  }

  private getTaskForStep(step: number): string {
    const tasks = [
      'Analyzing business context and goals...',
      'Creating detailed customer personas...',
      'Mapping journey phases and touchpoints...',
      'Processing research documents...',
      'Generating authentic customer quotes...',
      'Validating emotional journey patterns...',
      'Formatting professional output...',
      'Performing quality assurance review...'
    ];
    return tasks[step] || 'Processing...';
  }
}

export const agentService = new AgentService();