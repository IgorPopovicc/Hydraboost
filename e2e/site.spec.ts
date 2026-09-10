import { expect, test } from '@playwright/test';
import { JSDOM } from 'jsdom';

const routes = ['/', '/usluge', '/cenovnik', '/o-nama', '/faq', '/kontakt'];
const productionOrigin = 'https://www.hydraboost-infuzije.rs';
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const mobileViewports = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
  { width: 768, height: 844 },
];

const seoRoutes = [
  {
    path: '/',
    title: 'Infuzije Beograd na kućnoj adresi | HydraBoost',
    description: 'Infuzije na kućnoj adresi u Beogradu, u kancelariji ili hotelu, uz prethodnu medicinsku procenu i stručni nadzor. Pozovite HydraBoost i dogovorite termin.',
    image: `${productionOrigin}/assets/social/og-home.jpg`,
    imageAlt: 'HydraBoost Infuzije — mobilne infuzije Beograd',
  },
  {
    path: '/usluge',
    title: 'Vitaminske infuzije i IV terapija Beograd | HydraBoost',
    description: 'Vitaminske infuzije, hidratacija i individualna IV terapija na adresi u Beogradu. Saznajte kako se bira terapija i zašto je prethodna procena neophodna.',
    image: `${productionOrigin}/assets/social/og-usluge.jpg`,
    imageAlt: 'HydraBoost mobilne infuzione terapije',
  },
  {
    path: '/cenovnik',
    title: 'Cene infuzija u Beogradu – cenovnik | HydraBoost',
    description: 'Cenovnik infuzione terapije, primene lekova i previjanja u Beogradu. Pogledajte cene u RSD, šta obuhvata dolazak i kada se cena prilagođava.',
    image: `${productionOrigin}/assets/social/og-cenovnik.jpg`,
    imageAlt: 'HydraBoost cenovnik mobilnih medicinskih usluga',
  },
  {
    path: '/o-nama',
    title: 'O nama – Stefan Marković | HydraBoost infuzije Beograd',
    description: 'Upoznajte Stefana Markovića, njegovo iskustvo u intenzivnoj nezi, anesteziji i reanimaciji i HydraBoost uslugu infuzije na adresi u Beogradu.',
    image: `${productionOrigin}/assets/social/og-o-nama.jpg`,
    imageAlt: 'HydraBoost profesionalna medicinska usluga',
  },
  {
    path: '/faq',
    title: 'Infuzija kod kuće – česta pitanja | HydraBoost',
    description: 'Kako se zakazuje infuzija kod kuće, koliko traje i gde dolazimo? Pročitajte odgovore o proceni, ceni i organizaciji termina u Beogradu i okolini.',
    image: `${productionOrigin}/assets/social/og-faq.jpg`,
    imageAlt: 'Konsultacija o HydraBoost uslugama',
  },
  {
    path: '/kontakt',
    title: 'Kontakt i zakazivanje infuzije u Beogradu | HydraBoost',
    description: 'Zakažite konsultaciju za infuziju na adresi u Beogradu i okolini. Pozovite HydraBoost na 065/369-8376 ili pošaljite upit Viberom, WhatsAppom ili e-poštom.',
    image: `${productionOrigin}/assets/social/og-kontakt.jpg`,
    imageAlt: 'HydraBoost kontakt i zakazivanje',
  },
] as const;

test('homepage has no horizontal overflow at all target widths', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 820 : 900 });
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect.soft(hasOverflow, `overflow at ${width}px`).toBe(false);
  }
});

test('all public routes have one h1 and no overflow on mobile and desktop', async ({ page }) => {
  for (const route of routes) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: width < 768 ? 820 : 900 });
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect.soft(hasOverflow, `${route} overflow at ${width}px`).toBe(false);
    }
  }
});

