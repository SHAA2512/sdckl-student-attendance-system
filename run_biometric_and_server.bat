@echo off
REM Batch script to run biometric device Python script and start Node.js HTTP server

REM Change directory to the project folder
cd /d "C:\xampp\htdocs\sdckl-student-attendance-system-main (2)\sdckl-attendance-system-new"

REM Run the biometric Python script in a new window
start cmd /k "python connect_biometric.py"

REM Start Node.js HTTP server on port 8000 in current window
npx http-server -p 8000

REM Note: Close the Node.js server window to stop the server
