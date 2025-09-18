from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random
from src.middleware.auth_middleware import require_auth

router = APIRouter()

def get_user_analytics_data(user_id: str, date_range: str = "30d") -> Dict[str, Any]:
    """Generate user-specific analytics data"""
    import random
    from datetime import datetime, timedelta

    # Simulate user-specific data based on user_id
    user_seed = hash(user_id) % 1000
    random.seed(user_seed)

    # Calculate date range
    days_map = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}
    days = days_map.get(date_range, 30)

    # Base metrics with user-specific variation
    base_journeys = random.randint(8, 35)
    success_rate_base = random.uniform(0.75, 0.95)

    return {
        "userMetrics": {
            "totalJourneys": base_journeys,
            "completedJourneys": int(base_journeys * success_rate_base),
            "failedJourneys": int(base_journeys * 0.1),
            "inProgressJourneys": base_journeys - int(base_journeys * success_rate_base) - int(base_journeys * 0.1),
            "averageCompletionTime": round(random.uniform(3.2, 6.8), 1),
            "successRate": round(success_rate_base * 100, 1),
            "totalProcessingTime": round(random.uniform(45, 180), 0),
            "favoriteIndustry": random.choice(["E-commerce", "SaaS", "Healthcare", "FinTech", "Education"]),
            "accountAgeDays": random.randint(15, 365),
            "lastActivity": (datetime.now() - timedelta(hours=random.randint(1, 72))).isoformat()
        },
        "journeysByIndustry": [
            {"name": "E-commerce", "value": random.randint(2, 12)},
            {"name": "SaaS", "value": random.randint(1, 8)},
            {"name": "Healthcare", "value": random.randint(0, 6)},
            {"name": "FinTech", "value": random.randint(0, 5)},
            {"name": "Education", "value": random.randint(0, 4)},
            {"name": "Other", "value": random.randint(0, 3)}
        ],
        "journeysOverTime": generate_time_series_data(days, base_journeys),
        "agentPerformance": [
            {"agent": "Research Agent", "success_rate": random.randint(88, 98), "avg_time": round(random.uniform(1.8, 3.2), 1)},
            {"agent": "Persona Agent", "success_rate": random.randint(82, 92), "avg_time": round(random.uniform(2.8, 4.5), 1)},
            {"agent": "Journey Agent", "success_rate": random.randint(85, 95), "avg_time": round(random.uniform(3.5, 6.2), 1)},
            {"agent": "Analysis Agent", "success_rate": random.randint(87, 97), "avg_time": round(random.uniform(1.2, 2.8), 1)}
        ],
        "usagePatterns": {
            "peakUsageHours": [9, 10, 14, 15, 16],
            "averageJourneysPerWeek": round(base_journeys / max(1, days/7), 1),
            "mostProductiveDay": random.choice(["Monday", "Tuesday", "Wednesday", "Thursday"]),
            "usageGrowth": round(random.uniform(-15, 35), 1)
        },
        "journeyComplexity": [
            {"complexity": "Simple", "count": random.randint(3, 10), "avg_time": round(random.uniform(2, 4), 1)},
            {"complexity": "Medium", "count": random.randint(5, 15), "avg_time": round(random.uniform(4, 8), 1)},
            {"complexity": "Complex", "count": random.randint(2, 8), "avg_time": round(random.uniform(8, 15), 1)}
        ]
    }

def generate_time_series_data(days: int, base_journeys: int) -> List[Dict[str, Any]]:
    """Generate time series data for the specified date range"""
    import random
    from datetime import datetime, timedelta

    data = []
    current_date = datetime.now() - timedelta(days=days)

    for i in range(min(days, 12)):  # Limit to 12 data points for readability
        date_str = current_date.strftime("%b %d")
        created = random.randint(0, max(1, base_journeys // 4))
        completed = random.randint(0, created)

        data.append({
            "date": date_str,
            "created": created,
            "completed": completed,
            "failed": random.randint(0, max(0, created - completed))
        })

        current_date += timedelta(days=max(1, days // 12))

    return data

@router.get("/analytics")
async def get_analytics(
    user_data: Dict = Depends(require_auth),
    date_range: str = "30d"
):
    """
    Get user-specific comprehensive analytics data
    """
    try:
        user_id = user_data.get("user_id", "default")
        analytics_data = get_user_analytics_data(user_id, date_range)

        return {
            "success": True,
            "data": analytics_data,
            "dateRange": date_range,
            "message": "User analytics data retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics data: {str(e)}"
        )

@router.get("/analytics/summary")
async def get_analytics_summary(
    user_data: Dict = Depends(require_auth),
    date_range: str = "30d"
):
    """
    Get user-specific analytics summary
    """
    try:
        user_id = user_data.get("user_id", "default")
        analytics_data = get_user_analytics_data(user_id, date_range)
        user_metrics = analytics_data["userMetrics"]

        summary = {
            "totalJourneys": user_metrics["totalJourneys"],
            "completedJourneys": user_metrics["completedJourneys"],
            "failedJourneys": user_metrics["failedJourneys"],
            "inProgressJourneys": user_metrics["inProgressJourneys"],
            "successRate": user_metrics["successRate"],
            "averageCompletionTime": user_metrics["averageCompletionTime"],
            "totalProcessingTime": user_metrics["totalProcessingTime"],
            "usageGrowth": analytics_data["usagePatterns"]["usageGrowth"]
        }

        return {
            "success": True,
            "data": summary,
            "message": "User analytics summary retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics summary: {str(e)}"
        )

@router.get("/analytics/journeys-by-industry")
async def get_journeys_by_industry(user_data: Dict = Depends(require_auth)):
    """
    Get user-specific journey data grouped by industry
    """
    try:
        user_id = user_data.get("user_id", "default")
        analytics_data = get_user_analytics_data(user_id)
        favorite_industry = analytics_data["userMetrics"]["favoriteIndustry"]

        industry_data = analytics_data["journeysByIndustry"]
        # Mark the user's favorite industry
        for industry in industry_data:
            if industry["name"] == favorite_industry:
                industry["isFavorite"] = True

        return {
            "success": True,
            "data": industry_data,
            "favoriteIndustry": favorite_industry,
            "message": "User industry analytics retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving industry analytics: {str(e)}"
        )

@router.get("/analytics/usage-patterns")
async def get_usage_patterns(user_data: Dict = Depends(require_auth)):
    """
    Get user-specific usage patterns and insights
    """
    try:
        user_id = user_data.get("user_id", "default")
        analytics_data = get_user_analytics_data(user_id)

        return {
            "success": True,
            "data": analytics_data["usagePatterns"],
            "message": "User usage patterns retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving usage patterns: {str(e)}"
        )

@router.get("/analytics/journey-complexity")
async def get_journey_complexity(user_data: Dict = Depends(require_auth)):
    """
    Get user-specific journey complexity analysis
    """
    try:
        user_id = user_data.get("user_id", "default")
        analytics_data = get_user_analytics_data(user_id)

        return {
            "success": True,
            "data": analytics_data["journeyComplexity"],
            "message": "Journey complexity analytics retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving journey complexity data: {str(e)}"
        )