test('responsive media frames do not extend beyond their images', async ({ page }) => {
  for (const route of routes) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: width < 768 ? 820 : 900 });
      await page.goto(route);
      const frameErrors = await page.locator('.image-frame, .pricing-hero-visual picture').evaluateAll((frames) =>
        frames.map((frame) => {
          const image = frame.querySelector('img');
          if (!image) return 0;
          const frameBox = frame.getBoundingClientRect();
          const imageBox = image.getBoundingClientRect();
          return Math.max(
            Math.abs(frameBox.top - imageBox.top),
            Math.abs(frameBox.right - imageBox.right),
            Math.abs(frameBox.bottom - imageBox.bottom),
            Math.abs(frameBox.left - imageBox.left),
          );
        }),
      );
      for (const error of frameErrors) expect.soft(error, `${route} media geometry at ${width}px`).toBeLessThan(2);
    }
  }
});

test('public routes load without browser console or runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('prerendered HTML exposes complete route-specific metadata without JavaScript', async ({ request }) => {
  const images = new Set<string>();
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const config of seoRoutes) {
    const response = await request.get(config.path);
    expect(response.status(), `${config.path} response`).toBe(200);
    const document = new JSDOM(await response.text()).window.document;
    const canonical = `${productionOrigin}${config.path}`;

    const expectSingleAttribute = (selector: string, attribute: string, value: string) => {
      const elements = document.querySelectorAll(selector);
      expect(elements.length, `${config.path} ${selector} count`).toBe(1);
      expect(elements.item(0).getAttribute(attribute), `${config.path} ${selector}`).toBe(value);
    };

    expect(document.querySelectorAll('title')).toHaveLength(1);
    expect(document.title).toBe(config.title);
    expectSingleAttribute('meta[name="description"]', 'content', config.description);
    expectSingleAttribute('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large');
    expectSingleAttribute('link[rel="canonical"]', 'href', canonical);
    expectSingleAttribute('meta[property="og:type"]', 'content', 'website');
    expectSingleAttribute('meta[property="og:site_name"]', 'content', 'HydraBoost Infuzije');
    expectSingleAttribute('meta[property="og:title"]', 'content', config.title);
    expectSingleAttribute('meta[property="og:description"]', 'content', config.description);
    expectSingleAttribute('meta[property="og:url"]', 'content', canonical);
    expectSingleAttribute('meta[property="og:image"]', 'content', config.image);
    expectSingleAttribute('meta[property="og:image:secure_url"]', 'content', config.image);
    expectSingleAttribute('meta[property="og:image:type"]', 'content', 'image/jpeg');
    expectSingleAttribute('meta[property="og:image:width"]', 'content', '1200');
    expectSingleAttribute('meta[property="og:image:height"]', 'content', '1200');
    expectSingleAttribute('meta[property="og:image:alt"]', 'content', config.imageAlt);
    expectSingleAttribute('meta[property="og:locale"]', 'content', 'sr_RS');
    expectSingleAttribute('meta[name="twitter:card"]', 'content', 'summary_large_image');
    expectSingleAttribute('meta[name="twitter:title"]', 'content', config.title);
    expectSingleAttribute('meta[name="twitter:description"]', 'content', config.description);
    expectSingleAttribute('meta[name="twitter:image"]', 'content', config.image);
    expectSingleAttribute('meta[name="twitter:image:alt"]', 'content', config.imageAlt);

    const schema = document.querySelectorAll('script[data-hydraboost-schema]');
    expect(schema, `${config.path} JSON-LD count`).toHaveLength(1);
    const structuredData = JSON.parse(schema.item(0).textContent ?? '{}') as { '@graph': Record<string, unknown>[] };
    const serializedSchema = JSON.stringify(structuredData);
    expect(serializedSchema).toContain(`${productionOrigin}/#business`);
    expect(serializedSchema).toContain(`${productionOrigin}/#website`);
    expect(serializedSchema).toContain(`${productionOrigin}/assets/brand/logo-112.webp`);
    expect(serializedSchema).not.toContain('hydraboost.vercel.app');
    expect(serializedSchema).not.toContain('www.hydraboostinfuzije.com');
    expect(structuredData['@graph'].some((entry) => entry['@type'] === 'WebSite')).toBe(true);

    const imageResponse = await request.get(new URL(config.image).pathname);
    expect(imageResponse.status(), `${config.image} response`).toBe(200);
    expect(imageResponse.headers()['content-type']).toContain('image/jpeg');
    expect((await imageResponse.body()).byteLength).toBeGreaterThan(40_000);
    images.add(config.image);
    titles.add(config.title);
    descriptions.add(config.description);
  }

  expect(images.size).toBe(seoRoutes.length);
  expect(titles.size).toBe(seoRoutes.length);
  expect(descriptions.size).toBe(seoRoutes.length);

  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const config of seoRoutes) expect(sitemap).toContain(`${productionOrigin}${config.path}`);
  const sitemapDocument = new JSDOM(sitemap, { contentType: 'text/xml' }).window.document;
  expect(Array.from(sitemapDocument.querySelectorAll('loc'), (location) => location.textContent)).toEqual(
    seoRoutes.map((config) => `${productionOrigin}${config.path}`),
  );
  expect(sitemap).not.toContain('hydraboost.vercel.app');
  expect(sitemap).not.toContain('www.hydraboostinfuzije.com');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${productionOrigin}/sitemap.xml`);
  expect(robots).toContain('Allow: /');
});

test('client-side route changes replace social metadata without stale duplicates', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  for (const config of seoRoutes.slice(1, 3)) {
    const linkName = config.path === '/usluge' ? 'Usluge' : 'Cenovnik';
    await page.locator('.desktop-nav').getByRole('link', { name: linkName, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${config.path}$`));
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', config.title);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', config.image);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', config.image);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${productionOrigin}${config.path}`);
  }
});

