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
    Get the most recent price for each series.
    
    Returns a dictionary with each series ID and its latest value.
    """
    # SQL query to get the latest price for each series
    sql = """
        SELECT series_id, date, value, unit, source
        FROM prices p1
        WHERE date = (
            SELECT MAX(date) 
            FROM prices p2 
            WHERE p2.series_id = p1.series_id
        )
        ORDER BY series_id
    """
    
    results = run_query(sql)
    
    # Format as dictionary
    latest = {}
    for row in results:
        latest[row["series_id"]] = {
            "date": row["date"],
            "value": row["value"],
            "unit": row["unit"],
            "source": row["source"],
        }
    
    return {
        "latest_prices": latest,
        "series_count": len(latest),
    }


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
