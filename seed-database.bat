@echo off
setlocal
title Reality Check - Database Seeder
cd /d "%~dp0backend"

echo ================================================================
echo   REALITY CHECK - SEEDING MUNICIPAL ZONES & DEMO DATA
echo ================================================================
echo.
npm run seed
echo.
echo ================================================================
echo Done! Default accounts:
echo   * Admin:   admin@civic.com   / admin123
echo   * Citizen: citizen@civic.com / citizen123
echo ================================================================
echo.
pause
