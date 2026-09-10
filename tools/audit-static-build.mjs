import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const origin = 'https://www.hydraboost-infuzije.rs';
const outputRoot = resolve(import.meta.dirname, '../deploy/public_html');
const routes = ['/', '/usluge', '/cenovnik', '/o-nama', '/faq', '/kontakt'];
const staleOrigins = [
  'hydraboost.vercel.app',
  'https://hydraboost-infuzije.rs',
  'http://localhost',
  'http://127.0.0.1',
  'https://hydraboostinfuzije.com',
  'https://www.hydraboostinfuzije.com',
];

const routeFile = (route) => resolve(outputRoot, route === '/' ? 'index.html' : `${route.slice(1)}/index.html`);
const metaContent = (document, selector) => {
  const elements = document.querySelectorAll(selector);
  assert.equal(elements.length, 1, `${selector} must occur exactly once`);
  const content = elements.item(0).getAttribute('content');
  assert.ok(content, `${selector} must not be empty`);
  return content;
};

const assertPublicPathExists = async (url, context) => {
  const parsed = new URL(url, origin);
  if (parsed.origin !== origin) return;
  const candidate = resolve(outputRoot, `.${decodeURIComponent(parsed.pathname)}`);
  try {
    const details = await stat(candidate);
    if (details.isDirectory()) await access(resolve(candidate, 'index.html'));
  } catch {
    assert.fail(`${context} points to missing output: ${parsed.pathname}`);
  }
};

