# Start both dev servers (run from repo root)
# Usage: .\scripts\dev.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting backend on http://localhost:8015 ..."
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8015"
)

Start-Sleep -Seconds 2

Write-Host "Starting frontend on http://localhost:3000 ..."
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\frontend'; npm run dev -- -p 3000"
)

Write-Host ""
Write-Host "Open:  http://localhost:3000"
Write-Host "API:   http://localhost:8015/docs"
Write-Host "Login: alex@example.com / password123"
