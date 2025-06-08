// Biometric Device Integration
class BiometricDevice {
    constructor() {
        this.device = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // Request USB device access
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
            // Send command to initiate scan
            const data = new Uint8Array([0x01]); // Example command - adjust based on your device protocol
            await this.device.transferOut(1, data);

            // Read scan result
            const result = await this.device.transferIn(1, 64);
            
            // Process the scanned data
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

// Export the BiometricDevice class
window.BiometricDevice = BiometricDevice;