test('route loader follows real client navigation without flashing on initial hydration', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as Window & { __routeLoaderActivated?: boolean };
    state.__routeLoaderActivated = false;
    new MutationObserver(() => {
      if (document.querySelector('.route-loader.is-active')) state.__routeLoaderActivated = true;
    }).observe(document, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const loader = page.locator('.route-loader');
  await expect(loader).not.toHaveClass(/is-active/);
  expect(await page.evaluate(() => (window as Window & { __routeLoaderActivated?: boolean }).__routeLoaderActivated)).toBe(false);

  let releaseChunk = () => {};
  let markChunkRequested = () => {};
  const holdChunk = new Promise<void>((resolve) => { releaseChunk = resolve; });
  const chunkRequested = new Promise<void>((resolve) => { markChunkRequested = resolve; });
  await page.route(/\/chunk-.*\.js$/, async (route) => {
    markChunkRequested();
    await holdChunk;
    await route.continue();
  });

  await page.locator('.menu-toggle').click();
  await page.locator('#mobile-navigation').getByRole('link', { name: 'O nama', exact: true }).click({ noWaitAfter: true });
  await chunkRequested;
  await expect(loader).toHaveClass(/is-active/);
  await expect(loader).toHaveCSS('pointer-events', 'auto');
  releaseChunk();

  await expect(page).toHaveURL(/\/o-nama$/);
  await expect(loader).not.toHaveClass(/is-active/);
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
  await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
});

