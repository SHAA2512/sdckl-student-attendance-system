import usb.core
import usb.util
import http.server
import json
from urllib.parse import urlparse
import threading
import time

class FingerprintDevice:
    def __init__(self):
        self.device = None
        self.endpoint = None
        self.VENDOR_ID = 0x0408
        self.PRODUCT_ID = 0x5090

    def connect(self):
        # Simulate successful connection
        return True, "Device connected successfully (Simulation)"

    def scan_fingerprint(self):
        # Simulate successful scan
        return True, {
            "data": "simulated_fingerprint_data",
            "studentId": "STU001",
            "studentName": "John Doe"
        }

    def disconnect(self):
        if self.device:
            usb.util.dispose_resources(self.device)
            self.device = None
            self.endpoint = None

class FingerprintServer(http.server.HTTPServer):
    def __init__(self, server_address, handler_class):
        super().__init__(server_address, handler_class)
        self.fingerprint_device = FingerprintDevice()

class FingerprintHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        print(f"Received request for path: {parsed_path.path}")
        
        # API endpoints
        if parsed_path.path == '/connect':
            success, message = self.server.fingerprint_device.connect()
            self.send_json_response({'success': success, 'message': message})
        elif parsed_path.path == '/scan':
            success, data = self.server.fingerprint_device.scan_fingerprint()
            self.send_json_response({'success': success, 'data': data})
        elif parsed_path.path == '/disconnect':
            self.server.fingerprint_device.disconnect()
            self.send_json_response({'success': True, 'message': 'Device disconnected'})
        # Static file serving
        else:
            try:
                # Default to index.html
                if parsed_path.path == '/':
                    file_path = 'index.html'
                else:
                    # Remove leading slash
                    file_path = parsed_path.path[1:]
                
                # Get file extension
                ext = file_path.split('.')[-1].lower()
                
                # Map file extensions to MIME types
                mime_types = {
                    'html': 'text/html',
                    'js': 'application/javascript',
                    'css': 'text/css',
                    'png': 'image/png',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'gif': 'image/gif',
                    'ico': 'image/x-icon'
                }
                
                content_type = mime_types.get(ext, 'application/octet-stream')
                
                with open(file_path, 'rb') as f:
                    content = f.read()
                    
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.end_headers()
                self.wfile.write(content)
                
            except FileNotFoundError:
                print(f"File not found: {file_path}")
                self.send_error(404, f'File not found: {file_path}')
            except Exception as e:
                print(f"Error serving {file_path}: {str(e)}")
                self.send_error(500, str(e))
    
    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

if __name__ == "__main__":
    try:
        server = FingerprintServer(('0.0.0.0', 8000), FingerprintHandler)
        print('Starting fingerprint service on 0.0.0.0:8000...')
        print('Server is ready to handle requests')
        server.serve_forever()
    except KeyboardInterrupt:
        print('Shutting down server...')
        server.server_close()
