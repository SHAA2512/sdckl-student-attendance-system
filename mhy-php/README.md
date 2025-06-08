# SDCKL Student Attendance System - Biometric Module

## Overview
This system integrates biometric fingerprint scanning for student attendance management. The frontend connects to a local Python service that interfaces with the fingerprint device.

## Database Setup

1. Ensure you have MySQL or MariaDB installed and running.
2. Create a database named `sdckl_attendance`:
   ```sql
   CREATE DATABASE sdckl_attendance;
   ```
3. Import the database schema located in `sql/schema.sql`:
   ```bash
   mysql -u root -p sdckl_attendance < sql/schema.sql
   ```
4. Update the database credentials in `api/db.php` if necessary.

## Running the Biometric Device Service

1. Ensure you have Python 3 installed.
2. Install the required Python package `pyusb`:
   ```
   pip install pyusb
   ```
3. Connect your fingerprint device to the computer.
4. Run the biometric service:
   ```
   python3 middleware/fingerprint_service.py
   ```
   This will start an HTTP server on `http://localhost:8001` that communicates with the fingerprint device.

## Running the PHP Server

1. Ensure you have a PHP server installed (e.g., XAMPP, WAMP, or PHP built-in server).
2. Place the project directory in your web server's root directory or start the built-in server:
   ```
   php -S localhost:8080
   ```
3. Access the system via `http://localhost:8080/attendance.html` or the appropriate URL.

## Using the Attendance Page

1. Open `attendance.html` in a modern web browser.
2. Click the "Start Scanning" button to connect to the biometric device and scan fingerprints.
3. The system will display scan status and mark attendance for recognized students.

## Notes

- The fingerprint device vendor and product IDs are set in the Python service (`VENDOR_ID=0x0408`, `PRODUCT_ID=0x5090`). Adjust these if your device differs.
- The frontend expects the Python service to be running on port 8001.
- Ensure your browser allows connections to `http://localhost:8001` (CORS headers are set in the Python service).
- For development, you can run a local HTTP server to serve the frontend files, e.g.:
  ```
  python3 -m http.server 8000 -d .
  ```
  Then open `http://localhost:8000/attendance.html` in your browser.

## Troubleshooting

- If the device is not found, check USB connections and device IDs.
- Check the terminal running the Python service for error messages.
- Ensure no other service is using port 8001.
