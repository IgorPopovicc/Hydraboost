import { expect, test } from '@playwright/test';
import { JSDOM } from 'jsdom';

const widths = [320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440, 1920];
for (const width of widths) {
  test(`about portrait, factual experience and CTAs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
    await page.goto('/o-nama');
    const about = page.locator('app-about-page');
    await expect(about.locator('h1')).toHaveCount(1);
    await expect(about.getByRole('heading', { name: 'Stefan Marković', exact: true })).toBeVisible();
    const portrait = about.locator('.portrait img');
    await expect(portrait).toHaveAttribute('alt', 'Stefan Marković sa medicinskom torbom – HydraBoost');
    await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await portrait.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/stefan-markovic-hydraboost(?:-480|-768)?\.webp$/);
    await expect(portrait).toHaveCSS('object-position', '50% 0%');
    await expect(about.locator('.experience-row')).toHaveCount(2);
    await expect(about.locator('.experience-row').nth(0)).toContainText('KBC Zemun');
    await expect(about.locator('.experience-row').nth(0).locator('dd')).toContainText('4');
    await expect(about.locator('.experience-row').nth(1)).toContainText('Institut za majku i dete');
    await expect(about.locator('.experience-row').nth(1).locator('dd')).toContainText('2');
    await expect(about.locator('.additional-experience')).toContainText('onkološke, kardiotorakalne i estetske hirurgije');
    const geometry = await about.evaluate(root => {
      const width = innerWidth;
      const image = root.querySelector<HTMLImageElement>('.portrait img')!;
      const frame = root.querySelector<HTMLElement>('.portrait-frame')!.getBoundingClientRect();
      const heading = root.querySelector<HTMLElement>('#stefan-markovic')!.getBoundingClientRect();
      const ratio = image.naturalHeight / image.naturalWidth;
      // Portrait is anchored at its top; any mobile crop stays below the upper torso.
      const visibleSourceFraction = Math.min(1, frame.height / (frame.width * ratio));
      return {
        horizontalOverflow: document.documentElement.scrollWidth > width,
        clippedContent: [...root.querySelectorAll<HTMLElement>('h1, h2, h3, p, .portrait, .experience-row, a.button, a.text-link')]
          .some(element => { const box = element.getBoundingClientRect(); return box.width > 0 && (box.left < -1 || box.right > width + 1); }),
        visibleSourceFraction,
        photoBeforeName: frame.bottom < heading.top,
        frameHeight: frame.height,
        nameTop: heading.top,
        smallLinks: [...root.querySelectorAll<HTMLElement>('a.button, a.text-link')].some(element => element.getBoundingClientRect().height < 44),
      };
    });
    expect(geometry.horizontalOverflow).toBe(false);
    expect(geometry.clippedContent).toBe(false);
    expect(geometry.visibleSourceFraction).toBeGreaterThanOrEqual(.74);
    expect(geometry.smallLinks).toBe(false);
    if (width < 640) {
      expect(geometry.photoBeforeName).toBe(true);
      expect(geometry.frameHeight).toBeLessThanOrEqual(320);
      expect(geometry.nameTop).toBeLessThan(844);
    }
    await expect(about.getByRole('link', { name: 'Pogledajte naše usluge' })).toHaveAttribute('href', '/usluge');
    await expect(about.getByRole('link', { name: 'Dogovorite konsultaciju' })).toHaveAttribute('href', '/kontakt');
    await expect(about.getByRole('link', { name: 'Pogledajte cenovnik' })).toHaveAttribute('href', '/cenovnik');
  });
}

test('static AboutPage contains the real biography, linked Person and accessible content without JavaScript', async ({ browser, request }) => {
  const response = await request.get('/o-nama');
  expect(response.status()).toBe(200);
  const document = new JSDOM(await response.text()).window.document;
  const graph = JSON.parse(document.querySelector('script[data-hydraboost-schema]')!.textContent!)['@graph'];
  const person = graph.find((entity: Record<string, unknown>) => entity['@type'] === 'Person');
  expect(person.name).toBe('Stefan Marković');
  expect(person.affiliation['@id']).toBe('https://www.hydraboost-infuzije.rs/#business');
  expect(person.image).toBe('https://www.hydraboost-infuzije.rs/assets/images/about/stefan-markovic-hydraboost.webp');
  expect(person.description).toContain('Četiri godine rada na anesteziji sa reanimacijom u KBC Zemun.');
  expect(person.description).toContain('Dve godine rada na Institutu za majku i dete');
  for (const key of ['jobTitle', 'alumniOf', 'hasCredential', 'medicalSpecialty', 'sameAs', 'award']) expect(person[key]).toBeUndefined();
  expect(document.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://www.hydraboost-infuzije.rs/o-nama');
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/o-nama');
  await expect(page.getByRole('heading', { name: 'Stefan Marković', exact: true })).toBeVisible();
  await expect(page.locator('.portrait img')).toBeVisible();
  await expect(page.locator('.experience-row')).toHaveCount(2);
  await page.getByRole('link', { name: 'Dogovorite konsultaciju' }).click();
  await expect(page).toHaveURL(/\/kontakt$/);
  await context.close();
});
