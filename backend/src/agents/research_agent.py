from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, Any, List
import os
import PyPDF2
import docx
import csv
import logging

logger = logging.getLogger(__name__)

class ResearchAgent:
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="Research Data Integration Specialist",
            goal="Analyze and integrate uploaded research documents to enrich customer journey insights",
            backstory="""You are a research analyst expert at extracting insights from various data sources. 
            You excel at synthesizing information from documents, surveys, analytics, and other research materials 
            to enhance customer understanding and validate journey mapping assumptions.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF file using multiple methods for better accuracy"""
        try:
            # Method 1: Try pdfplumber first (best for tables and complex layouts)
            try:
                with pdfplumber.open(file_path) as pdf:
                    text = ""
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                    
                    if text.strip():
                        logger.info(f"Successfully extracted PDF text using pdfplumber: {len(text)} characters")
                        return text.strip()
            except Exception as e:
                logger.warning(f"pdfplumber failed for {file_path}: {e}")
            
            # Method 2: Try PyMuPDF (good for scanned documents and images)
            try:
                doc = fitz.open(file_path)
                text = ""
                for page_num in range(doc.page_count):
                    page = doc[page_num]
                    page_text = page.get_text()
                    if page_text:
                        text += page_text + "\n"
                doc.close()
                
                if text.strip():
                    logger.info(f"Successfully extracted PDF text using PyMuPDF: {len(text)} characters")
                    return text.strip()
            except Exception as e:
                logger.warning(f"PyMuPDF failed for {file_path}: {e}")
            
            # Method 3: Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                    
                    if text.strip():
                        logger.info(f"Successfully extracted PDF text using PyPDF2: {len(text)} characters")
                        return text.strip()
            except Exception as e:
                logger.warning(f"PyPDF2 failed for {file_path}: {e}")
            
            return f"[Unable to extract text from PDF file: {file_path}. File may be image-based or corrupted.]"
            
        except Exception as e:
            logger.error(f"Error extracting PDF text from {file_path}: {e}")
            return f"[Error reading PDF file: {str(e)}]"
    
    def _extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX text from {file_path}: {e}")
            return f"[Error reading DOCX file: {str(e)}]"
    
    def _extract_csv_text(self, file_path: str) -> str:
        """Extract text from CSV file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                csv_reader = csv.reader(file)
                rows = []
                for i, row in enumerate(csv_reader):
                    if i < 100:  # Limit to first 100 rows
                        rows.append(", ".join(row))
                    else:
                        break
                return "\n".join(rows)
        except Exception as e:
            logger.error(f"Error extracting CSV text from {file_path}: {e}")
            return f"[Error reading CSV file: {str(e)}]"
    
    def _extract_txt_text(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error extracting TXT text from {file_path}: {e}")
            return f"[Error reading TXT file: {str(e)}]"
    
    def _extract_file_content(self, file_path: str) -> str:
        """Extract content from various file types"""
        if not os.path.exists(file_path):
            return f"[File not found: {file_path}]"
        
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return self._extract_pdf_text(file_path)
        elif file_extension == '.docx':
            return self._extract_docx_text(file_path)
        elif file_extension == '.csv':
            return self._extract_csv_text(file_path)
        elif file_extension == '.txt':
            return self._extract_txt_text(file_path)
        else:
            return f"[Unsupported file type: {file_extension}]"
    
    def create_task(self, form_data: Dict[str, Any], context_analysis: str, personas: str, journey_phases: str) -> Task:
        uploaded_files = form_data.get('uploaded_files', [])
        
        # Extract content from uploaded files
        research_content = ""
        if uploaded_files:
            research_content += f"UPLOADED RESEARCH FILES ({len(uploaded_files)} files):\n"
            for file_path in uploaded_files:
                logger.info(f"Extracting content from file: {file_path}")
                content = self._extract_file_content(file_path)
                
                # Limit content size to prevent overwhelming the LLM
                if len(content) > 10000:
                    content = content[:10000] + "\n[Content truncated due to length...]"
                
                file_extension = os.path.splitext(file_path)[1].lower()
                research_content += f"\n\nFile: {os.path.basename(file_path)} ({file_extension})\nContent:\n{content}\n"
        
        if not research_content:
            research_content = "No research files were uploaded."
        
        return Task(
            description=f"""
            Integrate research data with the existing journey mapping insights:
            
            CONTEXT ANALYSIS:
            {context_analysis}
            
            PERSONAS:
            {personas}
            
            JOURNEY PHASES:
            {journey_phases}
            
            RESEARCH CONTENT:
            {research_content}
            
            FORM DATA:
            Industry: {form_data.get('industry')}
            Business Goals: {form_data.get('business_goals')}
            Target Personas: {', '.join(form_data.get('target_personas', []))}
            Journey Phases: {', '.join(form_data.get('journey_phases', []))}
            Additional Context: {form_data.get('additional_context', 'None provided')}
            Uploaded Files: {len(form_data.get('uploaded_files', []))} files
            
            Your task is to:
            1. **ANALYZE RESEARCH CONTENT THOROUGHLY**: Extract key insights, data points, customer quotes, statistics, and findings from the uploaded research files
            2. **VALIDATE PERSONAS**: Compare research data against the generated personas - do they match real customer data?
            3. **IDENTIFY PAIN POINTS**: Look for specific customer complaints, friction points, or challenges mentioned in the research
            4. **FIND OPPORTUNITIES**: Identify improvement areas, unmet needs, or optimization opportunities from the research
            5. **ENHANCE JOURNEY PHASES**: Use research data to add specific touchpoints, emotions, or behaviors to journey phases
            6. **HIGHLIGHT CONTRADICTIONS**: Point out any differences between assumptions and actual research findings
            7. **PROVIDE DATA-DRIVEN RECOMMENDATIONS**: Give specific, actionable recommendations based on the research evidence
            8. **SUGGEST METRICS**: Recommend KPIs and success metrics based on what the research shows matters to customers
            
            **IMPORTANT**: If research files contain actual customer data, quotes, survey responses, or specific metrics, 
            extract and reference these DIRECTLY in your analysis. Use specific examples and data points from the files.
            
            If no research files were provided or content couldn't be extracted, focus on industry best practices and benchmarks.
            
            Provide detailed, research-backed insights that significantly enhance the journey mapping with real data validation.
            """,
            agent=self.agent,
            expected_output="Research-integrated insights that validate and enhance personas and journey phases with data-driven recommendations and identified opportunities."
        )