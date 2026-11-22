import { createRequire } from 'node:module';
import { expect, type Page } from '@playwright/test';

const require = createRequire(import.meta.url);
export const AXE = require.resolve('axe-core/axe.min.js');

export type Lang = 'en' | 'ar';
export type Theme = 'dark' | 'light';

/** Start a session with a language, theme and (optionally) a signed-in demo reader. */
export async function prepare(page: Page, { lang = 'en', theme = 'dark', signedIn = false }: { lang?: Lang; theme?: Theme; signedIn?: boolean } = {}) {
  await page.addInitScript(
    ([l, t, s]) => {
      localStorage.setItem('bayan-lang', l as string);
      localStorage.setItem('bayan-theme', t as string);
      if (s) {
        localStorage.setItem('bayan-app:signedIn', 'true');
        localStorage.setItem(
          'bayan-app:user',
          JSON.stringify({ id: 'u1', name: 'Sara Ahmed', email: 'sara@example.com', joined: '2026-11-19T00:00:00Z', topics: [], preferences: { rememberConversations: true, useFeedback: true, saveSummaries: true } }),
        );
      }
    },
    [lang, theme, signedIn],
  );
}

/** Collect uncaught errors and console errors. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|Download the React DevTools/.test(m.text())) errors.push(m.text());
  });
  return errors;
}

/** Run axe and fail on serious or critical violations. */
export async function expectAccessible(page: Page, label: string) {
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async () => {
    // @ts-expect-error axe is injected above
    const r = await window.axe.run(document, { resultTypes: ['violations'], rules: { 'color-contrast': { enabled: false } } });
    return r.violations
      .filter((v: { impact: string }) => v.impact === 'serious' || v.impact === 'critical')
      .map((v: { id: string; help: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
  });
  expect(result, `${label} accessibility`).toEqual([]);
}

export const ROUTES = ['/', '/books', '/explore', '/library', '/favorites', '/profile', '/chat', '/chat?cat=fiction', '/duo', '/book/macbeth', '/signin'];
