import { expect, Page, test } from '@playwright/test';

// Browser trace snapshots retain detached DOM; collect memory without tracing.
test.use({ trace: 'off' });
const routes = ['/kontakt', '/o-nama', '/usluge', '/', '/cenovnik', '/faq'];
async function navigate(page: Page, path: string) {
  await page.locator(`.desktop-nav a[href="${path}"]`).click();
  await expect(page).toHaveURL(url => url.pathname === path);
  await expect(page.locator('.route-loader')).not.toHaveClass(/is-active/);
}

test('60 SPA route changes keep DOM, SEO and browser listeners bounded', async ({ page, browserName, context }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  const cdp = browserName === 'chromium' ? await context.newCDPSession(page) : undefined;
  await page.goto('/');
  const samples = [];
  for (let cycle = 0; cycle < 10; cycle++) {
    for (const path of routes) await navigate(page, path);
    await expect(page.locator('script[data-hydraboost-schema]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    // Let outgoing CSS transitions release their rendering state before collecting.
    await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished)));
    if (cdp) {
      await cdp.send('HeapProfiler.collectGarbage');
      samples.push(await cdp.send('Memory.getDOMCounters'));
    }
  }
  if (samples.length) {
    await test.info().attach('dom-counters', { body: JSON.stringify(samples, null, 2), contentType: 'application/json' });
    const stable = samples.slice(2);
    expect(Math.max(...stable.map(sample => sample.jsEventListeners)) - Math.min(...stable.map(sample => sample.jsEventListeners))).toBeLessThanOrEqual(2);
    expect(Math.max(...stable.map(sample => sample.nodes)) - Math.min(...stable.map(sample => sample.nodes))).toBeLessThanOrEqual(5);
  }
  expect(errors).toEqual([]);
});
