"""
Database Setup and Connection

This file handles:
1. Connecting to the SQLite database
2. Creating tables (if they don't exist)
3. Providing database sessions for other parts of the app
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment, or use default
# SQLite just needs a file path - no server required!
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/diesel_data.db")

# Create the database engine
# check_same_thread=False is needed for SQLite with FastAPI
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False,  # Set to True to see all SQL queries (helpful for learning!)
)

# Create a session factory
# Sessions are how we interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models
Base = declarative_base()


def get_db():
    """
    Get a database session.
    
    This is used as a "dependency" in FastAPI routes.
    It ensures the session is properly closed after each request.
    
    Usage in routes:
        @router.get("/prices")
        def get_prices(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize the database - create all tables.
    
    This is safe to call multiple times - it won't delete existing data.
    SQLite will create the database file if it doesn't exist.
    """
    # Make sure the data directory exists
    os.makedirs("data", exist_ok=True)
    
    # Import models so SQLAlchemy knows about them
    from app.models import Price, Inventory, FetchLog, DataQuality
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print(f"📁 Database location: {DATABASE_URL}")
    print("📊 Tables created/verified: prices, inventories, fetch_log, data_quality")


def run_query(sql: str, params: dict = None):
    """
    Run a raw SQL query and return results as a list of dictionaries.
    
    Useful for learning SQL! Try it in Python:
    
        from app.database import run_query
        results = run_query("SELECT * FROM prices LIMIT 5")
        for row in results:
            print(row)
    
    Args:
        sql: The SQL query string
        params: Optional dictionary of parameters (for safe queries)
    
    Returns:
        List of result rows as dictionaries
    """
    with engine.connect() as conn:
        result = conn.execute(text(sql), params or {})
        # Convert Row objects to dictionaries for easier access
        return [dict(row._mapping) for row in result.fetchall()]


# Command-line interface for database operations
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "init":
            print("Initializing database...")
            init_db()
            print("✅ Done!")
            
        elif command == "query":
            # Run a SQL query from command line
            if len(sys.argv) > 2:
                sql = " ".join(sys.argv[2:])
                print(f"Running: {sql}")
                results = run_query(sql)
                for row in results:
                    print(row)
            else:
                print("Usage: python -m app.database query 'SELECT * FROM prices LIMIT 5'")
                
        else:
            print(f"Unknown command: {command}")
            print("Available commands: init, query")
    else:
        print("Database utility")
        print("Commands:")
        print("  python -m app.database init              - Initialize database")
        print("  python -m app.database query 'SQL...'    - Run a SQL query")
