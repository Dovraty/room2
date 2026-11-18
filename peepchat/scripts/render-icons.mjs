// Renders the PeepChat icon set from SVG source with the preinstalled Chromium.
// Usage: node scripts/render-icons.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const AMBER = '#FFC46B';
const HOUSE = '#0E0B0A';

const mark = (color = AMBER, glow = true) => `
  <defs>
    <radialGradient id="lens" cx="46%" cy="40%" r="60%">
      <stop offset="0" stop-color="${color}" stop-opacity="${glow ? 0.95 : 0}"/>
      <stop offset="0.55" stop-color="${color}" stop-opacity="${glow ? 0.35 : 0}"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="52" cy="46" r="26" fill="url(#lens)"/>
  <circle cx="52" cy="46" r="33" stroke="${color}" stroke-width="11" fill="none"/>
  <path d="M24.5 62 C 23 76, 17 86, 8 93 C 22 92, 34 86, 41 77 Z" fill="${color}"/>
  <circle cx="43" cy="37" r="5.5" fill="${color}" opacity="0.9"/>`;

const bg = `
  <defs>
    <radialGradient id="spot" cx="50%" cy="-5%" r="95%">
      <stop offset="0" stop-color="${AMBER}" stop-opacity="0.42"/>
      <stop offset="0.5" stop-color="${AMBER}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1E1712"/><stop offset="1" stop-color="${HOUSE}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#base)"/>
  <rect width="1024" height="1024" fill="url(#spot)"/>`;

const files = {
  'icon.png': { size: 1024, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${bg}<g transform="translate(212 200) scale(6)">${mark()}</g></svg>` },
  'android-icon-background.png': { size: 1024, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${bg}</svg>` },
  // adaptive foreground: keep the mark inside the 66% safe zone
  'android-icon-foreground.png': { size: 1024, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><g transform="translate(300 290) scale(4.3)">${mark()}</g></svg>` },
  'android-icon-monochrome.png': { size: 1024, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><g transform="translate(300 290) scale(4.3)">${mark('#FFFFFF', false)}</g></svg>` },
  'splash-icon.png': { size: 512, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><g transform="translate(26 20) scale(4.8)">${mark()}</g></svg>` },
  'favicon.png': { size: 96, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 1024 1024">${bg}<g transform="translate(212 200) scale(6)">${mark()}</g></svg>` },
};

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
mkdirSync('assets', { recursive: true });
for (const [name, { size, svg }] of Object.entries(files)) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}" viewBox="0 0 ${name === 'favicon.png' ? 1024 : size} ${name === 'favicon.png' ? 1024 : size}"`)}</body></html>`);
  await page.screenshot({ path: `assets/${name}`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(`assets/brand/${name.replace('.png', '.svg')}`, svg);
  console.log('wrote', name);
}
await browser.close();
