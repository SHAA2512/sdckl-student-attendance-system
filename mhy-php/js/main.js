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
    getUsers: () => {
        return JSON.parse(localStorage.getItem('users')) || [
            { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' }
        ];
    },

    saveUsers: (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    },

    register: async (username, password, role) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = auth.getUsers();
                if (users.some(u => u.username === username)) {
                    resolve({ success: false, error: 'Username already exists' });
                    return;
                }
                users.push({ username, password, role, name: username });
                auth.saveUsers(users);
                resolve({ success: true });
            }, 1000);
        });
    },

    login: async (username, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = auth.getUsers();
                const user = users.find(u => u.username === username && u.password === password);
                if (user) {
                    appState.isAuthenticated = true;
                    appState.currentUser = user;
                    localStorage.setItem('user', JSON.stringify(user));
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
class BiometricDevice {
    constructor() {
        this.device = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            const device = await navigator.usb.requestDevice({
                filters: [] // Add your device-specific filters here
            });

            await device.open();
            await device.selectConfiguration(1);
            await device.claimInterface(0);

            this.device = device;
            this.isConnected = true;
            console.log('Biometric device connected successfully');
            return true;
        } catch (error) {
            console.error('Failed to connect to biometric device:', error);
            return false;
        }
    }

    async disconnect() {
        if (this.device) {
            try {
                await this.device.close();
                this.device = null;
                this.isConnected = false;
                console.log('Biometric device disconnected');
                return true;
            } catch (error) {
                console.error('Error disconnecting device:', error);
                return false;
            }
        }
        return false;
    }

    async scanFingerprint() {
        if (!this.isConnected) {
            throw new Error('Biometric device not connected');
        }

        try {
            const data = new Uint8Array([0x01]); // Example command
            await this.device.transferOut(1, data);

            const result = await this.device.transferIn(1, 64);
            const fingerprintData = new Uint8Array(result.data.buffer);
            return {
                success: true,
                data: fingerprintData
            };
        } catch (error) {
            console.error('Error scanning fingerprint:', error);
            return {
                success: false,
                error: 'Failed to scan fingerprint'
            };
        }
    }

    isDeviceConnected() {
        return this.isConnected;
    }
}

const biometric = new BiometricDevice();

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

// Attendance and data management
const getAttendanceRecords = () => {
    return JSON.parse(localStorage.getItem('attendanceRecords')) || [];
};

const getStudents = () => {
    return JSON.parse(localStorage.getItem('students')) || [];
};

const getClasses = () => {
    return JSON.parse(localStorage.getItem('classes')) || [];
};

const saveAttendanceRecord = (record) => {
    let records = getAttendanceRecords();
    records.push(record);
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
};

const saveStudents = (students) => {
    localStorage.setItem('students', JSON.stringify(students));
};

const saveClasses = (classes) => {
    localStorage.setItem('classes', JSON.stringify(classes));
};

// Calculate attendance percentage for a student
const calculateAttendancePercentage = (studentId) => {
    const attendanceRecords = getAttendanceRecords();
    if (attendanceRecords.length === 0) return 0;

    const uniqueDates = [...new Set(attendanceRecords.map(r => r.timestamp.slice(0, 10)))];
    const totalSessions = uniqueDates.length;
    if (totalSessions === 0) return 0;

    const attendedDates = new Set(
        attendanceRecords
            .filter(r => r.studentId === studentId && (r.status === 'Present' || r.status === 'Late'))
            .map(r => r.timestamp.slice(0, 10))
    );

    return (attendedDates.size / totalSessions) * 100;
};

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

    setTimeout(() => {
        toast.remove();
        notifications.remove(notification.id);
    }, 3000);
}

window.appState = appState;
window.auth = auth;
window.biometric = biometric;
window.notifications = notifications;
window.ui = ui;
window.calculateAttendancePercentage = calculateAttendancePercentage;

// DOMContentLoaded event for login form and auth check
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.checkAuth() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    if (window.location.pathname.endsWith('login.html')) {
        const loginForm = document.getElementById('loginForm');
        const loginButton = document.getElementById('loginButton');
        const biometricButton = document.getElementById('biometricButton');
        const biometricStatus = document.getElementById('biometricStatus');

        const registerContainer = document.getElementById('registerContainer');
        const registerForm = document.getElementById('registerForm');
        const registerButton = document.getElementById('registerButton');
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');

        showRegister.addEventListener('click', () => {
            registerContainer.classList.remove('hidden');
            loginForm.parentElement.classList.add('hidden');
        });

        showLogin.addEventListener('click', () => {
            registerContainer.classList.add('hidden');
            loginForm.parentElement.classList.remove('hidden');
        });

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

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const role = document.getElementById('regRole').value;

            registerButton.disabled = true;
            registerButton.innerHTML = `
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i class="fas fa-spinner fa-spin text-green-500"></i>
                </span>
                Registering...
            `;

            try {
                const result = await auth.register(username, password, role);
                if (result.success) {
                    notifications.add('Registration successful! You can now login.', 'success');
                    setTimeout(() => {
                        registerContainer.classList.add('hidden');
                        loginForm.parentElement.classList.remove('hidden');
                    }, 1000);
                } else {
                    registerButton.disabled = false;
                    registerButton.innerHTML = `
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-user-plus text-green-500 group-hover:text-green-400"></i>
                        </span>
                        Register
                    `;
                    notifications.add(result.error || 'Registration failed', 'error');
                }
            } catch (error) {
                registerButton.disabled = false;
                registerButton.innerHTML = `
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <i class="fas fa-user-plus text-green-500 group-hover:text-green-400"></i>
                    </span>
                    Register
                `;
                notifications.add('An error occurred during registration', 'error');
            }
        });

        biometricButton.addEventListener('click', async () => {
            biometricStatus.classList.remove('hidden');
            try {
                const connected = await biometric.connect();
                if (!connected) {
                    notifications.add('Failed to connect to biometric device', 'error');
                    biometricStatus.classList.add('hidden');
                    return;
                }
                const scanResult = await biometric.scanFingerprint();
                biometricStatus.classList.add('hidden');
                if (scanResult.success) {
                    // For demo, assume fingerprint data matches admin user
                    appState.isAuthenticated = true;
                    appState.currentUser = {
                        id: 1,
                        username: 'admin',
                        role: 'admin',
                        name: 'Administrator'
                    };
                    localStorage.setItem('user', JSON.stringify(appState.currentUser));
                    notifications.add('Biometric login successful!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    notifications.add(scanResult.error || 'Biometric scan failed', 'error');
                }
            } catch (error) {
                biometricStatus.classList.add('hidden');
                notifications.add('Error during biometric login', 'error');
            }
        });
    }
});
