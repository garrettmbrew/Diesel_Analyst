# Start Both Backend and Dashboard
# This script opens two separate terminals and loads environment variables from root .env

Write-Host "Starting Diesel Analyst Project..." -ForegroundColor Green
Write-Host ""

$projectRoot = $PSScriptRoot
$rootEnvFile = Join-Path $projectRoot ".env"

# Check if root .env exists
if (-not (Test-Path $rootEnvFile)) {
    Write-Host "ERROR: Root .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env in the project root with your API keys." -ForegroundColor Yellow
    Write-Host "Location: $rootEnvFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "Loading environment variables from root .env..." -ForegroundColor Cyan

# Start backend in new terminal with environment variables
Write-Host "Opening backend terminal..." -ForegroundColor Cyan
$backendCommand = @"
cd '$projectRoot\diesel-backend'
`$env:PYTHONDONTWRITEBYTECODE = '1'
Get-Content '$rootEnvFile' | ForEach-Object {
    if (`$_ -match '^\s*([^#][^=]+)\s*=\s*(.*)$') {
        `$name = `$matches[1].Trim()
        `$value = `$matches[2].Trim()
        Set-Item -Path "env:`$name" -Value `$value
    }
}
.\start-backend.ps1
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Wait a moment
Start-Sleep -Seconds 2

# Start dashboard in new terminal with environment variables
Write-Host "Opening dashboard terminal..." -ForegroundColor Cyan
$dashboardCommand = @"
cd '$projectRoot\diesel-dashboard'
Get-Content '$rootEnvFile' | ForEach-Object {
    if (`$_ -match '^\s*([^#][^=]+)\s*=\s*(.*)$') {
        `$name = `$matches[1].Trim()
        `$value = `$matches[2].Trim()
        Set-Item -Path "env:`$name" -Value `$value
    }
}
.\start-dashboard.ps1
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $dashboardCommand

Write-Host ""
Write-Host "Both terminals launched!" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Dashboard: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Environment loaded from: .env" -ForegroundColor Cyan
