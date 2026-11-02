@echo off
setlocal
title Reality Check - Push to GitHub
cd /d "%~dp0"

echo ================================================================
echo           REALITY CHECK - PUSHING UPDATES TO GITHUB
echo ================================================================
echo.

echo [1/3] Staging changes...
git add .

echo.
echo [2/3] Creating commit...
git commit -m "Fix admin dashboard reporting, map bounds, real-time sync, and add service scripts"

echo.
echo [3/3] Pushing to GitHub (origin/main)...
git push origin main

echo.
if errorlevel 1 (
    echo [ERROR] Git push encountered an issue. Check your connection or GitHub credentials.
) else (
    echo ================================================================
    echo        SUCCESS: Latest project code pushed to GitHub!
    echo ================================================================
)

echo.
pause
