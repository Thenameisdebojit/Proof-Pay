@echo off
echo Starting ProofPay...
echo.

:: Ensure we are in the script's directory
cd /d "%~dp0"

:: Kill any process running on port 5000 to avoid EADDRINUSE
echo Checking for existing process on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing existing process on port 5000 - PID: %%a...
    taskkill /f /pid %%a >nul 2>&1
)

:: Install dependencies if node_modules is missing
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing dependencies.
        pause
        exit /b %errorlevel%
    )
)

:: Build the project
echo Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo Error building the application.
    pause
    exit /b %errorlevel%
)

:: Start the server
echo Starting the server on port 5000...
echo Open your browser to http://localhost:5000
echo.
call npm run start

:: If server exits, pause so user can see error
echo.
echo Server stopped.
pause
