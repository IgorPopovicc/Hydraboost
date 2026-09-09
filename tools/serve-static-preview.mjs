import compression from 'compression';
import express from 'express';
import { resolve } from 'node:path';

const outputRoot = resolve(import.meta.dirname, '../deploy/public_html');
const port = Number(process.env['PORT'] || 4000);
const app = express();
app.enable('strict routing');

const pages = ['', 'usluge', 'cenovnik', 'o-nama', 'faq', 'kontakt'];
const redirects = new Map([
  ['/cjenovnik', '/cenovnik'],
  ['/our-services', '/usluge'],
  ['/about-us', '/o-nama'],
  ['/contact', '/kontakt'],
]);

app.use(compression());

for (const [source, destination] of redirects) {
  app.get([source, `${source}/`], (_request, response) => response.redirect(301, destination));
}

app.use(express.static(outputRoot, {
  index: false,
  redirect: false,
  maxAge: '1y',
}));

for (const page of pages) {
  const file = resolve(outputRoot, page, 'index.html');
  if (page) {
    app.get(`/${page}/`, (_request, response) => response.redirect(301, `/${page}`));
    app.get(`/${page}`, (_request, response) => response.sendFile(file));
  } else {
    app.get('/', (_request, response) => response.sendFile(file));
  }
}

app.use((_request, response) => {
  response.status(404).sendFile(resolve(outputRoot, '404/index.html'));
});

app.listen(port, () => {
  console.log(`Static DreamWeb preview listening on http://localhost:${port}`);
});
