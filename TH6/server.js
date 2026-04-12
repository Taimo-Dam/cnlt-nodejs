const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Readable } = require('stream');

const appEmitter = require('./events/AppEmitter');
const TextTransform = require('./streams/TextTransform');
const EchoDuplex = require('./streams/EchoDuplex');

const PORT = 3000;

// Helper: đọc file HTML view
function readView(name) {
  return fs.readFileSync(path.join(__dirname, 'views', name), 'utf8');
}

// Helper: ghi log bằng Writable Stream
function writeLog(message) {
  const ws = fs.createWriteStream(path.join(__dirname, 'data', 'log.txt'), { flags: 'a' });
  ws.write(`[${new Date().toISOString()}] ${message}\n`);
  ws.end();
}

// Helper: parse body JSON từ request
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Emit pageVisit cho mỗi request
  appEmitter.emit('pageVisit', { page: pathname, ip: req.socket.remoteAddress });
  writeLog(`${req.method} ${pathname}`);

  // ── TRANG 1: / ──────────────────────────────
  if (pathname === '/' && req.method === 'GET') {
    const html = readView('index.html');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'NodeJS-TH6',
      'X-Page': 'home',
    });
    res.write(html);
    res.end();
    return;
  }

  // ── TRANG 2: /events ─────────────────────────
  if (pathname === '/events' && req.method === 'GET') {
    let html = readView('events.html');
    const logs = appEmitter.getLog();
    const logHtml = logs.length
      ? logs.map(l => `<div class="log-entry">${l}</div>`).join('')
      : '<span style="color:var(--muted)">Chưa có log...</span>';

    html = html
      .replace('__VISIT_COUNT__', appEmitter.getVisitCount())
      .replace('__LOG_ENTRIES__', logHtml);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Powered-By': 'NodeJS-TH6' });
    res.write(html);
    res.end();
    return;
  }

  // ── TRANG 3: /request ────────────────────────
  if (pathname === '/request' && req.method === 'GET') {
    let html = readView('request.html');

    // Query params HTML
    const queryEntries = Object.entries(query);
    const queryParamsHtml = queryEntries.length
      ? queryEntries.map(([k, v]) =>
          `<div class="info-row"><span class="info-label">${k}</span><span class="info-value">${v}</span></div>`
        ).join('')
      : '<div class="info-row"><span style="color:var(--muted);font-size:0.85rem">Không có query params</span></div>';

    // Request headers HTML
    const reqHeadersHtml = Object.entries(req.headers)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join('');

    html = html
      .replace('__METHOD__', req.method)
      .replace('__FULL_URL__', `http://localhost:${PORT}${req.url}`)
      .replace('__REQ_URL__', req.url)
      .replace('__PATHNAME__', pathname)
      .replace('__QUERY_STRING__', parsedUrl.search || '(trống)')
      .replace('__HTTP_VERSION__', req.httpVersion)
      .replace('__QUERY_PARAMS__', queryParamsHtml)
      .replace('__REQUEST_HEADERS__', reqHeadersHtml)
      .replace('__TIMESTAMP__', new Date().toISOString());

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'NodeJS-TH6',
      'X-Page': 'request-info',
      'Cache-Control': 'no-cache',
      'X-Timestamp': new Date().toISOString(),
    });
    res.write(html);
    res.end();
    return;
  }

  // ── TRANG 4: /streams ────────────────────────
  if (pathname === '/streams' && req.method === 'GET') {
    const html = readView('streams.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Powered-By': 'NodeJS-TH6' });
    res.write(html);
    res.end();
    return;
  }

  // ── ENDPOINT: /json ──────────────────────────
  if (pathname === '/json') {
    const data = {
      app: 'NodeJS Blog TH6',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      visitCount: appEmitter.getVisitCount(),
      features: ['EventEmitter', 'HTTP Server', 'Stream', 'Request Headers'],
      recentLog: appEmitter.getLog().slice(-3),
    };
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Powered-By': 'NodeJS-TH6',
    });
    res.end(JSON.stringify(data, null, 2));
    return;
  }

  // ── ENDPOINT: /image ─────────────────────────
  if (pathname === '/image') {
    const imgPath = path.join(__dirname, 'public', 'images', 'sample.svg');
    if (!fs.existsSync(imgPath)) {
      // Tạo SVG mẫu nếu chưa có
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
        <rect width="400" height="200" fill="#1a1a2e"/>
        <text x="50%" y="45%" text-anchor="middle" fill="#a8d8ea" font-size="24" font-family="monospace">NodeJS Blog</text>
        <text x="50%" y="65%" text-anchor="middle" fill="#c3e88d" font-size="14" font-family="monospace">Stream via fs.createReadStream().pipe(res)</text>
      </svg>`;
      fs.writeFileSync(imgPath, svg);
    }
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'X-Powered-By': 'NodeJS-TH6' });
    // Stream ảnh về client
    fs.createReadStream(imgPath).pipe(res);
    return;
  }

  // ── ENDPOINT: /event ─────────────────────────
  if (pathname === '/event') {
    const type = query.type;

    if (type === 'pageVisit') {
      appEmitter.emit('pageVisit', { page: '/events (manual)', ip: req.socket.remoteAddress });
      writeLog('Manual trigger: pageVisit');
    } else if (type === 'postCreated') {
      const title = decodeURIComponent(query.title || 'Bài viết mới');
      const author = decodeURIComponent(query.author || 'Ẩn danh');
      appEmitter.emit('postCreated', { title, author });
      writeLog(`postCreated: "${title}" bởi ${author}`);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      visitCount: appEmitter.getVisitCount(),
      log: appEmitter.getLog(),
    }));
    return;
  }

  // ── ENDPOINT: /download-log ──────────────────
  if (pathname === '/download-log') {
    const logPath = path.join(__dirname, 'data', 'log.txt');
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="app-log.txt"',
      'X-Powered-By': 'NodeJS-TH6',
    });
    // Đọc file log bằng stream
    fs.createReadStream(logPath).pipe(res);
    return;
  }

  // ── STREAM ENDPOINTS ─────────────────────────

  // 4.1 Readable: đọc file story.txt
  if (pathname === '/streams/readable') {
    const filePath = path.join(__dirname, 'data', 'story.txt');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    const rs = fs.createReadStream(filePath, { encoding: 'utf8' });
    rs.on('data', chunk => res.write(chunk));
    rs.on('end', () => res.end());
    rs.on('error', () => res.end('Lỗi đọc file'));
    return;
  }

  // 4.2 Writable: ghi vào file log
  if (pathname === '/streams/writable' && req.method === 'POST') {
    parseBody(req).then(body => {
      const text = body.text || '';
      const logPath = path.join(__dirname, 'data', 'log.txt');
      const ws = fs.createWriteStream(logPath, { flags: 'a' });
      ws.write(`[WRITABLE][${new Date().toISOString()}] ${text}\n`);
      ws.end();
      ws.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `✅ Đã ghi: "${text}" vào data/log.txt` }));
      });
    });
    return;
  }

  // 4.3 Transform
  if (pathname === '/streams/transform' && req.method === 'POST') {
    parseBody(req).then(body => {
      const text = body.text || '';
      const mode = body.mode || 'uppercase';
      const transformer = new TextTransform({ mode });
      let result = '';
      const readable = Readable.from([text]);
      readable.pipe(transformer);
      transformer.on('data', chunk => result += chunk.toString());
      transformer.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      });
    });
    return;
  }

  // 4.4 Duplex: echo
  if (pathname === '/streams/duplex' && req.method === 'POST') {
    parseBody(req).then(body => {
      const message = body.message || '';
      const duplex = new EchoDuplex();
      let echoResult = '';
      duplex.write(message);
      duplex.end();
      duplex.on('data', chunk => echoResult += chunk.toString());
      duplex.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ echo: echoResult }));
      });
    });
    return;
  }

  // ── 404 ─────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<h1 style="font-family:monospace;text-align:center;margin-top:80px">
    404 - Không tìm thấy trang<br>
    <a href="/" style="font-size:1rem">← Về trang chủ</a>
  </h1>`);
});

// Khởi động server & emit once('serverStart')
server.listen(PORT, () => {
  appEmitter.emit('serverStart', { port: PORT });
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📄 Trang chủ:  http://localhost:${PORT}/`);
  console.log(`⚡ Events:     http://localhost:${PORT}/events`);
  console.log(`🌐 Request:    http://localhost:${PORT}/request`);
  console.log(`🌊 Streams:    http://localhost:${PORT}/streams`);
  console.log(`🔧 JSON:       http://localhost:${PORT}/json`);
  console.log(`🖼  Image:      http://localhost:${PORT}/image`);
  console.log(`⬇  Log:        http://localhost:${PORT}/download-log`);
});