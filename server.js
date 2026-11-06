// Node.js Backend Server for NFC Simulation & Static Frontend Serving
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const RESOLVED_DIST = path.resolve(__dirname, 'dist');
const INDEX_HTML = path.join(RESOLVED_DIST, 'index.html');

// Mock NFC registry database
const NFC_REGISTRY = [
  {
    id: 'cyber-card',
    name: 'NTAG-215 CyberCard',
    type: 'Smart Card ISO 14443-A',
    uid: '04:8F:A2:3B:5C:88:90',
    frequency: '13.56 MHz',
    status: 'AUTHENTICATED',
    payload: 'AI-CORE-HUMANOID:INIT_SEQUENCE_SIG_ALPHA'
  },
  {
    id: 'bio-implant',
    name: 'Bio-Subdermal Chip',
    type: 'Biocompatible RFID Capsule',
    uid: 'E0:04:01:A0:5B:C2:19',
    frequency: '13.56 MHz / NFC Type 2',
    status: 'AUTHENTICATED',
    payload: 'BIOMETRIC_IDENT:HUMANOID_SYNAPSE_LINK'
  },
  {
    id: 'key-fob',
    name: 'Quantum Key Fob',
    type: 'MIFARE DESFire EV3',
    uid: '1A:77:C3:90:22:DF:44',
    frequency: '13.56 MHz',
    status: 'AUTHENTICATED',
    payload: 'SECURITY_TOKEN:QUANTUM_NEURAL_OVERRIDE'
  }
];

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * Sanitizes and safely resolves a requested URL pathname inside the static DIST directory.
 * Prevents Path Traversal (CWE-22) vulnerabilities.
 * @param {string} requestUrl 
 * @returns {string | null} Validated absolute path within RESOLVED_DIST, or null if invalid/traversal attempted.
 */
function getSafeStaticPath(requestUrl) {
  try {
    const parsed = new URL(requestUrl, 'http://localhost');
    const decoded = decodeURIComponent(parsed.pathname);

    // Reject null byte injection attacks
    if (decoded.includes('\0')) {
      return null;
    }

    // Normalize path and eliminate any leading parent directory traversals
    const safeSubPath = path.normalize(decoded).replace(/^(\.\.[\/\\])+/, '');
    const cleanSubPath = safeSubPath.startsWith(path.sep) ? safeSubPath.slice(1) : safeSubPath;
    const resolvedPath = path.resolve(RESOLVED_DIST, cleanSubPath);

    // Strictly ensure resolved path resides within RESOLVED_DIST directory
    const relative = path.relative(RESOLVED_DIST, resolvedPath);
    const isInsideDist = !relative.startsWith('..') && !path.isAbsolute(relative);

    if (!isInsideDist) {
      return null;
    }

    return resolvedPath;
  } catch {
    return null;
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // API Endpoints
  if (pathname === '/api/nfc/tags' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, tags: NFC_REGISTRY }));
    return;
  }

  if (pathname === '/api/nfc/simulate-scan' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const matched = NFC_REGISTRY.find(t => t.id === parsed.tagId) || NFC_REGISTRY[0];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'NFC Scan validated by Node.js server',
          tag: matched,
          greeting: 'Hola, ¿en qué puedo servirte?'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ONLINE',
      system: 'CYBER-NFC HUMANOID AGENT CONTROLLER',
      timestamp: new Date().toISOString(),
      activeNodes: 2800
    }));
    return;
  }

  // Safe Static File Serving with Path Traversal Protection (CWE-22)
  const safePath = getSafeStaticPath(req.url);

  if (!safePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Invalid file path');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    // If requested file does not exist or is a directory (e.g. root /), fallback safely to index.html
    const fileToServe = (!err && stats.isFile()) ? safePath : INDEX_HTML;

    const ext = path.extname(fileToServe).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(fileToServe, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🤖 Cyber NFC Humanoid AI Server running on:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   API Endpoint: http://localhost:${PORT}/api/nfc/tags`);
  console.log(`====================================================`);
});
