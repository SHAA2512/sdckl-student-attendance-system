// Global state management
const appState = {
    isAuthenticated: false,
    currentUser: null,
    notifications: [],
    systemSettings: {
        schoolName: 'SDCKL International School',
        schoolHours: {
            start: '08:00',
            end: '15:00'
        },
        lateThreshold: 15,
        notifyAbsent: true
    }
};

// Authentication functions
const auth = {
    login: async (username, password) => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                if (username === 'admin' && password === 'admin123') {
                    appState.isAuthenticated = true;
                    appState.currentUser = {
                        id: 1,
                        username: username,
                        role: 'admin',
                        name: 'Administrator'
                    };
                    localStorage.setItem('user', JSON.stringify(appState.currentUser));
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Invalid credentials' });
                }
            }, 1000);
        });
    },

    logout: () => {
        appState.isAuthenticated = false;
        appState.currentUser = null;
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    checkAuth: () => {
        const user = localStorage.getItem('user');
        if (user) {
            appState.currentUser = JSON.parse(user);
            appState.isAuthenticated = true;
            return true;
        }
        return false;
    }
};

// Biometric device integration
const biometric = {
    device: new BiometricDevice(),

    startScan: async () => {
        try {
            // Ensure device is connected
            if (!biometric.device.isDeviceConnected()) {
                const connected = await biometric.device.connect();
                if (!connected) {
                    return {
                        success: false,
                        error: 'Failed to connect to biometric device. Please ensure the device is properly connected and try again.'
                    };
                }
            }

            // Perform the scan
            const scanResult = await biometric.device.scanFingerprint();
            if (!scanResult.success) {
                return {
                    success: false,
                    error: scanResult.error || 'Scan failed. Please try again.'
                };
            }

            // Get current timestamp
            const timestamp = new Date();

            // Determine attendance status based on school hours and late threshold
            const timeString = timestamp.toTimeString().slice(0, 5);
            const isLate = dateUtils.isLate(timeString);
            const status = isLate ? 'Late' : 'Present';

            // TODO: In production, implement proper student lookup based on fingerprint data
            // For demo, using random student ID
            const studentId = 'STU' + Math.floor(Math.random() * 10000);
            const studentName = 'Student ' + studentId.slice(3);

            // Create attendance record
            const attendanceRecord = {
                studentId,
                studentName,
                timestamp: timestamp.toISOString(),
                status,
                fingerprintData: Array.from(scanResult.data) // Store fingerprint data for verification
            };

            // Save attendance record to localStorage
            let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            attendanceRecords.push(attendanceRecord);
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

            return {
                success: true,
                studentId,
                studentName,
                timestamp,
                status
            };
        } catch (error) {
            console.error('Error during biometric scan:', error);
            return {
                success: false,
                error: 'An error occurred during the scan. Please try again.'
            };
        }
    }
};

// Notification system
const notifications = {
    add: (message, type = 'info') => {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        appState.notifications.push(notification);
        showNotification(notification);
    },

    remove: (id) => {
        appState.notifications = appState.notifications.filter(n => n.id !== id);
    }
};

// Function to get attendance records from localStorage
const getAttendanceRecords = () => {
    return JSON.parse(localStorage.getItem('attendanceRecords')) || [];
};

// Function to simulate adding attendance records for testing
const simulateAttendanceRecords = () => {
    const sampleRecords = [
        {
            studentId: 'STU1001',
            studentName: 'Student 1001',
            timestamp: new Date().toISOString(),
            status: 'Present'
        },
        {
            studentId: 'STU1002',
            studentName: 'Student 1002',
            timestamp: new Date().toISOString(),
            status: 'Late'
        },
        {
            studentId: 'STU1003',
            studentName: 'Student 1003',
            timestamp: new Date().toISOString(),
            status: 'Absent'
        }
    ];
    localStorage.setItem('attendanceRecords', JSON.stringify(sampleRecords));
};

window.simulateAttendanceRecords = simulateAttendanceRecords;

const clearAttendanceRecords = () => {
    localStorage.removeItem('attendanceRecords');
};

