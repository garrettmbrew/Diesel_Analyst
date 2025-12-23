"""
FRED API Fetcher

This module handles fetching data from the Federal Reserve Economic Data (FRED) API.
FRED provides free access to economic data including oil and diesel prices.

FRED Series we use:
- DCOILBRENTEU: Brent Crude Oil Price ($/bbl)
- DCOILWTICO: WTI Crude Oil Price ($/bbl)
- DDFUELUSGULF: No. 2 Diesel Gulf Coast ($/gal)
- DDFUELNYH: No. 2 Diesel NY Harbor ($/gal)
"""

import os
import httpx
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy.dialects.sqlite import insert

from app.models import Price, FetchLog


# FRED API base URL
FRED_BASE_URL = "https://api.stlouisfed.org/fred"

# The price series we want to fetch
FRED_SERIES = {
    "DCOILBRENTEU": {"name": "Brent Crude", "unit": "$/bbl"},
    "DCOILWTICO": {"name": "WTI Crude", "unit": "$/bbl"},
    "DDFUELUSGULF": {"name": "ULSD Gulf Coast", "unit": "$/gal"},
    "DDFUELNYH": {"name": "ULSD NY Harbor", "unit": "$/gal"},
}


def get_api_key() -> Optional[str]:
    """Get FRED API key from environment variables"""
    return os.getenv("FRED_API_KEY")


async def fetch_series(
    series_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 1000,
) -> Dict:
    """
    Fetch a single FRED series.
    
    Args:
        series_id: The FRED series ID (e.g., 'DCOILBRENTEU')
        start_date: Start of date range (default: 2 years ago)
        end_date: End of date range (default: today)
        limit: Maximum observations to return
        
    Returns:
        Dictionary with 'success', 'data', and 'error' keys
    """
    api_key = get_api_key()
    if not api_key:
        return {"success": False, "data": [], "error": "No FRED API key configured"}
    
    # Default date range: last 2 years
    if not start_date:
        start_date = date.today() - timedelta(days=730)
    if not end_date:
        end_date = date.today()
    
    # Build the API URL
    url = f"{FRED_BASE_URL}/series/observations"
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "observation_start": start_date.isoformat(),
        "observation_end": end_date.isoformat(),
        "sort_order": "desc",  # Most recent first
        "limit": limit,
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Parse observations
            observations = []
            for obs in data.get("observations", []):
                # FRED uses "." for missing values
                value = obs.get("value")
                if value and value != ".":
                    # Convert string date to Python date object
                    obs_date = datetime.strptime(obs["date"], "%Y-%m-%d").date()
                    observations.append({
                        "date": obs_date,
                        "value": float(value),
                    })
            
            return {
                "success": True,
                "data": observations,
                "error": None,
                "count": len(observations),
            }
            
    except httpx.HTTPStatusError as e:
        return {"success": False, "data": [], "error": f"HTTP {e.response.status_code}: {str(e)}"}
    except Exception as e:
        return {"success": False, "data": [], "error": str(e)}


async def fetch_and_store_series(
    db: Session,
    series_id: str,
    start_date: Optional[date] = None,
    months: int = 24,
) -> Dict:
    """
    Fetch a FRED series and store it in the database.
    
    This is the main function you'll use. It:
    1. Fetches data from FRED
    2. Stores it in the 'prices' table
    3. Logs the fetch in 'fetch_log' table
    4. Returns a summary
    
    Args:
        db: Database session
        series_id: The FRED series ID
        start_date: Optional start date
        months: How many months of history (default 24)
        
    Returns:
        Dictionary with fetch results
    """
    # Calculate start date if not provided
    if not start_date:
        start_date = date.today() - timedelta(days=months * 30)
    
    # Create fetch log entry
    fetch_log = FetchLog(
        source="FRED",
        endpoint="/series/observations",
        series_id=series_id,
        status="in_progress",
    )
    db.add(fetch_log)
    db.commit()
    
    # Fetch the data
    result = await fetch_series(series_id, start_date=start_date)
    
    if not result["success"]:
        # Update fetch log with error
        fetch_log.status = "error"
        fetch_log.error_message = result["error"]
        fetch_log.completed_at = datetime.now()
        db.commit()
        return result
    
    # Get series info for unit
    series_info = FRED_SERIES.get(series_id, {})
    unit = series_info.get("unit", "unknown")
    
    # Store each observation in the database
    records_inserted = 0
    for obs in result["data"]:
        try:
            # Use INSERT OR REPLACE to handle duplicates
            # This is SQLite-specific syntax
            stmt = insert(Price).values(
                source="FRED",
                series_id=series_id,
                date=obs["date"],
                value=obs["value"],
                unit=unit,
            ).on_conflict_do_update(
                index_elements=['source', 'series_id', 'date'],
                set_=dict(value=obs["value"], fetched_at=datetime.now())
            )
            db.execute(stmt)
            records_inserted += 1
        except Exception as e:
            print(f"Error inserting {series_id} {obs['date']}: {e}")
    
    db.commit()
    
    # Update fetch log
    fetch_log.status = "success"
    fetch_log.records_fetched = records_inserted
    fetch_log.completed_at = datetime.now()
    db.commit()
    
    return {
        "success": True,
        "series_id": series_id,
        "records_fetched": records_inserted,
        "date_range": f"{start_date} to {date.today()}",
    }


async def fetch_all_series(db: Session, months: int = 24) -> List[Dict]:
    """
    Fetch all configured FRED series and store them.
    
    This is what you'd call to update all price data at once.
    
    Args:
        db: Database session
        months: How many months of history
        
    Returns:
        List of results for each series
    """
    results = []
    
    for series_id in FRED_SERIES.keys():
        print(f"📊 Fetching {series_id}...")
        result = await fetch_and_store_series(db, series_id, months=months)
        results.append(result)
        
        if result["success"]:
            print(f"   ✅ {result['records_fetched']} records")
        else:
            print(f"   ❌ Error: {result.get('error')}")
    
    return results
