# SDCKL Student Attendance System

This is the SDCKL Student Attendance System, a web-based application designed to manage student attendance efficiently using biometric authentication.

## Features

- Biometric Authentication for secure login and attendance marking
- Real-time attendance tracking and reporting
- User management for students, classes, and admins
- Responsive design using Tailwind CSS and Font Awesome
- Backend API implemented in PHP with MySQL database
- Biometric device integration via Python and JavaScript

## Setup Instructions

1. **Database Setup**

- Create a MySQL database named `sdckl_attendance`.
- Import the SQL schema from `sql/schema.sql` or `db_schema.sql` to create necessary tables.

2. **Backend Setup**

- Place the PHP API files in a web server directory with PHP and MySQL support.
- Update database credentials in `api/db.php` if necessary.

3. **Frontend Setup**

- Serve the frontend HTML files (`index.html`, `attendance.html`, `login.html`, `reports.html`, `settings.html`) via a web server or open directly in a browser.
- Ensure `js/main.js` and `connect_biometric.js` are accessible.

4. **Biometric Device**

- Run the biometric device service on `localhost:8001`.
- Use `connect_biometric.py` to test device connection and scanning.
- The frontend uses `connect_biometric.js` to interact with the device.

## Running the System

- Start your web server and ensure PHP backend is running.
- Open `login.html` to authenticate.
- Use the attendance page to mark attendance via biometric scanning.
- View reports and configure settings as needed.

## Important Files

- Frontend: HTML files, `js/main.js`, `connect_biometric.js`
- Backend API: `api/*.php`, `api/db.php`
- Biometric Integration: `connect_biometric.py`, `connect_biometric.js`
- Database schema: `sql/schema.sql`

## Support

For issues or questions, please contact the system administrator or developer.
