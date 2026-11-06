// Node.js Backend Server for NFC Simulation & Static Frontend Serving
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

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

  // API Endpoints
  if (req.url === '/api/nfc/tags' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, tags: NFC_REGISTRY }));
    return;
  }

  if (req.url === '/api/nfc/simulate-scan' && req.method === 'POST') {
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

  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ONLINE',
      system: 'CYBER-NFC HUMANOID AGENT CONTROLLER',
      timestamp: new Date().toISOString(),
      activeNodes: 2800
    }));
    return;
  }

  // Static File Serving
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, data) => {
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
