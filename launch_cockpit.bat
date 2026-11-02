@echo off
setlocal
cd /d "%~dp0"

REM Check if port 8795 is already listening
netstat -ano | findstr /R ":8795 " | findstr "LISTENING" >nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Daniels Cockpit Server is already running on port 8795.
    exit /b 0
)

start "" pythonw "%~dp0server.py"
echo [SUCCESS] Daniels Cockpit Server launched in background: http://localhost:8795/
exit /b 0
