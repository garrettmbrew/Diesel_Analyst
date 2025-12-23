"""
EIA API Fetcher

This module handles fetching data from the US Energy Information Administration (EIA) API.
EIA provides petroleum inventory data including distillate stocks by PADD region.

EIA API v2 Documentation: https://www.eia.gov/opendata/documentation.php

Data we fetch:
- US Total Distillate Stocks
- PADD 1 (East Coast) Distillate Stocks
- PADD 2 (Midwest) Distillate Stocks
- PADD 3 (Gulf Coast) Distillate Stocks
- PADD 4 (Rocky Mountain) Distillate Stocks
- PADD 5 (West Coast) Distillate Stocks
"""

import os
import httpx
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy.dialects.sqlite import insert

from app.models import Inventory, FetchLog


# EIA API base URL (v2)
EIA_BASE_URL = "https://api.eia.gov/v2"

# Product codes
PRODUCT_DISTILLATE = "EPD0"

# Process code for ending stocks
PROCESS_ENDING_STOCKS = "SAE"

# Area codes for different regions
EIA_AREAS = {
    "NUS": {"name": "US Total", "region": "US"},
    "R10": {"name": "PADD 1 - East Coast", "region": "PADD1"},
    "R20": {"name": "PADD 2 - Midwest", "region": "PADD2"},
    "R30": {"name": "PADD 3 - Gulf Coast", "region": "PADD3"},
    "R40": {"name": "PADD 4 - Rocky Mountain", "region": "PADD4"},
    "R50": {"name": "PADD 5 - West Coast", "region": "PADD5"},
}


def get_api_key() -> Optional[str]:
    """Get EIA API key from environment variables"""
    return os.getenv("EIA_API_KEY")


async def fetch_distillate_stocks(
    area_code: str = "NUS",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict:
    """
    Fetch distillate ending stocks from EIA.
    
    Args:
        area_code: EIA area code (NUS for US total, R10-R50 for PADDs)
        start_date: Start of date range
        end_date: End of date range
        
    Returns:
        Dictionary with 'success', 'data', and 'error' keys
    """
    api_key = get_api_key()
    if not api_key:
        return {"success": False, "data": [], "error": "No EIA API key configured"}
    
    # Default date range: last 2 years
    if not start_date:
        start_date = date.today() - timedelta(days=730)
    if not end_date:
        end_date = date.today()
    
    # Build the API URL
    url = f"{EIA_BASE_URL}/petroleum/sum/sndw/data/"
    params = {
        "api_key": api_key,
        "frequency": "weekly",
        "data[0]": "value",
        "facets[product][]": PRODUCT_DISTILLATE,
        "facets[process][]": PROCESS_ENDING_STOCKS,
        "facets[duoarea][]": area_code,
        "start": start_date.strftime("%Y-%m-%d"),
        "end": end_date.strftime("%Y-%m-%d"),
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        "length": 500,
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Parse observations
            observations = []
            response_data = data.get("response", {}).get("data", [])
            
            for obs in response_data:
                value = obs.get("value")
                if value is not None:
                    # Convert string date to Python date object
                    obs_date = datetime.strptime(obs["period"], "%Y-%m-%d").date()
                    observations.append({
                        "date": obs_date,
                        "value": float(value),
                        "unit": obs.get("units", "thousand barrels"),
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


async def fetch_and_store_stocks(
    db: Session,
    area_code: str = "NUS",
    months: int = 24,
) -> Dict:
    """
    Fetch distillate stocks for an area and store in database.
    
    Args:
        db: Database session
        area_code: EIA area code
        months: How many months of history
        
    Returns:
        Dictionary with fetch results
    """
    start_date = date.today() - timedelta(days=months * 30)
    
    # Get area info
    area_info = EIA_AREAS.get(area_code, {"name": area_code, "region": area_code})
    region = area_info["region"]
    
    # Create fetch log entry
    fetch_log = FetchLog(
        source="EIA",
        endpoint="/petroleum/sum/sndw/data",
        series_id=f"distillate_{region}",
        status="in_progress",
    )
    db.add(fetch_log)
    db.commit()
    
    # Fetch the data
    result = await fetch_distillate_stocks(area_code, start_date=start_date)
    
    if not result["success"]:
        fetch_log.status = "error"
        fetch_log.error_message = result["error"]
        fetch_log.completed_at = datetime.now()
        db.commit()
        return result
    
    # Store each observation
    records_inserted = 0
    for obs in result["data"]:
        try:
            stmt = insert(Inventory).values(
                source="EIA",
                region=region,
                product="distillate",
                date=obs["date"],
                value=obs["value"],
                unit="thousand_barrels",
            ).on_conflict_do_update(
                index_elements=['source', 'region', 'product', 'date'],
                set_=dict(value=obs["value"], fetched_at=datetime.now())
            )
            db.execute(stmt)
            records_inserted += 1
        except Exception as e:
            print(f"Error inserting {region} {obs['date']}: {e}")
    
    db.commit()
    
    # Update fetch log
    fetch_log.status = "success"
    fetch_log.records_fetched = records_inserted
    fetch_log.completed_at = datetime.now()
    db.commit()
    
    return {
        "success": True,
        "region": region,
        "area_name": area_info["name"],
        "records_fetched": records_inserted,
        "date_range": f"{start_date} to {date.today()}",
    }


async def fetch_all_stocks(db: Session, months: int = 24) -> List[Dict]:
    """
    Fetch distillate stocks for all regions and store them.
    
    Args:
        db: Database session
        months: How many months of history
        
    Returns:
        List of results for each region
    """
    results = []
    
    for area_code in EIA_AREAS.keys():
        area_info = EIA_AREAS[area_code]
        print(f"📦 Fetching {area_info['name']}...")
        result = await fetch_and_store_stocks(db, area_code, months=months)
        results.append(result)
        
        if result["success"]:
            print(f"   ✅ {result['records_fetched']} records")
        else:
            print(f"   ❌ Error: {result.get('error')}")
    
    return results
