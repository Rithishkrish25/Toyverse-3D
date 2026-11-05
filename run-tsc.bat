@echo off
cd /d "c:\Users\vkrit\OneDrive\Desktop\Toyverse-3D"
npx tsc --noEmit > tsc-task10-output.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> tsc-task10-output.txt
type tsc-task10-output.txt
