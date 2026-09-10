import compression from 'compression';
import { mountContactProxy } from '../server/contact-proxy.mjs';
import express from 'express';
import { resolve } from 'node:path';

const outputRoot = resolve(import.meta.dirname, '../deploy/public_html');
const port = Number(process.env['PORT'] || 4000);
const app = express();
app.enable('strict routing');
app.disable('x-powered-by');
const pages = ['', 'usluge', 'cenovnik', 'o-nama', 'faq', 'kontakt'];
const redirects = new Map([
  ['/cjenovnik', '/cenovnik'], ['/our-services', '/usluge'], ['/about-us', '/o-nama'], ['/contact', '/kontakt'],
]);
app.use(compression());
mountContactProxy(app);
app.use((request, response, next) => {
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  const normalized = request.path.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
  const target = redirects.get(normalized) ?? (pages.includes(normalized.slice(1)) ? normalized : request.path);
  if (target !== request.path) {
    const query = request.originalUrl.includes('?') ? request.originalUrl.slice(request.originalUrl.indexOf('?')) : '';
    response.redirect(301, `${target}${query}`);
  } else if (/^\/404(?:\/index\.html|\/)?$/.test(request.path) || request.path === '/index.csr.html') {
    response.status(404).sendFile(resolve(outputRoot, '404/index.html'));
  } else next();
});
app.use(express.static(outputRoot, {
  index: false,
  redirect: false,
  setHeaders: (response, filePath) => {
    response.setHeader('Cache-Control', /-[A-Za-z0-9_-]{8}\.(js|css)$/.test(filePath) ? 'public, max-age=31536000, immutable'
      : /\.(avif|webp|jpe?g|png|woff2)$/.test(filePath) ? 'public, max-age=2592000' : 'no-cache');
  },
}));
for (const page of pages) {
  app.get(`/${page}`, (_request, response) => response.sendFile(resolve(outputRoot, page, 'index.html')));
}
app.use((_request, response) => response.status(404).sendFile(resolve(outputRoot, '404/index.html')));
app.listen(port, '127.0.0.1', () => console.log(`Static DreamWeb preview listening on http://127.0.0.1:${port}`));
