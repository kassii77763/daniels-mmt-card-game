@echo off
setlocal
echo [INFO] Stopping Daniels Cockpit Server on port 8795...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R ":8795 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [SUCCESS] Terminated PID %%a.
)
echo [DONE] Daniels Cockpit Server stopped.
timeout /t 3 >nul
