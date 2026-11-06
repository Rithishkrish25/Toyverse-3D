@echo off
cd /d "c:\Users\vkrit\OneDrive\Desktop\Toyverse-3D"
node node_modules/vite/bin/vite.js build > build-check-output.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> build-check-output.txt
type build-check-output.txt
