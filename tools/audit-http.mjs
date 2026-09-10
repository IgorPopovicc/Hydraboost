import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import http from 'node:http';
import https from 'node:https';

const base = process.env['SEO_BASE_URL'] || 'http://127.0.0.1:4000';
const origin = 'https://www.hydraboost-infuzije.rs';
// Only for testing a local Apache virtual host behind simulated TLS termination.
const headers = process.env['SEO_HOST'] ? { Host: process.env['SEO_HOST'], 'X-Forwarded-Proto': 'https' } : {};
const pages = ['/', '/usluge', '/cenovnik', '/o-nama', '/faq', '/kontakt'];
// Node fetch normalizes Host, so use the HTTP client for virtual-host checks.
const get = (url, requestHeaders = headers) => new Promise((resolve, reject) => {
  const client = url.protocol === 'https:' ? https : http;
  const request = client.get(url, { headers: requestHeaders, timeout: 20000 }, (response) => {
    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => resolve(new Response(Buffer.concat(chunks), {
      status: response.statusCode,
      headers: Object.fromEntries(Object.entries(response.headers).map(([key, value]) => [key, String(value)])),
    })));
    response.on('error', reject);
  });
  request.on('timeout', () => request.destroy(new Error(`Timeout: ${url}`)));
  request.on('error', reject);
});
const fetchPath = (path) => get(new URL(path, base));
for (const path of pages) {
  const response = await fetchPath(path);
  assert.equal(response.status, 200, `${path} direct status`);
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), `${path} HTTP robots`);
  const document = new JSDOM(await response.text()).window.document;
  assert.equal(document.querySelector('link[rel="canonical"]')?.href, `${origin}${path}`, `${path} canonical`);
  assert.equal(document.querySelectorAll('h1').length, 1, `${path} H1`);
  assert.ok(document.title, `${path} title`);
  assert.ok(document.querySelector('meta[name="description"]')?.content, `${path} description`);
  JSON.parse(document.querySelector('script[data-hydraboost-schema]')?.textContent || 'invalid');
  assert.ok(!/noindex/.test(document.querySelector('meta[name="robots"]')?.content || ''), `${path} indexability`);
  assert.ok(!/max-age=31536000|immutable/.test(response.headers.get('cache-control') || ''), `${path} HTML cache`);
  console.log(`PASS 200 ${path}; encoding=${response.headers.get('content-encoding') || 'identity'}; cache=${response.headers.get('cache-control') || 'unset'}`);
}
const aliases = [
  ['/index.html', '/'], ['/usluge/index.html', '/usluge'], ['/usluge/', '/usluge'],
  ['/cjenovnik', '/cenovnik'], ['/our-services', '/usluge'], ['/about-us', '/o-nama'], ['/contact', '/kontakt'],
  ['/our-services/index.html', '/usluge'],
];
for (const path of pages.slice(1)) aliases.push([`${path}/`, path], [`${path}/index.html`, path]);
for (const [path, target] of aliases) {
  const response = await fetchPath(`${path}?utm_source=seo-check`);
  assert.equal(response.status, 301, `${path} permanent redirect`);
  const location = new URL(response.headers.get('location'), base);
  assert.equal(location.pathname, target, `${path} destination`);
  assert.equal(location.search, '?utm_source=seo-check', `${path} preserves query`);
  assert.ok([new URL(base).origin, origin].includes(location.origin), `${path} trusted redirect origin`);
  console.log(`PASS 301 ${path} -> ${location.pathname}`);
}
for (const path of ['/ne-postoji-seo-provera', '/usluge/ne-postoji', '/404', '/404/', '/404/index.html', '/index.csr.html']) {
  const response = await fetchPath(path);
  assert.equal(response.status, 404, `${path} genuine not-found status`);
  const document = new JSDOM(await response.text()).window.document;
  assert.equal(document.querySelector('meta[name="robots"]')?.content, 'noindex, follow', `${path} error robots`);
  assert.equal(document.querySelector('link[rel="canonical"]'), null, `${path} error canonical`);
  console.log(`PASS 404 ${path}`);
}
for (const path of ['/robots.txt', '/sitemap.xml']) {
  const response = await fetchPath(path);
  assert.equal(response.status, 200, `${path} status`);
  assert.ok((await response.text()).includes(`${origin}/`), `${path} production origin`);
}
if (process.env['SEO_HOST']) {
  for (const testHeaders of [
    { Host: 'hydraboost-infuzije.rs', 'X-Forwarded-Proto': 'https' },
    { Host: 'www.hydraboost-infuzije.rs' },
    { Host: 'hydraboost-infuzije.rs' },
  ]) {
    const response = await get(new URL('/kontakt', base), testHeaders);
    assert.equal(response.status, 301, 'canonical host/HTTPS redirect');
    assert.equal(response.headers.get('location'), `${origin}/kontakt`, 'host/TLS destination');
  }
  console.log('PASS HTTPS, non-www and trusted proxy redirect behavior');
}
console.log(`PASS HTTP SEO audit: ${base}`);
