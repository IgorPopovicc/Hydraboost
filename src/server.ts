import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import compression from 'compression';
import { mountContactProxy } from '../server/contact-proxy.mjs';
import { join } from 'node:path';
import { NAVIGATION, SITE_URL } from './app/core/data/site.data';

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();
const publicPaths = new Set(NAVIGATION.map((item) => item.path));
const legacyPaths: Readonly<Record<string, string>> = {
  '/cjenovnik': '/cenovnik', '/our-services': '/usluge', '/about-us': '/o-nama', '/contact': '/kontakt',
};

const serveAssets = express.static(browserDistFolder, {
  index: false,
  redirect: false,
  setHeaders: (res, filePath) => {
    const cache = /-[A-Za-z0-9_-]{8}\.(js|css)$/.test(filePath) ? 'public, max-age=31536000, immutable'
      : /\.(avif|webp|jpe?g|png|woff2)$/.test(filePath) ? 'public, max-age=2592000' : 'no-cache';
    res.setHeader('Cache-Control', cache);
  },
});

app.disable('x-powered-by');
app.use(compression());
mountContactProxy(app);
app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-cache');
  const cleanPath = request.path.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
  const destination = legacyPaths[cleanPath] ?? (publicPaths.has(cleanPath) ? cleanPath : request.path);
  const query = request.originalUrl.includes('?') ? request.originalUrl.slice(request.originalUrl.indexOf('?')) : '';
  // Local previews remain local. At production, TLS must terminate here or at a trusted proxy.
  const isProductionHost = /^(www\.)?hydraboost-infuzije\.rs$/i.test(request.hostname);
  const forwardedHttps = request.get('x-forwarded-proto') === 'https';
  const needsOriginRedirect = isProductionHost && (request.hostname !== 'www.hydraboost-infuzije.rs' || (!request.secure && !forwardedHttps));
  if (destination !== request.path || needsOriginRedirect) {
    response.redirect(301, `${isProductionHost ? SITE_URL : ''}${destination}${query}`);
    return;
  }
  // Never serve generated error HTML or a CSR shell as an indexable static success.
  if (/^\/404(?:\/index\.html|\/)?$/.test(request.path) || request.path === '/index.csr.html') {
    next();
    return;
  }
  serveAssets(request, response, next);
});

app.use((request, response, next) => {
  angularApp
    .handle(request)
    .then((rendered) => rendered ? writeResponseToNodeResponse(rendered, response) : next())
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
