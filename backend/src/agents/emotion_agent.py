from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any

class EmotionAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Customer Emotion & Psychology Expert",
            goal="Validate and refine emotional states, psychological drivers, and pain points throughout the customer journey",
            backstory="""You are a customer psychology expert with deep understanding of emotional triggers, 
            behavioral patterns, and psychological drivers. You specialize in mapping emotional journeys and 
            identifying the psychological factors that influence customer decisions and experiences.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_task(self, form_data: Dict[str, Any], context_analysis: str, personas: str, journey_phases: str, research_insights: str, customer_quotes: str) -> Task:
        return Task(
            description=f"""
            Validate and enhance emotional mapping and psychological insights:
            
            CONTEXT ANALYSIS:
            {context_analysis}
            
            PERSONAS:
            {personas}
            
            JOURNEY PHASES:
            {journey_phases}
            
            RESEARCH INSIGHTS:
            {research_insights}
            
            CUSTOMER QUOTES:
            {customer_quotes}
            
            FORM DATA:
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            
            Validate and enhance:
            1. Emotional states at each journey phase (ensure psychological accuracy)
            2. Pain point severity and emotional impact
            3. Psychological triggers and motivators
            4. Emotional transition patterns between phases
            5. Stress points and anxiety drivers
            6. Delight moments and positive emotional peaks
            7. Trust-building and trust-breaking moments
            8. Decision-making emotional factors
            
            Provide:
            - Validated emotional journey with psychological backing
            - Enhanced pain point analysis with emotional context
            - Opportunity identification based on emotional gaps
            - Recommendations for emotional experience improvement
            - Psychological insights that explain customer behavior
            
            Ensure emotional mapping is realistic, actionable, and psychologically sound.
            """,
            agent=self.agent,
            expected_output="Validated emotional journey mapping with psychological insights, enhanced pain point analysis, and emotionally-driven recommendations for experience improvement."
        )