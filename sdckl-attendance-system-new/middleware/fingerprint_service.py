import http.server
import json
from urllib.parse import parse_qs, urlparse
import threading
import time

class FingerprintDevice:
    def __init__(self):
        self.device = None
        self.connected = False

    def connect(self):
        try:
            # Simulate successful connection
            self.connected = True
            return True, "Device connected successfully"
        except Exception as e:
            return False, str(e)

    def scan_fingerprint(self):
        try:
            if not self.connected:
                return False, "Device not connected"

            # Simulate successful scan
            return True, {"data": "simulated-fingerprint-data-123"}
            
        except Exception as e:
            return False, str(e)

    def disconnect(self):
        self.connected = False
        return True, "Device disconnected successfully"

class FingerprintServer(http.server.HTTPServer):
    def __init__(self, server_address, handler_class):
        super().__init__(server_address, handler_class)
        self.fingerprint_device = FingerprintDevice()

class FingerprintHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/connect':
            success, message = self.server.fingerprint_device.connect()
            self.send_response(200 if success else 500)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'success': success, 'message': message}).encode())
            
        elif parsed_path.path == '/scan':
            success, data = self.server.fingerprint_device.scan_fingerprint()
            self.send_response(200 if success else 500)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'success': success, 'data': data}).encode())
            
        elif parsed_path.path == '/disconnect':
            success, message = self.server.fingerprint_device.disconnect()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'success': success, 'message': message}).encode())

def run_server():
    server = FingerprintServer(('0.0.0.0', 8001), FingerprintHandler)
    print('Starting fingerprint service on port 8001...')
    server.serve_forever()

if __name__ == '__main__':
    run_server()
