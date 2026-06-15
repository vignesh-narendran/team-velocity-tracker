@echo off
setlocal

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm could not be found. Please install Node.js and npm first.
    exit /b 1
)

echo Starting Team Velocity Tracker setup...

:: Get the absolute path of the project root
set PROJECT_ROOT=%cd%

:: Install and setup Backend
echo Setting up Backend...
cd "%PROJECT_ROOT%\backend"
call npm install
echo Setting up Database...
call npx prisma db push

:: Install Frontend
echo Setting up Frontend...
cd "%PROJECT_ROOT%\frontend"
call npm install

:: Start both applications
echo Starting Backend and Frontend...
:: Using npx to run concurrently
cd "%PROJECT_ROOT%"
call npx concurrently --kill-others -n "backend,frontend" -c "blue,green" "cd backend && npm run dev" "cd frontend && npm run dev"

endlocal
