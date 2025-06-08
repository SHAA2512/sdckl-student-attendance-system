import usb.core
import usb.util
import http.server
import json
from urllib.parse import parse_qs, urlparse
import threading
import time

class FingerprintDevice:
    def __init__(self):
        self.device = None
        self.endpoint = None
        self.VENDOR_ID = 0x0408
        self.PRODUCT_ID = 0x5090

    def connect(self):
        try:
            # Find the fingerprint device
            self.device = usb.core.find(idVendor=self.VENDOR_ID, idProduct=self.PRODUCT_ID)
            
            if self.device is None:
                return False, "Device not found"

            # Set the active configuration
            self.device.set_configuration()

            # Get an endpoint instance
            cfg = self.device.get_active_configuration()
            intf = cfg[(0,0)]

            self.endpoint = usb.util.find_descriptor(
                intf,
                custom_match = \
                lambda e: \
                    usb.util.endpoint_direction(e.bEndpointAddress) == \
                    usb.util.ENDPOINT_IN
            )

            return True, "Device connected successfully"
        except Exception as e:
            return False, str(e)

    def scan_fingerprint(self):
        try:
            if not self.device:
                return False, "Device not connected"

            # Send command to start scanning
            # Note: These commands should be adjusted based on your device's protocol
            self.device.write(1, [0x01])  # Example command to start scan
            
            # Read the response
            data = self.device.read(self.endpoint.bEndpointAddress, self.endpoint.wMaxPacketSize)
            
            # Process the fingerprint data
            # This would need to be adjusted based on your device's data format
            return True, {"data": list(data)}
            
        except Exception as e:
            return False, str(e)

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
        
        if parsed_path.path == '/connect':
            success, message = self.server.fingerprint_device.connect()
            self.send_response(200 if success else 500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': success, 'message': message}).encode())
            
        elif parsed_path.path == '/scan':
            success, data = self.server.fingerprint_device.scan_fingerprint()
            self.send_response(200 if success else 500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': success, 'data': data}).encode())
            
        elif parsed_path.path == '/disconnect':
            self.server.fingerprint_device.disconnect()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': 'Device disconnected'}).encode())

def run_server():
    server = FingerprintServer(('localhost', 8001), FingerprintHandler)
    print('Starting fingerprint service on port 8001...')
    server.serve_forever()

if __name__ == '__main__':
    run_server()
