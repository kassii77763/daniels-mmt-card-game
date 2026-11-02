@echo off
setlocal
echo ========================================================
echo  Daniels Cockpit - Unregister Windows Task Scheduler
echo ========================================================
echo.

set "TASK_NAME=DanielsCockpitDashboard"
schtasks /delete /tn "%TASK_NAME%" /f

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Auto-start task removed successfully.
) else (
    echo.
    echo [INFO] Task not found or already removed.
)

echo.
timeout /t 5 >nul
