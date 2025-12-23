"""
Routes Package

This package contains all the API route modules.
"""

from app.routes.health import router as health_router
from app.routes.prices import router as prices_router
from app.routes.inventories import router as inventories_router
from app.routes.fetch import router as fetch_router

__all__ = [
    "health_router",
    "prices_router", 
    "inventories_router",
    "fetch_router",
]
