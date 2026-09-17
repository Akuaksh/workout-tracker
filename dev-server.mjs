// Zero-dependency static dev server with live reload.
// Serves the repo root and reloads open browsers when a file changes.
//   node dev-server.mjs        (PORT env var overrides the default)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { join, extname, normalize } from 'node:path';

// Always serve this script's own directory, never the caller's cwd.
const root = import.meta.dirname;
const port = Number(process.env.PORT) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const LIVE_RELOAD = `
<script>
  (function connect() {
    var es = new EventSource('/__reload');
    es.onmessage = function () { location.reload(); };
    es.onerror = function () { es.close(); setTimeout(connect, 1000); };
  })();
</script>
`;

const clients = new Set();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = join(root, normalize(pathname));
  if (!filePath.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    let body = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();

    if (ext === '.html') {
      body = Buffer.from(body.toString().replace(/<\/body>/i, LIVE_RELOAD + '</body>'));
    }

    res.writeHead(200, {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
});

let timer = null;
watch(root, { recursive: true }, (_event, filename) => {
  if (!filename || filename.startsWith('.git')) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    for (const client of clients) client.write('data: reload\n\n');
  }, 60);
});

server.listen(port, () => {
  console.log(`workout-tracker dev server: http://localhost:${port}`);
});
