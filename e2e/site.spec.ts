import { expect, test } from '@playwright/test';

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
