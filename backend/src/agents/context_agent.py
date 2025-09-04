from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any

class ContextAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Business Context Analyzer",
            goal="Analyze business context, industry specifics, and strategic goals to establish foundation for customer journey mapping",
            backstory="""You are an expert business analyst with deep knowledge across industries. 
            You excel at understanding business contexts, market dynamics, and strategic objectives. 
            Your role is to set the foundation for customer journey mapping by thoroughly analyzing 
            the business environment and goals.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_task(self, form_data: Dict[str, Any]) -> Task:
        return Task(
            description=f"""
            Analyze the business context for customer journey mapping:
            
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            Target Personas: {form_data.get('target_personas', [])}
            Journey Phases: {form_data.get('journey_phases', [])}
            Additional Context: {form_data.get('additional_context', 'None provided')}
            Uploaded Files: {len(form_data.get('uploaded_files', []))} research files uploaded
            
            Your analysis should include:
            1. Industry-specific characteristics and market dynamics
            2. Key business objectives and success metrics
            3. Competitive landscape considerations
            4. Customer behavior patterns typical in this industry
            5. Strategic recommendations for journey mapping focus
            
            Provide a comprehensive context analysis that will guide the subsequent agents.
            """,
            agent=self.agent,
            expected_output="A detailed business context analysis with industry insights, strategic objectives, and recommendations for journey mapping focus."
        )