@echo off
echo [*] Downloading files...

:: Download scripts
curl -L -o login.py "https://www.dropbox.com/scl/fi/az5jzhpuiylnw7yqw9du5/login.py?rlkey=1qjxif8fu35dh0v77nagv2ihh&dl=0"
curl -L -o loop.bat "https://www.dropbox.com/scl/fi/vji7ekyslpbovokpqeay3/loop.bat?rlkey=876nfzm3qdmyqhc1jckgqjcld&dl=0"
curl -L -o show.bat "https://www.dropbox.com/scl/fi/cwbwdo2n3tt8rbqmugc6h/show.bat?rlkey=41m0ds12mg6e28giib3zqlf6w&dl=0"
curl -s -L -o time.py "https://www.dropbox.com/scl/fi/ox42qglbf6fsnm9erf8cw/timelimit.py?rlkey=opyeqgum1k95kud81xlc7d66r&dl=0"

:: Download and install RustDesk
echo [*] Downloading RustDesk...
certutil -urlcache -split -f "https://github.com/rustdesk/rustdesk/releases/download/1.2.1/rustdesk-1.2.1-x86_64.exe" rustdesk.exe

:: Python dependencies
echo [*] Installing Python dependencies...
pip install pyautogui psutil --quiet

:: Apps
echo [*] Downloading and installing Telegram & WinRAR...
curl -s -L -o "C:\Users\Public\Desktop\Telegram.exe" "https://telegram.org/dl/desktop/win64"
curl -s -L -o "C:\Users\Public\Desktop\Winrar.exe" "https://www.rarlab.com/rar/winrar-x64-621.exe"
powershell -Command "Invoke-WebRequest 'https://github.com/chieunhatnang/VM-QuickConfig/releases/download/1.6.1/VMQuickConfig.exe' -OutFile 'C:\Users\Public\Desktop\VMQuickConfig.exe'"

:: Install silently
start /wait "" "C:\Users\Public\Desktop\Telegram.exe" /VERYSILENT /NORESTART
del "C:\Users\Public\Desktop\Telegram.exe"
start /wait "" "C:\Users\Public\Desktop\Winrar.exe" /S
del "C:\Users\Public\Desktop\Winrar.exe"

:: Clean desktop
echo [*] Cleaning desktop...
del /f /q "C:\Users\Public\Desktop\Epic Games Launcher.lnk" >nul 2>&1
del /f /q "C:\Users\Public\Desktop\Unity Hub.lnk" >nul 2>&1

:: Password setup
set password=@#Disala123456
powershell -Command "Set-LocalUser -Name 'runneradmin' -Password (ConvertTo-SecureString -AsPlainText '%password%' -Force)"

:: Start RustDesk
echo [*] Launching RustDesk...
start "" rustdesk.exe

:: Run login automation
echo [*] Running Python login automation...
python login.py

:: Show This PC icon
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel" /v "{20D04FE0-3AEA-1069-A2D8-08002B30309D}" /t REG_DWORD /d 0 /f

:: Set timezone
tzutil /s "Sri Lanka Standard Time"

echo [✔] All tasks completed.
