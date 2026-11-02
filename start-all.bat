@echo off
setlocal
title Reality Check - Multi-Service Launcher

:: Set working directory to project root
cd /d "%~dp0"

echo ================================================================
echo   REALITY CHECK - LOCATION-BASED CIVIC MAINTENANCE PLATFORM
echo               Mumbai University Mini Project
echo ================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check if required directories exist
if not exist "%~dp0backend" (
    echo [ERROR] backend directory not found!
    pause
    exit /b 1
)
if not exist "%~dp0admin" (
    echo [ERROR] admin directory not found!
    pause
    exit /b 1
)
if not exist "%~dp0mobile" (
    echo [ERROR] mobile directory not found!
    pause
    exit /b 1
)

:: 3. Display current local IPv4 addresses (for mobile app reference)
echo Detecting current local IPv4 address:
ipconfig | findstr /i /c:"IPv4"
echo Note: If testing with phone on Wi-Fi, ensure your phone is on the same
echo Wi-Fi network as this PC.
echo.

echo ----------------------------------------------------------------
echo Starting all services in separate windows...
echo ----------------------------------------------------------------
echo.

:: 4. Launch Backend API server
echo [1/3] Starting Backend API Server on Port 5000...
start "Reality Check - Backend (Port 5000)" cmd /k "cd /d ""%~dp0backend"" && npm run dev"

:: Small delay to let backend start first
ping 127.0.0.1 -n 3 >nul

:: 5. Launch Admin Web Dashboard
echo [2/3] Starting Admin Web Dashboard on Port 3000...
start "Reality Check - Admin Dashboard (Port 3000)" cmd /k "cd /d ""%~dp0admin"" && npm run dev"

:: Small delay
ping 127.0.0.1 -n 3 >nul

:: 6. Launch Mobile App (Expo)
echo [3/3] Starting Mobile App with Expo...
start "Reality Check - Mobile App (Expo)" cmd /k "cd /d ""%~dp0mobile"" && npm start"

echo.
echo ================================================================
echo                    ALL SERVICES STARTED!
echo ================================================================
echo.
echo  * Backend API:       http://localhost:5000
echo  * Admin Dashboard:   http://localhost:3000
echo  * Mobile App (Expo): Scan the QR code shown in the Expo window
echo.
echo  Default Demo Credentials:
echo    * Admin Portal:    admin@civic.com   / admin123
echo    * Citizen Account: citizen@civic.com / citizen123
echo.
echo  Helpful Scripts in this folder:
echo    * stop-all.bat            - Stop all services and close windows
echo    * clean-fake-reports.bat  - Remove dummy/stock reports from database
echo    * seed-database.bat       - Reset fresh database with demo accounts
echo ================================================================
echo.
pause