test('route loader remains centered and compact across target sizes', async ({ page }) => {
  const viewports = [
    { width: 320, height: 568 },
    { width: 360, height: 640 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 844 },
    { width: 1024, height: 900 },
    { width: 1280, height: 900 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];
  await page.goto('/');

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    const metrics = await page.locator('.route-loader').evaluate((element) => {
      element.classList.add('is-active');
      const overlay = element.getBoundingClientRect();
      const content = element.querySelector('.route-loader__content')!.getBoundingClientRect();
      const logo = element.querySelector('img')!.getBoundingClientRect();
      const track = element.querySelector('.route-loader__track')!.getBoundingClientRect();
      element.classList.remove('is-active');
      return {
        overlay: { width: overlay.width, height: overlay.height },
        centerOffsetX: Math.abs(content.left + content.width / 2 - overlay.width / 2),
        centerOffsetY: Math.abs(content.top + content.height / 2 - overlay.height / 2),
        logoWidth: logo.width,
        trackWidth: track.width,
      };
    });

    expect.soft(metrics.overlay.width, `${viewport.width}px overlay width`).toBe(viewport.width);
    expect.soft(metrics.overlay.height, `${viewport.width}px overlay height`).toBe(viewport.height);
    expect.soft(metrics.centerOffsetX, `${viewport.width}px horizontal center`).toBeLessThan(1);
    expect.soft(metrics.centerOffsetY, `${viewport.width}px vertical center`).toBeLessThan(1);
    expect.soft(metrics.logoWidth, `${viewport.width}px logo width`).toBeLessThanOrEqual(112);
    expect.soft(metrics.trackWidth, `${viewport.width}px track minimum`).toBeGreaterThanOrEqual(120);
    expect.soft(metrics.trackWidth, `${viewport.width}px track maximum`).toBeLessThanOrEqual(192);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const animationName = await page.locator('.route-loader').evaluate((element) => {
    element.classList.add('is-active');
    return getComputedStyle(element.querySelector('.route-loader__track span')!).animationName;
  });
  expect(animationName).toBe('none');
});

test('SVG icons, social links, and secondary buttons use stable accessible rendering', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const footer = page.locator('.site-footer');
  const instagram = footer.getByRole('link', { name: 'Instagram', exact: true });
  const whatsapp = footer.getByRole('link', { name: 'WhatsApp', exact: true });
  await expect(instagram).toHaveAttribute('href', 'https://instagram.com/hydraboost_infuzije');
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/381653698376');
  for (const socialLink of [instagram, whatsapp]) {
    await expect(socialLink).toHaveAttribute('target', '_blank');
    await expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(socialLink.locator('svg')).toBeVisible();
    expect(await socialLink.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height };
    })).toEqual({ width: 44, height: 44 });
  }

  const secondaryStyle = await page.locator('.button-secondary').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { borderWidth: style.borderTopWidth, borderColor: style.borderTopColor };
  });
  expect(secondaryStyle.borderWidth).toBe('1px');
  expect(secondaryStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');

  for (const route of routes) {
    await page.goto(route);
    expect(await page.locator('body').innerText()).not.toMatch(/[→↗›⌄×]/u);
  }

  const iconGeometry = await page.locator('app-icon').evaluateAll((icons) => icons.map((icon) => {
    const svg = icon.querySelector('svg');
    const box = icon.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      flexShrink: getComputedStyle(icon).flexShrink,
      svgDisplay: svg ? getComputedStyle(svg).display : '',
      viewBox: svg?.getAttribute('viewBox'),
    };
  }));
  for (const icon of iconGeometry) {
    expect(icon.width).toBeGreaterThan(0);
    expect(icon.height).toBeGreaterThan(0);
    expect(icon.flexShrink).toBe('0');
    expect(icon.svgDisplay).toBe('block');
    expect(icon.viewBox).toBe('0 0 24 24');
  }
});

