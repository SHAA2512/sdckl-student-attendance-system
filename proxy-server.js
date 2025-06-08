const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Proxy middleware configuration
const fingerprintServiceProxy = createProxyMiddleware('/fingerprint-service', {
    target: 'http://localhost:8001',
    changeOrigin: true,
    pathRewrite: {
        '^/fingerprint-service': '' // Remove the /fingerprint-service prefix
    },
    onProxyRes: function (proxyRes, req, res) {
        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
    }
});

// Use the proxy middleware
app.use('/fingerprint-service', fingerprintServiceProxy);

// Start the server
const PORT = 8002;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
    console.log('Proxying /fingerprint-service/* to http://localhost:8001/*');
});
