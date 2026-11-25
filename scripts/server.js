import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import validateHandler from '../api/validate-meal.js';
const root = resolve('src');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml' };
const port = Number(process.env.PORT || 3000);
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/api/validate-meal') {
      let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 16000) { res.writeHead(413); return res.end(); } }
      const adapter = { setHeader: (...args) => res.setHeader(...args), status(code) { res.statusCode = code; return this; }, json(data) { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(data)); } };
      return validateHandler({ method: req.method, body }, adapter);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root + sep)) { res.writeHead(403); return res.end(); }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }); res.end(req.method === 'HEAD' ? undefined : data);
  } catch { if (!res.headersSent) res.writeHead(404); res.end('Não encontrado'); }
}).listen(port, '127.0.0.1', () => console.log(`DietLife: http://localhost:${port}`));
