// WCAG contrast audit for every text/background pairing used in the UI. Usage: node scripts/check-contrast.mjs
import { readFileSync } from 'node:fs';
const t = JSON.parse(readFileSync('src/theme/tokens.json', 'utf8'));
const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const L = (hex) => { const h = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
let fails = 0;
const check = (label, fg, bg, min = 4.5) => {
  const r = cr(fg, bg);
  const ok = r >= min;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1 (min ${min}) ${label}`);
};
for (const mode of ['dark', 'light']) {
  const c = t.color[mode];
  console.log(`\n== ${mode} ==`);
  for (const bg of ['house', 'stage', 'stageRaised']) for (const fg of ['textPrimary', 'textSecondary', 'textTertiary', 'spotlightInk']) check(`${fg} on ${bg}`, c[fg], c[bg]);
  for (const bg of ['gallery', 'galleryRaised']) for (const fg of ['galleryText', 'galleryTextSecondary', 'galleryAccent']) check(`${fg} on ${bg}`, c[fg], c[bg]);
  check('onLive on live', c.onLive, c.live);
  check('onSpotlight on spotlight', c.onSpotlight, c.spotlight);
  check('live dot vs stage (non-text 3:1)', c.live, c.stage, 3);
  for (const ch of t.chatter) {
    const bubble = mode === 'dark' ? ch.bubbleDark : ch.bubbleLight;
    const name = mode === 'dark' ? ch.base : ch.ink;
    check(`${ch.id}: text on bubble`, c.textPrimary, bubble);
    check(`${ch.id}: name on stage`, name, c.stage);
    check(`${ch.id}: name on bubble (cast strip)`, name, bubble);
    check(`${ch.id}: accent bar vs bubble (non-text 3:1)`, mode === 'dark' ? ch.base : ch.ink, bubble, 3);
  }
}
console.log(`\n${fails} failing pair(s)`);
process.exit(fails ? 1 : 0);
