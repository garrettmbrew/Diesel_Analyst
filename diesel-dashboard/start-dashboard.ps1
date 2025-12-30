# Diesel Dashboard Startup Script

Write-Host "Starting Diesel Dashboard..." -ForegroundColor Green

# Check if we're in the diesel-dashboard folder
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Run this script from the diesel-dashboard folder!" -ForegroundColor Red
    Write-Host "Current location: $PWD" -ForegroundColor Yellow
    exit 1
}

# Load environment from root .env if not already loaded
$rootEnvFile = Join-Path (Split-Path $PSScriptRoot) ".env"
if ((Test-Path $rootEnvFile) -and -not $env:REACT_APP_FRED_API_KEY) {
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
if (-not $env:REACT_APP_FRED_API_KEY -or -not $env:REACT_APP_EIA_API_KEY) {
    Write-Host "WARNING: React API keys not found in environment!" -ForegroundColor Red
    Write-Host "Make sure .env file exists in project root with REACT_APP_ prefixed keys." -ForegroundColor Yellow
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting React dashboard at http://localhost:3000" -ForegroundColor Green
Write-Host ""
npm start
