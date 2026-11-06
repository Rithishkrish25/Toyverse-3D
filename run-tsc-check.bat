@echo off
cd /d "c:\Users\vkrit\OneDrive\Desktop\Toyverse-3D"
node node_modules/typescript/bin/tsc --noEmit > tsc-check-output.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> tsc-check-output.txt
type tsc-check-output.txt
