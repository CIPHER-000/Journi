from crewai import Crew
from typing import Dict, Any, Callable, Optional
import json
import logging
import os
from ..models.auth import UserProfile
from langchain_openai import ChatOpenAI
from .context_agent import ContextAgent
from .persona_agent import PersonaAgent
from .journey_agent import JourneyAgent
from .research_agent import ResearchAgent
from .quote_agent import QuoteAgent
from .emotion_agent import EmotionAgent
from .formatting_agent import FormattingAgent
from .qa_agent import QAAgent

logger = logging.getLogger(__name__)

class CrewCoordinator:
    def __init__(self, user: UserProfile):
        self.user = user
        
        # Get OpenAI API key (BYOK or default)
        api_key = user.openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("No OpenAI API key available")
        
        self.llm = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o"),
            temperature=0.7,
            openai_api_key=api_key
        )
        
        # Initialize all agents
        self.context_agent = ContextAgent(self.llm)
        self.persona_agent = PersonaAgent(self.llm)
        self.journey_agent = JourneyAgent(self.llm)
        self.research_agent = ResearchAgent(self.llm)
        self.quote_agent = QuoteAgent(self.llm)
        self.emotion_agent = EmotionAgent(self.llm)
        self.formatting_agent = FormattingAgent(self.llm)
        self.qa_agent = QAAgent(self.llm)
    
    async def execute_workflow(self, form_data: Dict[str, Any], progress_callback: Optional[Callable] = None, job_id: Optional[str] = None) -> Dict[str, Any]:
        """Execute the complete 8-step CrewAI workflow"""
        
        try:
            logger.info(f"Starting CrewAI workflow with form data: {form_data}")
            
            # Step 1: Context Analysis
            if progress_callback:
                await progress_callback(1, "Context Analysis", "Analyzing business context and goals")
            
            context_task = self.context_agent.create_task(form_data)
            context_crew = Crew(
                agents=[self.context_agent.agent],
                tasks=[context_task],
                verbose=True
            )
            context_result = context_crew.kickoff()
            context_analysis = str(context_result)
            logger.info("Step 1 completed: Context Analysis")
            
            # Step 2: Persona Creation
            if progress_callback:
                await progress_callback(2, "Persona Creation", "Creating detailed customer personas")
            
            persona_task = self.persona_agent.create_task(form_data, context_analysis)
            persona_crew = Crew(
                agents=[self.persona_agent.agent],
                tasks=[persona_task],
                verbose=True
            )
            persona_result = persona_crew.kickoff()
            personas = str(persona_result)
            logger.info("Step 2 completed: Persona Creation")
            
            # Step 3: Journey Mapping
            if progress_callback:
                await progress_callback(3, "Journey Mapping", "Mapping customer journey phases")
            
            journey_task = self.journey_agent.create_task(form_data, context_analysis, personas)
            journey_crew = Crew(
                agents=[self.journey_agent.agent],
                tasks=[journey_task],
                verbose=True
            )
            journey_result = journey_crew.kickoff()
            journey_phases = str(journey_result)
            logger.info("Step 3 completed: Journey Mapping")
            
            # Step 4: Research Integration
            if progress_callback:
                await progress_callback(4, "Research Integration", "Integrating uploaded research data")
            
            research_task = self.research_agent.create_task(form_data, context_analysis, personas, journey_phases)
            research_crew = Crew(
                agents=[self.research_agent.agent],
                tasks=[research_task],
                verbose=True
            )
            research_result = research_crew.kickoff()
            research_insights = str(research_result)
            logger.info("Step 4 completed: Research Integration")
            
            # Step 5: Quote Generation
            if progress_callback:
                await progress_callback(5, "Quote Generation", "Generating authentic customer quotes")
            
            quote_task = self.quote_agent.create_task(form_data, context_analysis, personas, journey_phases, research_insights)
            quote_crew = Crew(
                agents=[self.quote_agent.agent],
                tasks=[quote_task],
                verbose=True
            )
            quote_result = quote_crew.kickoff()
            customer_quotes = str(quote_result)
            logger.info("Step 5 completed: Quote Generation")
            
            # Step 6: Emotion Validation
            if progress_callback:
                await progress_callback(6, "Emotion Validation", "Validating emotions and pain points")
            
            emotion_task = self.emotion_agent.create_task(form_data, context_analysis, personas, journey_phases, research_insights, customer_quotes)
            emotion_crew = Crew(
                agents=[self.emotion_agent.agent],
                tasks=[emotion_task],
                verbose=True
            )
            emotion_result = emotion_crew.kickoff()
            emotion_validation = str(emotion_result)
            logger.info("Step 6 completed: Emotion Validation")
            
            # Step 7: Output Formatting
            if progress_callback:
                await progress_callback(7, "Output Formatting", "Formatting professional outputs")
            
            formatting_task = self.formatting_agent.create_task(form_data, context_analysis, personas, journey_phases, research_insights, customer_quotes, emotion_validation)
            formatting_crew = Crew(
                agents=[self.formatting_agent.agent],
                tasks=[formatting_task],
                verbose=True
            )
            formatting_result = formatting_crew.kickoff()
            formatted_output = str(formatting_result)
            logger.info("Step 7 completed: Output Formatting")
            
            # Step 8: Quality Assurance
            if progress_callback:
                await progress_callback(8, "Quality Assurance", "Final quality check and refinement")
            
            qa_task = self.qa_agent.create_task(form_data, formatted_output)
            qa_crew = Crew(
                agents=[self.qa_agent.agent],
                tasks=[qa_task],
                verbose=True
            )
            qa_result = qa_crew.kickoff()
            final_output = str(qa_result)
            logger.info("Step 8 completed: Quality Assurance")
            
            # Parse the final output to extract structured data
            journey_map_data = self._parse_final_output(final_output, form_data)
            
            return journey_map_data
            
        except Exception as e:
            logger.error(f"Error in CrewAI workflow: {str(e)}")
            raise e
    
    def _parse_final_output(self, final_output: str, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the final QA output into structured journey map data"""
        
        try:
            # Try to extract JSON from the output
            # This is a simplified parser - in production, you'd want more robust parsing
            
            # For now, return a structured format based on the output
            # In a real implementation, you'd parse the actual agent outputs
            
            return {
                "id": f"journey_{hash(final_output) % 10000}",
                "title": f"{form_data.get('industry', 'Business')} Customer Journey",
                "industry": form_data.get('industry', ''),
                "created_at": "2024-01-01T00:00:00Z",
                "personas": self._extract_personas_from_output(final_output),
                "phases": self._extract_phases_from_output(final_output, form_data),
                "insights": {
                    "key_findings": "Generated by CrewAI agents",
                    "recommendations": ["Improve customer experience", "Optimize touchpoints"],
                    "full_analysis": final_output
                }
            }
            
        except Exception as e:
            logger.error(f"Error parsing final output: {str(e)}")
            # Return a basic structure if parsing fails
            return {
                "id": "crewai_generated",
                "title": f"{form_data.get('industry', 'Business')} Customer Journey",
                "industry": form_data.get('industry', ''),
                "created_at": "2024-01-01T00:00:00Z",
                "personas": [],
                "phases": [],
                "insights": {"full_analysis": final_output}
            }
    
    def _extract_personas_from_output(self, output: str) -> list:
        """Extract persona data from agent output"""
        # This would parse the actual JSON from the formatting agent
        # For now, return a basic structure
        return [
            {
                "id": "1",
                "name": "AI Generated Persona 1",
                "age": "30-35",
                "occupation": "Professional",
                "goals": ["Achieve business objectives", "Improve efficiency"],
                "painPoints": ["Complex processes", "Lack of information"],
                "quote": "Generated by CrewAI agents based on your business context",
                "avatar": "👤"
            }
        ]
    
    def _extract_phases_from_output(self, output: str, form_data: Dict[str, Any]) -> list:
        """Extract journey phases from agent output"""
        phases = []
        journey_phases = form_data.get('journey_phases', ['Awareness', 'Consideration', 'Purchase'])
        
        for i, phase_name in enumerate(journey_phases):
            phases.append({
                "id": str(i + 1),
                "name": phase_name,
                "actions": [f"AI-generated action for {phase_name}"],
                "touchpoints": [f"Touchpoint for {phase_name}"],
                "emotions": "neutral",
                "painPoints": [f"Pain point identified by AI for {phase_name}"],
                "opportunities": [f"Opportunity identified by AI for {phase_name}"],
                "customerQuote": f"AI-generated quote for {phase_name} phase"
            })
        
        return phases