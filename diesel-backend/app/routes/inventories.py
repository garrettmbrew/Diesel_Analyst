"""
Inventories Routes

API endpoints for retrieving inventory (stock) data from the database.
These endpoints provide distillate inventory data by PADD region.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, timedelta
from typing import Optional, List

from app.database import get_db, run_query
from app.models import Inventory

router = APIRouter(prefix="/inventories", tags=["inventories"])


@router.get("")
async def get_inventories(
    region: Optional[str] = Query(None, description="Filter by region (US, PADD1-PADD5)"),
    product: Optional[str] = Query(None, description="Filter by product (distillate)"),
    start_date: Optional[date] = Query(None, description="Start of date range"),
    end_date: Optional[date] = Query(None, description="End of date range"),
    limit: int = Query(500, ge=1, le=5000, description="Maximum records to return"),
    db: Session = Depends(get_db),
):
    """
    Get inventory data from the database.
    
    Returns historical distillate stock levels by region.
    
    Query Parameters:
    - region: Filter by region (US, PADD1, PADD2, PADD3, PADD4, PADD5)
    - product: Filter by product type
    - start_date: Beginning of date range
    - end_date: End of date range
    - limit: Maximum number of records (default 500)
    """
    query = db.query(Inventory)
    
    if region:
        query = query.filter(Inventory.region == region)
    
    if product:
        query = query.filter(Inventory.product == product)
    
    if start_date:
        query = query.filter(Inventory.date >= str(start_date))
    
    if end_date:
        query = query.filter(Inventory.date <= str(end_date))
    
    query = query.order_by(desc(Inventory.date)).limit(limit)
    
    results = query.all()
    
    # Convert to dict for JSON response
    return [
        {
            "id": inv.id,
            "source": inv.source,
            "region": inv.region,
            "product": inv.product,
            "date": inv.date,
            "value": inv.value,
            "unit": inv.unit,
            "fetched_at": inv.fetched_at.isoformat() if inv.fetched_at else None,
        }
        for inv in results
    ]


@router.get("/latest")
async def get_latest_inventories(db: Session = Depends(get_db)):
    """
    Get the most recent inventory reading for each region with change calculations.
    
    Returns a dictionary with each region and its latest stock level, previous value,
    and calculated change.
    """
    sql = """
        WITH RankedInventories AS (
            SELECT 
                region,
                product,
                date, 
                value, 
                unit, 
                source,
                ROW_NUMBER() OVER (PARTITION BY region, product ORDER BY date DESC) as rn
            FROM inventories
        )
        SELECT 
            region,
            product,
            MAX(CASE WHEN rn = 1 THEN date END) as latest_date,
            MAX(CASE WHEN rn = 1 THEN value END) as latest_value,
            MAX(CASE WHEN rn = 2 THEN value END) as previous_value,
            MAX(CASE WHEN rn = 1 THEN unit END) as unit,
            MAX(CASE WHEN rn = 1 THEN source END) as source
        FROM RankedInventories
        WHERE rn <= 2
        GROUP BY region, product
        ORDER BY 
            CASE region
                WHEN 'US' THEN 0
                WHEN 'PADD1' THEN 1
                WHEN 'PADD2' THEN 2
                WHEN 'PADD3' THEN 3
                WHEN 'PADD4' THEN 4
                WHEN 'PADD5' THEN 5
            END
    """
    
    results = run_query(sql)
    
    # Format as dictionary with change calculations
    latest = {}
    for row in results:
        current = row["latest_value"]
        previous = row["previous_value"]
        
        # Calculate change
        change = current - previous if previous else 0
        
        latest[row["region"]] = {
            "product": row["product"],
            "date": row["latest_date"],
            "value": current,
            "previous": previous,
            "change": round(change, 1),
            "unit": row["unit"],
            "source": row["source"],
        }
    
    return latest


@router.get("/regions")
async def list_regions(db: Session = Depends(get_db)):
    """
    List all available regions with metadata.
    
    Returns info about each region including:
    - Number of records
    - Date range
    - Latest value
    """
    sql = """
        SELECT 
            region,
            product,
            source,
            COUNT(*) as record_count,
            MIN(date) as first_date,
            MAX(date) as last_date,
            (SELECT value FROM inventories i2 WHERE i2.region = i1.region AND i2.date = MAX(i1.date)) as latest_value
        FROM inventories i1
        GROUP BY region, product
        ORDER BY 
            CASE region
                WHEN 'US' THEN 0
                WHEN 'PADD1' THEN 1
                WHEN 'PADD2' THEN 2
                WHEN 'PADD3' THEN 3
                WHEN 'PADD4' THEN 4
                WHEN 'PADD5' THEN 5
            END
    """
    
    results = run_query(sql)
    
    return {
        "regions": results,
        "total_regions": len(results),
    }


@router.get("/history/{region}")
async def get_region_history(
    region: str,
    months: int = Query(12, ge=1, le=60, description="Months of history"),
    db: Session = Depends(get_db),
):
    """
    Get historical data for a specific region.
    
    Path Parameters:
    - region: The region to retrieve (US, PADD1, etc.)
    
    Query Parameters:
    - months: How many months of history (default 12)
    """
    start_date = date.today() - timedelta(days=months * 30)
    
    query = db.query(Inventory).filter(
        Inventory.region == region.upper(),
        Inventory.date >= str(start_date),
    ).order_by(desc(Inventory.date))
    
    results = query.all()
    
    if not results:
        raise HTTPException(status_code=404, detail=f"No data found for region {region}")
    
    return {
        "region": region.upper(),
        "records": len(results),
        "start_date": str(start_date),
        "data": [{"date": inv.date, "value": inv.value} for inv in results],
    }


@router.get("/compare")
async def compare_regions(
    regions: str = Query("US,PADD1,PADD3", description="Comma-separated list of regions"),
    months: int = Query(12, ge=1, le=60, description="Months of history"),
    db: Session = Depends(get_db),
):
    """
    Compare inventory levels across multiple regions.
    
    Query Parameters:
    - regions: Comma-separated list of regions (e.g., US,PADD1,PADD3)
    - months: How many months of history
    """
    region_list = [r.strip().upper() for r in regions.split(",")]
    start_date = date.today() - timedelta(days=months * 30)
    
    result = {}
    
    for region in region_list:
        query = db.query(Inventory).filter(
            Inventory.region == region,
            Inventory.date >= str(start_date),
        ).order_by(Inventory.date)
        
        data = query.all()
        result[region] = [{"date": inv.date, "value": inv.value} for inv in data]
    
    return {
        "regions": region_list,
        "months": months,
        "data": result,
    }
