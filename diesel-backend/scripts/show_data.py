"""
Show Database Summary

A simple non-interactive script to display what's in your database.
Run: python scripts/show_data.py
"""

import os
import sys

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

from app.database import run_query


def main():
    print("=" * 60)
    print("📊 DATABASE SUMMARY")
    print("=" * 60)
    
    # Show tables
    tables = run_query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    print("\n📋 Tables:", ", ".join(t['name'] for t in tables))
    
    # Price summary
    print("\n" + "-" * 60)
    print("💰 PRICE DATA")
    print("-" * 60)
    
    prices = run_query("""
        SELECT 
            series_id,
            COUNT(*) as records,
            MIN(date) as first_date,
            MAX(date) as last_date,
            ROUND(MIN(value), 2) as min_price,
            ROUND(MAX(value), 2) as max_price,
            ROUND(AVG(value), 2) as avg_price
        FROM prices
        GROUP BY series_id
        ORDER BY series_id
    """)
    
    if prices:
        for p in prices:
            print(f"\n{p['series_id']}:")
            print(f"   {p['records']} records from {p['first_date']} to {p['last_date']}")
            print(f"   Range: ${p['min_price']} - ${p['max_price']} (avg: ${p['avg_price']})")
    else:
        print("   (no price data)")
    
    # Inventory summary
    print("\n" + "-" * 60)
    print("📦 INVENTORY DATA")
    print("-" * 60)
    
    inventories = run_query("""
        SELECT 
            region,
            COUNT(*) as records,
            MIN(date) as first_date,
            MAX(date) as last_date,
            ROUND(MIN(value), 0) as min_stocks,
            ROUND(MAX(value), 0) as max_stocks
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
    
    if inventories:
        for inv in inventories:
            print(f"\n{inv['region']}:")
            print(f"   {inv['records']} records from {inv['first_date']} to {inv['last_date']}")
            print(f"   Range: {int(inv['min_stocks']):,} - {int(inv['max_stocks']):,} KB")
    else:
        print("   (no inventory data)")
    
    # Recent fetch log
    print("\n" + "-" * 60)
    print("📝 RECENT FETCHES")
    print("-" * 60)
    
    fetches = run_query("""
        SELECT source, series_id, status, records_fetched, started_at
        FROM fetch_log
        ORDER BY started_at DESC
        LIMIT 5
    """)
    
    if fetches:
        for f in fetches:
            status_icon = "✅" if f['status'] == 'success' else "❌"
            print(f"   {status_icon} {f['source']} {f['series_id']}: {f['records_fetched']} records")
    else:
        print("   (no fetch history)")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
