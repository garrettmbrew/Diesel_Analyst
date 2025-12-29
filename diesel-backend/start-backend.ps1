# Diesel Backend Startup Script

Write-Host "Starting Diesel Backend..." -ForegroundColor Green

# Check if we're in the diesel-backend folder
if (-not (Test-Path "app\main.py")) {
    Write-Host "ERROR: Run this script from the diesel-backend folder!" -ForegroundColor Red
    Write-Host "Current location: $PWD" -ForegroundColor Yellow
    exit 1
}

# Check if venv exists
if (-not (Test-Path "venv\Scripts\activate.ps1")) {
    Write-Host "Virtual environment not found. Creating it..." -ForegroundColor Yellow
    python -m venv venv
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Create .env with your API keys before starting." -ForegroundColor Yellow
    exit 1
}

# Activate venv and start server
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

Write-Host "Starting API server at http://localhost:8000" -ForegroundColor Green
Write-Host "API docs available at http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
uvicorn app.main:app --reload
