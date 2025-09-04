# CrewAI Agent Architecture

This directory will contain the CrewAI agent implementations for Journi's 8-step workflow.

## Agent Structure

Each agent is a specialized AI worker that handles a specific aspect of customer journey map generation:

### 1. Context Analysis Agent (`context_agent.py`)
- **Role**: Business Context Analyst
- **Goal**: Understand business objectives, industry context, and project requirements
- **Tasks**: 
  - Parse business goals and objectives
  - Analyze industry-specific considerations
  - Set context for downstream agents
- **Tools**: Industry knowledge base, business analysis frameworks

### 2. Persona Creation Agent (`persona_agent.py`)
- **Role**: Customer Persona Specialist
- **Goal**: Create detailed, realistic customer personas based on target segments
- **Tasks**:
  - Generate demographic profiles
  - Define goals, motivations, and pain points
  - Create authentic persona narratives
- **Tools**: Demographic databases, persona templates, behavioral analysis

### 3. Journey Mapping Agent (`journey_agent.py`)
- **Role**: Customer Journey Architect
- **Goal**: Map comprehensive customer journey phases and touchpoints
- **Tasks**:
  - Define journey phases and stages
  - Identify key touchpoints and interactions
  - Map customer actions and decisions
- **Tools**: Journey mapping frameworks, touchpoint databases

### 4. Research Integration Agent (`research_agent.py`)
- **Role**: Research Data Analyst
- **Goal**: Process and integrate uploaded research materials
- **Tasks**:
  - Parse uploaded documents (PDF, DOCX, CSV, TXT)
  - Extract key insights and quotes
  - Integrate findings with journey map
- **Tools**: Document parsing, NLP analysis, insight extraction

### 5. Quote Generation Agent (`quote_agent.py`)
- **Role**: Customer Voice Specialist
- **Goal**: Generate authentic customer quotes and testimonials
- **Tasks**:
  - Create realistic customer quotes for each journey phase
  - Ensure voice consistency with personas
  - Generate contextual testimonials
- **Tools**: Language models, voice consistency checkers

### 6. Emotion Validation Agent (`emotion_agent.py`)
- **Role**: Emotional Journey Analyst
- **Goal**: Analyze and validate emotional patterns throughout the journey
- **Tasks**:
  - Map emotional highs and lows
  - Validate emotion-touchpoint relationships
  - Identify emotional pain points and opportunities
- **Tools**: Emotion analysis models, sentiment analysis

### 7. Output Formatting Agent (`formatting_agent.py`)
- **Role**: Visualization Specialist
- **Goal**: Format and structure the final journey map output
- **Tasks**:
  - Structure data for frontend consumption
  - Ensure consistency and completeness
  - Optimize for visualization
- **Tools**: Data formatting utilities, validation schemas

### 8. Quality Assurance Agent (`qa_agent.py`)
- **Role**: Quality Assurance Specialist
- **Goal**: Review and refine the complete journey map
- **Tasks**:
  - Validate data consistency and completeness
  - Check for logical flow and coherence
  - Perform final quality checks
- **Tools**: Validation frameworks, quality metrics

## CrewAI Workflow Coordination

The `crew_coordinator.py` file orchestrates the entire workflow:

```python
from crewai import Crew, Agent, Task

class JourneyMapCrew:
    def __init__(self):
        self.agents = self._create_agents()
        self.tasks = self._create_tasks()
        self.crew = Crew(
            agents=self.agents,
            tasks=self.tasks,
            verbose=True,
            process=Process.sequential
        )
    
    def generate_journey_map(self, form_data):
        return self.crew.kickoff(inputs=form_data)
```

## Integration Points

### Frontend Integration
- `src/services/agentService.ts` - API interface for CrewAI backend
- Real-time progress updates via WebSocket
- Job status tracking and management

### Backend API (Future Implementation)
```
POST /api/journey/create
GET /api/journey/status/{job_id}
GET /api/journey/{journey_id}
WebSocket /ws/progress/{job_id}
```

## Development Phases

1. **Phase 1**: Mock implementation (current)
2. **Phase 2**: CrewAI agent development
3. **Phase 3**: Backend API integration
4. **Phase 4**: Real-time progress tracking
5. **Phase 5**: Production deployment

## Environment Setup

```bash
# Install CrewAI and dependencies
pip install crewai
pip install langchain
pip install openai  # or other LLM provider

# Set environment variables
export OPENAI_API_KEY="your-api-key"
export CREWAI_API_KEY="your-crewai-key"
```

This architecture ensures clean separation of concerns while maintaining the collaborative nature of CrewAI's multi-agent system.