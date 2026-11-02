@echo off
setlocal
echo ========================================================
echo  Daniels Cockpit - Windows Task Scheduler Auto-Start
echo ========================================================
echo.

set "TASK_NAME=DanielsCockpitDashboard"
set "BAT_PATH=%~dp0launch_cockpit.bat"

echo Target: %BAT_PATH%
echo Task:   %TASK_NAME%
echo Trigger: On Logon
echo.

schtasks /create /tn "%TASK_NAME%" /tr "\"%BAT_PATH%\"" /sc onlogon /rl highest /f

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Auto-start task registered successfully!
    echo Cockpit will start in background on logon: http://localhost:8795/
) else (
    echo.
    echo [WARN] Admin privileges may be required. Please run as Administrator.
)

echo.
timeout /t 5 >nul
