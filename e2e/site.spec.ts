import { expect, test } from '@playwright/test';
import { JSDOM } from 'jsdom';

const routes = ['/', '/usluge', '/cenovnik', '/o-nama', '/faq', '/kontakt'];
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
    title: 'Mobilne infuzije Beograd | HydraBoost Infuzije',
    description: 'Mobilne vitaminske i IV infuzije na kućnoj adresi, u kancelariji ili hotelu u Beogradu. Konsultacija, individualna procena i stručni nadzor.',
    image: 'https://hydraboost.vercel.app/assets/social/og-home.jpg',
    imageAlt: 'HydraBoost Infuzije — mobilne infuzije Beograd',
  },
  {
    path: '/usluge',
    title: 'Mobilne infuzione terapije Beograd | HydraBoost',
    description: 'HydraBoost infuzione terapije dolaze na Vašu adresu u Beogradu, uz prethodnu konsultaciju, individualnu procenu i medicinski nadzor.',
    image: 'https://hydraboost.vercel.app/assets/social/og-usluge.jpg',
    imageAlt: 'HydraBoost mobilne infuzione terapije',
  },
  {
    path: '/cenovnik',
    title: 'Cenovnik mobilnih medicinskih usluga | HydraBoost',
    description: 'Cenovnik infuzione terapije, primene lekova i previjanja na terenu u Beogradu, uz mogućnost HydraBoost personalizovanog paketa.',
    image: 'https://hydraboost.vercel.app/assets/social/og-cenovnik.jpg',
    imageAlt: 'HydraBoost cenovnik mobilnih medicinskih usluga',
  },
  {
    path: '/o-nama',
    title: 'O nama | HydraBoost mobilna medicinska usluga',
    description: 'Upoznajte HydraBoost individualni pristup profesionalnoj medicinskoj usluzi i nezi na dogovorenoj adresi u Beogradu.',
    image: 'https://hydraboost.vercel.app/assets/social/og-o-nama.jpg',
    imageAlt: 'HydraBoost profesionalna medicinska usluga',
  },
  {
    path: '/faq',
    title: 'Česta pitanja o mobilnim infuzijama | HydraBoost',
    description: 'Odgovori na česta pitanja o infuzionim terapijama, konsultaciji, zakazivanju i dolasku HydraBoost medicinske usluge na Vašu adresu.',
    image: 'https://hydraboost.vercel.app/assets/social/og-faq.jpg',
    imageAlt: 'Konsultacija o HydraBoost uslugama',
  },
  {
    path: '/kontakt',
    title: 'HydraBoost kontakt i zakazivanje | Beograd',
    description: 'Kontaktirajte HydraBoost u Beogradu radi konsultacije i zakazivanja mobilne medicinske usluge na dogovorenoj adresi.',
    image: 'https://hydraboost.vercel.app/assets/social/og-kontakt.jpg',
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
    const canonical = `https://hydraboost.vercel.app${config.path}`;

    const expectSingleAttribute = (selector: string, attribute: string, value: string) => {
      const elements = document.querySelectorAll(selector);
      expect(elements.length, `${config.path} ${selector} count`).toBe(1);
      expect(elements.item(0).getAttribute(attribute), `${config.path} ${selector}`).toBe(value);
    };

    expect(document.querySelectorAll('title')).toHaveLength(1);
    expect(document.title).toBe(config.title);
    expectSingleAttribute('meta[name="description"]', 'content', config.description);
    expectSingleAttribute('meta[name="robots"]', 'content', 'index, follow');
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
    expectSingleAttribute('meta[property="og:image:height"]', 'content', '630');
    expectSingleAttribute('meta[property="og:image:alt"]', 'content', config.imageAlt);
    expectSingleAttribute('meta[property="og:locale"]', 'content', 'sr_RS');
    expectSingleAttribute('meta[name="twitter:card"]', 'content', 'summary_large_image');
    expectSingleAttribute('meta[name="twitter:title"]', 'content', config.title);
    expectSingleAttribute('meta[name="twitter:description"]', 'content', config.description);
    expectSingleAttribute('meta[name="twitter:image"]', 'content', config.image);
    expectSingleAttribute('meta[name="twitter:image:alt"]', 'content', config.imageAlt);

    const schema = document.querySelectorAll('script[data-hydraboost-schema]');
    expect(schema, `${config.path} JSON-LD count`).toHaveLength(1);
    expect(schema.item(0).textContent).toContain('https://hydraboost.vercel.app/#business');
    expect(schema.item(0).textContent).toContain('https://hydraboost.vercel.app/assets/brand/logo-112.webp');
    expect(schema.item(0).textContent).not.toContain('www.hydraboostinfuzije.com');

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
  for (const config of seoRoutes) expect(sitemap).toContain(`https://hydraboost.vercel.app${config.path}`);
  expect(sitemap).not.toContain('www.hydraboostinfuzije.com');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://hydraboost.vercel.app/sitemap.xml');
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
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://hydraboost.vercel.app${config.path}`);
  }
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
  const secondQuestion = page.getByRole('button', { name: 'Da li su medicinski radnici licencirani?' });
  await secondQuestion.click();
  await expect(secondQuestion).toHaveAttribute('aria-expanded', 'true');

  await page.goto('/kontakt');
  await page.getByRole('button', { name: 'Otvorite poruku za slanje' }).click();
  await expect(page.getByText('Unesite ime i prezime.')).toBeVisible();
  await expect(page.locator('#fullName')).toHaveAttribute('aria-invalid', 'true');
});

test('unknown URLs render the branded 404 page with the correct response status', async ({ page }) => {
  const response = await page.goto('/ne-postoji');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Izgleda da ova adresa više nije dostupna.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Početna stranica' })).toBeVisible();
});
