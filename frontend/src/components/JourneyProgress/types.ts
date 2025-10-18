/**
 * Type definitions for Journey Progress component
 */

export interface JourneyProgressProps {
  jobId: string;
  title: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export type JobStatus = 
  | 'connecting'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ProgressData {
  current_step: number;
  total_steps: number;
  step_name: string;
  message: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}

export interface JourneyResult {
  id: string;
  title: string;
  // Add other result fields as needed
  [key: string]: any;
}
