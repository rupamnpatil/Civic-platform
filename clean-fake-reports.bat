@echo off
setlocal
title Reality Check - Remove Fake Reports
cd /d "%~dp0"

echo ================================================================
echo          REALITY CHECK - REMOVING FAKE & STOCK ENTRIES
echo ================================================================
echo.
echo Connecting to MongoDB database...
cd /d "%~dp0backend"
node src/utils/cleanFakeReports.js

echo.
echo Press any key to close this window.
pause >nul
