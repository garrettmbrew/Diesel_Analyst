"""
Diesel Data Backend - Main Application

This is the entry point for the FastAPI application.
Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our route modules
from app.routes import prices, inventories, health, fetch
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    This runs when the app starts up and shuts down.
    We use it to initialize the database.
    """
    # Startup: Initialize database tables
    print("🚀 Starting Diesel Data Backend...")
    init_db()
    print("✅ Database initialized")
    
    yield  # App is running
    
    # Shutdown: Clean up if needed
    print("👋 Shutting down...")


# Create the FastAPI app
app = FastAPI(
    title="Diesel Data Backend",
    description="API for fetching, storing, and serving diesel market data",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow React frontend to call this API
# This is needed because React runs on a different port (3000) than this API (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:5173",     # Vite dev server (if you switch)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Register route modules
# Each module handles a different part of the API
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(prices.router, prefix="/api", tags=["Prices"])
app.include_router(inventories.router, prefix="/api", tags=["Inventories"])
app.include_router(fetch.router, prefix="/api", tags=["Data Fetching"])


@app.get("/")
async def root():
    """
    Root endpoint - just a welcome message
    """
    return {
        "message": "Diesel Data Backend API",
        "docs": "/docs",  # FastAPI auto-generates nice documentation!
        "status": "running"
    }


# This runs if you execute this file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
