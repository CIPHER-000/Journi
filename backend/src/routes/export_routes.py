"""
Export Routes Module
Handles journey map export endpoints (JSON, PDF, etc.)
"""

import logging
from io import BytesIO
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from src.models.journey import JourneyMap, JobStatus
from src.models.auth import UserProfile
from src.middleware.auth_middleware import require_auth

# Initialize router
router = APIRouter(prefix="/api/journey", tags=["exports"])
logger = logging.getLogger(__name__)

# Global job_manager reference (will be set from main.py)
job_manager = None

def set_dependencies(jm):
    """Set job manager dependency"""
    global job_manager
    job_manager = jm


@router.get("/{journey_id}/export/{format}")
async def export_journey(
    journey_id: str,
    format: str,
    current_user: UserProfile = Depends(require_auth)
):
    """Export journey map in various formats"""
    global job_manager
    
    if not job_manager:
        raise HTTPException(status_code=503, detail="Job manager not initialized")
    
    try:
        job = await job_manager.get_job_async(journey_id, current_user.id)
        if not job or job.status != JobStatus.COMPLETED or not job.result:
            raise HTTPException(status_code=404, detail="Completed journey not found")
        
        journey_map = job.result
        
        if format.lower() == "json":
            return journey_map.dict()
        elif format.lower() == "pdf":
            return await export_to_pdf(journey_map)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported export format: {format}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


async def export_to_pdf(journey_map: JourneyMap) -> Response:
    """Export journey map as PDF"""
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
        )
        story.append(Paragraph(journey_map.title, title_style))
        story.append(Spacer(1, 12))
        
        # Industry
        story.append(Paragraph(f"<b>Industry:</b> {journey_map.industry}", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Personas
        story.append(Paragraph("Customer Personas", styles['Heading2']))
        for persona in journey_map.personas:
            story.append(Paragraph(f"<b>{persona.name}</b> - {persona.occupation}", styles['Heading3']))
            story.append(Paragraph(f"<i>\"{persona.quote}\"</i>", styles['Normal']))
            story.append(Spacer(1, 6))
        
        story.append(Spacer(1, 12))
        
        # Journey Phases
        story.append(Paragraph("Journey Phases", styles['Heading2']))
        for phase in journey_map.phases:
            story.append(Paragraph(f"<b>{phase.name}</b>", styles['Heading3']))
            story.append(Paragraph(f"Actions: {', '.join(phase.actions)}", styles['Normal']))
            story.append(Paragraph(f"Touchpoints: {', '.join(phase.touchpoints)}", styles['Normal']))
            story.append(Paragraph(f"<i>\"{phase.customerQuote}\"</i>", styles['Normal']))
            story.append(Spacer(1, 12))
        
        doc.build(story)
        buffer.seek(0)
        
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={journey_map.title.replace(' ', '_')}.pdf"}
        )
        
    except Exception as e:
        logger.error(f"PDF export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")
