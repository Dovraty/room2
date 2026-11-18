// Captures every screen in dark + light at iPhone (393x852) and Android (412x915) sizes from the web build.
// Usage: node scripts/serve.mjs & node scripts/screenshots.mjs [outDir] [--quick]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const out = process.argv[2] ?? 'screenshots';
const quick = process.argv.includes('--quick');
const BASE = 'http://localhost:8099';
const devices = quick ? [{ id: 'iphone', os: 'ios', w: 393, h: 852 }] : [{ id: 'iphone', os: 'ios', w: 393, h: 852 }, { id: 'android', os: 'android', w: 412, h: 915 }];
const schemes = quick ? ['dark'] : ['dark', 'light'];
const dpr = Number(process.env.DPR ?? 2);

const shots = [
  { name: '01-onboarding-1', url: '/', wait: 1600 },
  { name: '02-onboarding-3', url: '/', wait: 1600, act: async (p) => { for (let i = 0; i < 2; i++) { await p.getByLabel('Next').click(); await p.waitForTimeout(700); } } },
  { name: '03-discover-loading', url: '/discover', wait: 300 },
  { name: '04-discover', url: '/discover', wait: 4500 },
  { name: '05-discover-scrolled', url: '/discover', wait: 2500, act: async (p) => { await p.mouse.move(200, 500); await p.mouse.wheel(0, 900); await p.waitForTimeout(900); } },
  { name: '06-live-aperture', url: '/live/reveal', wait: 330 },
  { name: '07-live-2p', url: '/live/reveal', wait: 9000 },
  { name: '08-live-group', url: '/live/roundtable', wait: 7000 },
  { name: '09-gallery-open', url: '/live/reveal', wait: 2500, act: openGallery },
  { name: '10-gallery-poll-voted', url: '/live/reveal', wait: 2500, act: async (p) => { await openGallery(p); await p.getByRole('tab', { name: /Poll/ }).first().click(); await p.waitForTimeout(500); await p.getByLabel(/Dex's cousin/).first().click(); await p.waitForTimeout(1600); } },
  { name: '11-gallery-rooms', url: '/live/reveal', wait: 2500, act: async (p) => { await openGallery(p); await p.getByRole('tab', { name: /Side rooms/ }).first().click(); await p.waitForTimeout(600); } },
  { name: '12-audio', url: '/audio/afterhours', wait: 6500 },
  { name: '13-ended', url: '/live/reveal?ended=1', wait: 2500 },
  { name: '14-replay', url: '/replay/lakehouse', wait: 2500 },
  { name: '15-replay-poll', url: '/replay/lakehouse', wait: 1500, act: async (p) => { await p.getByLabel(/Jump to Poll/).first().click(); await p.waitForTimeout(1400); } },
  { name: '16-replay-empty', url: '/replay/finale-leak', wait: 1500 },
  { name: '17-profile', url: '/chatter/marisol', wait: 3000 },
  { name: '18-profile-past', url: '/chatter/kiki', wait: 2000, act: async (p) => { await p.mouse.move(200, 500); await p.mouse.wheel(0, 700); await p.waitForTimeout(700); } },
  { name: '19-studio', url: '/studio', wait: 1500 },
  { name: '20-chatter-view-on', url: '/studio-live', wait: 5000 },
  { name: '21-chatter-view-off', url: '/studio-live?audience=off', wait: 5000 },
  { name: '22-following', url: '/following', wait: 1500 },
  { name: '23-following-empty', url: '/following', wait: 1200, act: async (p) => { await p.getByRole('tab', { name: 'Mentions' }).click(); await p.waitForTimeout(600); } },
  { name: '24-system', url: '/system', wait: 1500 },
  { name: '25-system-components', url: '/system', wait: 1500, act: async (p) => { await p.mouse.move(200, 500); for (let i = 0; i < 9; i++) await p.mouse.wheel(0, 700); await p.waitForTimeout(900); } },
];

async function openGallery(p) {
  await p.getByLabel(/Open the Gallery/).first().click();
  await p.waitForTimeout(1200);
}
async function dragGallery(p) {
  // drag the sheet handle up to the middle detent, like a thumb would
  const h = await p.evaluate(() => window.innerHeight);
  await p.mouse.move(196, h - 100);
  await p.mouse.down();
  for (let y = h - 100; y > h * 0.4; y -= 30) await p.mouse.move(196, y);
  await p.mouse.up();
  await p.waitForTimeout(1100);
}

const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch();
const errors = [];
for (const d of devices) for (const scheme of schemes) {
  const dir = `${out}/${d.id}-${scheme}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: dpr, colorScheme: scheme, hasTouch: false, isMobile: false });
  for (const s of shots) {
    if (only && !only.test(s.name)) continue;
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${s.name}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${s.name} console: ${m.text().slice(0, 200)}`); });
    await page.goto(BASE + s.url + (s.url.includes('?') ? '&' : '?') + `device=${d.os}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(s.wait);
    try { if (s.act) await s.act(page); } catch (e) { errors.push(`${s.name} act: ${e.message.split('\n')[0]}`); }
    await page.screenshot({ path: `${dir}/${s.name}.png` });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(errors.length ? `ERRORS:\n${[...new Set(errors)].join('\n')}` : 'no errors');
