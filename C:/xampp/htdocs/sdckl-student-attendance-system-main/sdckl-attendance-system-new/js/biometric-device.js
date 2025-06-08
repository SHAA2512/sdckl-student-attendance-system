class BiometricDevice {
    constructor() {
        this.isConnected = false;
        this.serviceUrl = 'http://localhost:8001';
        this.demoStudents = [
            { id: 'STD001', name: 'John Smith', class: '10A' },
            { id: 'STD002', name: 'Sarah Johnson', class: '10A' },
            { id: 'STD003', name: 'Michael Lee', class: '10B' },
            { id: 'STD004', name: 'Emma Wilson', class: '10B' },
            { id: 'STD005', name: 'David Brown', class: '10C' }
        ];
        this.currentStudentIndex = 0;
    }

    async connect() {
        try {
            // Simulate successful connection
            this.isConnected = true;
            console.log('Biometric device connected successfully');
            return true;
        } catch (error) {
            console.error('Error connecting to biometric device:', error);
            return false;
        }
    }

    async disconnect() {
        try {
            this.isConnected = false;
            console.log('Biometric device disconnected');
            return true;
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
            // Simulate scanning by rotating through demo students
            const student = this.demoStudents[this.currentStudentIndex];
            
            // Rotate to next student for next scan
            this.currentStudentIndex = (this.currentStudentIndex + 1) % this.demoStudents.length;

            // Add some randomization to make it more realistic
            const isLate = Math.random() > 0.7;
            const status = isLate ? 'Late' : 'Present';

            // Generate attendance record
            const record = {
                success: true,
                data: { fingerprintId: `FP${student.id}` },
                studentId: student.id,
                studentName: student.name,
                class: student.class,
                status: status,
                timestamp: new Date().toISOString()
            };

            // Save to localStorage for reports
            this.saveAttendanceRecord(record);

            return record;
        } catch (error) {
            console.error('Error scanning fingerprint:', error);
            return {
                success: false,
                error: 'Failed to scan fingerprint'
            };
        }
    }

    saveAttendanceRecord(record) {
        const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        records.push({
            studentId: record.studentId,
            studentName: record.studentName,
            class: record.class,
            status: record.status,
            timestamp: record.timestamp
        });
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
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

    // Helper method to get attendance records for reports
    static getAttendanceRecords() {
        return JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    }

    // Helper method to get attendance statistics
    static getAttendanceStats() {
        const records = BiometricDevice.getAttendanceRecords();
        const stats = {
            total: records.length,
            present: records.filter(r => r.status === 'Present').length,
            late: records.filter(r => r.status === 'Late').length,
            byClass: {}
        };

        // Calculate per-class statistics
        records.forEach(record => {
            if (!stats.byClass[record.class]) {
                stats.byClass[record.class] = {
                    total: 0,
                    present: 0,
                    late: 0
                };
            }
            stats.byClass[record.class].total++;
            if (record.status === 'Present') stats.byClass[record.class].present++;
            if (record.status === 'Late') stats.byClass[record.class].late++;
        });

        return stats;
    }
}

window.biometric = new BiometricDevice();
