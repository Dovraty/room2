// Tiny SPA static server for the web export (dist/). Usage: node scripts/serve.mjs [port]
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const port = Number(process.argv[2] ?? 8099);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.json': 'application/json' };
http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(root, url);
  try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); } catch { file = path.join(root, 'index.html'); }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(port, () => console.log(`serving dist on http://localhost:${port}`));
