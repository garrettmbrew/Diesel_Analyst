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

# Load environment from root .env if not already loaded
$rootEnvFile = Join-Path (Split-Path $PSScriptRoot) ".env"
if ((Test-Path $rootEnvFile) -and -not $env:FRED_API_KEY) {
    Write-Host "Loading environment from root .env..." -ForegroundColor Cyan
    Get-Content $rootEnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Verify API keys are loaded
if (-not $env:FRED_API_KEY -or -not $env:EIA_API_KEY) {
    Write-Host "WARNING: API keys not found in environment!" -ForegroundColor Red
    Write-Host "Make sure .env file exists in project root." -ForegroundColor Yellow
}

# Activate venv and start server
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

Write-Host "Starting API server at http://localhost:8000" -ForegroundColor Green
Write-Host "API docs available at http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
uvicorn app.main:app --reload