test('homepage pricing preview contains every mobile row before the next section', async ({ page }) => {
  const expectedRows = [
    ['Vitaminska infuzija', '5.000 RSD'],
    ['Detoksikacija', '6.000 RSD'],
    ['Infuzija za mamurluk', '6.000 RSD'],
    ['Infuzija za imunitet', '5.500 RSD'],
  ];
  let heightAt390 = 0;

  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const layout = await page.locator('.pricing-preview').evaluate((section) => {
      const grid = section.querySelector('.pricing-grid')!;
      const copy = section.querySelector('.pricing-copy')!;
      const list = section.querySelector('.price-list')!;
      const heading = copy.querySelector('h2')!;
      const description = copy.querySelector('p:not(.eyebrow)')!;
      const cta = copy.querySelector('a')!;
      const rows = Array.from(list.children);
      const sectionBox = section.getBoundingClientRect();
      const gridBox = grid.getBoundingClientRect();
      const listBox = list.getBoundingClientRect();
      const nextBox = section.nextElementSibling!.getBoundingClientRect();
      const rect = (element: Element) => {
        const box = element.getBoundingClientRect();
        return { top: box.top, right: box.right, bottom: box.bottom, left: box.left, width: box.width, height: box.height };
      };
      const sectionStyle = getComputedStyle(section);
      const gridStyle = getComputedStyle(grid);
      const listStyle = getComputedStyle(list);
      return {
        section: { ...rect(section), clientHeight: section.clientHeight, scrollHeight: section.scrollHeight },
        grid: { ...rect(grid), display: gridStyle.display, flexDirection: gridStyle.flexDirection, overflow: gridStyle.overflow, position: gridStyle.position, maxHeight: gridStyle.maxHeight },
        copy: rect(copy),
        heading: rect(heading),
        description: rect(description),
        cta: rect(cta),
        list: { ...rect(list), clientHeight: list.clientHeight, scrollHeight: list.scrollHeight, overflow: listStyle.overflow, position: listStyle.position, maxHeight: listStyle.maxHeight },
        rows: rows.map((row) => {
          const price = row.querySelector('strong')!;
          return {
            name: row.querySelector('span')!.textContent?.trim(),
            price: price.textContent?.trim(),
            row: rect(row),
            priceBox: rect(price),
            priceDisplay: getComputedStyle(price).display,
            priceVisibility: getComputedStyle(price).visibility,
          };
        }),
        nextTop: nextBox.top,
        bottomSpace: sectionBox.bottom - rows.at(-1)!.getBoundingClientRect().bottom,
        sectionOverflow: sectionStyle.overflow,
        sectionPosition: sectionStyle.position,
        sectionMaxHeight: sectionStyle.maxHeight,
        scrollWidth: document.documentElement.scrollWidth,
        boundaries: {
          headingInside: heading.getBoundingClientRect().top >= sectionBox.top,
          gridInside: gridBox.bottom <= sectionBox.bottom + 0.5,
          listInside: listBox.bottom <= gridBox.bottom + 0.5,
        },
      };
    });

    if (viewport.width === 390) heightAt390 = layout.section.height;
    expect.soft(layout.rows.map((row) => [row.name, row.price]), `${viewport.width}px preview rows`).toEqual(expectedRows);
    expect.soft(layout.grid.display, `${viewport.width}px mobile flow`).toBe('flex');
    expect.soft(layout.grid.flexDirection, `${viewport.width}px mobile direction`).toBe('column');
    expect.soft(layout.section.scrollHeight - layout.section.clientHeight, `${viewport.width}px section clipping`).toBeLessThanOrEqual(1);
    expect.soft(layout.list.scrollHeight - layout.list.clientHeight, `${viewport.width}px list clipping`).toBeLessThanOrEqual(1);
    expect.soft(layout.sectionOverflow, `${viewport.width}px section overflow`).toBe('visible');
    expect.soft(layout.grid.overflow, `${viewport.width}px grid overflow`).toBe('visible');
    expect.soft(layout.list.overflow, `${viewport.width}px list overflow`).toBe('visible');
    expect.soft(layout.sectionMaxHeight, `${viewport.width}px section maximum`).toBe('none');
    expect.soft(layout.grid.maxHeight, `${viewport.width}px grid maximum`).toBe('none');
    expect.soft(layout.list.maxHeight, `${viewport.width}px list maximum`).toBe('none');
    expect.soft(layout.sectionPosition, `${viewport.width}px section flow`).toBe('static');
    expect.soft(layout.grid.position, `${viewport.width}px grid flow`).toBe('static');
    expect.soft(layout.list.position, `${viewport.width}px list flow`).toBe('static');
    expect.soft(layout.heading.bottom, `${viewport.width}px heading order`).toBeLessThan(layout.description.top);
    expect.soft(layout.description.bottom, `${viewport.width}px description order`).toBeLessThan(layout.cta.top);
    expect.soft(layout.cta.bottom, `${viewport.width}px CTA order`).toBeLessThan(layout.list.top);
    expect.soft(layout.rows.at(-1)!.row.bottom, `${viewport.width}px last row containment`).toBeLessThanOrEqual(layout.section.bottom);
    expect.soft(layout.bottomSpace, `${viewport.width}px bottom spacing`).toBeGreaterThanOrEqual(44);
    expect.soft(Math.abs(layout.nextTop - layout.section.bottom), `${viewport.width}px next-section boundary`).toBeLessThan(1);
    expect.soft(layout.boundaries, `${viewport.width}px content containment`).toEqual({ headingInside: true, gridInside: true, listInside: true });
    expect.soft(layout.scrollWidth, `${viewport.width}px horizontal overflow`).toBe(viewport.width);
    for (const row of layout.rows) {
      expect.soft(row.priceDisplay, `${viewport.width}px ${row.name} price display`).not.toBe('none');
      expect.soft(row.priceVisibility, `${viewport.width}px ${row.name} price visibility`).toBe('visible');
      expect.soft(row.priceBox.right, `${viewport.width}px ${row.name} price right edge`).toBeLessThanOrEqual(row.row.right + 0.5);
      expect.soft(row.priceBox.bottom, `${viewport.width}px ${row.name} price bottom edge`).toBeLessThanOrEqual(row.row.bottom + 0.5);
    }
  }

  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto('/');
  const shortViewportHeight = await page.locator('.pricing-preview').evaluate((section) => section.getBoundingClientRect().height);
  expect(shortViewportHeight).toBeCloseTo(heightAt390, 0);
});

