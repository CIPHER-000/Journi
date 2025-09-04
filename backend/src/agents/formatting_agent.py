from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any

class FormattingAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Professional Output Formatter",
            goal="Format all journey mapping insights into professional, structured outputs ready for stakeholder presentation",
            backstory="""You are a business communication expert who specializes in transforming complex research 
            and analysis into clear, professional, and actionable business documents. You excel at structuring 
            information for maximum impact and creating outputs that drive decision-making.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_task(self, form_data: Dict[str, Any], context_analysis: str, personas: str, journey_phases: str, research_insights: str, customer_quotes: str, emotion_validation: str) -> Task:
        return Task(
            description=f"""
            Format all insights into a professional, comprehensive journey map output:
            
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
            
            EMOTION VALIDATION:
            {emotion_validation}
            
            FORM DATA:
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            
            Create a comprehensive, professional journey map output with:
            
            1. EXECUTIVE SUMMARY
            - Key findings and recommendations
            - Business impact and opportunities
            - Strategic priorities
            
            2. CUSTOMER PERSONAS (formatted as JSON array)
            - Complete persona profiles with all attributes
            - Goals, pain points, quotes, demographics
            - Behavioral insights and preferences
            
            3. JOURNEY MAP (formatted as JSON array)
            - Detailed phase mapping with all touchpoints
            - Emotional states and transitions
            - Pain points and opportunities
            - Customer quotes for each phase
            
            4. KEY INSIGHTS & RECOMMENDATIONS
            - Prioritized improvement opportunities
            - Quick wins and long-term strategies
            - Metrics and success measures
            
            5. IMPLEMENTATION ROADMAP
            - Actionable next steps
            - Resource requirements
            - Timeline considerations
            
            Format the personas and journey phases as valid JSON that matches the frontend data structure.
            Ensure all content is professional, actionable, and stakeholder-ready.
            """,
            agent=self.agent,
            expected_output="A comprehensive, professionally formatted journey map with executive summary, JSON-formatted personas and phases, key insights, recommendations, and implementation roadmap."
        )