"""
Health Routes

Simple endpoint to check if the backend is running properly.
This is useful for monitoring and for the React frontend to verify connectivity.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check():
    """
    Basic health check endpoint.
    
    Returns a simple status message to confirm the API is running.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "message": "Diesel Backend API is running",
    }


@router.get("/db")
async def database_check(db: Session = Depends(get_db)):
    """
    Check database connectivity.
    
    Runs a simple query to verify the database is accessible.
    """
    try:
        # Simple query to test database connection
        result = db.execute("SELECT 1").fetchone()
        
        if result:
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": datetime.now().isoformat(),
            }
        else:
            return {
                "status": "unhealthy",
                "database": "query failed",
                "timestamp": datetime.now().isoformat(),
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }
