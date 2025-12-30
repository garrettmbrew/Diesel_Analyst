"""
Export Database to CSV

Exports your price and inventory data to CSV files.
Run: python scripts/export_csv.py

Output files are saved to the 'exports/' folder.
"""

import os
import sys
import csv
from datetime import datetime

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


def export_to_csv(data, filename, fieldnames):
    """Export data to a CSV file"""
    # Create exports folder if it doesn't exist
    exports_dir = os.path.join(BACKEND_DIR, "exports")
    os.makedirs(exports_dir, exist_ok=True)
    
    filepath = os.path.join(exports_dir, filename)
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    return filepath


def main():
    print("=" * 60)
    print("📁 EXPORTING DATABASE TO CSV")
    print("=" * 60)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Export prices
    print("\n💰 Exporting prices...")
    prices = run_query("""
        SELECT source, series_id, date, value, unit, fetched_at
        FROM prices
        ORDER BY series_id, date
    """)
    
    if prices:
        filepath = export_to_csv(
            prices, 
            f"prices_{timestamp}.csv",
            ['source', 'series_id', 'date', 'value', 'unit', 'fetched_at']
        )
        print(f"   ✅ {len(prices)} records → {filepath}")
    else:
        print("   (no price data to export)")
    
    # Export inventories
    print("\n📦 Exporting inventories...")
    inventories = run_query("""
        SELECT source, region, product, date, value, unit, fetched_at
        FROM inventories
        ORDER BY region, date
    """)
    
    if inventories:
        filepath = export_to_csv(
            inventories,
            f"inventories_{timestamp}.csv",
            ['source', 'region', 'product', 'date', 'value', 'unit', 'fetched_at']
        )
        print(f"   ✅ {len(inventories)} records → {filepath}")
    else:
        print("   (no inventory data to export)")
    
    # Export price summary (pivot-style for Excel)
    print("\n📊 Exporting price pivot table...")
    pivot_prices = run_query("""
        SELECT date,
            MAX(CASE WHEN series_id = 'DCOILBRENTEU' THEN value END) as Brent,
            MAX(CASE WHEN series_id = 'DCOILWTICO' THEN value END) as WTI,
            MAX(CASE WHEN series_id = 'DDFUELUSGULF' THEN value END) as ULSD_Gulf,
            MAX(CASE WHEN series_id = 'DDFUELNYH' THEN value END) as ULSD_NYH
        FROM prices
        GROUP BY date
        ORDER BY date
    """)
    
    if pivot_prices:
        filepath = export_to_csv(
            pivot_prices,
            f"prices_pivot_{timestamp}.csv",
            ['date', 'Brent', 'WTI', 'ULSD_Gulf', 'ULSD_NYH']
        )
        print(f"   ✅ {len(pivot_prices)} rows → {filepath}")
    
    # Export inventory pivot table
    print("\n📊 Exporting inventory pivot table...")
    pivot_inv = run_query("""
        SELECT date,
            MAX(CASE WHEN region = 'US' THEN value END) as US_Total,
            MAX(CASE WHEN region = 'PADD1' THEN value END) as PADD1,
            MAX(CASE WHEN region = 'PADD2' THEN value END) as PADD2,
            MAX(CASE WHEN region = 'PADD3' THEN value END) as PADD3,
            MAX(CASE WHEN region = 'PADD4' THEN value END) as PADD4,
            MAX(CASE WHEN region = 'PADD5' THEN value END) as PADD5
        FROM inventories
        GROUP BY date
        ORDER BY date
    """)
    
    if pivot_inv:
        filepath = export_to_csv(
            pivot_inv,
            f"inventories_pivot_{timestamp}.csv",
            ['date', 'US_Total', 'PADD1', 'PADD2', 'PADD3', 'PADD4', 'PADD5']
        )
        print(f"   ✅ {len(pivot_inv)} rows → {filepath}")
    
    print("\n" + "=" * 60)
    print(f"📂 Files saved to: {os.path.join(BACKEND_DIR, 'exports')}")
    print("=" * 60)


if __name__ == "__main__":
    main()
