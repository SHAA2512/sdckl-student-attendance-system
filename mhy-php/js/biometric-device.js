class BiometricDevice {
    constructor() {
        this.isConnected = false;
        this.serviceUrl = 'http://localhost:8001';
    }

    async connect() {
        try {
            const response = await fetch(`${this.serviceUrl}/connect`);
            const result = await response.json();
            
            if (result.success) {
                this.isConnected = true;
                console.log('Biometric device connected successfully');
                return true;
            } else {
                console.error('Failed to connect to biometric device:', result.message);
                return false;
            }
        } catch (error) {
            console.error('Error connecting to biometric device:', error);
            return false;
        }
    }

    async disconnect() {
        try {
            const response = await fetch(`${this.serviceUrl}/disconnect`);
            const result = await response.json();
            
            if (result.success) {
                this.isConnected = false;
                console.log('Biometric device disconnected');
                return true;
            } else {
                console.error('Error disconnecting device');
                return false;
            }
        } catch (error) {
            console.error('Error disconnecting device:', error);
            return false;
        }
    }

    async scanFingerprint() {
        if (!this.isConnected) {
            throw new Error('Biometric device not connected');
        }

        try {
            const response = await fetch(`${this.serviceUrl}/scan`);
            const result = await response.json();
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data,
                    // In a real implementation, the middleware would handle matching
                    // and return the actual student information
                    studentId: 'demoStudentId',
                    studentName: 'Demo Student'
                };
            } else {
                return {
                    success: false,
                    error: result.message || 'Failed to scan fingerprint'
                };
            }
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

    async startScan() {
        const connected = await this.connect();
        if (!connected) {
            return { success: false, error: 'Failed to connect to biometric device' };
        }
        return await this.scanFingerprint();
    }
}

window.biometric = new BiometricDevice();
