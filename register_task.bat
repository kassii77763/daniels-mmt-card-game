@echo off
setlocal
echo ========================================================
echo  Daniels Cockpit - Windows Auto-Start Registration
echo ========================================================
echo.

REM Register to Windows Startup folder (No Administrator privileges required, space-safe)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$Wsh = New-Object -ComObject WScript.Shell; $Startup = [System.Environment]::GetFolderPath('Startup'); $Shortcut = $Wsh.CreateShortcut(\"$Startup\DanielsCockpit.lnk\"); $Shortcut.TargetPath = '%~dp0launch_cockpit.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.WindowStyle = 7; $Shortcut.Description = 'Daniels Cockpit Auto-Start'; $Shortcut.Save(); Write-Host '[SUCCESS] Registered to Windows Startup Folder successfully!'"

echo.
echo [DONE] The Cockpit server will start automatically when you log on to Windows.
echo URL: http://localhost:8795/
echo.
pause