test('clinical standard and service composition remain responsive and distinct', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 820 : 900 });
    await page.goto('/');
    const illustrationBox = await page.locator('.clinical-illustration').boundingBox();
    expect(illustrationBox?.width).toBeGreaterThan(0);
    expect(illustrationBox?.width ?? width).toBeLessThan(width);
    expect(illustrationBox?.height).toBeGreaterThan(0);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/usluge');
  for (const id of ['hidratacija-i-oporavak', 'imuno-podrska', 'energija-i-vitalnost', 'individualna-terapija']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('.service-catalog .image-frame')).toHaveCount(4);
  const sectionBackgrounds = await page.locator('.service-feature, .service-pair-section, .service-final').evaluateAll((sections) => sections.map((section) => getComputedStyle(section).backgroundColor));
  expect(new Set(sectionBackgrounds).size).toBe(3);
});

test('Cenovnik presents the exact service catalog and one personalized package at every target width', async ({ page }) => {
  const expectedPrices = [
    ['Vitaminska infuzija', '5.000 RSD'],
    ['Detoksikacija', '6.000 RSD'],
    ['Infuzija za mamurluk', '6.000 RSD'],
    ['Infuzija za imunitet', '5.500 RSD'],
    ['Glutation infuzija', '6.000 RSD'],
    ['Infuzija gvožđa', '6.000 RSD'],
    ['Infuzija nakon hemoterapije', '5.000 RSD'],
    ['Prilagođena infuziona terapija', 'Cena zavisi od preporučene terapije i doze'],
    ['Intramuskularna primena leka', '2.500 RSD'],
    ['Subkutana primena leka', '2.500 RSD'],
    ['Malo previjanje na terenu', '2.500 RSD'],
    ['Veliko previjanje na terenu', '3.500 RSD'],
  ];

  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 820 : 900 });
    await page.goto('/cenovnik');

    await expect(page.locator('.price-category')).toHaveCount(3);
    await expect(page.locator('.pricing-item')).toHaveCount(expectedPrices.length);
    await expect(page.locator('.personalized-package')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'HydraBoost personalizovani paket' })).toHaveCount(1);
    await expect(page.locator('.personalized-action strong')).toHaveText('Cena na upit');

    const rows = await page.locator('.pricing-item').evaluateAll((items) =>
      items.map((item) => {
        const name = item.querySelector('dt');
        const price = item.querySelector('dd');
        const nameBox = name?.getBoundingClientRect();
        const priceBox = price?.getBoundingClientRect();
        return {
          name: name?.textContent?.trim(),
          price: price?.textContent?.trim(),
          fits: item.scrollWidth <= item.clientWidth,
          overlaps: Boolean(nameBox && priceBox) && nameBox!.right > priceBox!.left + 1 && nameBox!.bottom > priceBox!.top + 1 && priceBox!.bottom > nameBox!.top + 1,
        };
      }),
    );
    expect(rows.map(({ name, price }) => [name, price])).toEqual(expectedPrices);
    expect(
      rows.every((row) => row.fits && !row.overlaps),
      `${width}px pricing row geometry`,
    ).toBe(true);

    const personalizedBox = await page.locator('.personalized-package').boundingBox();
    expect(personalizedBox?.x).toBeGreaterThanOrEqual(0);
    expect((personalizedBox?.x ?? width) + (personalizedBox?.width ?? 0)).toBeLessThanOrEqual(width);
  }

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('HydraBoost vitaminski paket');
  expect(body).not.toContain('Preporučeni paket');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /cenovnik infuzione terapije/i);
});

