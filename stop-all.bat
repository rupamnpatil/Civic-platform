@echo off
setlocal
title Reality Check - Multi-Service Stopper
cd /d "%~dp0"

echo ================================================================
echo          REALITY CHECK - STOPPING ALL ACTIVE SERVICES
echo ================================================================
echo.

echo [1/3] Terminating services on ports 5000, 3000, and 8081...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 5000, 3000, 8081 -State Listen -ErrorAction SilentlyContinue | " ^
  "ForEach-Object { " ^
  "  Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; " ^
  "  Write-Host ('  [STOPPED] Service on Port ' + $_.LocalPort + ' (PID: ' + $_.OwningProcess + ')'); " ^
  "}"

echo.
echo [2/3] Closing active Reality Check command windows...
taskkill /F /FI "WINDOWTITLE eq Reality Check - Backend*" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq Reality Check - Admin*" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq Reality Check - Mobile*" >nul 2>nul

echo.
echo ================================================================
echo               ALL SERVICES HAVE BEEN STOPPED!
echo ================================================================
echo.
echo Press any key to close.
pause >nul
