from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any, List

class PersonaAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Customer Persona Specialist",
            goal="Create detailed, research-backed customer personas with demographics, psychographics, goals, pain points, and behavioral patterns",
            backstory="""You are a customer research expert with extensive experience in persona development. 
            You combine quantitative data analysis with qualitative insights to create comprehensive, 
            actionable customer personas. You understand how to translate business goals into customer-centric 
            profiles that drive meaningful journey mapping.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_task(self, form_data: Dict[str, Any], context_analysis: str) -> Task:
        target_personas = form_data.get('target_personas', [])
        personas_text = ', '.join(target_personas) if target_personas else 'Not specified'
        
        return Task(
            description=f"""
            Based on the business context analysis and form data, create detailed customer personas:
            
            CONTEXT ANALYSIS:
            {context_analysis}
            
            FORM DATA:
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            Target Personas: {personas_text}
            Journey Phases: {', '.join(form_data.get('journey_phases', []))}
            Additional Context: {form_data.get('additional_context', 'None provided')}
            
            Create 2-3 detailed personas, each including:
            1. Demographics (age, occupation, income, location)
            2. Psychographics (values, interests, lifestyle)
            3. Goals and motivations
            4. Pain points and frustrations
            5. Behavioral patterns and preferences
            6. Technology usage and digital behavior
            7. Decision-making process
            8. A representative quote that captures their mindset
            9. An appropriate emoji avatar
            
            Ensure personas are:
            - Realistic and research-backed
            - Relevant to the industry and business goals
            - Distinct from each other
            - Actionable for journey mapping
            
            Format as JSON with persona objects containing all fields.
            """,
            agent=self.agent,
            expected_output="A JSON array of 2-3 detailed customer personas with all specified attributes including demographics, goals, pain points, quotes, and emoji avatars."
        )