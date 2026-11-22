/**
 * Side-by-side screenshots: live Bayan (left) vs the React app (right).
 *
 *   LIVE_URL=https://bayan2.vercel.app APP_URL=http://localhost:3000 node scripts/compare-live.mjs
 *
 * LIVE_URL may also be a file:// path to the old index.html. Output: compare/<variant>/<screen>.png
 * for EN/AR × dark/light × desktop/phone.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const LIVE = process.env.LIVE_URL ?? 'https://bayan2.vercel.app';
const APP = process.env.APP_URL ?? 'http://localhost:3000';
const OUT = process.env.OUT ?? 'compare';

const USER = { id: 'u1', name: 'Sara Ahmed', email: 'sara@example.com', joined: '2026-11-19T00:00:00Z', topics: [], preferences: { rememberConversations: true, useFeedback: true, saveSummaries: true } };

// [name, live action (run after load), app route]
const SCREENS = [
  ['home', null, '/'],
  ['books', 'bayanBooks.open()', '/books'],
  ['explore', 'bayanExplore.open()', '/explore'],
  ['library', "bayanSpace.open('conv')", '/library'],
  ['profile', 'bayanProfile.open()', '/profile'],
  ['credits', "bayanProfile.open();document.querySelector('#pfNav button[data-tab=credit]').click()", '/profile?tab=credit'],
  ['book-chat', "openBookChat('macbeth')", '/book/macbeth'],
  ['librarian', "(()=>{const i=document.querySelector('#lqi');i.value='something about love';document.querySelector('#lq').requestSubmit()})()", '/chat?q=something%20about%20love'],
];

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
for (const [device, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  for (const lang of ['en', 'ar']) {
    for (const theme of ['dark', 'light']) {
      const dir = `${OUT}/${device}-${lang}-${theme}`;
      mkdirSync(dir, { recursive: true });
      for (const [name, liveJs, route] of SCREENS) {
        const shots = [];
        for (const side of ['live', 'app']) {
          const page = await browser.newPage({ viewport });
          await page.addInitScript(
            ([l, t, u]) => {
              localStorage.setItem('bayan-lang', l);
              localStorage.setItem('bayan-theme', t);
              localStorage.setItem('bayan-user', JSON.stringify({ name: u.name, email: u.email }));
              localStorage.setItem('bayan-app:signedIn', 'true');
              localStorage.setItem('bayan-app:user', JSON.stringify(u));
            },
            [lang, theme, USER],
          );
          await page.goto(side === 'live' ? LIVE : APP + route);
          await page.waitForTimeout(1500);
          if (side === 'live' && liveJs) {
            await page.evaluate(liveJs).catch(() => {});
            await page.waitForTimeout(name === 'book-chat' || name === 'librarian' ? 3500 : 1500);
          } else await page.waitForTimeout(name === 'librarian' ? 1500 : 300);
          shots.push(await page.screenshot());
          await page.close();
        }
        // Stitch live | app into one image with labels.
        const page = await browser.newPage({ viewport: { width: viewport.width * 2 + 24, height: viewport.height + 40 } });
        const [a, b] = shots.map((s) => `data:image/png;base64,${s.toString('base64')}`);
        await page.setContent(`<body style="margin:0;background:#111;font:600 14px system-ui;color:#fff;display:flex;gap:24px">
          <figure style="margin:0"><figcaption style="height:40px;line-height:40px;padding:0 12px">Live</figcaption><img src="${a}"></figure>
          <figure style="margin:0"><figcaption style="height:40px;line-height:40px;padding:0 12px">React</figcaption><img src="${b}"></figure></body>`);
        await page.screenshot({ path: `${dir}/${name}.png` });
        await page.close();
        console.log(`${dir}/${name}.png`);
      }
    }
  }
}
await browser.close();
