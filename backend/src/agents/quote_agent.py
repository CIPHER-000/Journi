from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any

class QuoteAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Customer Voice & Quote Specialist",
            goal="Generate authentic, emotionally resonant customer quotes and insights that bring personas and journey phases to life",
            backstory="""You are a customer insights expert with a talent for capturing authentic customer voice. 
            You understand how customers really think, speak, and express their experiences. You excel at creating 
            quotes that feel genuine and emotionally connect with stakeholders while accurately representing 
            customer sentiment at different journey stages.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_task(self, form_data: Dict[str, Any], context_analysis: str, personas: str, journey_phases: str, research_insights: str) -> Task:
        return Task(
            description=f"""
            Generate authentic customer quotes and emotional insights:
            
            CONTEXT ANALYSIS:
            {context_analysis}
            
            PERSONAS:
            {personas}
            
            JOURNEY PHASES:
            {journey_phases}
            
            RESEARCH INSIGHTS:
            {research_insights}
            
            FORM DATA:
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            
            Generate:
            1. Enhanced persona quotes that capture their core mindset and motivations
            2. Journey phase quotes that reflect customer emotions and thoughts at each stage
            3. Pain point quotes that express frustrations authentically
            4. Success moment quotes that capture positive experiences
            5. Emotional insights that explain the "why" behind customer behavior
            6. Voice-of-customer insights that stakeholders can relate to
            
            Ensure quotes are:
            - Authentic and realistic (how customers actually speak)
            - Emotionally resonant and relatable
            - Specific to the industry and context
            - Varied in tone and perspective across personas
            - Actionable for business decision-making
            
            Include both positive and negative sentiment quotes to show the full emotional journey.
            """,
            agent=self.agent,
            expected_output="A collection of authentic customer quotes and emotional insights for personas and journey phases, including both positive and negative sentiments that bring the customer experience to life."
        )