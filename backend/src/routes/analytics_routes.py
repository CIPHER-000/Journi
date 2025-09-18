from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random
from src.middleware.auth_middleware import require_auth

router = APIRouter()

def get_mock_analytics_data() -> Dict[str, Any]:
    """Generate mock analytics data for development"""
    return {
        "totalJourneys": 24,
        "completedJourneys": 18,
        "failedJourneys": 3,
        "averageCompletionTime": 4.2,
        "journeysByIndustry": [
            {"name": "E-commerce", "value": 8},
            {"name": "SaaS", "value": 6},
            {"name": "Healthcare", "value": 4},
            {"name": "Education", "value": 3},
            {"name": "Other", "value": 3}
        ],
        "journeysOverTime": [
            {"date": "Jan 1", "created": 3, "completed": 2},
            {"date": "Jan 8", "created": 4, "completed": 3},
            {"date": "Jan 15", "created": 2, "completed": 4},
            {"date": "Jan 22", "created": 5, "completed": 3},
            {"date": "Jan 29", "created": 6, "completed": 4}
        ],
        "agentPerformance": [
            {"agent": "Research Agent", "success_rate": 95, "avg_time": 2.1},
            {"agent": "Persona Agent", "success_rate": 88, "avg_time": 3.2},
            {"agent": "Journey Agent", "success_rate": 92, "avg_time": 4.5},
            {"agent": "Analysis Agent", "success_rate": 90, "avg_time": 1.8}
        ],
        "userActivity": [
            {"date": "Jan 1", "journeys_created": 3, "active_users": 12},
            {"date": "Jan 8", "journeys_created": 4, "active_users": 15},
            {"date": "Jan 15", "journeys_created": 2, "active_users": 18},
            {"date": "Jan 22", "journeys_created": 5, "active_users": 22},
            {"date": "Jan 29", "journeys_created": 6, "active_users": 25}
        ]
    }

@router.get("/analytics")
async def get_analytics(user_data: Dict = Depends(require_auth)):
    """
    Get comprehensive analytics data for the dashboard
    """
    try:
        # For now, return mock data
        # In production, this would query the database for real analytics
        analytics_data = get_mock_analytics_data()

        return {
            "success": True,
            "data": analytics_data,
            "message": "Analytics data retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics data: {str(e)}"
        )

@router.get("/analytics/summary")
async def get_analytics_summary(user_data: Dict = Depends(require_auth)):
    """
    Get a summary of key analytics metrics
    """
    try:
        analytics_data = get_mock_analytics_data()

        summary = {
            "totalJourneys": analytics_data["totalJourneys"],
            "completedJourneys": analytics_data["completedJourneys"],
            "failedJourneys": analytics_data["failedJourneys"],
            "successRate": round((analytics_data["completedJourneys"] / analytics_data["totalJourneys"]) * 100, 1),
            "averageCompletionTime": analytics_data["averageCompletionTime"]
        }

        return {
            "success": True,
            "data": summary,
            "message": "Analytics summary retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics summary: {str(e)}"
        )

@router.get("/analytics/journeys-by-industry")
async def get_journeys_by_industry(user_data: Dict = Depends(require_auth)):
    """
    Get journey data grouped by industry
    """
    try:
        analytics_data = get_mock_analytics_data()

        return {
            "success": True,
            "data": analytics_data["journeysByIndustry"],
            "message": "Industry analytics retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving industry analytics: {str(e)}"
        )