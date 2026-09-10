import { expect, Page, test } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const fields = { fullName: '  Ana Anić  ', phone: '+381 (65) 369-8376', email: 'ana@example.com', location: 'Vračar', message: 'Želim da proverim termin za sutra.' };
async function fill(page: Page) {
  for (const [id, value] of Object.entries(fields)) await page.locator(`#${id}`).fill(value);
}
const send = (page: Page) => page.getByRole('button', { name: 'Pošaljite poruku', exact: true });
const modal = (page: Page) => page.getByRole('dialog');
async function bounds(page: Page) {
  const measured = await page.evaluate(() => {
    const width = innerWidth;
    const elements = [...document.querySelectorAll<HTMLElement>('app-contact-page input:not(#contact-website), app-contact-page textarea, app-contact-page button[type="submit"], dialog[open]')];
    return {
      overflow: document.documentElement.scrollWidth > width,
      clipped: elements.some(element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && (rect.left < -1 || rect.right > width + 1); }),
      dialogOverflow: [...document.querySelectorAll('dialog[open]')].some(element => element.scrollWidth > element.clientWidth),
    };
  });
  expect(measured).toEqual({ overflow: false, clipped: false, dialogOverflow: false });
}

test('success waits for acceptance, prevents duplicates, resets after acknowledgement, and returns focus', async ({ page }) => {
  let requests = 0;
  let release!: () => void;
  const gate = new Promise<void>(resolve => release = resolve);
  await page.route('**/api/contact', async route => {
    requests++;
    expect(route.request().postDataJSON()).toMatchObject({ fullName: 'Ana Anić', email: fields.email, website: '' });
    await gate;
    await route.fulfill({ json: { ok: true, status: 'accepted' } });
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/kontakt'); await fill(page);
  await send(page).click();
  await expect(page.getByRole('button', { name: 'Slanje...' })).toBeDisabled();
  await page.locator('form').evaluate(form => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
  await expect(modal(page)).not.toBeVisible();
  await expect.poll(() => requests).toBe(1);
  release();
  await expect(modal(page)).toBeVisible();
  await expect(modal(page)).toHaveAccessibleName('Poruka je uspešno poslata');
  await expect(page.getByRole('button', { name: 'U redu', exact: true })).toBeFocused();
  await expect(page.locator('#fullName')).toHaveValue('Ana Anić');
  await expect(page.locator('dialog .result-icon')).toHaveCSS('color', 'rgb(23, 117, 71)');
  await page.keyboard.press('Escape');
  await expect(modal(page)).not.toBeVisible();
  await expect(page.locator('#fullName')).toHaveValue('');
  await expect(send(page)).toBeEnabled(); await expect(send(page)).toBeFocused();
  await expect(page).toHaveURL(/\/kontakt$/);
  expect(errors).toEqual([]);
});

test('invalid and empty forms never send a request; focus moves to first error', async ({ page }) => {
  let requests = 0;
  page.on('request', request => { if (request.url().endsWith('/api/contact')) requests++; });
  await page.goto('/kontakt'); await send(page).click();
  await expect(page.locator('.error')).toHaveCount(4);
  await expect(page.locator('#fullName')).toBeFocused();
  await fill(page); await page.locator('#email').fill('ana@'); await send(page).click();
  await expect(page.locator('#email-error')).toBeVisible();
  await expect(page.locator('#email')).toBeFocused();
  expect(requests).toBe(0);
});

for (const status of [403, 422, 429, 502, 503]) {
  test(`HTTP ${status} preserves values, displays error, and allows a safe retry`, async ({ page }) => {
    const keys: string[] = [];
    await page.route('**/api/contact', route => {
      keys.push(route.request().headers()['idempotency-key']);
      return keys.length === 1 ? route.fulfill({ status, json: { ok: false } }) : route.fulfill({ json: { ok: true, status: 'accepted' } });
    });
    await page.goto('/kontakt'); await fill(page); await send(page).click();
    await expect(modal(page)).toHaveAccessibleName('Poruka nije poslata');
    await expect(page.locator('dialog .result-icon')).toHaveCSS('color', 'rgb(177, 55, 55)');
    await expect(modal(page).getByRole('link', { name: 'Pozovite 065/369-8376' })).toHaveAttribute('href', 'tel:+381653698376');
    await page.getByRole('button', { name: 'Vratite se na poruku' }).click();
    await expect(page.locator('#message')).toHaveValue(fields.message);
    await expect(send(page)).toBeFocused(); await send(page).click();
    await expect(modal(page)).toHaveAccessibleName('Poruka je uspešno poslata');
    expect(keys.length).toBe(2); expect(keys[1]).toBe(keys[0]);
  });
}

for (const mode of ['offline', 'malformed', 'timeout']) {
  test(`${mode} recovers without erasing the message`, async ({ page, context }) => {
    await page.goto('/kontakt'); await fill(page);
    if (mode === 'offline') await context.setOffline(true);
    else if (mode === 'malformed') await page.route('**/api/contact', route => route.fulfill({ json: { ok: true } }));
    else {
      await page.clock.install();
      await page.route('**/api/contact', async () => { /* intentionally unanswered */ });
    }
    await send(page).click();
    if (mode === 'timeout') await page.clock.fastForward(26_000);
    await expect(modal(page)).toHaveAccessibleName('Poruka nije poslata');
    await page.getByRole('button', { name: 'Vratite se na poruku' }).click();
    await expect(page.locator('#message')).toHaveValue(fields.message);
    await expect(send(page)).toBeEnabled();
    await context.setOffline(false);
  });
}

for (const width of [320, 360, 375, 390, 414, 768, 1024, 1440, 1920]) {
  test(`contact and both result states fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    let count = 0;
    await page.route('**/api/contact', route => ++count === 1
      ? route.fulfill({ status: 502, json: { ok: false } })
      : route.fulfill({ json: { ok: true, status: 'accepted' } }));
    await page.goto('/kontakt'); await fill(page); await bounds(page); await send(page).click();
    await expect(modal(page)).toBeVisible(); await bounds(page);
    if (width === 390 || width === 1440) await page.screenshot({ path: `tmp/contact-error-${width}.png`, animations: 'disabled' });
    await expect(page.getByRole('button', { name: 'Vratite se na poruku' })).toBeInViewport();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
    await page.keyboard.press('Escape'); await send(page).click();
    await expect(modal(page)).toHaveAccessibleName('Poruka je uspešno poslata'); await bounds(page);
    await expect(page.getByRole('button', { name: 'U redu', exact: true })).toBeInViewport();
    if (width === 390 || width === 1440) await page.screenshot({ path: `tmp/contact-success-${width}.png`, animations: 'disabled' });
    await page.getByRole('button', { name: 'U redu', exact: true }).click();
    await expect(page.locator('#message')).toHaveValue('');
  });
}

test('reduced motion, short mobile viewport and dialog focus trap', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 480 });
  await page.route('**/api/contact', route => route.fulfill({ status: 502, json: { ok: false } }));
  await page.goto('/kontakt'); await fill(page); await send(page).click();
  await expect(modal(page)).toBeVisible(); await bounds(page);
  await expect(modal(page)).toHaveCSS('animation-name', 'none');
  for (let index = 0; index < 6; index++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  for (let index = 0; index < 6; index++) {
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  await page.getByRole('button', { name: 'Vratite se na poruku' }).click();
  await expect(send(page)).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('browser → Node preview → real PHP endpoint → injected email transport → success', async ({ page }) => {
  const directory = await mkdtemp(join(tmpdir(), 'hydraboost-browser-api-'));
  const child = spawn('php', ['-S', '127.0.0.1:8081', 'tests/contact/router.php'], {
    env: { ...process.env, CONTACT_TEST_STATE_DIR: directory }, stdio: 'ignore',
  });
  let error: Error | undefined;
  child.on('error', reason => error = reason);
  try {
    await expect.poll(async () => {
      if (error) throw error;
      try { return (await fetch('http://127.0.0.1:8081/')).status; } catch { return 0; }
    }).toBe(404);
    await page.goto('/kontakt'); await fill(page); await send(page).click();
    await expect(modal(page)).toHaveAccessibleName('Poruka je uspešno poslata');
    const captured = JSON.parse(await readFile(join(directory, 'captured.json'), 'utf8'));
    expect(captured.email.to).toEqual(['info@hydraboost-infuzije.rs']);
    expect(captured.email.reply_to).toBe(fields.email);
    expect(captured.email.text).toContain(fields.message);
  } finally {
    child.kill('SIGTERM');
    await new Promise<void>(resolve => child.exitCode !== null ? resolve() : child.once('exit', () => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
});
