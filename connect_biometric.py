import requests

def connect_device():
    response = requests.get('http://localhost:8001/connect')
    return response.json()

def scan_fingerprint():
    response = requests.get('http://localhost:8001/scan')
    return response.json()

def disconnect_device():
    response = requests.get('http://localhost:8001/disconnect')
    return response.json()

if __name__ == "__main__":
    print("Connecting to biometric device...")
    connect_result = connect_device()
    print(connect_result)

    if connect_result.get('success'):
        print("Scanning fingerprint...")
        scan_result = scan_fingerprint()
        print(scan_result)

        print("Disconnecting device...")
        disconnect_result = disconnect_device()
        print(disconnect_result)
    else:
        print("Failed to connect to the biometric device.")
