export interface Job {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  formData: any;
  result?: JourneyMap;
  agentProgress?: AgentProgress;
  currentAgent?: string;
  estimatedCompletion?: Date;
}

export interface AgentProgress {
  currentStep: number;
  totalSteps: number;
  stepProgress: number;
  currentAgent: string;
  currentTask: string;
  completedSteps: AgentStep[];
  estimatedTimeRemaining: number;
}

export interface AgentStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  output?: any;
  tasks: AgentTask[];
}

export interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
}

export interface JourneyMap {
  id: string;
  title: string;
  industry: string;
  createdAt: Date;
  personas: Persona[];
  journeyPhases: JourneyPhase[];
  insights: Insights;
  formData: any;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  demographics: {
    age: string;
    location: string;
    income: string;
  };
  goals: string[];
  painPoints: string[];
  motivations: string[];
  quote: string;
}

export interface JourneyPhase {
  id: string;
  name: string;
  description: string;
  touchpoints: string[];
  emotions: {
    positive: string[];
    negative: string[];
  };
  painPoints: string[];
  opportunities: string[];
  quotes: string[];
}

export interface Insights {
  keyFindings: string[];
  recommendations: string[];
  emotionalJourney: {
    highest: string;
    lowest: string;
  };
}