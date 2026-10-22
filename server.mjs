import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const args = process.argv.slice(2);
const port = args.length === 0 ? 4173 : args.length === 2 && args[0] === '--port' ? Number(args[1]) : NaN;
if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('Usage: node server.mjs [--port 1..65535]'); process.exit(1); }
const root = process.cwd();
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const name = pathname === '/' ? 'public/index.html' : pathname.slice(1);
    const path = resolve(root, name);
    if (!(name === 'public/index.html' || name.startsWith('dist/')) || !path.startsWith(root + sep)) {
      res.writeHead(404).end('Not found'); return;
    }
    const data = await readFile(path);
    res.writeHead(200, { 'content-type': name.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8', 'cache-control': 'no-store' }).end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Machine Slices: http://127.0.0.1:${port}`));
