// Debug logging
console.log('%c SDCKL System Initializing...', 'background: #222; color: #bada55; font-size: 16px;');

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

// Notification system
const notifications = {
    add: (message, type = 'info') => {
        console.log(`%c ${type.toUpperCase()}: ${message}`, 'background: #222; color: #bada55');
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        appState.notifications.push(notification);
        showNotification(notification);
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
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c DOM Content Loaded', 'background: #222; color: #bada55');

    // Handle biometric authentication
    const biometricButton = document.getElementById('biometricButton');
    if (biometricButton) {
        console.log('%c Biometric button found', 'background: #222; color: #bada55');
        biometricButton.addEventListener('click', async function() {
            console.log('%c Biometric button clicked', 'background: #222; color: #bada55');
            const status = document.getElementById('biometricStatus');
            status.classList.remove('hidden');
            
            try {
                if (!window.biometric) {
                    throw new Error('Biometric module not loaded');
                }

                console.log('%c Starting biometric scan...', 'background: #222; color: #bada55');
                const result = await window.biometric.startScan();
                console.log('%c Scan result:', 'background: #222; color: #bada55', result);
                
                if (result.success) {
                    status.innerHTML = '<div class="text-green-500"><i class="fas fa-check-circle mr-2"></i>Authentication successful!</div>';
                    notifications.add('Biometric authentication successful!', 'success');
                    
                    // Set authentication state
                    appState.isAuthenticated = true;
                    appState.currentUser = {
                        id: result.studentId,
                        username: result.studentName,
                        role: 'student',
                        name: result.studentName
                    };
                    localStorage.setItem('user', JSON.stringify(appState.currentUser));
                    
                    // Save attendance record
                    saveAttendanceRecord({
                        studentId: result.studentId,
                        studentName: result.studentName,
                        status: 'Present'
                    });
                    
                    setTimeout(() => {
                        window.location.href = 'attendance.html';
                    }, 1000);
                } else {
                    status.innerHTML = '<div class="text-red-500"><i class="fas fa-times-circle mr-2"></i>Authentication failed</div>';
                    notifications.add(result.error, 'error');
                }
            } catch (error) {
                console.error('%c Biometric error:', 'background: #222; color: #bada55', error);
                status.innerHTML = '<div class="text-red-500"><i class="fas fa-times-circle mr-2"></i>System error</div>';
                notifications.add('System error occurred: ' + error.message, 'error');
            }
        });
    } else {
        console.error('%c Biometric button not found', 'background: #222; color: #bada55');
    }

    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('%c Login form found', 'background: #222; color: #bada55');
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginButton = document.getElementById('loginButton');
            
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
    } else {
        console.error('%c Login form not found', 'background: #222; color: #bada55');
    }

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
});

// Attendance records management
function getAttendanceRecords() {
    const records = localStorage.getItem('attendanceRecords');
    return records ? JSON.parse(records) : [];
}

function saveAttendanceRecord(record) {
    const records = getAttendanceRecords();
    records.push({
        ...record,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
}

// Biometric scanning functionality
const biometric = {
    async startScan() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulated successful scan for demo
                resolve({
                    success: true,
                    studentId: 'STU' + Math.floor(1000 + Math.random() * 9000),
                    studentName: 'Test Student'
                });
            }, 2000);
        });
    }
};

// Date formatting utility
const dateUtils = {
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
};

// Export functions and objects for global access
window.appState = appState;
window.auth = auth;
window.notifications = notifications;
window.biometric = biometric;
window.dateUtils = dateUtils;

console.log('%c SDCKL System Initialized', 'background: #222; color: #bada55; font-size: 16px;');
