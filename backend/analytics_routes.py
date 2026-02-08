from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case, desc
from db_conn import SessionLocal
from models import SkinCareEntry, ProductUsage
from datetime import date, datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/skincare/analytics", tags=["analytics"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# TODO: Replace with actual auth
def get_current_user_id():
    return 1

@router.get("/overview")
async def get_analytics_overview(
    days: Optional[int] = 30,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics for the dashboard
    """
    user_id = get_current_user_id()
    
    # Calculate date range
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Get all entries in range
    entries = db.query(SkinCareEntry).filter(
        SkinCareEntry.user_id == user_id,
        SkinCareEntry.date >= start_date,
        SkinCareEntry.date <= end_date
    ).order_by(SkinCareEntry.date).all()
    
    # Calculate streak
    streak = calculate_streak(db, user_id)
    
    # Calculate consistency
    total_days = days
    completed_days = len(entries)
    consistency_percentage = round((completed_days / total_days) * 100) if total_days > 0 else 0
    
    # Get skin condition trends
    skin_conditions = {}
    for entry in entries:
        if entry.skin_condition:
            skin_conditions[entry.skin_condition] = skin_conditions.get(entry.skin_condition, 0) + 1
    
    # Most common skin condition
    most_common_condition = max(skin_conditions.items(), key=lambda x: x[1])[0] if skin_conditions else None
    
    # Calculate AI analysis trends (simplified mock for now)
    ai_analyses = [e for e in entries if e.analysis_result]
    has_ai_data = len(ai_analyses) > 0
    
    # Product usage stats
    product_stats = db.query(
        ProductUsage.product_name,
        func.count(ProductUsage.id).label('usage_count')
    ).join(
        SkinCareEntry, ProductUsage.entry_id == SkinCareEntry.id
    ).filter(
        SkinCareEntry.user_id == user_id,
        SkinCareEntry.date >= start_date,
        SkinCareEntry.date <= end_date
    ).group_by(
        ProductUsage.product_name
    ).order_by(
        desc('usage_count')
    ).limit(10).all()
    
    product_usage = [
        {
            "name": stat.product_name,
            "uses": stat.usage_count,
            "percentage": round((stat.usage_count / completed_days) * 100) if completed_days > 0 else 0
        }
        for stat in product_stats
    ]
    
    return {
        "time_period": {
            "days": days,
            "start_date": str(start_date),
            "end_date": str(end_date)
        },
        "consistency": {
            "percentage": consistency_percentage,
            "streak": streak,
            "total_days": total_days,
            "completed_days": completed_days,
            "missed_days": total_days - completed_days
        },
        "skin_trends": {
            "most_common_condition": most_common_condition,
            "condition_distribution": skin_conditions,
            "total_entries": len(entries),
            "entries_with_ai_analysis": len(ai_analyses)
        },
        "product_usage": product_usage,
        "entries_over_time": [
            {
                "date": str(e.date),
                "skin_condition": e.skin_condition,
                "has_analysis": e.analysis_result is not None,
                "product_count": len(e.products)
            }
            for e in entries
        ]
    }

def calculate_streak(db: Session, user_id: int) -> int:
    """
    Calculate current streak of consecutive days with entries
    """
    today = date.today()
    current_date = today
    
    # Check if there's an entry today, if not start from yesterday
    today_entry = db.query(SkinCareEntry).filter(
        SkinCareEntry.user_id == user_id,
        SkinCareEntry.date == today
    ).first()
    
    if not today_entry:
        current_date = today - timedelta(days=1)
    
    streak = 0
    
    # Count backwards
    while True:
        entry = db.query(SkinCareEntry).filter(
            SkinCareEntry.user_id == user_id,
            SkinCareEntry.date == current_date
        ).first()
        
        if entry:
            streak += 1
            current_date = current_date - timedelta(days=1)
        else:
            break
    
    return streak

@router.get("/skin-progress")
async def get_skin_progress(
    days: Optional[int] = 30,
    db: Session = Depends(get_db)
):
    """
    Get skin progress metrics over time
    This analyzes AI analysis results to track improvements
    """
    user_id = get_current_user_id()
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Get entries with AI analysis
    entries = db.query(SkinCareEntry).filter(
        SkinCareEntry.user_id == user_id,
        SkinCareEntry.date >= start_date,
        SkinCareEntry.date <= end_date,
        SkinCareEntry.analysis_result.isnot(None)
    ).order_by(SkinCareEntry.date).all()
    
    if not entries:
        return {
            "message": "No AI analysis data available for this period",
            "metrics": {}
        }
    
    # Analyze AI results for trends
    # Look for keywords in analysis results
    concern_keywords = {
        'acne': ['acne', 'breakout', 'pimple', 'blemish'],
        'dark_circles': ['dark circle', 'under eye'],
        'wrinkles': ['wrinkle', 'fine line', 'crow'],
        'spots': ['spot', 'pigment', 'hyperpigment'],
        'pores': ['pore', 'enlarged pore']
    }
    
    # Count occurrences over time
    concern_counts = {key: [] for key in concern_keywords}
    dates = []
    
    for entry in entries:
        analysis_lower = entry.analysis_result.lower()
        dates.append(str(entry.date))
        
        for concern, keywords in concern_keywords.items():
            detected = any(keyword in analysis_lower for keyword in keywords)
            concern_counts[concern].append(1 if detected else 0)
    
    # Calculate trend for each concern
    metrics = {}
    for concern, counts in concern_counts.items():
        if not counts:
            continue
            
        # Compare first half vs second half
        mid_point = len(counts) // 2
        if mid_point > 0:
            first_half_avg = sum(counts[:mid_point]) / mid_point
            second_half_avg = sum(counts[mid_point:]) / (len(counts) - mid_point)
            
            # Calculate change (negative means improvement for skin concerns)
            change = ((second_half_avg - first_half_avg) / max(first_half_avg, 0.01)) * 100
            current_score = max(0, 100 - (second_half_avg * 100))  # Higher score = better
            
            metrics[concern] = {
                "current": round(current_score),
                "change": round(-change),  # Negative change in concerns = positive change in score
                "trend": "improving" if change < 0 else "worsening" if change > 0 else "stable"
            }
    
    return {
        "time_period": {
            "days": days,
            "start_date": str(start_date),
            "end_date": str(end_date)
        },
        "metrics": metrics,
        "total_analyses": len(entries)
    }

@router.get("/product-effectiveness")
async def get_product_effectiveness(
    days: Optional[int] = 30,
    db: Session = Depends(get_db)
):
    """
    Analyze which products correlate with better skin conditions
    """
    user_id = get_current_user_id()
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Get all entries with products
    entries = db.query(SkinCareEntry).filter(
        SkinCareEntry.user_id == user_id,
        SkinCareEntry.date >= start_date,
        SkinCareEntry.date <= end_date
    ).all()
    
    product_effectiveness = {}
    
    for entry in entries:
        # Skip entries without skin condition
        if not entry.skin_condition:
            continue
            
        # Score skin conditions (higher = better)
        condition_scores = {
            'Clear': 100,
            'Normal': 90,
            'Combination': 70,
            'Dry': 60,
            'Oily': 60,
            'Sensitive': 50,
            'Acne': 30
        }
        
        score = condition_scores.get(entry.skin_condition, 50)
        
        # Track each product used
        for product_usage in entry.products:
            product_name = product_usage.product_name
            
            if product_name not in product_effectiveness:
                product_effectiveness[product_name] = {
                    'total_uses': 0,
                    'total_score': 0,
                    'conditions': {}
                }
            
            product_effectiveness[product_name]['total_uses'] += 1
            product_effectiveness[product_name]['total_score'] += score
            
            condition = entry.skin_condition
            if condition not in product_effectiveness[product_name]['conditions']:
                product_effectiveness[product_name]['conditions'][condition] = 0
            product_effectiveness[product_name]['conditions'][condition] += 1
    
    # Calculate average scores
    results = []
    for product_name, data in product_effectiveness.items():
        avg_score = data['total_score'] / data['total_uses'] if data['total_uses'] > 0 else 0
        most_common_condition = max(data['conditions'].items(), key=lambda x: x[1])[0] if data['conditions'] else 'Unknown'
        
        results.append({
            'product_name': product_name,
            'uses': data['total_uses'],
            'average_skin_score': round(avg_score, 1),
            'most_common_condition': most_common_condition
        })
    
    # Sort by average score
    results.sort(key=lambda x: x['average_skin_score'], reverse=True)
    
    return {
        "time_period": {
            "days": days,
            "start_date": str(start_date),
            "end_date": str(end_date)
        },
        "products": results
    }