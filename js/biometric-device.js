class BiometricDevice {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        // Simulate successful connection
        this.isConnected = true;
        console.log('Biometric device connected successfully (Simulation)');
        return true;
    }

    async disconnect() {
        this.isConnected = false;
        console.log('Biometric device disconnected (Simulation)');
        return true;
    }

    async scanFingerprint() {
        if (!this.isConnected) {
            throw new Error('Biometric device not connected');
        }

        // Simulate successful scan with random student data
        return {
            success: true,
            data: "simulated_fingerprint_data",
            studentId: 'STU' + Math.floor(1000 + Math.random() * 9000),
            studentName: 'Test Student'
        };
    }

    isDeviceConnected() {
        return this.isConnected;
    }

    async startScan() {
        console.log('Starting biometric scan (Simulation)...');
        const connected = await this.connect();
        if (!connected) {
            return { success: false, error: 'Failed to connect to biometric device' };
        }
        
        try {
            const result = await this.scanFingerprint();
            return {
                success: true,
                studentId: result.studentId,
                studentName: result.studentName
            };
        } finally {
            await this.disconnect();
        }
    }
}

window.biometric = new BiometricDevice();
