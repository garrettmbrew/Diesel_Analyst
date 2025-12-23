# SQL Basics for Beginners

This guide will help you understand the SQL used in this project. No prior experience needed!

## What is SQL?

SQL (Structured Query Language) is how we talk to databases. Think of a database as a collection of spreadsheets (called "tables"), and SQL as the way to ask questions about or modify the data in those spreadsheets.

## Our Database: SQLite

We're using **SQLite**, which is the simplest type of database:
- It's just a single file (`diesel_data.db`)
- No server to install or manage
- Perfect for learning and small projects

## Basic SQL Commands

### 1. SELECT - Reading Data (Most Common!)

```sql
-- Get all data from a table
SELECT * FROM prices;

-- Get specific columns
SELECT date, value FROM prices;

-- Filter with WHERE
SELECT * FROM prices WHERE series_id = 'DCOILBRENTEU';

-- Filter by date
SELECT * FROM prices WHERE date > '2024-01-01';

-- Combine filters with AND/OR
SELECT * FROM prices 
WHERE series_id = 'DCOILBRENTEU' 
AND date > '2024-01-01';

-- Sort results
SELECT * FROM prices ORDER BY date DESC;

-- Limit results
SELECT * FROM prices ORDER BY date DESC LIMIT 10;
```

### 2. INSERT - Adding Data

```sql
-- Add a single row
INSERT INTO prices (source, series_id, date, value, unit)
VALUES ('FRED', 'DCOILBRENTEU', '2024-12-20', 72.50, '$/bbl');

-- Add multiple rows
INSERT INTO prices (source, series_id, date, value, unit)
VALUES 
    ('FRED', 'DCOILBRENTEU', '2024-12-20', 72.50, '$/bbl'),
    ('FRED', 'DCOILBRENTEU', '2024-12-19', 71.80, '$/bbl');
```

### 3. UPDATE - Changing Data

```sql
-- Update specific rows
UPDATE prices 
SET value = 73.00 
WHERE series_id = 'DCOILBRENTEU' AND date = '2024-12-20';
```

### 4. DELETE - Removing Data

```sql
-- Delete specific rows (BE CAREFUL!)
DELETE FROM prices WHERE date < '2020-01-01';
```

## Our Database Tables

### prices table
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | INTEGER | Auto-generated unique ID | 1, 2, 3... |
| source | TEXT | Where data came from | 'FRED', 'EIA' |
| series_id | TEXT | The data series code | 'DCOILBRENTEU' |
| date | DATE | The date of the price | '2024-12-20' |
| value | REAL | The price value | 72.50 |
| unit | TEXT | Unit of measurement | '$/bbl', '$/gal' |
| fetched_at | TIMESTAMP | When we got this data | '2024-12-20 10:30:00' |

### inventories table
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | INTEGER | Auto-generated unique ID | 1, 2, 3... |
| source | TEXT | Where data came from | 'EIA' |
| region | TEXT | Geographic region | 'US', 'PADD1', 'PADD3' |
| product | TEXT | Type of product | 'distillate' |
| date | DATE | The date of the reading | '2024-12-20' |
| value | REAL | Stock level | 118500 |
| unit | TEXT | Unit of measurement | 'thousand_barrels' |
| fetched_at | TIMESTAMP | When we got this data | '2024-12-20 10:30:00' |

### fetch_log table
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | INTEGER | Auto-generated unique ID | 1, 2, 3... |
| source | TEXT | API that was called | 'FRED', 'EIA' |
| endpoint | TEXT | Specific endpoint | '/series/observations' |
| started_at | TIMESTAMP | When fetch started | '2024-12-20 10:30:00' |
| completed_at | TIMESTAMP | When fetch finished | '2024-12-20 10:30:05' |
| status | TEXT | Result | 'success', 'error' |
| records_fetched | INTEGER | How many records | 100 |
| error_message | TEXT | If error, what happened | 'API timeout' |

## Useful Queries for This Project

### Get latest price for each series
```sql
SELECT series_id, date, value 
FROM prices 
WHERE (series_id, date) IN (
    SELECT series_id, MAX(date) 
    FROM prices 
    GROUP BY series_id
);
```

### Get price history for Brent (last 30 days)
```sql
SELECT date, value 
FROM prices 
WHERE series_id = 'DCOILBRENTEU'
AND date >= date('now', '-30 days')
ORDER BY date;
```

### Count records by source
```sql
SELECT source, COUNT(*) as record_count
FROM prices
GROUP BY source;
```

### Check for missing data (gaps in dates)
```sql
-- This shows how many records per day
SELECT date, COUNT(*) as records
FROM prices
WHERE series_id = 'DCOILBRENTEU'
GROUP BY date
ORDER BY date DESC
LIMIT 14;
```

### Compare two price series
```sql
SELECT 
    p1.date,
    p1.value as brent,
    p2.value as wti,
    (p1.value - p2.value) as spread
FROM prices p1
JOIN prices p2 ON p1.date = p2.date
WHERE p1.series_id = 'DCOILBRENTEU'
AND p2.series_id = 'DCOILWTICO'
ORDER BY p1.date DESC
LIMIT 10;
```

## How to Run SQL Queries

### Option 1: Python Script (Recommended)
```python
import sqlite3

# Connect to database
conn = sqlite3.connect('data/diesel_data.db')
cursor = conn.cursor()

# Run a query
cursor.execute("SELECT * FROM prices LIMIT 5")
results = cursor.fetchall()

for row in results:
    print(row)

conn.close()
```

### Option 2: SQLite CLI
```bash
# Open the database
sqlite3 data/diesel_data.db

# Run queries
sqlite> SELECT * FROM prices LIMIT 5;

# Exit
sqlite> .quit
```

### Option 3: VS Code Extension
Install "SQLite Viewer" or "SQLite" extension in VS Code to browse the database visually.

### Option 4: DB Browser for SQLite
Download from [sqlitebrowser.org](https://sqlitebrowser.org/) - great visual tool!

## Common Mistakes & Fixes

### Forgetting quotes around text
```sql
-- WRONG
SELECT * FROM prices WHERE series_id = DCOILBRENTEU;

-- RIGHT
SELECT * FROM prices WHERE series_id = 'DCOILBRENTEU';
```

### Using = instead of LIKE for patterns
```sql
-- Find all diesel series
SELECT * FROM prices WHERE series_id LIKE '%DIESEL%';
```

### Date format
```sql
-- SQLite dates should be 'YYYY-MM-DD'
SELECT * FROM prices WHERE date = '2024-12-20';
```

## Next Steps

1. Try the queries above on your database
2. Use VS Code SQLite extension to browse data visually
3. Check out [SQLite Tutorial](https://www.sqlitetutorial.net/) for more learning
