"""
Prices Routes

API endpoints for retrieving price data from the database.
These endpoints are consumed by the React dashboard.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, timedelta
from typing import Optional, List

from app.database import get_db, run_query
from app.models import Price, PriceResponse

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("", response_model=List[PriceResponse])
async def get_prices(
    series_id: Optional[str] = Query(None, description="Filter by series ID (e.g., DCOILBRENTEU)"),
    start_date: Optional[date] = Query(None, description="Start of date range"),
    end_date: Optional[date] = Query(None, description="End of date range"),
    limit: int = Query(500, ge=1, le=5000, description="Maximum records to return"),
    db: Session = Depends(get_db),
):
    """
    Get price data from the database.
    
    Returns historical price data for crude oil and diesel.
    
    Query Parameters:
    - series_id: Filter by specific series (DCOILBRENTEU, DCOILWTICO, DDFUELUSGULF, DDFUELNYH)
    - start_date: Beginning of date range
    - end_date: End of date range
    - limit: Maximum number of records (default 500)
    """
    query = db.query(Price)
    
    if series_id:
        query = query.filter(Price.series_id == series_id)
    
    if start_date:
        query = query.filter(Price.date >= str(start_date))
    
    if end_date:
        query = query.filter(Price.date <= str(end_date))
    
    # Order by date descending (most recent first)
    query = query.order_by(desc(Price.date)).limit(limit)
    
    results = query.all()
    return results


@router.get("/latest")
async def get_latest_prices(db: Session = Depends(get_db)):
    """
    Get the most recent price for each series with change calculations.
    
    Returns a dictionary with each series ID and its latest value, previous value,
    and calculated changes.
    """
    # SQL query to get the latest and previous price for each series
    sql = """
        WITH RankedPrices AS (
            SELECT 
                series_id, 
                date, 
                value, 
                unit, 
                source,
                ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY date DESC) as rn
            FROM prices
        )
        SELECT 
            series_id,
            MAX(CASE WHEN rn = 1 THEN date END) as latest_date,
            MAX(CASE WHEN rn = 1 THEN value END) as latest_value,
            MAX(CASE WHEN rn = 2 THEN value END) as previous_value,
            MAX(CASE WHEN rn = 1 THEN unit END) as unit,
            MAX(CASE WHEN rn = 1 THEN source END) as source
        FROM RankedPrices
        WHERE rn <= 2
        GROUP BY series_id
        ORDER BY series_id
    """
    
    results = run_query(sql)
    
    # Format as dictionary with change calculations
    latest = {}
    for row in results:
        current = row["latest_value"]
        previous = row["previous_value"]
        
        # Calculate change and percent change
        change = current - previous if previous else 0
        change_percent = (change / previous * 100) if previous and previous != 0 else 0
        
        latest[row["series_id"]] = {
            "date": row["latest_date"],
            "value": current,
            "previous": previous,
            "change": round(change, 4),
            "changePercent": round(change_percent, 2),
            "unit": row["unit"],
            "source": row["source"],
            # Placeholder for high/low (could calculate from last N days)
            "high": current,  # TODO: Calculate actual high
            "low": current,   # TODO: Calculate actual low
        }
    
    return latest


@router.get("/series")
async def list_series(db: Session = Depends(get_db)):
    """
    List all available price series with metadata.
    
    Returns info about each series including:
    - Number of records
    - Date range
    - Latest value
    """
    sql = """
        SELECT 
            series_id,
            source,
            unit,
            COUNT(*) as record_count,
            MIN(date) as first_date,
            MAX(date) as last_date
        FROM prices
        GROUP BY series_id
        ORDER BY series_id
    """
    
    results = run_query(sql)
    
    return {
        "series": results,
        "total_series": len(results),
    }


@router.get("/{series_id}")
async def get_series(
    series_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Get data for a specific price series.
    
    Path Parameters:
    - series_id: The series to retrieve (e.g., DCOILBRENTEU)
    
    Query Parameters:
    - start_date: Beginning of date range
    - end_date: End of date range
    """
    query = db.query(Price).filter(Price.series_id == series_id)
    
    if start_date:
        query = query.filter(Price.date >= str(start_date))
    
    if end_date:
        query = query.filter(Price.date <= str(end_date))
    
    results = query.order_by(desc(Price.date)).all()
    
    if not results:
        raise HTTPException(status_code=404, detail=f"Series {series_id} not found")
    
    return {
        "series_id": series_id,
        "records": len(results),
        "data": [{"date": p.date, "value": p.value} for p in results],
    }