const rawHtml = [];
const titles = new Set();
const descriptions = new Set();
const headings = new Set();
const documents = new Map();
for (const route of routes) {
  documents.set(route, new JSDOM(await readFile(routeFile(route), 'utf8'), { url: `${origin}${route}` }).window.document);
}
for (const route of routes) {
  const html = await readFile(routeFile(route), 'utf8');
  rawHtml.push(html);
  const document = new JSDOM(html, { url: `${origin}${route}` }).window.document;
  const canonical = `${origin}${route}`;
  assert.equal(document.documentElement.lang, 'sr-Latn', `${route} document language`);
  assert.equal(document.querySelectorAll('main').length, 1, `${route} main landmark`);
  assert.equal(document.querySelectorAll('h1').length, 1, `${route} H1 count`);
  const h1 = document.querySelector('h1').textContent.trim();
  assert.ok(h1 && !headings.has(h1), `${route} unique nonempty H1`);
  headings.add(h1);
  assert.ok(!titles.has(document.title), `${route} duplicate title`);
  titles.add(document.title);
  const description = metaContent(document, 'meta[name="description"]');
  assert.ok(!descriptions.has(description), `${route} duplicate description`);
  descriptions.add(description);
  assert.ok(document.querySelector('main').textContent.trim().length > 400, `${route} crawlable main content`);
  assert.equal(document.querySelector('meta[http-equiv="refresh"]'), null, `${route} must not be a soft redirect`);
  let level = 0;
  for (const heading of document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')) {
    const next = Number(heading.tagName[1]);
    assert.ok(next <= level + 1, `${route} skips heading level at ${heading.textContent}`);
    level = next;
  }
  for (const img of document.querySelectorAll('img')) {
    assert.ok(img.hasAttribute('alt'), `${route} image alt missing: ${img.getAttribute('src')}`);
    assert.ok(Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0, `${route} image dimensions`);
  }
  const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
  assert.equal(new Set(ids).size, ids.length, `${route} duplicate element IDs`);
  for (const field of document.querySelectorAll('input, textarea, select')) {
    assert.ok(field.id && document.querySelector(`label[for="${field.id}"]`), `${route} field label ${field.id}`);
  }
  for (const img of Array.from(document.querySelectorAll('main img')).slice(1)) {
    assert.equal(img.getAttribute('loading'), 'lazy', `${route} below-fold image loading`);
  }
  const hero = document.querySelector('main img');
  assert.equal(hero.getAttribute('fetchpriority'), 'high', `${route} primary image priority`);
  assert.notEqual(hero.getAttribute('loading'), 'lazy', `${route} primary image loading`);
  const heroPreload = document.querySelector('link[data-hydraboost-hero]');
  assert.equal(Boolean(heroPreload), route === '/', `${route} homepage image preload scope`);
  if (heroPreload) assert.equal(heroPreload.getAttribute('imagesizes'), hero.getAttribute('sizes'), 'responsive preload size matches hero');
  for (const link of document.querySelectorAll('a[href]')) {
    const url = new URL(link.getAttribute('href'), canonical);
    if (url.origin !== origin) continue;
    assert.ok(routes.includes(url.pathname), `${route} links to a noncanonical/orphan route: ${url}`);
    if (url.hash) assert.ok(documents.get(url.pathname)?.getElementById(decodeURIComponent(url.hash.slice(1))), `${route} missing fragment target ${url}`);
  }

  assert.equal(document.querySelector('base')?.getAttribute('href'), '/', `${route} base href`);
  assert.equal(document.querySelectorAll('title').length, 1, `${route} title count`);
  assert.ok(document.title, `${route} title`);
  metaContent(document, 'meta[name="description"]');
  assert.equal(metaContent(document, 'meta[name="robots"]'), 'index, follow, max-image-preview:large', `${route} robots`);

  const canonicalElements = document.querySelectorAll('link[rel="canonical"]');
  assert.equal(canonicalElements.length, 1, `${route} canonical count`);
  assert.equal(canonicalElements.item(0).getAttribute('href'), canonical, `${route} canonical`);
  assert.equal(metaContent(document, 'meta[property="og:url"]'), canonical, `${route} og:url`);
  assert.equal(metaContent(document, 'meta[property="og:site_name"]'), 'HydraBoost Infuzije', `${route} site name`);

  for (const selector of [
    'meta[property="og:type"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:image"]',
    'meta[property="og:image:width"]',
    'meta[property="og:image:height"]',
    'meta[property="og:image:alt"]',
    'meta[property="og:locale"]',
    'meta[name="twitter:card"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:alt"]',
  ]) metaContent(document, selector);

  const socialImage = metaContent(document, 'meta[property="og:image"]');
  assert.ok(socialImage.startsWith(`${origin}/assets/social/`), `${route} absolute social image`);
  assert.equal(metaContent(document, 'meta[name="twitter:image"]'), socialImage, `${route} Twitter image`);
  await assertPublicPathExists(socialImage, `${route} social image`);

  const schemaElements = document.querySelectorAll('script[data-hydraboost-schema]');
  assert.equal(schemaElements.length, 1, `${route} structured-data count`);
  const schema = JSON.parse(schemaElements.item(0).textContent ?? '{}');
  const graph = schema['@graph'];
  assert.ok(Array.isArray(graph), `${route} structured-data graph`);
  assert.equal(schema['@context'], 'https://schema.org', `${route} schema context`);
  const serializedSchema = JSON.stringify(schema);
  const entities = new Map(graph.map((entity) => [entity['@id'], entity]));
  assert.equal(entities.size, graph.length, `${route} unique schema entity IDs`);
  assert.ok(!entities.has(undefined), `${route} every top-level entity has an ID`);
  const checkSchema = (value) => {
    if (!value || typeof value !== 'object') return;
    if (value['@id'] && !value['@type']) assert.ok(entities.has(value['@id']), `${route} unresolved entity ${value['@id']}`);
    for (const [key, item] of Object.entries(value)) {
      assert.ok(!['aggregateRating', 'review', 'ratingValue', 'reviewCount', 'address', 'hasCredential'].includes(key), `${route} unsupported business/rating claim ${key}`);
      if (typeof item === 'object') checkSchema(item);
    }
  };
  checkSchema(graph);
  const webpage = graph.find((entry) => ['WebPage', 'AboutPage', 'ContactPage'].includes(entry['@type']));
  assert.equal(webpage?.url, canonical, `${route} WebPage URL`);
  assert.equal(webpage?.name, document.title, `${route} WebPage name`);
  assert.equal(webpage?.description, description, `${route} WebPage description`);
  const services = graph.filter((entry) => entry['@type'] === 'Service');
  assert.equal(services.length, route === '/' ? 1 : route === '/usluge' ? 5 : 0, `${route} Service scope`);
  if (route === '/usluge') {
    for (const service of services.filter((item) => item.url.includes('#'))) {
      const section = document.getElementById(new URL(service.url).hash.slice(1));
      assert.ok(section?.textContent.includes(service.name), `${route} Service name matches visible heading`);
      assert.ok(Array.from(section.querySelectorAll('p'), (p) => p.textContent.trim()).join(' ').includes(service.description), `${route} Service description matches visible copy`);
    }
  }
  assert.ok(serializedSchema.includes(`${origin}/#business`), `${route} business schema`);
  assert.ok(serializedSchema.includes(`${origin}/#website`), `${route} website schema`);
  assert.ok(serializedSchema.includes(`${origin}/assets/brand/logo-112.webp`), `${route} logo schema`);

  const business = graph.find((entry) => entry['@type'] === 'MedicalBusiness');
  assert.equal(business?.url, `${origin}/`, `${route} business URL`);
  assert.equal(business?.logo, `${origin}/assets/brand/logo-112.webp`, `${route} business logo`);
  assert.deepEqual(business?.sameAs, ['https://instagram.com/hydraboost_infuzije'], `${route} external social identity`);

  const website = graph.find((entry) => entry['@type'] === 'WebSite');
  assert.equal(website?.url, `${origin}/`, `${route} website URL`);
  assert.equal(website?.name, 'HydraBoost Infuzije', `${route} website name`);
  assert.equal(website?.inLanguage, 'sr-Latn', `${route} website language`);

  const breadcrumb = graph.find((entry) => entry['@type'] === 'BreadcrumbList');
  if (route === '/') {
    assert.equal(breadcrumb, undefined, 'homepage must not invent a breadcrumb');
  } else {
    const items = breadcrumb?.itemListElement;
    assert.ok(Array.isArray(items), `${route} breadcrumb items`);
    assert.deepEqual(items.map((item) => item.item), [`${origin}/`, canonical], `${route} breadcrumb URLs`);
  }

  const faqPage = graph.find((entry) => entry['@type'] === 'FAQPage');
  assert.equal(faqPage, undefined, `${route} omits obsolete FAQ rich-result markup`);

  for (const staleOrigin of staleOrigins) {
    assert.ok(!html.includes(staleOrigin), `${route} contains stale origin ${staleOrigin}`);
  }

  for (const element of document.querySelectorAll('[src], link[href]')) {
    const reference = element.getAttribute('src') ?? element.getAttribute('href');
    if (!reference || reference.startsWith('data:')) continue;
    await assertPublicPathExists(new URL(reference, document.baseURI).href, `${route} ${reference}`);
  }

  for (const element of document.querySelectorAll('[srcset]')) {
    for (const entry of (element.getAttribute('srcset') ?? '').split(',')) {
      const reference = entry.trim().split(/\s+/)[0];
      if (reference) await assertPublicPathExists(new URL(reference, document.baseURI).href, `${route} ${reference}`);
    }
  }

  const linkTargets = new Set(Array.from(document.querySelectorAll('a[href]'), (link) => link.getAttribute('href')));
  for (const expectedTarget of [
    'tel:+381653698376',
    'mailto:info@hydraboost-infuzije.rs',
    'https://wa.me/381653698376',
    'https://instagram.com/hydraboost_infuzije',
  ]) {
    assert.ok(linkTargets.has(expectedTarget), `${route} contact link ${expectedTarget}`);
  }

  console.log(`PASS ${route} -> ${canonical}`);
}

