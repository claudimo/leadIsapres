const http = require('http');
const fs   = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css',
  '.js':    'application/javascript',
  '.json':  'application/json',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath    = path.join(PUBLIC_DIR, urlPath);
  const contentType = MIME[path.extname(filePath)] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? '404 Not Found' : '500 Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const next = err.port + 1;
    console.log(`  Puerto ${err.port} ocupado, probando ${next}...`);
    server.listen(next);
  } else {
    throw err;
  }
});

server.on('listening', () => {
  const { port } = server.address();
  console.log(`\n  ✅  http://localhost:${port}\n`);
  console.log('  Presiona Ctrl+C para detener\n');
});

server.listen(Number(process.env.PORT) || 3000);
