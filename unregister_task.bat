@echo off
setlocal
echo ========================================================
echo  Daniels Cockpit - Remove Auto-Start Registration
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$Startup = [System.Environment]::GetFolderPath('Startup'); $Target = \"$Startup\DanielsCockpit.lnk\"; if (Test-Path $Target) { Remove-Item $Target -Force; Write-Host '[SUCCESS] Startup shortcut removed successfully.' } else { Write-Host '[INFO] Shortcut not found or already removed.' }"

schtasks /delete /tn "DanielsCockpitDashboard" /f >nul 2>&1

echo.
pause
