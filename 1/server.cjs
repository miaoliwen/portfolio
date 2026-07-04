const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

const publicFiles = new Map([
    ['/', 'index.html'],
    ['/index.html', 'index.html'],
    ['/app.js', 'app.js']
]);

function getPublicFilePath(requestUrl) {
    let pathname;
    try {
        pathname = decodeURIComponent((requestUrl || '/').split('?')[0].split('#')[0]);
    } catch {
        return null;
    }

    // Only serve the small, explicit public surface. Do not expose server code,
    // dotfiles, package files, source maps, or any future private files that are
    // accidentally placed in this directory.
    const publicFile = publicFiles.get(pathname);
    if (!publicFile) {
        return null;
    }

    return path.join(rootDir, publicFile);
}

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
};

function writeResponse(res, statusCode, headers = {}, body = '') {
    res.writeHead(statusCode, { ...securityHeaders, ...headers });
    res.end(body);
}

const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        writeResponse(res, 405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, HEAD' }, 'Method Not Allowed');
        return;
    }

    const filePath = getPublicFilePath(req.url);
    if (!filePath) {
        writeResponse(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'File not found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                writeResponse(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'File not found');
            } else {
                writeResponse(res, 500, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Server error');
            }
            return;
        }

        res.writeHead(200, { ...securityHeaders, 'Content-Type': contentType });
        if (req.method === 'HEAD') {
            res.end();
            return;
        }
        res.end(content);
    });
});

const PORT = 8081;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
