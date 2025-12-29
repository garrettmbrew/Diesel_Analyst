# Diesel Dashboard Startup Script

Write-Host "Starting Diesel Dashboard..." -ForegroundColor Green

# Check if we're in the diesel-dashboard folder
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Run this script from the diesel-dashboard folder!" -ForegroundColor Red
    Write-Host "Current location: $PWD" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting React dashboard at http://localhost:3000" -ForegroundColor Green
Write-Host ""
npm start
