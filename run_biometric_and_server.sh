#!/bin/bash
# Script to run biometric device Python service and Node.js HTTP server

# Run fingerprint service Python script in background
echo "Starting fingerprint service Python script..."
python3 sdckl-attendance-system-new/middleware/fingerprint_service.py &

# Run biometric device Python script in background
echo "Starting biometric device Python script..."
python3 connect_biometric.py &

# Start Node.js HTTP server on port 8000
echo "Starting Node.js HTTP server on port 8000..."
npx http-server -p 8000

# Note: To stop the biometric Python scripts, you may need to kill the processes manually.
