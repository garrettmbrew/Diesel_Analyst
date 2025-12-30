"""
Quick Start Script

Run this to test that everything is working.
It will:
1. Initialize the database
2. Fetch sample data from FRED and EIA
3. Show you what's in the database
"""

import asyncio
import os
import sys

# Add parent directory to path so we can import our modules
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv
# Load .env - check root first, then backend folder
root_env = os.path.join(PROJECT_ROOT, ".env")
backend_env = os.path.join(BACKEND_DIR, ".env")
if os.path.exists(root_env):
    load_dotenv(root_env, override=True)
elif os.path.exists(backend_env):
    load_dotenv(backend_env, override=True)

from app.database import init_db, get_db, run_query, SessionLocal
from app.fetchers.fred import fetch_all_series
from app.fetchers.eia import fetch_all_stocks


async def main():
    """Main function to test the backend"""
    
    print("=" * 60)
    print("🚀 DIESEL DATA BACKEND - QUICK START")
    print("=" * 60)
    
    # Check for API keys
    fred_key = os.getenv("FRED_API_KEY")
    eia_key = os.getenv("EIA_API_KEY")
    
    print("\n📋 API Key Status:")
    print(f"   FRED API Key: {'✅ Found' if fred_key else '❌ Missing - add to .env'}")
    print(f"   EIA API Key:  {'✅ Found' if eia_key else '❌ Missing - add to .env'}")
    
    if not fred_key and not eia_key:
        print("\n⚠️  No API keys found. Create a .env file with:")
        print("   FRED_API_KEY=your_key_here")
        print("   EIA_API_KEY=your_key_here")
        print("\n   Get keys from:")
        print("   - FRED: https://fred.stlouisfed.org/docs/api/api_key.html")
        print("   - EIA:  https://www.eia.gov/opendata/register.php")
        return
    
    # Initialize database
    print("\n📦 Initializing database...")
    init_db()
    print("   ✅ Database tables created")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Fetch FRED data (only if we have the key)
        if fred_key:
            print("\n📈 Fetching FRED price data (3 months)...")
            fred_results = await fetch_all_series(db, months=3)
            
            for result in fred_results:
                if result.get("success"):
                    print(f"   ✅ {result['series_id']}: {result['records_fetched']} records")
                else:
                    print(f"   ❌ {result.get('series_id', 'Unknown')}: {result.get('error')}")
        
        # Fetch EIA data (only if we have the key)
        if eia_key:
            print("\n📦 Fetching EIA inventory data (3 months)...")
            eia_results = await fetch_all_stocks(db, months=3)
            
            for result in eia_results:
                if result.get("success"):
                    print(f"   ✅ {result['region']}: {result['records_fetched']} records")
                else:
                    print(f"   ❌ {result.get('region', 'Unknown')}: {result.get('error')}")
        
        # Show what's in the database
        print("\n📊 Database Summary:")
        print("-" * 40)
        
        # Count prices
        price_counts = run_query("""
            SELECT series_id, COUNT(*) as count, MIN(date) as first, MAX(date) as last
            FROM prices 
            GROUP BY series_id
        """)
        
        if price_counts:
            print("\nPrices table:")
            for row in price_counts:
                print(f"   {row['series_id']}: {row['count']} records ({row['first']} to {row['last']})")
        else:
            print("\nPrices table: (empty)")
        
        # Count inventories
        inv_counts = run_query("""
            SELECT region, COUNT(*) as count, MIN(date) as first, MAX(date) as last
            FROM inventories 
            GROUP BY region
            ORDER BY CASE region
                WHEN 'US' THEN 0
                WHEN 'PADD1' THEN 1
                WHEN 'PADD2' THEN 2
                WHEN 'PADD3' THEN 3
                WHEN 'PADD4' THEN 4
                WHEN 'PADD5' THEN 5
            END
        """)
        
        if inv_counts:
            print("\nInventories table:")
            for row in inv_counts:
                print(f"   {row['region']}: {row['count']} records ({row['first']} to {row['last']})")
        else:
            print("\nInventories table: (empty)")
        
        print("\n" + "=" * 60)
        print("✅ QUICK START COMPLETE!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Start the API server:")
        print("   uvicorn app.main:app --reload")
        print("\n2. Open the API docs in your browser:")
        print("   http://localhost:8000/docs")
        print("\n3. Test an endpoint:")
        print("   http://localhost:8000/api/prices/latest")
        
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
