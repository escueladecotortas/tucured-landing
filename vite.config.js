// Archivo: vite.config.js
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

function rewriteShortTicketMiddleware(req, _res, next) {
  if (req.url) {
    const match = req.url.match(/^\/t\/([^/?#]+)(?:\?(.*))?$/i);
    if (match) {
      const token = encodeURIComponent(decodeURIComponent(match[1]));
      const extraQuery = match[2] ? `&${match[2]}` : '';
      req.url = `/gestion_turno.html?token=${token}${extraQuery}`;
    }
  }
  next();
}

export default defineConfig({
  plugins: [
    {
      name: 'tucured-short-ticket-redirect',
      configureServer(server) { server.middlewares.use(rewriteShortTicketMiddleware); },
      configurePreviewServer(server) { server.middlewares.use(rewriteShortTicketMiddleware); },
      closeBundle() {
        const rawDir = path.resolve('dist/assets/mascot/raw');
        if (fs.existsSync(rawDir)) fs.rmSync(rawDir, { recursive: true, force: true });
      }
    }
  ]
});
