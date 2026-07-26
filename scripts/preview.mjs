import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);

function argumentValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const host = argumentValue("--host", "0.0.0.0");
const port = Number(argumentValue("--port", process.env.PORT || "4173"));

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

http
  .createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const requestedPath = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
    const filePath = path.resolve(root, `.${requestedPath}`);

    if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(response);
  })
  .listen(port, host, () => {
    console.log(`Preview server listening on http://${host}:${port}`);
  });
