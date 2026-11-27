// Renders the website's artwork straight from the game's own drawing code, so the site always
// matches the game: key art (desktop, mobile, social card), beast portraits, region landscapes and
// clean screenshots, written as web-ready files to public/img/.
//
//   1. Have the game repo next to this one (../frozen-valley) with its packages installed,
//      or set FROSTSPEAR_GAME=/path/to/frozen-valley.
//   2. cd ../frozen-valley && npm ci && npm run build:dev
//   3. cd ../playflex.net && node scripts/render-art.mjs
//      (set CHROME_PATH if Playwright's own Chromium is not installed)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GAME = resolve(process.env.FROSTSPEAR_GAME || join(SITE, '..', 'frozen-valley'));
const OUT = join(SITE, 'public', 'img');
const { serve, launch, BOT } = await import(pathToFileURL(join(GAME, 'tests', 'lib.mjs')).href);
for (const d of ['', 'beasts', 'regions', 'screens']) mkdirSync(join(OUT, d), { recursive: true });
const save = (p, url) => { writeFileSync(join(OUT, p), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote public/img/' + p); };

const srv = await serve();
const browser = await launch();
// 520 css px wide => SC 1.444, DPR 2 => 1040 px wide frames (W is 360 game units)
const page = await browser.newPage({ viewport: { width: 520, height: 925 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(srv.url);
await page.waitForFunction(() => typeof window.upd === 'function' && document.fonts.check('24px "Lilita One"') && imgOK(SPEAR_IMG));
await page.evaluate(BOT);
await page.evaluate(() => { window.requestAnimationFrame = () => 0; SV.mute = 1; SV.hood = 0; });
console.log(await page.evaluate(() => JSON.stringify({ W, H, SC, DPR, cw: cv.width, ch: cv.height })));

await page.evaluate(() => {
  window.__mk = (w, h) => { const cn = document.createElement('canvas'); cn.width = w; cn.height = h; return cn; };
  // scale a canvas to width w (keeping its shape, or to w x h) and encode it, e.g. ('image/webp', 0.8)
  window.__enc = (src, w, h, type, q) => { h = h || Math.round(w * src.height / src.width); const cn = __mk(w, h), x = cn.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    let cur = src; while (cur.width / 2 >= w * 1.05) { const half = __mk(Math.round(cur.width / 2), Math.round(cur.height / 2)), hx = half.getContext('2d'); hx.imageSmoothingQuality = 'high'; hx.drawImage(cur, 0, 0, half.width, half.height); cur = half; }
    x.drawImage(cur, 0, 0, w, h); return cn.toDataURL(type, q); };
  // copy the used part of the beast canvas, trimmed to its visible pixels
  window.__trim = (src, w, h, pad) => {
    const d = src.getContext('2d').getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
    const cn = __mk(x1 - x0 + 1, y1 - y0 + 1); cn.getContext('2d').drawImage(src, x0, y0, cn.width, cn.height, 0, 0, cn.width, cn.height); return cn;
  };
  // beast drawn at full detail, then scaled to `sc` (1 = game size 400x360 units) with feet at footY
  window.__beast = (x, k, cx, footY, sc, st, ph) => {
    const a = dummy(k); if (st) a.st = st; const kk = renderBeast(a, ph ?? 1.1, 1, 0, 0, null);
    x.drawImage(oc, 0, 0, 400 * kk, 360 * kk, cx - 200 * sc, footY - 330 * sc, 400 * sc, 360 * sc);
  };
  window.__hunter = (x, left, top, height) => {
    const s = height / 420, hk = renderHunter(Math.min(2.5, s) / (SC * DPR));
    x.drawImage(hc, 0, 0, 280 * hk, 420 * hk, left, top, 280 * s, 420 * s);
  };
  // the landscape: night sky, aurora, two mountain ridges, snowfield. hz = horizon as a share of height
  window.__land = (x, Wd, Hd, hz, stars, damp, quiet) => {
    const Y = Hd * hz, u = Hd / 500;
    let g = x.createLinearGradient(0, 0, 0, Y); g.addColorStop(0, '#0a1a42'); g.addColorStop(0.7, '#1f3f7c'); g.addColorStop(1, '#3a66ad');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Y + 2);
    x.fillStyle = '#ffffff'; for (let i = 0; i < stars; i++) { const sx = (i * 467.3) % Wd, sy = ((i * 191.7) % (Y * 0.8)), q = quiet && sx < Wd * quiet; if (q && i % 3) continue; x.globalAlpha = q ? 0.14 + (i % 4) * 0.04 : 0.25 + (i % 5) * 0.12; x.beginPath(); x.arc(sx, sy, (q ? 0.5 : 0.6 + (i % 3) * 0.45) * u, 0, Math.PI * 2); x.fill(); } x.globalAlpha = 1;
    x.save(); x.globalAlpha = 0.3; for (let i = 0; i < 4; i++) { const ag = x.createLinearGradient(0, 0, Wd, 0); ag.addColorStop(0, 'rgba(120,255,200,0)'); ag.addColorStop(0.45, 'rgba(120,255,200,0.6)'); ag.addColorStop(1, 'rgba(120,180,255,0)'); x.strokeStyle = ag; x.lineWidth = (16 - i * 3) * u; x.beginPath(); x.moveTo(0, Y * (0.26 + i * 0.05)); x.bezierCurveTo(Wd * 0.3, Y * (0.06 + i * 0.04), Wd * 0.62, Y * (0.5 + i * 0.02), Wd, Y * (0.16 + i * 0.05)); x.stroke(); } x.restore();
    // damp(x) lowers peaks where text will sit; snow caps go on the local summits only
    const ridge = (base, peaks, col, caps) => {
      const P = peaks.map(([a, b]) => [a, b * (damp ? damp(a) : 1)]);
      x.fillStyle = col; x.beginPath(); x.moveTo(0, base); P.forEach(([a, b]) => x.lineTo(a * Wd, base - b * Hd)); x.lineTo(Wd, base); x.closePath(); x.fill();
      if (caps) { x.fillStyle = '#ffffff'; P.forEach(([a, b], i) => { const l = P[i - 1], r = P[i + 1]; if (!l || !r || b <= l[1] || b <= r[1] || b < 0.07) return; const px = a * Wd, py = base - b * Hd, s = Math.min(26 * u, b * Hd * 0.32); x.beginPath(); x.moveTo(px - s, py + s * 1.15); x.lineTo(px, py); x.lineTo(px + s, py + s * 1.15); x.lineTo(px + s * 0.35, py + s * 0.85); x.lineTo(px, py + s * 1.2); x.lineTo(px - s * 0.4, py + s * 0.85); x.closePath(); x.fill(); }); }
    };
    ridge(Y, [[0, 0.1], [0.08, 0.2], [0.17, 0.12], [0.27, 0.24], [0.38, 0.13], [0.5, 0.22], [0.6, 0.11], [0.72, 0.23], [0.84, 0.12], [0.93, 0.2], [1, 0.1]], '#7f9dcc', false);
    ridge(Y, [[0, 0.04], [0.1, 0.15], [0.21, 0.06], [0.33, 0.17], [0.45, 0.05], [0.57, 0.15], [0.69, 0.05], [0.8, 0.16], [0.91, 0.06], [1, 0.12]], '#c9d9f0', true);
    g = x.createLinearGradient(0, Y, 0, Hd); g.addColorStop(0, '#e6f1fa'); g.addColorStop(1, '#b9d3ea'); x.fillStyle = g; x.fillRect(0, Y, Wd, Hd - Y);
    x.fillStyle = 'rgba(120,160,215,0.14)'; for (let i = 0; i < 4; i++) { const yy = Y + Math.pow((i + 0.6) / 4, 1.4) * (Hd - Y); x.beginPath(); x.ellipse(Wd * (i % 2 ? 0.3 : 0.72), yy, Wd * 0.32, (10 + i * 8) * u, 0, 0, Math.PI * 2); x.fill(); }
  };
});

// ---------- 1. key art ----------
const art = await page.evaluate(() => {
  const out = {};
  // desktop: text sits on the calm sky at the left, the hunt happens on the right
  { const Wd = 2560, Hd = 1440, cn = __mk(Wd, Hd), x = cn.getContext('2d'), u = 2.4; __land(x, Wd, Hd, 0.8, 260, a => a < 0.45 ? 0.2 : a < 0.6 ? 0.2 + (a - 0.45) / 0.15 * 0.8 : 1, 0.47);
    __beast(x, 'eagle', Wd * 0.645, Hd * 0.39, 0.44 * u);
    __beast(x, 'mam', Wd * 0.625, Hd * 0.8125, 0.64 * u);
    __beast(x, 'saber', Wd * 0.548, Hd * 0.945, 0.58 * u, 'move', 2.2);
    __beast(x, 'wolf', Wd * 0.605, Hd * 1.0, 0.76 * u, 'lunge');
    __beast(x, 'hyena', Wd * 0.728, Hd * 0.975, 0.74 * u);
    __hunter(x, Wd * 0.79, Hd * 0.283, 996);
    out.desk2560 = __enc(cn, 2560, 0, 'image/webp', 0.8); out.desk1600 = __enc(cn, 1600, 0, 'image/webp', 0.8); }
  // mobile: tighter group, no room needed for text
  { const Wd = 1200, Hd = 900, cn = __mk(Wd, Hd), x = cn.getContext('2d'), u = Hd / 500; __land(x, Wd, Hd, 0.58, 90);
    __beast(x, 'eagle', Wd * 0.17, Hd * 0.27, 0.4 * u);
    __beast(x, 'mam', Wd * 0.43, Hd * 0.63, 0.6 * u);
    __beast(x, 'wolf', Wd * 0.24, Hd * 0.98, 0.78 * u, 'lunge');
    __beast(x, 'hyena', Wd * 0.58, Hd * 0.99, 0.74 * u);
    __hunter(x, Wd * 0.64, Hd * 0.08, Hd * 0.9);
    out.mob1200 = __enc(cn, 1200, 0, 'image/webp', 0.8); out.mob800 = __enc(cn, 800, 0, 'image/webp', 0.8); }
  // social card 1200x630 with the game's logo
  { const Wd = 1200, Hd = 630, cn = __mk(Wd, Hd), x = cn.getContext('2d'), u = Hd / 500; __land(x, Wd, Hd, 0.6, 90);
    __beast(x, 'eagle', Wd * 0.73, Hd * 0.25, 0.42 * u);
    __beast(x, 'mam', Wd * 0.6, Hd * 0.64, 0.6 * u);
    __beast(x, 'wolf', Wd * 0.45, Hd * 0.92, 0.72 * u, 'lunge');
    __beast(x, 'hyena', Wd * 0.68, Hd * 0.95, 0.7 * u);
    __hunter(x, Wd * 0.78, Hd * 0.1, Hd * 0.86);
    x.save(); x.font = `${Math.round(92 * u)}px "Lilita One"`; x.textAlign = 'center'; x.lineJoin = 'round'; const lx = Wd * 0.26, ly = Hd * 0.3;
    x.lineWidth = 22 * u; x.strokeStyle = '#0a2150'; x.strokeText('FROSTSPEAR', lx, ly); x.lineWidth = 8 * u; x.strokeStyle = '#59d0ff'; x.strokeText('FROSTSPEAR', lx, ly);
    const lg = x.createLinearGradient(0, ly - 70 * u, 0, ly); lg.addColorStop(0, '#ffffff'); lg.addColorStop(1, '#82cdf4'); x.fillStyle = lg; x.fillText('FROSTSPEAR', lx, ly);
    x.fillStyle = '#e0602a'; x.beginPath(); x.roundRect(lx - 120 * u, ly + 18 * u, 240 * u, 46 * u, 12 * u); x.fill(); x.font = `${Math.round(30 * u)}px "Lilita One"`; x.fillStyle = '#ffffff'; x.fillText('TUNDRA HUNT', lx, ly + 52 * u); x.restore();
    out.og = cn.toDataURL('image/jpeg', 0.9); }
  return out;
});
save('hero-2560.webp', art.desk2560); save('hero-1600.webp', art.desk1600); save('hero-mobile-1200.webp', art.mob1200); save('hero-mobile-800.webp', art.mob800); save('og.jpg', art.og);

// ---------- 2. beast portraits (transparent) ----------
const beasts = await page.evaluate(() => {
  const out = {};
  for (const k of ORDER) { const kk = renderBeast(dummy(k), 1.1, 1, 0, 0, null); const w = Math.ceil(400 * kk) + 2, h = Math.ceil(360 * kk) + 2; const tc = __trim(oc, w, h, 6), f = Math.min(360 / tc.width, 300 / tc.height, 1); out[k] = __enc(tc, Math.round(tc.width * f), Math.round(tc.height * f), 'image/webp', 0.86); }
  return out;
});
for (const [k, url] of Object.entries(beasts)) save(`beasts/${k}.webp`, url);

// ---------- 3. one landscape per region (no beasts, no HUD) ----------
const regions = await page.evaluate(() => {
  const out = [];
  for (let r = 0; r < 10; r++) {
    let li = r * 20 + 2; for (let j = r * 20 + 2; j < r * 20 + 9; j++) { const L = LVL[j]; if (!L.m && !L.bonus && L.g !== 'boss') { li = j; break; } }
    startLevel(li); for (let i = 0; i < 10; i++) upd(1 / 60); A = []; POP = []; P = [];
    X.setTransform(SC * DPR, 0, 0, SC * DPR, 0, 0); X.globalAlpha = 1; bg(); X.setTransform(1, 0, 0, 1, 0, 0);
    const k = SC * DPR, y0 = Math.round((HZ() - 170) * k), w = cv.width, h = Math.round(240 * k);
    const cn = __mk(w, h); cn.getContext('2d').drawImage(cv, 0, y0, w, h, 0, 0, w, h);
    out.push({ n: REG[r].n, lv: li + 1, m: run.L.m || '', url: __enc(cn, 780, 520, 'image/webp', 0.8) });
  }
  return out;
});
regions.forEach((r, i) => { console.log('region', i + 1, r.n, 'level', r.lv, r.m); save(`regions/${String(i + 1).padStart(2, '0')}.webp`, r.url); });

// ---------- 4. clean gameplay screens (no captions) ----------
const SHOTS = [
  ['hunt', () => { SV.runs = 9; SV.spear = 2; startLevel(21); for (let i = 0; i < 60 * 4; i++) { if (i % 30 === 0) botTap(0.2); upd(1 / 60); } A = []; POP = []; run.st = 99;
    const pid = ++packId; [[-0.62, 0.42], [-0.2, 0.5], [0.22, 0.56], [0.62, 0.44], [0, 0.3], [-0.45, 0.22]].forEach(([lx, z]) => { const w2 = put('wolf', lx, z, null, { pack: pid }); w2.pt = null; });
    [[-0.5, 0.3, 0.08], [0.45, 0.38, 0.12]].forEach(([lx, z, y0]) => { const e = put('eagle', lx, z, null, { y0 }); e.pt = null; });
    for (let i = 0; i < 30; i++) upd(1 / 60); const t1 = A.find(a => a.k === 'wolf' && a.z > 0.5); if (t1) { const q = center(t1); throwAt(q.x, q.y - q.r * 0.3); } combo = 12; comboT = 2; for (let i = 0; i < 5; i++) upd(1 / 60); }],
  ['journey', () => { for (let i = 0; i < 26; i++) SV.lvm[i] = i % 4 ? 7 : 3; goMap(26); }],
  ['boss', () => { SV.runs = 9; SV.spear = 4; startLevel(69); for (let i = 0; i < 60 * 9; i++) { if (i % 30 === 0) botTap(0.3); upd(1 / 60); } POP = POP.filter(p => p.sz >= 20).slice(-2); }],
  ['storm', () => { SV.runs = 9; SV.spear = 3; startLevel(43); for (let i = 0; i < 60 * 7; i++) { if (i % 24 === 0) botTap(0.2); upd(1 / 60); } POP = []; furyReady = 1; unleash(); for (let i = 0; i < 14; i++) upd(1 / 60); }],
  ['trophies', () => { for (const k of ORDER) SV.hunted[k] = 20 + (k.length * 17) % 140; st = 'trophy'; }],
];
for (const [name, stage] of SHOTS) {
  await page.evaluate(`(${stage.toString()})()`);
  await page.evaluate(() => { draw(); });
  save(`screens/${name}.webp`, await page.evaluate(() => __enc(cv, 540, 960, 'image/webp', 0.82)));
}

await browser.close();
await srv.close();
