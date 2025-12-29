# Start Both Backend and Dashboard
# This script opens two separate terminals

Write-Host "Starting Diesel Analyst Project..." -ForegroundColor Green
Write-Host ""

$projectRoot = $PSScriptRoot

# Start backend in new terminal
Write-Host "Opening backend terminal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\diesel-backend'; .\start-backend.ps1"

# Wait a moment
Start-Sleep -Seconds 2

# Start dashboard in new terminal  
Write-Host "Opening dashboard terminal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\diesel-dashboard'; .\start-dashboard.ps1"

Write-Host ""
Write-Host "Both terminals launched!" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Dashboard: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
