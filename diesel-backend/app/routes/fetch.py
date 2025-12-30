"""
Fetch Routes

API endpoints for triggering data fetches from FRED and EIA.
These endpoints let you manually pull new data into the database.
"""

from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional

from app.database import get_db, run_query
from app.fetchers.fred import fetch_and_store_series, fetch_all_series, FRED_SERIES
from app.fetchers.eia import fetch_and_store_stocks, fetch_all_stocks, EIA_AREAS

router = APIRouter(prefix="/fetch", tags=["fetch"])


@router.post("/fred/{series_id}")
async def fetch_fred_series(
    series_id: str,
    months: int = Query(24, ge=1, le=120, description="Months of history to fetch"),
    db: Session = Depends(get_db),
):
    """
    Fetch a specific FRED series and store in database.
    
    Path Parameters:
    - series_id: The FRED series ID (DCOILBRENTEU, DCOILWTICO, DDFUELUSGULF, DDFUELNYH)
    
    Query Parameters:
    - months: How many months of history (default 24)
    """
    if series_id not in FRED_SERIES:
        return {
            "success": False,
            "error": f"Unknown series. Valid options: {', '.join(FRED_SERIES.keys())}",
        }
    
    result = await fetch_and_store_series(db, series_id, months=months)
    return result


@router.post("/fred/all")
async def fetch_all_fred(
    months: int = Query(24, ge=1, le=120, description="Months of history to fetch"),
    db: Session = Depends(get_db),
):
    """
    Fetch ALL FRED price series and store in database.
    
    This fetches:
    - Brent Crude (DCOILBRENTEU)
    - WTI Crude (DCOILWTICO)
    - ULSD Gulf Coast (DDFUELUSGULF)
    - ULSD NY Harbor (DDFUELNYH)
    
    Query Parameters:
    - months: How many months of history (default 24)
    """
    results = await fetch_all_series(db, months=months)
    
    success_count = sum(1 for r in results if r.get("success"))
    total_records = sum(r.get("records_fetched", 0) for r in results if r.get("success"))
    
    return {
        "message": f"Fetched {success_count}/{len(results)} series",
        "total_records": total_records,
        "results": results,
    }


@router.post("/eia/{area_code}")
async def fetch_eia_area(
    area_code: str,
    months: int = Query(24, ge=1, le=120, description="Months of history to fetch"),
    db: Session = Depends(get_db),
):
    """
    Fetch distillate stocks for a specific EIA area and store in database.
    
    Path Parameters:
    - area_code: EIA area code (NUS=US Total, R10-R50 for PADDs)
    
    Query Parameters:
    - months: How many months of history (default 24)
    """
    if area_code not in EIA_AREAS:
        return {
            "success": False,
            "error": f"Unknown area. Valid options: {', '.join(EIA_AREAS.keys())}",
        }
    
    result = await fetch_and_store_stocks(db, area_code, months=months)
    return result


@router.post("/eia/all")
async def fetch_all_eia(
    months: int = Query(24, ge=1, le=120, description="Months of history to fetch"),
    db: Session = Depends(get_db),
):
    """
    Fetch distillate stocks for ALL regions and store in database.
    
    This fetches:
    - US Total (NUS)
    - PADD 1 East Coast (R10)
    - PADD 2 Midwest (R20)
    - PADD 3 Gulf Coast (R30)
    - PADD 4 Rocky Mountain (R40)
    - PADD 5 West Coast (R50)
    
    Query Parameters:
    - months: How many months of history (default 24)
    """
    results = await fetch_all_stocks(db, months=months)
    
    success_count = sum(1 for r in results if r.get("success"))
    total_records = sum(r.get("records_fetched", 0) for r in results if r.get("success"))
    
    return {
        "message": f"Fetched {success_count}/{len(results)} regions",
        "total_records": total_records,
        "results": results,
    }


@router.post("/all")
async def fetch_everything(
    months: int = Query(24, ge=1, le=120, description="Months of history to fetch"),
    db: Session = Depends(get_db),
):
    """
    Fetch ALL data from both FRED and EIA.
    
    This is a convenience endpoint that fetches:
    - All FRED price series (4 series)
    - All EIA inventory data (6 regions)
    
    Query Parameters:
    - months: How many months of history (default 24)
    """
    # Fetch FRED
    print("🔄 Starting FRED fetch...")
    fred_results = await fetch_all_series(db, months=months)
    
    # Fetch EIA
    print("🔄 Starting EIA fetch...")
    eia_results = await fetch_all_stocks(db, months=months)
    
    # Summarize
    fred_success = sum(1 for r in fred_results if r.get("success"))
    fred_records = sum(r.get("records_fetched", 0) for r in fred_results if r.get("success"))
    
    eia_success = sum(1 for r in eia_results if r.get("success"))
    eia_records = sum(r.get("records_fetched", 0) for r in eia_results if r.get("success"))
    
    return {
        "message": "Fetch complete",
        "fred": {
            "series_fetched": f"{fred_success}/{len(fred_results)}",
            "records": fred_records,
        },
        "eia": {
            "regions_fetched": f"{eia_success}/{len(eia_results)}",
            "records": eia_records,
        },
        "total_records": fred_records + eia_records,
    }


@router.get("/status")
async def fetch_status(db: Session = Depends(get_db)):
    """
    Get status of recent fetch operations.
    
    Shows the last 10 fetch operations with their status.
    """
    sql = """
        SELECT 
            source,
            series_id,
            status,
            records_fetched,
            started_at,
            completed_at,
            error_message
        FROM fetch_log
        ORDER BY started_at DESC
        LIMIT 10
    """
    
    results = run_query(sql)
    
    return {
        "recent_fetches": results,
        "count": len(results),
    }


@router.get("/fred/proxy/{series_id}")
async def proxy_fred_series(
    series_id: str,
    limit: int = Query(30, ge=1, le=10000, description="Number of observations to return"),
):
    """
    Proxy endpoint to fetch FRED data directly without storing.
    This bypasses CORS issues by making the request server-side.
    
    Path Parameters:
    - series_id: The FRED series ID (DCOILBRENTEU, DCOILWTICO, etc.)
    
    Query Parameters:
    - limit: Number of observations to return (default 30)
    """
    import os
    import httpx
    
    api_key = os.getenv("FRED_API_KEY")
    if not api_key:
        return {"success": False, "error": "FRED API key not configured"}
    
    url = f"https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": limit,
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/sources")
async def list_sources():
    """
    List all available data sources and what they provide.
    """
    return {
        "fred": {
            "name": "Federal Reserve Economic Data",
            "base_url": "https://api.stlouisfed.org/fred",
            "series": {
                series_id: {
                    "name": info["name"],
                    "unit": info["unit"],
                }
                for series_id, info in FRED_SERIES.items()
            },
        },
        "eia": {
            "name": "US Energy Information Administration",
            "base_url": "https://api.eia.gov/v2",
            "areas": {
                code: info["name"]
                for code, info in EIA_AREAS.items()
            },
        },
    }