test('mobile navigation exposes every link and remains operable at phone widths', async ({ page }) => {
  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const toggle = page.locator('.menu-toggle');
    await expect(toggle).toHaveAccessibleName('Otvorite meni');
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).toHaveClass(/menu-locked/);
    await expect(page.locator('#mobile-navigation')).toBeVisible();
    await expect(page.locator('#mobile-navigation > a')).toHaveCount(7);
    await expect(page.locator('#mobile-navigation').getByRole('link', { name: /Zakažite termin/ })).toBeVisible();
    await expect(toggle).toHaveAccessibleName('Zatvori navigaciju');
    await expect(toggle).toBeFocused();
    const drawerHeight = await page.locator('#mobile-navigation').evaluate((element) => element.getBoundingClientRect().height);
    expect(drawerHeight).toBe(viewport.height - 76);

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
    await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
  }
});

test('mobile navigation remains viewport-bound with zero scroll drift across repeated toggles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (const target of [0, Math.round(maxScroll * 0.25), Math.round(maxScroll * 0.5), Math.round(maxScroll * 0.75), maxScroll]) {
    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), target);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    const contentTopBefore = await page.locator('.services-intro').evaluate((element) => element.getBoundingClientRect().top);

    for (let iteration = 0; iteration < 3; iteration += 1) {
      const openToggleBox = await page.locator('.menu-toggle').boundingBox();
      expect(openToggleBox?.y).toBeGreaterThanOrEqual(0);
      expect((openToggleBox?.y ?? 844) + (openToggleBox?.height ?? 0)).toBeLessThanOrEqual(844);
      await page.mouse.click((openToggleBox?.x ?? 0) + (openToggleBox?.width ?? 0) / 2, (openToggleBox?.y ?? 0) + (openToggleBox?.height ?? 0) / 2);
      const drawerBox = await page.locator('#mobile-navigation').boundingBox();
      expect(drawerBox?.y).toBe(76);
      expect(drawerBox?.height).toBe(768);
      await expect(page.locator('.menu-toggle')).toHaveAccessibleName('Zatvori navigaciju');

      const lockState = await page.evaluate(() => ({
        scrollY: window.scrollY,
        htmlLocked: document.documentElement.classList.contains('menu-locked'),
        bodyLocked: document.body.classList.contains('menu-locked'),
        bodyPosition: document.body.style.position,
        bodyTop: document.body.style.top,
      }));
      expect(lockState).toEqual({
        scrollY: scrollBefore,
        htmlLocked: true,
        bodyLocked: true,
        bodyPosition: '',
        bodyTop: '',
      });
      const contentTopLocked = await page.locator('.services-intro').evaluate((element) => element.getBoundingClientRect().top);
      expect(Math.abs(contentTopLocked - contentTopBefore)).toBeLessThan(1);

      await page.mouse.move(4, 500);
      await page.mouse.wheel(0, 700);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBefore);
      const contentTopAfterWheel = await page.locator('.services-intro').evaluate((element) => element.getBoundingClientRect().top);
      expect(Math.abs(contentTopAfterWheel - contentTopBefore)).toBeLessThan(1);

      const closeToggleBox = await page.locator('.menu-toggle').boundingBox();
      await page.mouse.click((closeToggleBox?.x ?? 0) + (closeToggleBox?.width ?? 0) / 2, (closeToggleBox?.y ?? 0) + (closeToggleBox?.height ?? 0) / 2);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
      const contentTopAfterClose = await page.locator('.services-intro').evaluate((element) => element.getBoundingClientRect().top);
      expect(Math.abs(contentTopAfterClose - contentTopBefore)).toBeLessThan(1);
      await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
      await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
    }
  }
});

