from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any

class QAAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Quality Assurance & Refinement Specialist",
            goal="Perform final quality check, ensure consistency, accuracy, and completeness of the journey map output",
            backstory="""You are a quality assurance expert with meticulous attention to detail and deep understanding 
            of customer journey mapping best practices. You ensure all outputs meet professional standards, are 
            internally consistent, and provide maximum value to stakeholders.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_task(self, form_data: Dict[str, Any], formatted_output: str) -> Task:
        return Task(
            description=f"""
            Perform comprehensive quality assurance on the journey map output:
            
            FORMATTED OUTPUT TO REVIEW:
            {formatted_output}
            
            ORIGINAL FORM DATA:
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            Target Personas: {form_data.get('target_personas', [])}
            Journey Phases: {form_data.get('journey_phases', [])}
            Additional Context: {form_data.get('additional_context', 'None provided')}
            
            Quality checks to perform:
            
            1. ACCURACY & CONSISTENCY
            - Verify all personas are realistic and well-developed
            - Ensure journey phases flow logically
            - Check emotional states are appropriate and consistent
            - Validate pain points and opportunities are actionable
            
            2. COMPLETENESS
            - Confirm all requested journey phases are included
            - Verify personas match the target audience
            - Ensure all required data fields are populated
            - Check that business goals are addressed
            
            3. PROFESSIONAL QUALITY
            - Review language for clarity and professionalism
            - Ensure recommendations are specific and actionable
            - Verify JSON formatting is valid and complete
            - Check that insights are valuable and relevant
            
            4. STAKEHOLDER VALUE
            - Assess if output drives decision-making
            - Ensure insights are prioritized by impact
            - Verify recommendations align with business goals
            - Check that the output is presentation-ready
            
            5. FINAL REFINEMENTS
            - Make any necessary corrections or improvements
            - Enhance clarity where needed
            - Ensure optimal structure and flow
            - Validate all technical formatting
            
            Provide the final, polished journey map output that meets the highest professional standards.
            """,
            agent=self.agent,
            expected_output="The final, quality-assured journey map output with all refinements, corrections, and enhancements applied, ready for stakeholder presentation and implementation."
        )