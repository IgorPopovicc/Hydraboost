import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const origin = 'https://hydraboost-infuzije.rs';
const outputRoot = resolve(import.meta.dirname, '../deploy/public_html');
const routes = ['/', '/usluge', '/cenovnik', '/o-nama', '/faq', '/kontakt'];
const staleOrigins = [
  'hydraboost.vercel.app',
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
for (const route of routes) {
  const html = await readFile(routeFile(route), 'utf8');
  rawHtml.push(html);
  const document = new JSDOM(html, { url: `${origin}${route}` }).window.document;
  const canonical = `${origin}${route}`;

  assert.equal(document.querySelector('base')?.getAttribute('href'), '/', `${route} base href`);
  assert.equal(document.querySelectorAll('title').length, 1, `${route} title count`);
  assert.ok(document.title, `${route} title`);
  metaContent(document, 'meta[name="description"]');
  assert.equal(metaContent(document, 'meta[name="robots"]'), 'index, follow', `${route} robots`);

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
  const serializedSchema = JSON.stringify(schema);
  assert.ok(serializedSchema.includes(`${origin}/#business`), `${route} business schema`);
  assert.ok(serializedSchema.includes(`${origin}/#website`), `${route} website schema`);
  assert.ok(serializedSchema.includes(`${origin}/assets/brand/logo-112.webp`), `${route} logo schema`);

  const business = graph.find((entry) => Array.isArray(entry['@type']) && entry['@type'].includes('MedicalBusiness'));
  assert.equal(business?.url, origin, `${route} business URL`);
  assert.equal(business?.logo, `${origin}/assets/brand/logo-112.webp`, `${route} business logo`);
  assert.deepEqual(business?.sameAs, ['https://instagram.com/hydraboost_infuzije'], `${route} external social identity`);

  const website = graph.find((entry) => entry['@type'] === 'WebSite');
  assert.equal(website?.url, origin, `${route} website URL`);
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
  assert.equal(Boolean(faqPage), route === '/faq', `${route} FAQPage scope`);

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
    'mailto:info@hydraboostinfuzije.com',
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
assert.equal(robots.includes(`Sitemap: ${origin}/sitemap.xml`), true, 'robots sitemap');
const apacheConfig = await readFile(resolve(outputRoot, '.htaccess'), 'utf8');
assert.ok(apacheConfig.includes('DirectorySlash Off'), 'Apache clean-route directory handling');
assert.ok(apacheConfig.includes('RewriteOptions AllowNoSlash'), 'Apache no-slash rewrite support');
assert.ok(apacheConfig.includes('HTTP:X-Forwarded-Proto'), 'Cloudflare HTTPS loop guard');
assert.ok(apacheConfig.includes(`https://hydraboost-infuzije.rs%{REQUEST_URI}`), 'Apache canonical origin redirect');
assert.ok(apacheConfig.includes('ErrorDocument 404 /404/index.html'), 'Apache 404 document');
await access(resolve(outputRoot, '404/index.html'));

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
assert.ok(!deploymentFiles.includes('index.csr.html'), 'unused CSR shell must not be deployed');
assert.deepEqual(
  deploymentFiles.filter((file) => / \d+(?=\.|$)/.test(file)),
  [],
  'conflict-copy files must not be deployed',
);
assert.ok(rawHtml.every((html) => !html.includes(`http://hydraboost-infuzije.rs`)), 'first-party mixed content');

console.log(`PASS sitemap (${sitemapUrls.length} canonical URLs)`);
console.log('PASS robots, .htaccess, 404, assets, and static-only deployment contents');
