"""
Fetch Data with Custom Timeframe

Easy way to pull historical data from FRED and EIA.

USAGE:
    python scripts/fetch_data.py              # Uses default (24 months)
    python scripts/fetch_data.py 12           # Fetch 12 months of data
    python scripts/fetch_data.py 60           # Fetch 60 months (5 years)

Or edit the MONTHS variable below to set your default.
"""

import asyncio
import os
import sys

# ============================================================
# CONFIGURATION - Change this to set your default timeframe
# ============================================================
MONTHS = 24  # How many months of history to fetch (default: 24 = 2 years)
# ============================================================

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND_DIR, ".env"), override=True)

from app.database import init_db, SessionLocal
from app.fetchers.fred import fetch_all_series
from app.fetchers.eia import fetch_all_stocks


async def main(months: int):
    print("=" * 60)
    print(f"📥 FETCHING {months} MONTHS OF DATA")
    print("=" * 60)
    
    # Initialize database
    print("\n📦 Initializing database...")
    init_db()
    
    db = SessionLocal()
    
    try:
        # Fetch FRED price data
        print(f"\n💰 Fetching FRED prices ({months} months)...")
        print("   Series: Brent, WTI, ULSD Gulf, ULSD NYH")
        fred_results = await fetch_all_series(db, months=months)
        
        fred_success = sum(1 for r in fred_results if r.get("success"))
        fred_records = sum(r.get("records_fetched", 0) for r in fred_results if r.get("success"))
        print(f"   ✅ {fred_success}/4 series fetched ({fred_records} total records)")
        
        for r in fred_results:
            if r.get("success"):
                print(f"      {r['series_id']}: {r['records_fetched']} records")
            else:
                print(f"      ❌ {r.get('series_id', 'Unknown')}: {r.get('error')}")
        
        # Fetch EIA inventory data
        print(f"\n📦 Fetching EIA inventories ({months} months)...")
        print("   Regions: US Total, PADD 1-5")
        eia_results = await fetch_all_stocks(db, months=months)
        
        eia_success = sum(1 for r in eia_results if r.get("success"))
        eia_records = sum(r.get("records_fetched", 0) for r in eia_results if r.get("success"))
        print(f"   ✅ {eia_success}/6 regions fetched ({eia_records} total records)")
        
        for r in eia_results:
            if r.get("success"):
                print(f"      {r['region']}: {r['records_fetched']} records")
            else:
                print(f"      ❌ {r.get('region', 'Unknown')}: {r.get('error')}")
        
        # Summary
        print("\n" + "=" * 60)
        print("✅ FETCH COMPLETE")
        print("=" * 60)
        print(f"   Total price records:     {fred_records}")
        print(f"   Total inventory records: {eia_records}")
        print(f"   Timeframe:               {months} months")
        print("\n💡 Run 'python scripts/show_data.py' to see your data")
        print("💡 Run 'python scripts/export_csv.py' to export to CSV")
        
    finally:
        db.close()


if __name__ == "__main__":
    # Check for command-line argument
    if len(sys.argv) > 1:
        try:
            months = int(sys.argv[1])
        except ValueError:
            print(f"❌ Invalid number: {sys.argv[1]}")
            print("Usage: python scripts/fetch_data.py [months]")
            print("Example: python scripts/fetch_data.py 60")
            sys.exit(1)
    else:
        months = MONTHS  # Use default from config
    
    # Validate range
    if months < 1:
        print("❌ Months must be at least 1")
        sys.exit(1)
    if months > 240:
        print("⚠️  Warning: Requesting 20+ years of data. This may take a while...")
    
    asyncio.run(main(months))