test('mobile navigation scrolls internally on a short viewport and cleans up on navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 480 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 2)));
  await page.locator('.menu-toggle').dispatchEvent('click');

  const drawer = page.locator('#mobile-navigation');
  const dimensions = await drawer.evaluate((element) => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
  await drawer.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  expect(await drawer.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(page.locator('.menu-toggle')).toBeVisible();
  await expect(page.locator('.menu-toggle')).toHaveAccessibleName('Zatvori navigaciju');

  await drawer.getByRole('link', { name: 'Usluge', exact: true }).click();
  await expect(page).toHaveURL(/\/usluge$/);
  await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
  expect(await page.evaluate(() => document.body.style.position)).toBe('');
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(async () => (await drawer.boundingBox())?.x ?? 0).toBeGreaterThanOrEqual(374);
});

test('mobile navigation backdrop and appointment CTA both release the body lock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 1200));
  const scrollBefore = await page.evaluate(() => window.scrollY);

  await page.locator('.menu-toggle').dispatchEvent('click');
  await page.locator('.menu-backdrop').click({ position: { x: 2, y: 400 } });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);

  await page.locator('.menu-toggle').dispatchEvent('click');
  const appointment = page.locator('#mobile-navigation .mobile-appointment');
  await appointment.evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await appointment.click();
  await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
  expect(await page.evaluate(() => document.body.style.position)).toBe('');
});

test('mobile route links release the lock and use normal router scroll restoration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const destinations = [
    { label: 'Usluge', path: '/usluge' },
    { label: 'Cenovnik', path: '/cenovnik' },
    { label: 'O nama', path: '/o-nama' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Kontakt', path: '/kontakt' },
  ];

  for (const destination of destinations) {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 2)));
    await page.locator('.menu-toggle').dispatchEvent('click');
    await page.locator('#mobile-navigation').getByRole('link', { name: destination.label, exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`${destination.path}$`));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
    await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
    expect(await page.evaluate(() => ({ position: document.body.style.position, top: document.body.style.top }))).toEqual({ position: '', top: '' });
  }
});

test('FAQ and contact validation expose accessible UI state', async ({ page }) => {
  await page.goto('/faq');
  const secondQuestion = page.locator('summary').filter({ hasText: 'Da li su medicinski radnici licencirani?' });
  await secondQuestion.click();
  await expect(secondQuestion.locator('..')).toHaveAttribute('open', '');

  await page.goto('/kontakt');
  await page.getByRole('button', { name: 'Pošaljite poruku', exact: true }).click();
  await expect(page.getByText('Unesite ime i prezime (2–100 znakova).')).toBeVisible();
  await expect(page.locator('#fullName')).toHaveAttribute('aria-invalid', 'true');
});

test('unknown URLs render the branded 404 page with the correct response status', async ({ page }) => {
  const response = await page.goto('/ne-postoji');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Izgleda da ova adresa više nije dostupna.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Početna stranica' })).toBeVisible();
});

test('FAQ, content and contact links work with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('footer a[href="tel:+381653698376"]')).toBeVisible();
  }
  await page.goto('/faq');
  const question = page.locator('details').nth(1);
  await question.locator('summary').click();
  await expect(question.locator('.faq-answer')).toBeVisible();
  await expect(page.locator('details').first()).not.toHaveAttribute('open', '');
  await page.goto('/kontakt');
  await expect(page.locator('form')).toBeHidden();
  await expect(page.locator('body > noscript p')).toBeVisible();
  await context.close();
});

test('canonical variants redirect and error documents stay nonindexable', async ({ request }) => {
  const variants = [['/index.html', '/'], ['/usluge/index.html', '/usluge'], ['/usluge/', '/usluge'], ['/our-services/index.html', '/usluge'], ['/cjenovnik', '/cenovnik']];
  for (const [path, target] of variants) {
    const response = await request.get(`${path}?utm_source=check`, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe(`${target}?utm_source=check`);
  }
  for (const path of ['/ne-postoji', '/404', '/404/', '/404/index.html', '/index.csr.html']) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    const document = new JSDOM(await response.text()).window.document;
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('script[data-hydraboost-schema]')).toBeNull();
  }
  for (const path of ['/', '/usluge', '/robots.txt', '/sitemap.xml']) {
    expect((await request.get(path)).headers()['cache-control']).toBe('no-cache');
  }
});

test('secondary pages do not download the homepage hero and menu unlocks on resize', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/kontakt');
  await page.waitForLoadState('networkidle');
  expect(requests.some((url) => url.includes('/hero/mobile-iv-care-'))).toBe(false);
  await expect(page.locator('.brand')).toHaveAccessibleName(/hydraboost\s*infuzije/i);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.menu-toggle').click();
  await expect(page.locator('html')).toHaveClass(/menu-locked/);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText('Kontakt');
});
