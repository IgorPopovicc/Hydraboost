import { expect, test } from '@playwright/test';

const routes = ['/', '/usluge', '/cenovnik', '/o-nama', '/faq', '/kontakt'];
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

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

test('mobile navigation exposes every link and remains operable at phone widths', async ({ page }) => {
  for (const width of [320, 360, 375, 390, 430, 768]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
    await page.goto('/');
    const toggle = page.locator('.menu-toggle');
    await expect(toggle).toHaveAccessibleName('Otvorite meni');
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).toHaveClass(/menu-locked/);
    await expect(page.locator('#mobile-navigation')).toBeVisible();
    await expect(page.locator('#mobile-navigation > a')).toHaveCount(7);
    await expect(page.locator('#mobile-navigation').getByRole('link', { name: /Zakažite termin/ })).toBeVisible();
    await expect(page.locator('#mobile-navigation > a').first()).toBeFocused();
    const drawerHeight = await page.locator('#mobile-navigation').evaluate((element) => element.getBoundingClientRect().height);
    expect(drawerHeight).toBeGreaterThan(450);

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/menu-locked/);
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
