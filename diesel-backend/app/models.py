"""
Database Models

These define the structure of our database tables.
Think of each class as a spreadsheet template - it defines what columns exist.

SQLAlchemy (the library we're using) converts these Python classes into SQL tables.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Text, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base


class Price(Base):
    """
    Stores price data (Brent, WTI, ULSD, etc.)
    
    Each row is one price observation for one day.
    
    Example row:
        id=1, source='FRED', series_id='DCOILBRENTEU', date='2024-12-20', 
        value=72.50, unit='$/bbl', fetched_at='2024-12-20 10:30:00'
    """
    __tablename__ = "prices"  # This is the SQL table name
    
    # Columns
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(20), nullable=False)          # 'FRED', 'EIA', 'ICE'
    series_id = Column(String(50), nullable=False)       # 'DCOILBRENTEU', 'DDFUELUSGULF'
    date = Column(Date, nullable=False)                  # The date of the price
    value = Column(Float, nullable=True)                 # The price (nullable for missing data)
    unit = Column(String(20), nullable=True)             # '$/bbl', '$/gal', '$/mt'
    fetched_at = Column(DateTime, server_default=func.now())  # When we fetched this
    
    # This ensures we don't have duplicate entries for the same series/date
    __table_args__ = (
        UniqueConstraint('source', 'series_id', 'date', name='uix_price_series_date'),
    )
    
    def __repr__(self):
        return f"<Price {self.series_id} {self.date}: {self.value}>"


class Inventory(Base):
    """
    Stores inventory/stock data (US distillate, PADD regions, ARA)
    
    Each row is one inventory reading for one region/product/date.
    
    Example row:
        id=1, source='EIA', region='PADD3', product='distillate', 
        date='2024-12-20', value=45200, unit='thousand_barrels'
    """
    __tablename__ = "inventories"
    
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(20), nullable=False)          # 'EIA', 'INSIGHTS_GLOBAL'
    region = Column(String(20), nullable=False)          # 'US', 'PADD1', 'PADD3', 'ARA'
    product = Column(String(30), nullable=False)         # 'distillate', 'crude', 'gasoline'
    date = Column(Date, nullable=False)
    value = Column(Float, nullable=True)                 # Stock level
    unit = Column(String(30), nullable=True)             # 'thousand_barrels', 'million_mt'
    fetched_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('source', 'region', 'product', 'date', name='uix_inventory'),
    )
    
    def __repr__(self):
        return f"<Inventory {self.region} {self.product} {self.date}: {self.value}>"


class FetchLog(Base):
    """
    Audit trail of data fetches.
    
    Every time we call an external API, we log it here.
    This helps us track:
    - When data was last updated
    - If there were any errors
    - How many records we got
    
    Example row:
        id=1, source='FRED', endpoint='/series/observations', 
        started_at='2024-12-20 10:30:00', completed_at='2024-12-20 10:30:05',
        status='success', records_fetched=100
    """
    __tablename__ = "fetch_log"
    
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(20), nullable=False)          # 'FRED', 'EIA'
    endpoint = Column(String(100), nullable=True)        # The API endpoint called
    series_id = Column(String(50), nullable=True)        # Which series (if applicable)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False)          # 'success', 'error', 'partial'
    records_fetched = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)          # Error details if failed
    
    def __repr__(self):
        return f"<FetchLog {self.source} {self.started_at}: {self.status}>"


class DataQuality(Base):
    """
    Data quality check results.
    
    After fetching data, we run quality checks and log results here.
    
    Types of checks:
    - 'missing_data': Expected data that wasn't returned
    - 'outlier': Value is suspiciously high/low
    - 'stale': Data hasn't been updated in expected timeframe
    - 'duplicate': Same data point fetched twice
    
    Example row:
        id=1, table_name='prices', series_id='DCOILBRENTEU',
        check_type='outlier', check_date='2024-12-20 10:30:00',
        status='warning', details='{"value": 150.0, "expected_range": [50, 100]}'
    """
    __tablename__ = "data_quality"
    
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(50), nullable=False)      # Which table was checked
    series_id = Column(String(50), nullable=True)        # Which series (if applicable)
    check_type = Column(String(50), nullable=False)      # Type of check
    check_date = Column(DateTime, server_default=func.now())
    status = Column(String(20), nullable=False)          # 'pass', 'warning', 'fail'
    details = Column(Text, nullable=True)                # JSON with details
    
    def __repr__(self):
        return f"<DataQuality {self.check_type} {self.status}>"


# ----- Pydantic Models for API Responses -----
# These define the shape of data returned by our API endpoints

from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


class PriceResponse(BaseModel):
    """Response model for price data"""
    id: int
    source: str
    series_id: str
    date: date
    value: Optional[float]
    unit: Optional[str]
    fetched_at: Optional[datetime]
    
    class Config:
        from_attributes = True  # Allows converting from SQLAlchemy model


class InventoryResponse(BaseModel):
    """Response model for inventory data"""
    id: int
    source: str
    region: str
    product: str
    date: date
    value: Optional[float]
    unit: Optional[str]
    fetched_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class FetchLogResponse(BaseModel):
    """Response model for fetch logs"""
    id: int
    source: str
    endpoint: Optional[str]
    series_id: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    status: str
    records_fetched: int
    error_message: Optional[str]
    
    class Config:
        from_attributes = True
