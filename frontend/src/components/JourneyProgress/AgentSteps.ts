/**
 * Agent Steps Configuration
 * Defines the 8 CrewAI agent steps with realistic time estimates
 */

export interface AgentStep {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedDuration: number; // in seconds
}

export const AGENT_STEPS: AgentStep[] = [
  { 
    id: 'context_agent', 
    name: 'Context Analysis Agent',
    description: 'Analyzing business context, industry specifics, and strategic goals',
    icon: '🎯',
    estimatedDuration: 45
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

/**
 * Get total estimated duration for all agent steps
 */
export function getTotalEstimatedDuration(): number {
  return AGENT_STEPS.reduce((total, step) => total + step.estimatedDuration, 0);
}

/**
 * Get agent step by ID
 */
export function getAgentStepById(id: string): AgentStep | undefined {
  return AGENT_STEPS.find(step => step.id === id);
}

/**
 * Get agent step by index (0-based)
 */
export function getAgentStepByIndex(index: number): AgentStep | undefined {
  return AGENT_STEPS[index];
}
