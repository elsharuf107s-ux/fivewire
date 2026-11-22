// Tiny local server: serves index.html and relays Polymarket's public APIs (avoids browser CORS issues).
// Run: node server.js   then open http://localhost:5555
const http = require('http');
const fs = require('fs');
const path = require('path');

const UPSTREAM = { gamma: 'https://gamma-api.polymarket.com', clob: 'https://clob.polymarket.com' };
const PORT = process.env.PORT || 5555;

http.createServer(async (req, res) => {
  const m = req.url.match(/^\/api\/(gamma|clob)(\/.*)$/);
  if (!m) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
  }
  try {
    const r = await fetch(UPSTREAM[m[1]] + m[2], { headers: { accept: 'application/json' } });
    res.writeHead(r.status, { 'content-type': 'application/json' });
    res.end(await r.text());
  } catch (e) {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: String(e.cause?.code || e.message) }));
  }
}).listen(PORT, () => console.log(`Open http://localhost:${PORT}`));
