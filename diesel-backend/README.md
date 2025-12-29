# Diesel Data Backend

A Python backend service that fetches, validates, and stores market data for the Diesel Dashboard.

## Status: ✅ Core Functionality Complete

The backend successfully fetches and stores data from FRED and EIA APIs.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SCRIPTS (Entry Points)                    │
│  fetch_data.py → quickstart.py → show_data.py → export_csv.py   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FETCHERS                                 │
│              fred.py                    eia.py                   │
│         (FRED API calls)           (EIA API calls)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                            │
│     models.py (table definitions)  ←→  database.py (connection) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SQLite Database File                          │
│                    data/diesel_data.db                           │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Exists

| Problem with Current Setup | Solution |
|---------------------------|----------|
| API calls happen on every page load | Data is cached in database |
| No data validation | QA checks before storage |
| No historical tracking | Database keeps all history |
| Can't see when data was fetched | Audit trail in database |
| External API errors break the UI | Cached data available as fallback |

## Quick Start

### 1. Install Python (if needed)
- Download from [python.org](https://www.python.org/downloads/)
- Make sure to check "Add Python to PATH" during install

### 2. Set Up Virtual Environment
```bash
# Navigate to backend folder from project root
cd diesel-backend

# Create virtual environment
python -m venv venv

# Activate it (Windows PowerShell)
venv\Scripts\activate

# Or for Command Prompt
venv\Scripts\activate.bat
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure API Keys
Create a `.env` file in the `diesel-backend` folder:
```env
FRED_API_KEY=your_fred_key_here
EIA_API_KEY=your_eia_key_here
```

### 5. Fetch Data
```bash
python scripts/fetch_data.py 24    # Fetch 24 months of data
```

### 6. View Your Data
```bash
python scripts/show_data.py        # See summary in terminal
python scripts/export_csv.py       # Export to CSV files
```

### 7. (Optional) Run the API Server
```bash
# Make sure you're in diesel-backend folder and venv is activated
uvicorn app.main:app --reload
```
The API will be available at http://localhost:8000

---

## Running Both Frontend & Backend

**Terminal 1 - Backend API:**
```powershell
cd diesel-backend
venv\Scripts\activate
uvicorn app.main:app --reload
```
Backend runs at http://localhost:8000

**Terminal 2 - React Dashboard:**
```powershell
cd diesel-dashboard
npm start
```
Frontend runs at http://localhost:3000

---

## Quick Reference

| Task | Command |
|------|---------|
| Fetch 2 years of data | `python scripts/fetch_data.py 24` |
| Fetch 5 years of data | `python scripts/fetch_data.py 60` |
| Fetch 10 years of data | `python scripts/fetch_data.py 120` |
| See what's in database | `python scripts/show_data.py` |
| Export to CSV | `python scripts/export_csv.py` |
| Start API server | `uvicorn app.main:app --reload` |
| View API docs | http://localhost:8000/docs |

---

## Core Files Explained

### app/database.py - Foundation
**What it does:** Connects to SQLite and provides database utilities.

**Key functions:**
- `engine` - The SQLite connection (reads `DATABASE_URL` from `.env`)
- `SessionLocal` - Creates database sessions for queries
- `init_db()` - Creates all tables if they don't exist
- `run_query(sql)` - Runs raw SQL and returns results as dictionaries
- `get_db()` - Dependency injection for FastAPI routes

**Used by:** Everything else (models, fetchers, routes, scripts)

---

### app/models.py - Data Structure
**What it does:** Defines the database tables using SQLAlchemy ORM.

**Tables created:**
| Table | Purpose |
|-------|---------|
| `prices` | Stores daily price data (Brent, WTI, ULSD) |
| `inventories` | Stores weekly inventory data (US, PADD1-5) |
| `fetch_log` | Audit trail of every API fetch |
| `data_quality` | Future: data validation results |

**Depends on:** `database.py` (uses `Base` for table creation)

---

### app/fetchers/fred.py - FRED API
**What it does:** Fetches price data from Federal Reserve (FRED).

**Key functions:**
- `get_api_key()` - Gets `FRED_API_KEY` from environment
- `fetch_series(series_id, start_date, end_date)` - Raw API call, returns data
- `fetch_and_store_series(db, series_id, months)` - Fetches AND saves to database
- `fetch_all_series(db, months)` - Fetches all 4 price series at once

**Data flow:**
```
fetch_all_series()
    └→ fetch_and_store_series() (x4 series)
           └→ fetch_series() (API call)
           └→ INSERT INTO prices (database write)
           └→ INSERT INTO fetch_log (audit)
```

**Depends on:** `database.py`, `models.py`

---

### app/fetchers/eia.py - EIA API
**What it does:** Fetches inventory data from Energy Information Administration.

**Key functions:**
- `get_api_key()` - Gets `EIA_API_KEY` from environment
- `fetch_distillate_stocks(area_code, start_date, end_date)` - Raw API call
- `fetch_and_store_stocks(db, area_code, months)` - Fetches AND saves to database
- `fetch_all_stocks(db, months)` - Fetches all 6 regions at once

**Data flow:** Same pattern as FRED - fetch from API, store in database, log the fetch.

**Depends on:** `database.py`, `models.py`

---

## API Routes (app/routes/)

These are for the FastAPI web server (`uvicorn app.main:app --reload`):

### app/routes/health.py
- `GET /api/health` - Is the server running?
- `GET /api/health/db` - Is the database connected?

### app/routes/prices.py
- `GET /api/prices` - Get price data with filters
- `GET /api/prices/latest` - Latest price for each series
- `GET /api/prices/series` - List all available series
- `GET /api/prices/{series_id}` - Get specific series data

### app/routes/inventories.py
- `GET /api/inventories` - Get inventory data with filters
- `GET /api/inventories/latest` - Latest inventory for each region
- `GET /api/inventories/regions` - List all regions
- `GET /api/inventories/compare` - Compare multiple regions

### app/routes/fetch.py
- `POST /api/fetch/fred/all` - Trigger FRED data fetch
- `POST /api/fetch/eia/all` - Trigger EIA data fetch
- `POST /api/fetch/all` - Fetch everything
- `GET /api/fetch/status` - See recent fetch history

### app/main.py - Ties it all together
- Creates FastAPI app
- Sets up CORS (so React can call the API)
- Registers all route modules
- Runs `init_db()` on startup

---

## Scripts Explained

### scripts/fetch_data.py - Main Data Pull Script
**Usage:** `python scripts/fetch_data.py 60` (for 60 months)

**What it does:**
1. Loads `.env` for API keys
2. Calls `init_db()` to ensure tables exist
3. Calls `fetch_all_series()` for FRED prices
4. Calls `fetch_all_stocks()` for EIA inventories
5. Prints summary

**Depends on:** `database.py`, `fetchers/fred.py`, `fetchers/eia.py`

---

### scripts/show_data.py
**Usage:** `python scripts/show_data.py`

**What it does:** Runs SQL queries to display summaries of what's in the database.

**Depends on:** `database.py` (just `run_query()`)

---

### scripts/export_csv.py
**Usage:** `python scripts/export_csv.py`

**What it does:**
1. Queries all data from `prices` and `inventories` tables
2. Creates pivot tables (date as rows, series as columns)
3. Writes 4 CSV files to `exports/` folder

**Output files:**
- `prices_*.csv` - All price records (raw data)
- `inventories_*.csv` - All inventory records (raw data)
- `prices_pivot_*.csv` - Prices pivoted by date (ready for Excel charts)
- `inventories_pivot_*.csv` - Inventories pivoted by date (ready for Excel charts)

**Depends on:** `database.py` (just `run_query()`)

---

### scripts/quickstart.py
**Usage:** `python scripts/quickstart.py`

**What it does:** Same as `fetch_data.py` but with more verbose output. Good for first-time setup testing.

---

## Data Flow Summary

```
1. YOU RUN: python scripts/fetch_data.py 60

2. SCRIPT loads .env → gets FRED_API_KEY, EIA_API_KEY

3. SCRIPT calls init_db() → creates tables if needed

4. SCRIPT calls fetch_all_series(db, months=60)
   └→ fred.py makes HTTP requests to api.stlouisfed.org
   └→ fred.py parses JSON response
   └→ fred.py INSERTs into prices table
   └→ fred.py INSERTs into fetch_log table

5. SCRIPT calls fetch_all_stocks(db, months=60)
   └→ eia.py makes HTTP requests to api.eia.gov
   └→ eia.py parses JSON response  
   └→ eia.py INSERTs into inventories table
   └→ eia.py INSERTs into fetch_log table

6. DATA is now in diesel_data.db

7. YOU RUN: python scripts/export_csv.py
   └→ Reads from database
   └→ Writes CSV files to exports/
```

---

## Files Overview

```
diesel-backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # Database connection & helpers
│   ├── models.py         # SQLAlchemy table definitions
│   ├── fetchers/
│   │   ├── __init__.py
│   │   ├── fred.py       # FRED API fetcher
│   │   └── eia.py        # EIA API fetcher
│   └── routes/
│       ├── __init__.py
│       ├── health.py     # Health check endpoints
│       ├── prices.py     # Price data endpoints
│       ├── inventories.py # Inventory data endpoints
│       └── fetch.py      # Trigger data fetches
├── scripts/
│   ├── fetch_data.py     # Main script to pull data
│   ├── show_data.py      # Display database summary
│   ├── export_csv.py     # Export to CSV files
│   ├── quickstart.py     # First-time setup test
│   └── explore_db.py     # Interactive database explorer
├── exports/              # CSV exports go here
├── data/
│   └── diesel_data.db    # SQLite database (created on first run)
├── docs/
│   └── sql-basics.md     # SQL tutorial for beginners
├── .env                  # Your API keys (don't commit!)
├── .gitignore
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## SQL Basics for Beginners

See [docs/sql-basics.md](docs/sql-basics.md) for a beginner-friendly SQL guide.

---

## Development Status

- [x] Project structure
- [x] Database schema
- [x] FRED fetcher
- [x] EIA fetcher  
- [x] Data fetch scripts
- [x] CSV export
- [x] API routes
- [ ] Data quality checks
- [ ] Scheduled fetching
- [ ] React integration
