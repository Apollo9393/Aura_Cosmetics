const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Access-Control-Allow-Origin", "*");

  let reqUrl = decodeURI(req.url.split("?")[0]);
  if (reqUrl === "/") reqUrl = "/index.html";

  const safePath = path.normalize(path.join(ROOT_DIR, reqUrl));
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const range = req.headers.range;

    if (range && (ext === ".webm" || ext === ".mp4")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(safePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": stats.size,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      });
      fs.createReadStream(safePath).pipe(res);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n========================================`);
  console.log(`🚀 Сервер успешно запущен!`);
  console.log(`========================================`);
  console.log(`📱 Для телефона (в одной Wi-Fi сети):`);

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`   👉 http://${net.address}:${PORT}`);
      }
    }
  }

  console.log(`\n💻 Локально на компьютере:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
