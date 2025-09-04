from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any

class JourneyAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Customer Journey Mapping Expert",
            goal="Map detailed customer journey phases with actions, touchpoints, emotions, and experience moments",
            backstory="""You are a customer experience expert specializing in journey mapping. 
            You have deep understanding of customer behavior, touchpoint optimization, and experience design. 
            You excel at identifying critical moments of truth and mapping the complete customer experience 
            across all phases of their relationship with a business.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_task(self, form_data: Dict[str, Any], context_analysis: str, personas: str) -> Task:
        journey_phases = form_data.get('journey_phases', [])
        phases_text = ', '.join(journey_phases) if journey_phases else 'Standard journey phases'
        
        return Task(
            description=f"""
            Create a detailed customer journey map based on the context analysis and personas:
            
            CONTEXT ANALYSIS:
            {context_analysis}
            
            PERSONAS:
            {personas}
            
            FORM DATA:
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            Target Personas: {', '.join(form_data.get('target_personas', []))}
            Journey Phases: {phases_text}
            Additional Context: {form_data.get('additional_context', 'None provided')}
            
            For each journey phase, map out:
            1. Phase name and description
            2. Customer actions and behaviors
            3. Touchpoints and channels used
            4. Emotional state (happy, neutral, frustrated, excited)
            5. Pain points and friction areas
            6. Opportunities for improvement
            7. Key performance indicators
            8. A representative customer quote for this phase
            
            Ensure the journey:
            - Reflects the personas' needs and behaviors
            - Aligns with industry best practices
            - Supports the stated business goals
            - Identifies clear optimization opportunities
            - Shows realistic emotional progression
            
            Format as JSON with phase objects containing all specified fields.
            """,
            agent=self.agent,
            expected_output="A JSON array of detailed journey phases with actions, touchpoints, emotions, pain points, opportunities, and customer quotes for each phase."
        )