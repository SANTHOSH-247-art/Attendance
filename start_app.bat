@echo off
echo Starting SMAS System...

:: Start Python Backend
echo Starting Python SMS Server...
start "SMAS Backend" cmd /k "python server.py"

:: Start React Frontend
echo Starting Frontend...
start "SMAS Frontend" cmd /k "npm run dev"

echo ===================================================
echo SMAS System Started
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173 (usually)
echo ===================================================
pause