const sitemap = await readFile(resolve(outputRoot, 'sitemap.xml'), 'utf8');
const sitemapDocument = new JSDOM(sitemap, { contentType: 'text/xml' }).window.document;
const sitemapUrls = Array.from(sitemapDocument.querySelectorAll('loc'), (location) => location.textContent);
assert.deepEqual(sitemapUrls, routes.map((route) => `${origin}${route}`), 'sitemap routes');

const robots = await readFile(resolve(outputRoot, 'robots.txt'), 'utf8');
assert.equal(robots.trim(), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml`, 'robots allows public content and assets');
assert.equal(sitemapDocument.documentElement.namespaceURI, 'http://www.sitemaps.org/schemas/sitemap/0.9', 'sitemap namespace');
assert.equal(sitemapDocument.querySelectorAll('lastmod, priority, changefreq').length, 0, 'no fabricated sitemap dates or priorities');
const apacheConfig = await readFile(resolve(outputRoot, '.htaccess'), 'utf8');
assert.ok(apacheConfig.includes('DirectorySlash Off'), 'Apache clean-route directory handling');
assert.ok(apacheConfig.includes('RewriteOptions AllowNoSlash'), 'Apache no-slash rewrite support');
assert.ok(apacheConfig.includes('HTTP:X-Forwarded-Proto'), 'Cloudflare HTTPS loop guard');
assert.ok(apacheConfig.includes(`https://www.hydraboost-infuzije.rs%{REQUEST_URI}`), 'Apache canonical origin redirect');
assert.ok(apacheConfig.includes('ErrorDocument 404 /404/index.html'), 'Apache 404 document');
const errorDocument = new JSDOM(await readFile(resolve(outputRoot, '404/index.html'), 'utf8')).window.document;
assert.equal(metaContent(errorDocument, 'meta[name="robots"]'), 'noindex, follow', '404 robots');
assert.equal(errorDocument.querySelector('link[rel="canonical"]'), null, '404 must not canonicalize to an indexable page');
assert.equal(errorDocument.querySelector('script[data-hydraboost-schema]'), null, '404 must not advertise business/services');
assert.equal(errorDocument.querySelectorAll('h1').length, 1, '404 heading');

const topLevelEntries = await readdir(outputRoot);
for (const forbiddenEntry of ['server', 'node_modules', 'src', 'tests', '.git']) {
  assert.ok(!topLevelEntries.includes(forbiddenEntry), `${forbiddenEntry} must not be deployed`);
}

const collectRelativeFiles = async (directory, prefix = '') => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await collectRelativeFiles(resolve(directory, entry.name), relativePath));
    else files.push(relativePath);
  }
  return files;
};
const deploymentFiles = await collectRelativeFiles(outputRoot);
assert.ok(deploymentFiles.includes('api/contact.php'), 'public PHP entry is deployed');
assert.deepEqual(deploymentFiles.filter((file) => /(?:config(?:\.example)?\.php|handler\.php|rate\.json|\.env)$/.test(file)), [], 'no private backend/config/state in public_html');
assert.ok(!topLevelEntries.includes('hydraboost-private'), 'private code must be beside public_html');
assert.ok((await readFile(resolve(outputRoot, 'api/contact.php'), 'utf8')).includes('/hydraboost-private/contact/handler.php'), 'entry loads private backend');
await access(resolve(outputRoot, '../hydraboost-private/contact/handler.php'));
assert.ok(!deploymentFiles.includes('index.csr.html'), 'unused CSR shell must not be deployed');
assert.deepEqual(
  deploymentFiles.filter((file) => / \d+(?=\.|$)/.test(file)),
  [],
  'conflict-copy files must not be deployed',
);
assert.ok(rawHtml.every((html) => !html.includes(`http://hydraboost-infuzije.rs`)), 'first-party mixed content');

console.log(`PASS sitemap (${sitemapUrls.length} canonical URLs)`);
console.log('PASS robots, .htaccess, 404, assets, prerender and private PHP deployment separation');
