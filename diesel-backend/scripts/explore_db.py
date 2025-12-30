"""
Database Explorer Script

A simple interactive tool to explore your database.
Run this whenever you want to check what's in the database.
"""

import os
import sys

# Add parent directory to path
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


def show_tables():
    """Show all tables in the database"""
    tables = run_query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    print("\n📋 Tables in database:")
    for t in tables:
        print(f"   - {t['name']}")
    return [t['name'] for t in tables]


def show_table_info(table_name):
    """Show info about a specific table"""
    # Get column info
    columns = run_query(f"PRAGMA table_info({table_name})")
    print(f"\n📊 Table: {table_name}")
    print("-" * 40)
    print("Columns:")
    for col in columns:
        print(f"   {col['name']}: {col['type']}")
    
    # Get row count
    count = run_query(f"SELECT COUNT(*) as count FROM {table_name}")
    print(f"\nTotal rows: {count[0]['count']}")


def show_sample_data(table_name, limit=5):
    """Show sample rows from a table"""
    print(f"\n📝 Sample data from {table_name} (first {limit} rows):")
    print("-" * 60)
    
    rows = run_query(f"SELECT * FROM {table_name} ORDER BY id DESC LIMIT {limit}")
    
    if not rows:
        print("   (no data)")
        return
    
    # Print each row
    for i, row in enumerate(rows):
        print(f"\nRow {i + 1}:")
        for key, value in row.items():
            print(f"   {key}: {value}")


def show_price_summary():
    """Show summary of price data"""
    print("\n💰 Price Data Summary:")
    print("-" * 60)
    
    summary = run_query("""
        SELECT 
            series_id,
            COUNT(*) as records,
            MIN(date) as first_date,
            MAX(date) as last_date,
            ROUND(AVG(value), 2) as avg_price,
            ROUND(MIN(value), 2) as min_price,
            ROUND(MAX(value), 2) as max_price
        FROM prices
        GROUP BY series_id
        ORDER BY series_id
    """)
    
    if not summary:
        print("   (no price data)")
        return
    
    for row in summary:
        print(f"\n{row['series_id']}:")
        print(f"   Records: {row['records']}")
        print(f"   Date Range: {row['first_date']} to {row['last_date']}")
        print(f"   Price Range: ${row['min_price']} - ${row['max_price']} (avg: ${row['avg_price']})")


def show_inventory_summary():
    """Show summary of inventory data"""
    print("\n📦 Inventory Data Summary:")
    print("-" * 60)
    
    summary = run_query("""
        SELECT 
            region,
            COUNT(*) as records,
            MIN(date) as first_date,
            MAX(date) as last_date,
            ROUND(AVG(value), 0) as avg_stocks,
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
    
    if not summary:
        print("   (no inventory data)")
        return
    
    for row in summary:
        print(f"\n{row['region']}:")
        print(f"   Records: {row['records']}")
        print(f"   Date Range: {row['first_date']} to {row['last_date']}")
        print(f"   Stock Range: {int(row['min_stocks']):,} - {int(row['max_stocks']):,} KB (avg: {int(row['avg_stocks']):,})")


def run_custom_query(sql):
    """Run a custom SQL query"""
    print(f"\n🔍 Running query:")
    print(f"   {sql}")
    print("-" * 60)
    
    try:
        results = run_query(sql)
        
        if not results:
            print("   (no results)")
            return
        
        # Print results
        for i, row in enumerate(results):
            if i == 0:
                # Print header
                print("   " + " | ".join(str(k) for k in row.keys()))
                print("   " + "-" * 50)
            
            print("   " + " | ".join(str(v) for v in row.values()))
            
            if i >= 19:  # Limit to 20 rows
                print(f"   ... (showing first 20 of {len(results)} rows)")
                break
        
        print(f"\nTotal rows: {len(results)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Main function with interactive menu"""
    print("=" * 60)
    print("🗄️  DATABASE EXPLORER")
    print("=" * 60)
    
    while True:
        print("\n📋 Menu:")
        print("   1. Show all tables")
        print("   2. Show price summary")
        print("   3. Show inventory summary")
        print("   4. Show table details")
        print("   5. Show sample data")
        print("   6. Run custom SQL query")
        print("   q. Quit")
        
        choice = input("\nChoice: ").strip().lower()
        
        if choice == '1':
            show_tables()
        
        elif choice == '2':
            show_price_summary()
        
        elif choice == '3':
            show_inventory_summary()
        
        elif choice == '4':
            tables = show_tables()
            table = input("\nEnter table name: ").strip()
            if table in tables:
                show_table_info(table)
            else:
                print(f"Table '{table}' not found")
        
        elif choice == '5':
            tables = show_tables()
            table = input("\nEnter table name: ").strip()
            if table in tables:
                show_sample_data(table)
            else:
                print(f"Table '{table}' not found")
        
        elif choice == '6':
            print("\n💡 Example queries:")
            print("   SELECT * FROM prices WHERE series_id = 'DCOILBRENTEU' ORDER BY date DESC LIMIT 10")
            print("   SELECT region, MAX(value) FROM inventories GROUP BY region")
            sql = input("\nEnter SQL query: ").strip()
            if sql:
                run_custom_query(sql)
        
        elif choice == 'q':
            print("\n👋 Goodbye!")
            break
        
        else:
            print("Invalid choice, try again")


if __name__ == "__main__":
    main()
