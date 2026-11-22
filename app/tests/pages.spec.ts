import { expect, test } from '@playwright/test';
import { ROUTES, expectAccessible, prepare, watchErrors } from './helpers';

for (const lang of ['en', 'ar'] as const) {
  for (const route of ROUTES) {
    test(`${route} loads cleanly and is accessible (${lang})`, async ({ page }) => {
      const errors = watchErrors(page);
      await prepare(page, { lang, signedIn: true });
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('main, [role=log]').first()).toBeVisible();
      await page.waitForTimeout(600);
      await expectAccessible(page, `${route} ${lang}`);
      expect(errors, 'console errors').toEqual([]);
    });
  }
}

test('nothing overflows the screen sideways', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'phone only');
  for (const lang of ['en', 'ar'] as const) {
    await prepare(page, { lang, signedIn: true });
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForTimeout(500);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, `${route} ${lang}`).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    }
  }
});

test('Arabic screens have no untranslated interface text', async ({ page }) => {
  await prepare(page, { lang: 'ar', signedIn: true });
  for (const route of ['/', '/books', '/explore', '/library', '/profile', '/chat', '/book/macbeth', '/signin']) {
    await page.goto(route);
    await page.waitForTimeout(700);
    const english = await page.evaluate(() => {
      const out: string[] = [];
      const skip = /^(Bayan|BAYAN|Google|EN|CVV|MM\/YY|Sara Ahmed|sara@example\.com)$/;
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = w.nextNode())) {
        const el = n.parentElement;
        const s = (n.textContent ?? '').trim();
        // Book titles, authors and names in their own language are allowed (dir="auto" text).
        if (!el || el.closest('[aria-hidden=true],[dir=auto],script,style')) continue;
        if (/[A-Za-z]{3,}/.test(s) && !/[؀-ۿ]/.test(s) && !skip.test(s)) out.push(s);
      }
      return out;
    });
    expect(english, route).toEqual([]);
  }
});

test('language and theme switches apply immediately and persist', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop header');
  // No prepare(): its init script would reset the language on reload.
  await page.goto('/books');
  await page.getByRole('radio', { name: 'عربي' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: 'الكتب' })).toBeVisible();
  await page.getByRole('button', { name: 'التبديل إلى الوضع الفاتح' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