// Function to simulate attendance records for existing students for testing eligibility
const simulateAttendanceForStudents = () => {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    if (students.length === 0) {
        console.warn('No students found in localStorage.');
        return;
    }

    // Create attendance records for last 5 days for each student as Present
    const attendanceRecords = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const isoDate = date.toISOString().slice(0, 10);

        students.forEach(student => {
            attendanceRecords.push({
                studentId: student.studentId,
                studentName: student.studentName,
                timestamp: isoDate + 'T08:00:00.000Z',
                status: 'Present'
            });
        });
    }

    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    console.log('Simulated attendance records for students added.');
};

window.simulateAttendanceForStudents = simulateAttendanceForStudents;
window.clearAttendanceRecords = clearAttendanceRecords;
window.getAttendanceRecords = getAttendanceRecords;

// UI Utilities
const ui = {
    showLoading: (element) => {
        element.innerHTML = `
            <div class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Loading...
            </div>
        `;
    },

    showError: (element, message) => {
        element.innerHTML = `
            <div class="text-red-500">
                <i class="fas fa-exclamation-circle mr-2"></i>
                ${message}
            </div>
        `;
    },

    showSuccess: (element, message) => {
        element.innerHTML = `
            <div class="text-green-500">
                <i class="fas fa-check-circle mr-2"></i>
                ${message}
            </div>
        `;
    }
};

// Show notification toast
function showNotification(notification) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        notification.type === 'error' ? 'bg-red-500' :
        notification.type === 'success' ? 'bg-green-500' :
        'bg-blue-500'
    } text-white`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                notification.type === 'error' ? 'fa-times-circle' :
                notification.type === 'success' ? 'fa-check-circle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${notification.message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
        notifications.remove(notification.id);
    }, 3000);
}

// Date and Time Utilities
const dateUtils = {
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime: (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    isLate: (time) => {
        const [hours, minutes] = time.split(':');
        const arrivalTime = new Date();
        arrivalTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const [startHours, startMinutes] = appState.systemSettings.schoolHours.start.split(':');
        const startTime = new Date();
        startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

        const diffMinutes = (arrivalTime - startTime) / (1000 * 60);
        return diffMinutes > appState.systemSettings.lateThreshold;
    }
};

// Export functions and objects
window.appState = appState;
window.auth = auth;
window.biometric = biometric;
window.notifications = notifications;
window.ui = ui;
window.dateUtils = dateUtils;

// Function to calculate attendance percentage for a student
window.calculateAttendancePercentage = (studentId) => {
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    if (attendanceRecords.length === 0) {
        return 0;
    }

    // Get unique attendance dates (sessions)
    const uniqueDates = [...new Set(attendanceRecords.map(record => record.timestamp.slice(0, 10)))];
    const totalSessions = uniqueDates.length;

    if (totalSessions === 0) {
        return 0;
    }

    // Count number of sessions student attended (Present or Late)
    const attendedDates = new Set(
        attendanceRecords
            .filter(record => record.studentId === studentId && (record.status === 'Present' || record.status === 'Late'))
            .map(record => record.timestamp.slice(0, 10))
    );

    const attendedCount = attendedDates.size;

    // Calculate percentage
    const percentage = (attendedCount / totalSessions) * 100;
    return percentage;
};

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    if (!auth.checkAuth() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Setup logout buttons
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    });

    // Setup login form submission handler if on login page
    if (window.location.pathname.endsWith('login.html')) {
        const loginForm = document.getElementById('loginForm');
        const loginButton = document.getElementById('loginButton');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            loginButton.disabled = true;
            loginButton.innerHTML = `
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i class="fas fa-spinner fa-spin text-blue-500"></i>
                </span>
                Signing in...
            `;

            try {
                const result = await auth.login(username, password);
                if (result.success) {
                    notifications.add('Login successful!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    loginButton.disabled = false;
                    loginButton.innerHTML = `
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-sign-in-alt text-blue-500 group-hover:text-blue-400"></i>
                        </span>
                        Sign in
                    `;
                    notifications.add(result.error || 'Login failed', 'error');
                }
            } catch (error) {
                loginButton.disabled = false;
                loginButton.innerHTML = `
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <i class="fas fa-sign-in-alt text-blue-500 group-hover:text-blue-400"></i>
                    </span>
                    Sign in
                `;
                notifications.add('An error occurred during login', 'error');
            }
        });
    }
});
