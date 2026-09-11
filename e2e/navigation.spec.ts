import { expect, Page, test } from '@playwright/test';

const routes = ['/kontakt', '/o-nama', '/usluge', '/', '/cenovnik', '/faq'];

async function navigate(page: Page, path: string) {
  const mobile = await page.locator('.menu-toggle').isVisible();
  if (mobile) await page.locator('.menu-toggle').click();
  await page.locator(`${mobile ? '#mobile-navigation' : '.desktop-nav'} a[href="${path}"]`).click();
  await expect(page).toHaveURL(url => url.pathname === path);
  await expect(page.locator('.route-loader')).not.toHaveClass(/is-active/);
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
  await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
  await expect(page.locator('body')).not.toHaveCSS('overflow-y', 'hidden');
}

for (const width of [320, 360, 375, 390, 414, 768, 1024, 1088, 1089, 1440]) {
  test(`navbar, history and direct routes remain usable at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const path of routes) await navigate(page, path);
    await page.goBack();
    await expect(page).toHaveURL(/\/cenovnik$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/faq$/);
    for (const path of routes) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
      expect((await page.reload())?.status()).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`a pending lazy route can be replaced through the navbar at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    // Warm this destination so recovery does not depend on the stalled request.
    await navigate(page, '/o-nama');
    await navigate(page, '/');
    let release!: () => void;
    const gate = new Promise<void>(resolve => release = resolve);
    await page.route(/\/chunk-.*\.js$/, async route => {
      await gate;
      await route.continue();
    });
    try {
      if (width < 1089) await page.locator('.menu-toggle').click();
      await page.locator(`${width < 1089 ? '#mobile-navigation' : '.desktop-nav'} a[href="/kontakt"]`).click();
      await expect(page.locator('.route-loader')).toHaveClass(/is-active/);
      const control = page.locator(width < 1089 ? '.menu-toggle' : '.desktop-nav a[href="/o-nama"]');
      const receivesClicks = await control.evaluate(element => {
        const box = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
      });
      expect(receivesClicks, 'the loading overlay must leave navigation available').toBe(true);
      await navigate(page, '/o-nama');
    } finally {
      release();
      await page.unrouteAll({ behavior: 'wait' });
    }
    await expect(page).toHaveURL(/\/o-nama$/);
    await expect(page.locator('.route-loader')).not.toHaveClass(/is-active/);
  });
}

test('closed mobile backdrop stops intercepting clicks immediately', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.menu-backdrop')).toHaveCSS('opacity', '1');
  const state = await page.locator('.menu-toggle').evaluate(async element => {
    (element as HTMLButtonElement).click();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const backdrop = document.querySelector('.menu-backdrop')!;
    return { open: backdrop.classList.contains('is-open'), pointerEvents: getComputedStyle(backdrop).pointerEvents };
  });
  expect(state).toEqual({ open: false, pointerEvents: 'none' });
});

test('a failed lazy chunk releases the loader and leaves cached navigation usable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await navigate(page, '/o-nama');
  await navigate(page, '/');
  const failures: string[] = [];
  page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
  page.on('pageerror', error => failures.push(error.message));
  await page.route(/\/chunk-.*\.js$/, route => route.abort('failed'));
  await page.locator('.desktop-nav a[href="/kontakt"]').click();
  await expect.poll(() => failures.length).toBeGreaterThan(0);
  await expect(page.locator('.route-loader')).not.toHaveClass(/is-active/);
  await page.unrouteAll({ behavior: 'wait' });
  await navigate(page, '/o-nama');
  await test.info().attach('expected-network-failure', { body: JSON.stringify(failures), contentType: 'application/json' });
});

test('contact navigation does not compete for autofocus', async ({ page, browserName, context }) => {
  test.skip(browserName !== 'chromium', 'Chromium rendering messages are exposed through CDP Log');
  const cdp = await context.newCDPSession(page);
  const messages: string[] = [];
  await cdp.send('Log.enable');
  cdp.on('Log.entryAdded', ({ entry }) => messages.push(entry.text));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const path of ['/kontakt', '/o-nama', '/kontakt', '/']) await navigate(page, path);
  expect(messages.filter(message => /autofocus/i.test(message))).toEqual([]);
});

test('mobile menu releases its lock across the desktop breakpoint and history navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1088, height: 900 });
  await page.goto('/');
  await navigate(page, '/o-nama');
  await page.locator('.menu-toggle').click();
  await page.setViewportSize({ width: 1089, height: 900 });
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
  await page.locator('.desktop-nav a[href="/usluge"]').click();
  await expect(page).toHaveURL(/\/usluge$/);
  await page.setViewportSize({ width: 1088, height: 900 });
  await page.locator('.menu-toggle').click();
  await page.goBack();
  await expect(page).toHaveURL(/\/o-nama$/);
  await expect(page.locator('#mobile-navigation')).not.toHaveClass(/is-open/);
  await expect(page.locator('html')).not.toHaveClass(/menu-locked/);
});

test('service details and pricing anchors survive SPA navigation and refresh', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const details = await page.locator('.service-index a').evaluateAll(links => links.map(link => link.getAttribute('href')!));
  expect(details.length).toBeGreaterThan(0);
  for (const path of details) {
    await page.locator(`.service-index a[href="${path}"]`).click();
    await expect(page).toHaveURL(url => url.pathname + url.hash === path);
    await expect(page.locator(path.slice(path.indexOf('#')))).toBeInViewport();
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.locator(path.slice(path.indexOf('#')))).toBeInViewport();
    await navigate(page, '/');
  }
  await navigate(page, '/usluge');
  for (const id of ['primena-lekova', 'previjanje-na-terenu', 'infuzione-terapije']) {
    await page.locator(`a[href="/cenovnik#${id}"]`).click();
    await expect(page).toHaveURL(url => url.pathname + url.hash === `/cenovnik#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await navigate(page, '/usluge');
  }
});
