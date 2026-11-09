// Toda a arte do jogo é pixel art original gerada por código: não há arquivo externo.
import { classOf, ITEMS, MOBS, SETS } from '../shared/data';
import { T, Obj } from '../shared/world';

export type Cv = HTMLCanvasElement;
const glowCache = new Map<string, Cv>();
/** Luz radial suave; desenhar com composição 'lighter' (ou normal, para sombras). */
export function glowSprite(col: string): Cv {
  let c = glowCache.get(col); if (c) return c; c = cv(64, 64); const g = c.getContext('2d')!, n = parseInt(col.slice(1), 16), rgb = `${n >> 16},${n >> 8 & 255},${n & 255}`, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.45, `rgba(${rgb},.42)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowCache.set(col, c); return c;
}
type G = CanvasRenderingContext2D;
export function cv(w: number, h: number): Cv { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const ctx = (c: Cv) => c.getContext('2d', { willReadFrequently: true })!;
const r = (g: G, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
function rng(s: number) { return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function ell(g: G, cx: number, cy: number, rx: number, ry: number, col: string) { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + .3)) ** 2))); r(g, cx - w, cy + y, w * 2, 1, col); } }
function outline(c: Cv, col = [24, 18, 34, 255]) {
  const g = ctx(c), d = g.getImageData(0, 0, c.width, c.height), a = d.data, W = c.width, H = c.height, o = new Uint8ClampedArray(a);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (a[(y * W + x) * 4 + 3]) continue;
    const on = (i: number, j: number) => i >= 0 && j >= 0 && i < W && j < H && a[(j * W + i) * 4 + 3] > 0;
    if (on(x + 1, y) || on(x - 1, y) || on(x, y + 1) || on(x, y - 1)) o.set(col, (y * W + x) * 4);
  }
  d.data.set(o); g.putImageData(d, 0, 0); return c;
}
const flip = (c: Cv) => { const o = cv(c.width, c.height), g = ctx(o); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return o; };

// ---------- tiles ----------
const tileCache = new Map<number, Cv>();
export function tile(t: number, v: number, frame: number): Cv {
  const k = t * 1000 + v * 10 + frame; let c = tileCache.get(k); if (c) return c;
  c = cv(32, 32); const g = ctx(c), R = rng(t * 991 + v * 113 + 7);
  const speck = (n: number, cols: string[], s = 2) => { for (let i = 0; i < n; i++) r(g, R() * 32 | 0, R() * 32 | 0, s, s === 2 ? 1 : s, cols[R() * cols.length | 0]); };
  if (t === T.GRASS) {
    r(g, 0, 0, 32, 32, '#4a8440'); speck(34, ['#508b45', '#45793b', '#569449']);
    for (let i = 0; i < 3; i++) { const x = R() * 29 | 0, y = 3 + R() * 26 | 0; r(g, x, y, 1, 3, '#6bb45a'); r(g, x + 2, y + 1, 1, 2, '#6bb45a'); }
    if (v === 3) for (let i = 0; i < 4; i++) { const x = 3 + R() * 25 | 0, y = 3 + R() * 25 | 0, f = ['#f4e36b', '#f2a0c0', '#fff'][i % 3]; r(g, x, y, 2, 2, f); }
  } else if (t === T.STONE) {
    r(g, 0, 0, 32, 32, '#7f786c');
    for (let row = 0; row < 3; row++) for (let i = -1; i < 3; i++) { const x = i * 15 + (row % 2) * 7 + 1, y = row * 11, sh = ['#9c9486', '#968e80', '#a1998b', '#92897c'][R() * 4 | 0]; r(g, x, y, 14, 10, sh); r(g, x, y, 14, 1, '#aca495'); r(g, x, y + 9, 14, 1, '#878074'); }
  } else if (t === T.DIRT) {
    r(g, 0, 0, 32, 32, '#94734b'); speck(44, ['#a5845a', '#826340', '#7a5c3a']);
  } else if (t === T.SNOW) {
    r(g, 0, 0, 32, 32, '#e4edf6'); speck(26, ['#d2dfec', '#f6fbff', '#c9d8e8']);
    if (v % 2) for (let i = 0; i < 12; i++) r(g, 6 + i, 18 + Math.round(Math.sin(i / 2) * 2), 2, 1, '#c5d5e7');
  } else if (t === T.ICE) {
    r(g, 0, 0, 32, 32, '#a6d6ee'); speck(16, ['#bfe5f7', '#93c8e4']);
    let x = R() * 32, y = 0; for (let i = 0; i < 26; i++) { r(g, x | 0, y | 0, 1, 1, '#e8f7ff'); x += R() * 2.4 - 1.2; y += 1.2; }
    r(g, 5 + v * 4, 6, 9, 1, '#e8f7ff');
  } else if (t === T.ASH) {
    r(g, 0, 0, 32, 32, '#3a3136'); speck(40, ['#453a3f', '#2f282d', '#4e4247']);
    if (v % 2) { let x = 4 + R() * 20, y = 2; for (let i = 0; i < 24; i++) { r(g, x | 0, y | 0, 1, 1, v === 3 ? '#b8431c' : '#231d21'); x += R() * 2 - 1; y += 1.1; } }
  } else if (t === T.LAVA) {
    r(g, 0, 0, 32, 32, '#d8481a'); const q = frame * 8 + v * 5;
    for (let i = 0; i < 6; i++) { const x = (i * 11 + q) % 28, y = (i * 7 + frame * 3 + 2) % 28; r(g, x, y, 9, 4, '#ff8a2b'); r(g, x + 2, y + 1, 5, 2, '#ffd76a'); }
    for (let i = 0; i < 4; i++) r(g, (i * 17 + q * 2) % 30, (i * 13 + 5) % 30, 6, 2, '#9c2a12');
  } else {
    r(g, 0, 0, 32, 32, '#2f74b5'); const f = frame * 8;
    for (let i = 0; i < 7; i++) { const x = (i * 13 + f + v * 5) % 32, y = (i * 9 + 3) % 30; r(g, x, y, 7, 1, '#5ba3dc'); r(g, (x + 16) % 32, (y + 15) % 31, 4, 1, '#8cc6ee'); }
  }
  tileCache.set(k, c); return c;
}

const PRIO = [1, 3, 0, 3, 1, 2, 0, 2]; // GRASS, STONE, WATER, SNOW, ICE, DIRT
export const tilePrio = (t: number) => PRIO[t];
const edgeCache = new Map<number, Cv>();
/** Borda irregular do terreno vizinho (0 cima, 1 baixo, 2 esquerda, 3 direita) sobre este tile. */
export function edge(t: number, side: number, water: boolean): Cv {
  const k = t * 100 + side * 10 + (water ? 1 : 0); let c = edgeCache.get(k); if (c) return c;
  c = cv(32, 32); const g = ctx(c), src = tile(t, 1, 0), R = rng(k + 3), rim = water ? '#d6eefb' : t === T.STONE ? '#5f584e' : t === T.DIRT ? '#6f5535' : t === T.ASH ? '#ff7a2b' : t === T.SNOW ? '#b7c9de' : '#3b6c33';
  let d = 4;
  for (let i = 0; i < 32; i++) {
    if (i % 3 === 0) d = Math.max(2, Math.min(8, d + Math.round(R() * 4 - 2)));
    if (side === 0) { g.drawImage(src, i, 0, 1, d, i, 0, 1, d); r(g, i, d, 1, 1, rim); }
    else if (side === 1) { g.drawImage(src, i, 32 - d, 1, d, i, 32 - d, 1, d); r(g, i, 31 - d, 1, 1, rim); }
    else if (side === 2) { g.drawImage(src, 0, i, d, 1, 0, i, d, 1); r(g, d, i, 1, 1, rim); }
    else { g.drawImage(src, 32 - d, i, d, 1, 32 - d, i, d, 1); r(g, 31 - d, i, 1, 1, rim); }
  }
  edgeCache.set(k, c); return c;
}
export function archSprite(): Cv { return memo('arch', () => { const c = cv(84, 96), g = ctx(c); for (const x of [6, 64]) { r(g, x, 22, 14, 70, '#7a7c92'); r(g, x, 22, 4, 70, '#a2a4bb'); r(g, x + 10, 22, 4, 70, '#585a70'); for (let y = 34; y < 88; y += 13) r(g, x + 5, y, 4, 6, '#c9a4ff'); r(g, x - 3, 86, 20, 8, '#5f6178'); } for (let i = 0; i < 84; i++) { const h = Math.round(Math.sin(i / 83 * Math.PI) * 18); r(g, i, 22 - h, 1, 14, i % 12 < 1 ? '#585a70' : '#7a7c92'); r(g, i, 22 - h, 1, 3, '#a2a4bb'); } r(g, 37, 2, 10, 12, '#e4d3ff'); return outline(c); }); }
export function crystalSprite(v: number): Cv { return memo('cr' + v, () => { const c = cv(36, 44), g = ctx(c); for (const [x, y, w, col] of [[14, 2 + v * 2, 9, '#7fe3ff'], [5, 18, 8, '#5bb6e6'], [24, 14, 8, '#a4eeff']] as [number, number, number, string][]) { r(g, x, y + 3, w, 40 - y, col); r(g, x + 1, y, w - 2, 3, col); r(g, x + 1, y + 3, 2, 34 - y, '#e8fbff'); r(g, x + w - 2, y + 3, 2, 37 - y, shade(col, -40)); } return outline(c, [20, 50, 90, 255]); }); }
export function skillIcon(kind: string, col: string): Cv {
  const c = cv(32, 32), g = ctx(c), a = col || '#ffd76a'; r(g, 0, 0, 32, 32, shade(a, -105));
  if (kind === 'buff') { for (let i = 0; i < 3; i++) { for (let w = 0; w < 7; w++) r(g, 16 - w, 7 + i * 7 + w, w * 2, 1, i === 0 ? '#fff' : a); } }
  else if (kind === 'heal') { r(g, 13, 5, 6, 22, a); r(g, 5, 13, 22, 6, a); r(g, 14, 6, 2, 20, '#fff'); }
  else if (kind === 'drain') { ell(g, 10, 16, 7, 8, a); for (let i = 0; i < 4; i++) r(g, 15 + i * 3, 15 + (i % 2) * 2, 2, 2, '#fff'); ell(g, 25, 16, 4, 5, '#ffb7c5'); }
  else if (kind === 'spin') { for (let t = 0; t < 40; t++) { const q = t / 40 * 9, R0 = 3 + t * .28; r(g, 16 + Math.cos(q) * R0, 16 + Math.sin(q) * R0, 3, 3, a); } }
  else if (kind === 'dash') { for (let i = 0; i < 3; i++) { r(g, 5 + i * 8, 13, 7, 6, i === 2 ? '#fff' : a); r(g, 11 + i * 8, 15, 3, 2, a); } r(g, 4, 8, 12, 2, shade(a, -50)); r(g, 4, 23, 12, 2, shade(a, -50)); }
  else if (kind === 'splash') { ell(g, 16, 18, 10, 10, a); ell(g, 15, 18, 6, 6, '#ffe9a8'); r(g, 12, 4, 3, 7, a); r(g, 19, 2, 3, 8, a); r(g, 7, 8, 3, 5, a); r(g, 24, 8, 3, 5, a); }
  else if (kind === 'multi') { for (let i = 0; i < 3; i++) { const x = 6 + i * 8; r(g, x + 2, 4 + i % 2 * 3, 3, 20, a); r(g, x, 21 + i % 2 * 3, 7, 3, '#fff'); r(g, x + 1, 24 + i % 2 * 3, 5, 2, a); } }
  else if (kind === 'summon') { ell(g, 16, 16, 12, 12, shade(a, -60)); ell(g, 16, 14, 7, 7, a); r(g, 12, 12, 3, 3, '#14102a'); r(g, 18, 12, 3, 3, '#14102a'); r(g, 9, 23, 14, 3, a); }
  else { ell(g, 16, 16, 11, 11, a); ell(g, 16, 16, 7, 7, '#1d1030'); r(g, 13, 12, 2, 8, a); r(g, 18, 12, 2, 8, a); }
  return c;
}

// ---------- objetos ----------
const objCache = new Map<string, Cv>();
function memo(k: string, f: () => Cv) { let c = objCache.get(k); if (!c) { c = f(); objCache.set(k, c); } return c; }
export function objSprite(o: Obj): { c: Cv; ox: number; oy: number; sway: number } {
  if (o.k === 'tree') return { c: memo('tree' + o.v, () => { const c = cv(56, 72), g = ctx(c), pal = [['#2f6b34', '#3f8740', '#59a652'], ['#2c6440', '#3a7f55', '#58a374'], ['#4f7430', '#6c9238', '#8fb14a']][o.v], R = rng(o.v + 5); r(g, 24, 46, 9, 22, '#5b3d24'); r(g, 24, 46, 3, 22, '#7a5533'); ell(g, 28, 30, 24, 22, pal[0]); ell(g, 25, 26, 19, 17, pal[1]); ell(g, 21, 21, 11, 9, pal[2]); for (let i = 0; i < 26; i++) r(g, 8 + R() * 40 | 0, 12 + R() * 34 | 0, 3, 2, pal[R() * 3 | 0]); return outline(c); }), ox: -12, oy: -40, sway: 1 };
  if (o.k === 'pine') return { c: memo('pine' + o.v, () => { const c = cv(48, 72), g = ctx(c), R = rng(o.v * 7 + 3); r(g, 21, 56, 7, 13, '#4f3a2a'); for (let t = 0; t < 4; t++) { const y = 8 + t * 13, w = 8 + t * 5; for (let i = 0; i < 20; i++) { const hw = Math.round(w * i / 19); r(g, 24 - hw, y + i, hw * 2, 1, i < 7 ? '#eef5fb' : (i + t) % 5 ? '#23584f' : '#1b4a44'); } for (let i = 0; i < 5; i++) r(g, 24 - w * .55 + R() * w * 1.1 | 0, y + 8 + R() * 8 | 0, 3, 2, '#dfeaf4'); } return outline(c); }), ox: -8, oy: -40, sway: 1 };
  if (o.k === 'rock') return { c: memo('rock' + o.v, () => { const c = cv(36, 32), g = ctx(c); ell(g, 18, 18, 15, 11, '#6f7c8c'); ell(g, 16, 15, 11, 8, '#8c9aab'); ell(g, 15, 11, 9, 4, '#eef5fb'); r(g, 20, 21, 7, 1, '#556170'); return outline(c); }), ox: -2, oy: -4, sway: 0 };
  if (o.k === 'lamp') return { c: memo('lamp', () => { const c = cv(24, 66), g = ctx(c); r(g, 10, 16, 4, 46, '#3c3a48'); r(g, 11, 16, 1, 46, '#646272'); r(g, 6, 60, 12, 5, '#3c3a48'); r(g, 5, 8, 14, 12, '#3c3a48'); r(g, 7, 10, 10, 8, '#ffd98a'); r(g, 8, 11, 3, 5, '#fff3c8'); r(g, 3, 5, 18, 3, '#2b2a36'); r(g, 9, 1, 6, 4, '#2b2a36'); return outline(c); }), ox: 4, oy: -36, sway: 0 };
  if (o.k === 'barrel') return { c: memo('barrel' + o.v, () => { const c = cv(30, 36), g = ctx(c), w = o.v ? '#8a5f36' : '#74502e'; r(g, 4, 6, 22, 28, w); r(g, 2, 12, 26, 16, shade(w, 12)); r(g, 2, 12, 26, 3, '#5c5a66'); r(g, 2, 25, 26, 3, '#5c5a66'); ell(g, 15, 6, 11, 4, shade(w, 30)); for (let x = 8; x < 26; x += 5) r(g, x, 10, 1, 24, shade(w, -30)); return outline(c); }), ox: 1, oy: -6, sway: 0 };
  if (o.k === 'stall') return { c: memo('stall' + o.v, () => { const c = cv(104, 92), g = ctx(c), a = o.v ? '#c4593d' : '#3e86b0'; for (const x of [6, 92]) r(g, x, 28, 5, 60, '#5b3d24'); r(g, 2, 58, 100, 26, '#7a5533'); r(g, 2, 58, 100, 4, '#a4784c'); for (let x = 0; x < 13; x++) { r(g, 2 + x * 8, 4, 8, 28, x % 2 ? a : '#efe6d2'); r(g, 2 + x * 8, 32, 8, 4 + x % 2 * 2, x % 2 ? shade(a, -30) : '#cfc5ae'); } const it = o.v ? ['#d9483b', '#e0a93a', '#79b94a'] : ['#8fd0ff', '#e0425a', '#b58cff']; for (let i = 0; i < 11; i++) { ell(g, 11 + i * 8, 53 + i % 2, 4, 4, it[i % 3]); r(g, 9 + i * 8, 50 + i % 2, 2, 2, '#fff'); } return outline(c); }), ox: 0, oy: -28, sway: 0 };
  if (o.k === 'spire') return { c: memo('spire' + o.v, () => { const c = cv(40, 72), g = ctx(c), R = rng(o.v + 91); for (let y = 0; y < 62; y++) { const w = Math.round(3 + y * .24 + Math.sin(y / 5 + o.v) * 1.4); r(g, 20 - w, 8 + y, w * 2, 1, '#2a2328'); r(g, 20 - w, 8 + y, Math.max(2, w >> 1), 1, '#463c42'); } let x = 18, y = 22; for (let i = 0; i < 36; i++) { r(g, x | 0, y | 0, 2, 2, i % 3 ? '#ff7a2b' : '#ffd76a'); x += R() * 3 - 1.5; y += 1.2; } return outline(c, [15, 8, 12, 255]); }), ox: -4, oy: -40, sway: 0 };
  if (o.k === 'deadtree') return { c: memo('dead' + o.v, () => { const c = cv(48, 68), g = ctx(c), k = '#231c1f'; r(g, 21, 26, 7, 40, k); r(g, 22, 26, 2, 40, '#3c3236'); for (const [x, y, w, d] of [[8, 26, 14, 1], [26, 18, 14, -1], [14, 12, 10, 1], [28, 34, 12, -1]] as number[][]) { r(g, x, y, w, 4, k); r(g, d > 0 ? x : x + w - 4, y - 8, 4, 9, k); } r(g, 21, 6, 5, 22, k); if (o.v) { r(g, 23, 36, 2, 10, '#ff7a2b'); r(g, 23, 40, 2, 3, '#ffd76a'); } return outline(c, [15, 8, 12, 255]); }), ox: -8, oy: -36, sway: 0 };
  if (o.k === 'wall') return { c: memo('wall', () => { const c = cv(32, 56), g = ctx(c); r(g, 0, 8, 32, 48, '#8b8478'); for (let y = 0; y < 5; y++) for (let x = -1; x < 2; x++) { const bx = x * 16 + (y % 2) * 8; r(g, bx + 1, 13 + y * 9, 14, 8, y % 3 ? '#a39b8c' : '#978f81'); } r(g, 0, 8, 32, 5, '#c0b8a8'); r(g, 2, 0, 11, 9, '#b2aa9a'); r(g, 19, 0, 11, 9, '#b2aa9a'); return c; }), ox: 0, oy: -24, sway: 0 };
  if (o.k === 'fountain') return { c: memo('fount', () => { const c = cv(112, 124), g = ctx(c); const a = 8; for (const [x, y, w, h] of [[a, 28, 96, 8], [a, 116, 96, 8], [a, 28, 8, 96], [a + 88, 28, 8, 96]]) { r(g, x, y, w, h, '#a39b8c'); r(g, x, y, w, 2, '#d0c8b8'); } r(g, 48, 40, 16, 30, '#b5ad9d'); r(g, 50, 40, 4, 30, '#d0c8b8'); ell(g, 56, 70, 13, 4, '#8c8476'); ell(g, 56, 40, 22, 8, '#b5ad9d'); ell(g, 56, 38, 18, 5, '#5ba3dc'); ell(g, 56, 18, 9, 11, '#c8c0b0'); r(g, 54, 2, 4, 8, '#7fd0ff'); return outline(c); }), ox: -8, oy: -28, sway: 0 };
  // casa: telhado + fachada
  return { c: memo(`h${o.w}${o.h}${o.v}`, () => {
    const W = o.w * 32, H = o.h * 32 + 40, c = cv(W + 8, H), g = ctx(c), pal = [['#a4442f', '#c4593d', '#7d3022'], ['#2f6a8f', '#3e86b0', '#234f6c'], ['#5e7a3a', '#789a4a', '#465c2b']][o.v];
    const wallY = H - 54; r(g, 4, wallY, W, 54, '#d6c7a4');
    for (let x = 0; x < W; x += 28) r(g, 4 + x, wallY, 4, 54, '#7d5a3a');
    r(g, 4, wallY + 24, W, 4, '#7d5a3a'); r(g, 4, H - 6, W, 6, '#7a7468');
    const dx = W / 2 - 8 | 0; r(g, dx, H - 36, 24, 36, '#5a3a22'); r(g, dx + 2, H - 34, 20, 34, '#7a5533'); r(g, dx + 17, H - 18, 3, 3, '#f4d35e');
    for (const wx of [18, W - 28]) { r(g, wx, wallY + 8, 16, 14, '#7d5a3a'); r(g, wx + 2, wallY + 10, 12, 10, '#ffe08a'); r(g, wx + 7, wallY + 10, 2, 10, '#7d5a3a'); }
    const rh = wallY + 4; for (let y = 0; y < rh; y++) { r(g, 0, y, W + 8, 1, y % 8 < 1 ? pal[2] : y % 16 < 8 ? pal[0] : pal[1]); }
    for (let y = 8; y < rh; y += 8) for (let x = (y % 16 ? 0 : 8); x < W + 8; x += 16) r(g, x, y - 7, 1, 7, pal[2]);
    r(g, 0, 0, W + 8, 3, pal[1]); r(g, 0, rh - 3, W + 8, 3, pal[2]);
    return outline(c);
  }), ox: -4, oy: -40, sway: 0 };
}

// ---------- personagens ----------
export interface Look { helmSet?: string; armorSet?: string; pantsSet?: string; bootsSet?: string; cls?: string; hc: string; hs: number; helm?: string | null; armor?: string | null; pants?: string | null; boots?: string | null; weapon?: string | null; robe?: string }
export const FRAME_W = 40, FRAME_H = 56;
function heroFrame(dir: number, f: number, o: Look): Cv {
  const c = cv(FRAME_W, FRAME_H), g = ctx(c), X = 4; // desloca o sprite 32 px para caber a arma
  g.translate(0, 8); // folga para chapéus e cajados
  if (f === 5) { // caído
    r(g, X + 3, 36, 26, 8, o.armor ?? '#4d5873'); r(g, X + 24, 34, 9, 9, '#e8b88f'); r(g, X + 25, 33, 8, 5, o.hc); r(g, X - 2, 38, 6, 5, o.boots ?? '#2c2632'); return outline(c);
  }
  const step = f === 1 ? 1 : f === 3 ? -1 : 0, atk = f === 4, bob = step ? 1 : 0;
  const skin = '#e8b88f', skinD = '#c98f66', armor = o.robe ?? o.armor ?? '#4d5873', armD = shade(armor, -28), armL = shade(armor, 28), pants = o.robe ? shade(o.robe, -20) : o.pants ?? '#373b52', boots = o.boots ?? '#2c2632';
  const wd = o.weapon ? ITEMS[o.weapon] : null, blade = wd?.blade ?? '#cfd8e3', isAxe = o.weapon === 'iron_axe';
  const sword = (x: number, y: number, horiz: boolean, s = 1) => {
    if (!wd) return;
    if (wd.wtype === 'staff') { if (horiz) { r(g, x, y + 3, 18, 2, '#7a5533'); r(g, x + 16, y, 7, 7, blade); r(g, x + 18, y + 2, 2, 2, '#fff'); } else { r(g, x + 1, y - 4, 2, 26, '#7a5533'); r(g, x - 2, y - 10, 8, 8, blade); r(g, x, y - 8, 2, 2, '#fff'); } return; }
    if (wd.wtype === 'bow') { const yy = horiz ? y - 8 : y - 3; for (let i = 0; i < 24; i++) { const b = Math.round(Math.sin(i / 23 * Math.PI) * 5); r(g, x + b, yy + i, 2, 1, blade); } r(g, x, yy, 1, 24, '#e8e6df'); return; }
    if (horiz) { r(g, x, y + 3, 3 * s > 0 ? 4 : 4, 2, '#6b4a2b'); const bx = s > 0 ? x + 4 : x - 12; r(g, bx, y + 2, 12, 4, blade); r(g, bx, y + 2, 12, 1, '#fff'); if (isAxe) r(g, s > 0 ? x + 10 : x - 12, y - 2, 6, 12, blade); }
    else { r(g, x + 1, y + 13, 2, 5, '#6b4a2b'); r(g, x - 2, y + 12, 8, 2, '#c9a44c'); r(g, x, y, 4, 12, blade); r(g, x, y, 1, 12, '#fff'); if (isAxe) r(g, x + 3, y, 7, 8, blade); if (o.weapon === 'frost_blade') r(g, x + 1, y - 3, 2, 3, '#d9f7ff'); }
  };
  const Y = 2 - bob;
  if (dir === 1 && !atk) sword(X + 24, Y + 18, false);
  const cloak = o.armorSet ? SETS[o.armorSet].cape : o.cls === 'dark_warrior' ? '#8c2433' : o.cls === 'spell_knight' ? '#4d2a78' : null, robed = o.cls === 'arcane_wizard' || o.cls === 'shadow_summoner';
  if (cloak && dir === 0) { r(g, X + 6, Y + 22, 3, 20, shade(cloak, -30)); r(g, X + 24, Y + 22, 3, 20, shade(cloak, -30)); }
  if (cloak && dir === 2) { r(g, X + 5, Y + 21, 7, 21 + step, cloak); r(g, X + 5, Y + 21, 2, 21 + step, shade(cloak, 25)); }
  // pernas
  if (dir === 2) {
    r(g, X + 12 + step * 3, Y + 32, 7, 8, pants); r(g, X + 12 + step * 3, Y + 39, 9, 4, boots);
    r(g, X + 13 - step * 3, Y + 32, 7, 8, shade(pants, -16)); r(g, X + 13 - step * 3, Y + 39, 9, 4, boots);
  } else {
    const l = step > 0 ? 2 : 0, rr = step < 0 ? 2 : 0;
    r(g, X + 10, Y + 32, 6, 9 - l, pants); r(g, X + 10, Y + 40 - l, 6, 4, boots);
    r(g, X + 17, Y + 32, 6, 9 - rr, pants); r(g, X + 17, Y + 40 - rr, 6, 4, boots);
  }
  if (o.pantsSet && !robed) { const t = SETS[o.pantsSet].trim; if (dir === 2) r(g, X + 12, Y + 34, 8, 1, t); else { r(g, X + 10, Y + 34, 6, 1, t); r(g, X + 17, Y + 34, 6, 1, t); } }
  if (o.bootsSet && !robed) { const t = SETS[o.bootsSet].trim; if (dir === 2) r(g, X + 12, Y + 39, 9, 1, t); else { r(g, X + 10, Y + 40, 6, 1, t); r(g, X + 17, Y + 40, 6, 1, t); } if (o.bootsSet === 'dragon' && dir === 0) for (const x of [10, 13, 17, 20]) r(g, X + x, Y + 44, 2, 1, '#d9d2bb'); }
  if (robed) { const rx = dir === 2 ? 9 : 7, rw = dir === 2 ? 15 : 19; r(g, X + rx, Y + 31, rw, 11, armor); r(g, X + rx, Y + 40, rw, 2, armD); for (let i = 3; i < rw; i += 5) r(g, X + rx + i, Y + 32, 1, 8, armD); }
  // tronco
  const tx = dir === 2 ? 10 : 8, tw = dir === 2 ? 13 : 17;
  r(g, X + tx, Y + 20, tw, 13, armor); r(g, X + tx, Y + 20, tw, 2, armL); r(g, X + tx, Y + 31, tw, 2, armD); r(g, X + tx, Y + 29, tw, 2, '#b08a3c');
  r(g, X + tx, Y + 22, 2, 7, armL); r(g, X + tx + tw - 2, Y + 22, 2, 7, armD);
  if (o.armorSet) {
    const t = SETS[o.armorSet].trim, mid = X + tx + (tw >> 1) - 1, a = o.armorSet;
    r(g, X + tx, Y + 20, tw, 2, a === 'dragon' ? '#d9d2bb' : t);
    if (a === 'dragon') { for (let y = 22; y < 30; y += 2) r(g, X + tx + 1, Y + y, tw - 2, 1, '#d9d2bb'); r(g, mid, Y + 21, 3, 9, '#8f8770'); r(g, mid + 1, Y + 24, 1, 3, t); }
    else if (a === 'lion' && dir !== 1) { r(g, mid - 3, Y + 22, 9, 8, t); r(g, mid - 1, Y + 23, 5, 5, '#f6dc8c'); r(g, mid - 1, Y + 24, 1, 1, '#3a2208'); r(g, mid + 3, Y + 24, 1, 1, '#3a2208'); r(g, mid + 1, Y + 26, 1, 1, '#3a2208'); }
    else if (a === 'serpent') { for (let y = 22; y < 29; y += 2) for (let x = (y % 4 ? 1 : 3); x < tw - 1; x += 4) r(g, X + tx + x, Y + y, 2, 1, t); }
    else if (a === 'griffin') { for (let i = 0; i < 6; i++) { r(g, mid - i, Y + 22 + i, 2, 1, t); r(g, mid + 1 + i, Y + 22 + i, 2, 1, t); } }
    else if (a === 'spider') { if (dir !== 1) { r(g, mid - 2, Y + 22, 7, 2, t); r(g, mid, Y + 24, 3, 2, t); r(g, mid - 2, Y + 26, 7, 2, t); } else for (let i = 0; i < 4; i++) r(g, X + tx + i * 4 + 1, Y + 23 + i % 2 * 2, 3, 1, t); }
    else if (a === 'bat') { for (let i = 0; i < 6; i++) { r(g, X + tx + i, Y + 22 + i, 2, 1, t); r(g, X + tx + tw - 2 - i, Y + 22 + i, 2, 1, t); } }
    else if (a === 'wolf') { for (let y = 22; y < 29; y += 3) { r(g, mid - 2, Y + y, 6, 1, t); r(g, mid, Y + y - 1, 2, 3, t); } }
    else if (a === 'scorpion') { for (let y = 22; y < 29; y += 2) r(g, X + tx + 1, Y + y, tw - 2, 1, y % 4 ? t : '#463e50'); }
    else if (a === 'manticore') { r(g, mid - 3, Y + 22, 9, 7, t); r(g, mid - 1, Y + 24, 5, 3, '#5a1616'); }
    else if (a === 'pegasus') { for (let i = 0; i < 4; i++) { r(g, X + tx + 1 + i * 2, Y + 23 + i, 3, 2, t); r(g, X + tx + tw - 4 - i * 2, Y + 23 + i, 3, 2, t); } }
    else if (a === 'hydra') { for (let i = 0; i < 3; i++) { const xx = X + tx + 2 + i * ((tw - 6) >> 1); for (let y = 22; y < 29; y++) r(g, xx + (y % 2), Y + y, 2, 1, t); } }
    else if (a === 'salamander') { for (const [dx, dy] of [[2, 1], [7, 4], [11, 2], [4, 6], [10, 6]]) if (dx < tw - 1) r(g, X + tx + dx, Y + 22 + dy, 2, 2, t); }
    else if (a === 'chimera') { if (dir !== 1) { r(g, mid - 3, Y + 24, 9, 2, t); r(g, mid, Y + 21, 3, 8, t); r(g, mid + 1, Y + 24, 1, 2, '#fff'); } }
    else if (a === 'axolotl' && dir !== 1) { r(g, mid - 3, Y + 22, 9, 7, '#ffe0ec'); for (const [dx, dy] of [[-2, 1], [3, 3], [0, 4]]) r(g, mid + dx, Y + 22 + dy, 2, 2, t); }
    else if (a === 'bear') { for (let x = 1; x < tw - 1; x += 3) r(g, X + tx + x, Y + 21, 2, 3, t); if (dir !== 1) for (let i = 0; i < 3; i++) r(g, mid - 3 + i * 3, Y + 24 + i % 2, 1, 5, t); }
    else if (a === 'owl') { if (dir !== 1) { r(g, mid - 2, Y + 22, 6, 7, t); r(g, mid, Y + 22, 5, 5, armor); } for (let y = 23; y < 29; y += 3) { r(g, X + tx + 1, Y + y, 2, 1, t); r(g, X + tx + tw - 3, Y + y, 2, 1, t); } }
    else if (a === 'tiger') { for (let i = 1; i < tw - 1; i += 4) { r(g, X + tx + i, Y + 22, 2, 3 + i % 3, t); r(g, X + tx + i + 1, Y + 27, 2, 2, t); } }
    else if (a === 'kraken') { for (let i = 0; i < 3; i++) { const yy = Y + 22 + i * 3; for (let x = 0; x < tw; x += 2) r(g, X + tx + x, yy + (x + i * 2) % 4 / 2, 2, 1, t); } }
    else if (a === 'demon') { if (dir !== 1) { r(g, mid - 2, Y + 22, 7, 7, '#1d0a12'); r(g, mid - 1, Y + 24, 2, 2, t); r(g, mid + 2, Y + 24, 2, 2, t); r(g, mid, Y + 27, 3, 1, t); } r(g, X + tx, Y + 29, tw, 2, t); }
    else if (a === 'phoenix') { for (let i = 0; i < tw; i += 2) { const h = 3 + (i * 7 % 5); r(g, X + tx + i, Y + 29 - h, 2, h, i % 4 ? t : '#ffe08a'); } }
  }
  if (dir === 0) { r(g, X + 15, Y + 22, 3, 7, armL); r(g, X + 15, Y + 29, 3, 2, '#f0d27a'); }
  if (cloak && dir === 1) { r(g, X + 7, Y + 21, 19, 21 + Math.abs(step), cloak); r(g, X + 7, Y + 21, 3, 21, shade(cloak, 25)); r(g, X + 23, Y + 21, 3, 21, shade(cloak, -30)); }
  if (o.cls === 'mystic_archer' && dir !== 0) { r(g, X + (dir === 1 ? 19 : 7), Y + 16, 6, 18, '#6b4a2b'); for (let i = 0; i < 3; i++) r(g, X + (dir === 1 ? 19 : 7) + i * 2, Y + 11, 1, 5, '#f1e3b8'); }
  // braços
  const sw = atk ? 0 : step * 2;
  if (dir !== 2) { r(g, X + 4, Y + 21 + sw, 4, 11, armD); r(g, X + 4, Y + 31 + sw, 4, 3, skin); if (!atk) { r(g, X + 25, Y + 21 - sw, 4, 11, armD); r(g, X + 25, Y + 31 - sw, 4, 3, skin); } }
  if (cloak) { const ps = o.armorSet === 'dragon' ? '#d9d2bb' : o.armorSet ? SETS[o.armorSet].trim : o.cls === 'spell_knight' ? '#c9a4ff' : '#aab3c4'; if (o.armorSet === 'dragon' && dir !== 2) for (const x of [3, 6, 24, 27]) r(g, X + x, Y + 14 + (x % 2) * 2, 2, 5, '#f1ecd9'); if (dir !== 2) { r(g, X + 3, Y + 19, 7, 5, ps); r(g, X + 23, Y + 19, 7, 5, ps); r(g, X + 3, Y + 19, 7, 1, '#fff'); r(g, X + 23, Y + 19, 7, 1, '#fff'); } else { r(g, X + 12, Y + 19, 8, 5, ps); r(g, X + 12, Y + 19, 8, 1, '#fff'); } }
  // cabeça
  const hx = dir === 2 ? 9 : 8, hw = dir === 2 ? 14 : 17;
  r(g, X + hx, Y + 8, hw, 13, skin); r(g, X + hx, Y + 19, hw, 2, skinD);
  if (dir === 0) { r(g, X + 11, Y + 13, 3, 4, '#2b2230'); r(g, X + 19, Y + 13, 3, 4, '#2b2230'); r(g, X + 11, Y + 13, 1, 1, '#fff'); r(g, X + 19, Y + 13, 1, 1, '#fff'); r(g, X + 15, Y + 18, 3, 1, skinD); }
  if (dir === 2) { r(g, X + 18, Y + 13, 3, 4, '#2b2230'); r(g, X + 18, Y + 13, 1, 1, '#fff'); }
  const hair = o.hc, hairD = shade(hair, -30), hairL = shade(hair, 35);
  if (o.helmSet) {
    const a = o.helmSet, h0 = X + hx, f = dir === 0;
    if (a === 'dragon') {
      const b = '#d9d2bb', b2 = '#f1ecd9', d = '#8f8770', k = '#241c2c';
      for (const [hxx, sgn] of (dir === 2 ? [[h0 - 2, -1]] : [[h0 - 2, -1], [h0 + hw - 1, 1]]) as number[][]) { r(g, hxx, Y + 3, 3, 6, b); r(g, hxx + sgn * 2, Y - 1, 3, 5, b); r(g, hxx + sgn * 3, Y - 5, 2, 5, b2); }
      r(g, h0 - 1, Y + 3, hw + 2, 11, b); r(g, h0 + 1, Y + 3, hw - 3, 2, b2); r(g, h0 - 1, Y + 12, hw + 2, 2, d);
      if (f) { r(g, X + 11, Y + 7, 4, 4, k); r(g, X + 18, Y + 7, 4, 4, k); r(g, X + 12, Y + 8, 2, 2, '#7dffb0'); r(g, X + 19, Y + 8, 2, 2, '#7dffb0'); r(g, X + 15, Y + 11, 3, 2, k); for (let x = 10; x < 23; x += 3) r(g, X + x, Y + 14, 2, 3, b2); }
      else if (dir === 2) { r(g, h0 + hw - 2, Y + 8, 8, 6, b); r(g, h0 + 8, Y + 7, 4, 4, k); r(g, h0 + 9, Y + 8, 2, 2, '#7dffb0'); for (let x = 0; x < 8; x += 3) r(g, h0 + hw - 2 + x, Y + 14, 2, 3, b2); }
      else { r(g, h0, Y + 8, hw, 12, b); for (let y = 3; y < 20; y += 4) r(g, X + 15, Y + y, 3, 3, d); }
    } else if (a === 'lion') {
      const go = '#e8b93e', m = '#b5651d', m2 = '#d98a2b';
      r(g, h0 - 3, Y + 3, hw + 6, 15, m); for (let x = -3; x < hw + 3; x += 4) { r(g, h0 + x, Y + 1 + (x & 1), 3, 3, m2); r(g, h0 + x, Y + 17, 3, 3, m); }
      if (dir === 1) r(g, h0, Y + 5, hw, 11, m2);
      else { r(g, h0 + 1, Y + 5, hw - 2, 8, go); r(g, h0, Y + 1, 4, 4, go); if (f) r(g, h0 + hw - 4, Y + 1, 4, 4, go); if (f) { r(g, X + 11, Y + 7, 2, 2, '#3a2208'); r(g, X + 20, Y + 7, 2, 2, '#3a2208'); r(g, X + 13, Y + 9, 7, 4, '#f6dc8c'); r(g, X + 15, Y + 9, 3, 2, '#3a2208'); } else { r(g, h0 + hw - 3, Y + 8, 6, 4, '#f6dc8c'); r(g, h0 + hw + 1, Y + 8, 2, 2, '#3a2208'); } }
    } else if (a === 'serpent') {
      const gn = '#2fae6a', dk = '#1a6b45';
      r(g, h0 - 4, Y + 5, hw + 8, 12, dk); r(g, h0 - 1, Y + 2, hw + 2, 8, gn); for (let x = 1; x < hw; x += 4) r(g, h0 + x, Y + 4, 2, 1, '#b7e85a');
      if (f) { r(g, X + 11, Y + 6, 3, 2, '#ffe14a'); r(g, X + 19, Y + 6, 3, 2, '#ffe14a'); r(g, X + 13, Y + 10, 2, 4, '#fff'); r(g, X + 18, Y + 10, 2, 4, '#fff'); } else if (dir === 2) r(g, h0 + 10, Y + 6, 3, 2, '#ffe14a'); else r(g, h0, Y + 8, hw, 9, dk);
    } else if (a === 'griffin') {
      r(g, h0 - 1, Y + 3, hw + 2, 10, '#eef3fb'); r(g, h0 - 4, Y + 4, 4, 11, '#7fb3e8'); if (dir !== 2) r(g, h0 + hw, Y + 4, 4, 11, '#7fb3e8');
      for (let x = 0; x < hw; x += 4) r(g, h0 + x, Y + 1, 3, 3, '#7fb3e8');
      if (f) { r(g, X + 11, Y + 7, 2, 2, '#241c2c'); r(g, X + 20, Y + 7, 2, 2, '#241c2c'); r(g, X + 14, Y + 8, 5, 4, '#e8b93e'); r(g, X + 15, Y + 12, 3, 2, '#c98f2a'); } else if (dir === 2) r(g, h0 + hw - 1, Y + 8, 6, 4, '#e8b93e'); else r(g, h0, Y + 8, hw, 12, '#c9d8ee');
    } else if (a === 'salamander') {
      const b = '#c2452d', t = '#ffd23f'; r(g, h0 - 3, Y + 4, hw + 6, 10, b); for (let x = -2; x < hw + 2; x += 4) r(g, h0 + x, Y + 1 + (x & 2), 3, 4, t); for (const [dx, dy] of [[1, 5], [9, 4], [13, 7]]) r(g, h0 + dx, Y + dy, 2, 2, t);
      if (f) { r(g, X + 11, Y + 8, 3, 3, t); r(g, X + 19, Y + 8, 3, 3, t); r(g, X + 12, Y + 9, 1, 2, '#241c2c'); r(g, X + 20, Y + 9, 1, 2, '#241c2c'); } else if (dir === 2) r(g, h0 + 10, Y + 8, 3, 3, t); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'chimera') {
      const b = '#3a2f8f', t = '#9ff0ff'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); for (const [dx, h] of [[0, 8], [hw >> 1, 13], [hw - 3, 8]]) { r(g, h0 + dx, Y + 3 - h, 3, h, t); r(g, h0 + dx + 1, Y + 1 - h, 1, 2, '#fff'); }
      if (f) { r(g, X + 11, Y + 8, 11, 2, t); r(g, X + 15, Y + 5, 3, 3, '#fff'); } else if (dir === 2) r(g, h0 + 7, Y + 8, 7, 2, t); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'pegasus') {
      const b = '#f0e6ff', t = '#ff9fd8'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); for (let y = 0; y < 20; y += 2) r(g, X + 15, Y + y, 3, 2, y % 4 ? t : '#ffc9ea'); r(g, h0 - 6, Y + 4, 6, 3, '#fff'); r(g, h0 - 8, Y + 7, 8, 3, b); if (dir !== 2) { r(g, h0 + hw, Y + 4, 6, 3, '#fff'); r(g, h0 + hw, Y + 7, 8, 3, b); }
      if (f) { r(g, X + 11, Y + 8, 3, 2, '#5a3c8a'); r(g, X + 19, Y + 8, 3, 2, '#5a3c8a'); } else if (dir === 2) r(g, h0 + 10, Y + 8, 3, 2, '#5a3c8a'); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'wolf') {
      const b = '#8a98a8', l = '#c6d2de', t = '#6fd6ff'; r(g, h0 - 1, Y - 2, 5, 8, b); if (dir !== 2) r(g, h0 + hw - 4, Y - 2, 5, 8, b); r(g, h0 - 2, Y + 4, hw + 4, 11, b);
      if (f) { r(g, X + 11, Y + 8, 3, 2, t); r(g, X + 19, Y + 8, 3, 2, t); r(g, X + 13, Y + 10, 7, 5, l); r(g, X + 15, Y + 10, 3, 2, '#1d2230'); } else if (dir === 2) { r(g, h0 + 8, Y + 8, 3, 2, t); r(g, h0 + hw - 3, Y + 10, 8, 4, l); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'scorpion') {
      const b = '#2a2430', t = '#e8c23a'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); for (let y = 5; y < 13; y += 3) r(g, h0, Y + y, hw, 1, '#463e50'); r(g, h0 + hw - 3, Y - 6, 4, 10, b); r(g, h0 + 8, Y - 9, hw - 7, 4, b); r(g, h0 + 5, Y - 7, 4, 5, t); r(g, h0 - 4, Y + 9, 4, 4, t); if (dir !== 2) r(g, h0 + hw, Y + 9, 4, 4, t);
      if (f) { r(g, X + 11, Y + 8, 11, 2, t); } else if (dir === 2) r(g, h0 + 7, Y + 8, 7, 2, t); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'manticore') {
      const b = '#9a2f2f', t = '#e0b04a'; r(g, h0 - 3, Y + 3, hw + 6, 14, t); for (let x = -3; x < hw + 3; x += 3) r(g, h0 + x, Y + (x & 1), 2, 4, '#c98a2a'); r(g, h0 - 5, Y - 1, 4, 7, b); if (dir !== 2) r(g, h0 + hw + 1, Y - 1, 4, 7, b);
      if (dir !== 1) { r(g, h0 + 1, Y + 5, hw - 2, 9, b); if (f) { r(g, X + 11, Y + 8, 3, 2, '#ffe14a'); r(g, X + 19, Y + 8, 3, 2, '#ffe14a'); for (let x = 12; x < 21; x += 2) r(g, X + x, Y + 12, 1, 2, '#fff'); } else r(g, h0 + 9, Y + 8, 3, 2, '#ffe14a'); } else r(g, h0, Y + 5, hw, 12, t);
    } else if (a === 'hydra') {
      const b = '#2f4a3a', t = '#9affc8'; r(g, h0 - 2, Y + 3, hw + 4, 11, b); for (const dx of [-1, (hw >> 1) - 2, hw - 3]) { r(g, h0 + dx + 1, Y - 3, 3, 6, b); r(g, h0 + dx, Y - 7, 6, 5, b); r(g, h0 + dx + 3, Y - 6, 2, 1, t); r(g, h0 + dx + 5, Y - 4, 2, 1, '#fff'); }
      if (f) { r(g, X + 11, Y + 8, 3, 2, t); r(g, X + 19, Y + 8, 3, 2, t); } else if (dir === 2) r(g, h0 + 10, Y + 8, 3, 2, t); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'bat') {
      const b = '#3b2a55', t = '#d86bff'; r(g, h0 - 4, Y - 6, 7, 13, b); r(g, h0 - 3, Y - 3, 4, 8, t); if (dir !== 2) { r(g, h0 + hw - 3, Y - 6, 7, 13, b); r(g, h0 + hw - 1, Y - 3, 4, 8, t); } r(g, h0 - 1, Y + 4, hw + 2, 11, b);
      if (f) { r(g, X + 11, Y + 8, 3, 2, '#ff3b4f'); r(g, X + 19, Y + 8, 3, 2, '#ff3b4f'); r(g, X + 13, Y + 12, 2, 4, '#fff'); r(g, X + 18, Y + 12, 2, 4, '#fff'); } else if (dir === 2) { r(g, h0 + 9, Y + 8, 3, 2, '#ff3b4f'); r(g, h0 + 11, Y + 12, 2, 4, '#fff'); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'spider') {
      const b = '#241a28', t = '#ff3b4f'; r(g, h0 - 2, Y + 3, hw + 4, 12, b); for (let i = 0; i < 3; i++) { r(g, h0 - 6, Y + 4 + i * 4, 5, 1, b); r(g, h0 - 8, Y + 5 + i * 4, 3, 3, b); if (dir !== 2) { r(g, h0 + hw + 1, Y + 4 + i * 4, 5, 1, b); r(g, h0 + hw + 5, Y + 5 + i * 4, 3, 3, b); } }
      if (f) { for (const [dx, dy] of [[11, 6], [14, 5], [18, 5], [21, 6], [12, 9], [15, 8], [18, 8], [20, 9]]) r(g, X + dx, Y + dy, 2, 2, t); r(g, X + 13, Y + 13, 2, 4, '#e8dcc8'); r(g, X + 18, Y + 13, 2, 4, '#e8dcc8'); } else if (dir === 2) { for (const dx of [8, 11, 14]) r(g, h0 + dx, Y + 7, 2, 2, t); } else { r(g, h0 + 5, Y + 6, 6, 8, t); r(g, h0 + 7, Y + 9, 2, 2, b); }
    } else if (a === 'axolotl') {
      const p = '#f8c2d6', t = '#ff5f9e', t2 = '#ff94c0';
      for (let i = 0; i < 3; i++) { r(g, h0 - 5, Y + 3 + i * 4, 5, 2, t); r(g, h0 - 8, Y + 2 + i * 4, 3, 3, t2); if (dir !== 2) { r(g, h0 + hw, Y + 3 + i * 4, 5, 2, t); r(g, h0 + hw + 5, Y + 2 + i * 4, 3, 3, t2); } }
      r(g, h0 - 1, Y + 3, hw + 2, 12, p); r(g, h0 + 1, Y + 3, hw - 3, 2, '#ffe0ec');
      if (f) { r(g, X + 10, Y + 8, 3, 3, '#241c2c'); r(g, X + 20, Y + 8, 3, 3, '#241c2c'); r(g, X + 10, Y + 8, 1, 1, '#fff'); r(g, X + 20, Y + 8, 1, 1, '#fff'); r(g, X + 13, Y + 13, 7, 1, '#c0507e'); r(g, X + 12, Y + 12, 1, 1, '#c0507e'); r(g, X + 20, Y + 12, 1, 1, '#c0507e'); } else if (dir === 2) { r(g, h0 + 10, Y + 8, 3, 3, '#241c2c'); r(g, h0 + 8, Y + 13, 6, 1, '#c0507e'); }
    } else if (a === 'bear') {
      const b = '#7a4f2a', l = '#c49a6c';
      r(g, h0 - 1, Y + 1, 6, 6, b); r(g, h0 + 1, Y + 3, 2, 2, l); if (dir !== 2) { r(g, h0 + hw - 5, Y + 1, 6, 6, b); r(g, h0 + hw - 3, Y + 3, 2, 2, l); }
      r(g, h0 - 2, Y + 4, hw + 4, 12, b); r(g, h0, Y + 4, hw - 4, 2, '#946539');
      if (f) { r(g, X + 11, Y + 8, 2, 2, '#1a120c'); r(g, X + 20, Y + 8, 2, 2, '#1a120c'); r(g, X + 12, Y + 10, 9, 6, l); r(g, X + 15, Y + 10, 3, 2, '#1a120c'); r(g, X + 16, Y + 12, 1, 2, '#1a120c'); } else if (dir === 2) { r(g, h0 + hw - 4, Y + 9, 8, 6, l); r(g, h0 + hw + 2, Y + 9, 2, 2, '#1a120c'); r(g, h0 + 7, Y + 8, 2, 2, '#1a120c'); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'owl') {
      const b = '#4a55a8', t = '#ffe9a8';
      r(g, h0 - 1, Y + 3, hw + 2, 12, b); r(g, h0 - 2, Y, 5, 5, b); if (dir !== 2) r(g, h0 + hw - 3, Y, 5, 5, b); for (let x = 1; x < hw; x += 4) r(g, h0 + x, Y + 3, 2, 2, t);
      if (f) { ell(g, X + 12, Y + 9, 4, 3, t); ell(g, X + 21, Y + 9, 4, 3, t); r(g, X + 11, Y + 8, 2, 3, '#1d1830'); r(g, X + 20, Y + 8, 2, 3, '#1d1830'); r(g, X + 15, Y + 11, 3, 4, '#e8b93e'); } else if (dir === 2) { ell(g, h0 + 9, Y + 9, 4, 3, t); r(g, h0 + 10, Y + 8, 2, 3, '#1d1830'); r(g, h0 + hw - 1, Y + 10, 4, 3, '#e8b93e'); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'tiger') {
      const o2 = '#e0762a', k = '#1d1620';
      r(g, h0 - 1, Y + 1, 5, 5, o2); if (dir !== 2) r(g, h0 + hw - 4, Y + 1, 5, 5, o2); r(g, h0 - 2, Y + 4, hw + 4, 12, o2); for (let x = 0; x < hw; x += 4) r(g, h0 + x, Y + 4, 2, 4 + (x % 3), k); r(g, X + 15, Y + 4, 3, 3, k);
      if (f) { r(g, X + 11, Y + 9, 3, 2, '#b6f06a'); r(g, X + 19, Y + 9, 3, 2, '#b6f06a'); r(g, X + 12, Y + 11, 9, 5, '#fff3e0'); r(g, X + 15, Y + 11, 3, 2, '#d0405a'); r(g, X + 13, Y + 15, 2, 3, '#fff'); r(g, X + 18, Y + 15, 2, 3, '#fff'); } else if (dir === 2) { r(g, h0 + 8, Y + 9, 3, 2, '#b6f06a'); r(g, h0 + hw - 3, Y + 11, 7, 5, '#fff3e0'); } else r(g, h0, Y + 8, hw, 12, o2);
    } else if (a === 'kraken') {
      const p = '#5c3290', t = '#56e0d0', d = '#3a1d62';
      for (const tx0 of (dir === 2 ? [h0 - 3, h0 + 1] : [h0 - 4, h0, h0 + hw - 5, h0 + hw - 1])) { for (let y = 8; y < 28; y++) r(g, tx0 + Math.round(Math.sin(y / 3 + tx0) * 1.4), Y + y, 3, 1, d); for (let y = 10; y < 27; y += 4) r(g, tx0 + Math.round(Math.sin(y / 3 + tx0) * 1.4) + 1, Y + y, 1, 1, t); }
      r(g, h0 - 2, Y + 2, hw + 4, 11, p); r(g, h0, Y + 2, hw - 4, 2, '#8456bd');
      if (f) { ell(g, X + 16, Y + 7, 4, 3, t); r(g, X + 15, Y + 5, 3, 5, '#14082a'); } else if (dir === 2) { ell(g, h0 + 10, Y + 7, 3, 2, t); r(g, h0 + 10, Y + 6, 1, 3, '#14082a'); } else r(g, h0, Y + 8, hw, 8, p);
    } else if (a === 'demon') {
      const b = '#7a1430', k = '#1d0a12', g2 = '#ffcf3a';
      for (const [hxx, sgn] of (dir === 2 ? [[h0 - 2, -1]] : [[h0 - 2, -1], [h0 + hw - 1, 1]]) as number[][]) { r(g, hxx, Y + 2, 3, 7, k); r(g, hxx + sgn * 3, Y - 2, 4, 6, k); r(g, hxx + sgn * 5, Y - 7, 3, 7, k); r(g, hxx + sgn * 5, Y - 9, 2, 3, g2); }
      r(g, h0 - 1, Y + 3, hw + 2, 13, b); r(g, h0 + 1, Y + 3, hw - 3, 2, '#a82348');
      if (f) { r(g, X + 11, Y + 8, 4, 2, g2); r(g, X + 18, Y + 8, 4, 2, g2); r(g, X + 12, Y + 12, 9, 3, k); for (let x = 12; x < 21; x += 2) r(g, X + x, Y + 12, 1, 3, '#fff'); } else if (dir === 2) { r(g, h0 + 8, Y + 8, 5, 2, g2); r(g, h0 + 7, Y + 12, 7, 3, k); } else r(g, h0, Y + 8, hw, 12, b);
    } else {
      r(g, h0 - 1, Y + 3, hw + 2, 10, '#c8352a'); r(g, h0 - 1, Y + 11, hw + 2, 2, '#7d1c16');
      r(g, X + 15, Y - 5, 3, 9, '#ffb13d'); r(g, X + 12, Y - 2, 3, 6, '#ff7a2b'); r(g, X + 18, Y - 2, 3, 6, '#ff7a2b'); r(g, X + 16, Y - 7, 1, 3, '#ffe08a');
      if (f) r(g, X + 11, Y + 8, 11, 2, '#ffd76a'); else if (dir === 2) r(g, h0 + 7, Y + 8, 7, 2, '#ffd76a'); else r(g, h0, Y + 8, hw, 12, '#c8352a');
    }
  } else if (o.helm) { const hm = o.helm; r(g, X + hx - 1, Y + 4, hw + 2, 9, hm); r(g, X + hx - 1, Y + 4, hw + 2, 2, shade(hm, 35)); r(g, X + hx - 1, Y + 12, hw + 2, 2, shade(hm, -30)); if (dir === 1) r(g, X + hx, Y + 8, hw, 12, hm); }
  else {
    r(g, X + hx - 1, Y + 4, hw + 2, 7, hair); r(g, X + hx + 2, Y + 4, hw - 6, 2, hairL);
    if (dir === 0) { r(g, X + hx - 1, Y + 10, 3, 5, hair); r(g, X + hx + hw - 2, Y + 10, 3, 5, hair); r(g, X + 12, Y + 10, 5, 2, hairD); }
    if (dir === 1) r(g, X + hx - 1, Y + 8, hw + 2, 12, hair);
    if (dir === 2) r(g, X + hx - 1, Y + 8, 7, 10, hair);
    if (o.hs === 1) for (let i = 0; i < 4; i++) r(g, X + hx + i * 5 - 1, Y + 1 + (i % 2) * 2, 4, 4, hair);
    if (o.cls === 'arcane_wizard') { r(g, X + hx - 5, Y + 7, hw + 10, 3, armD); r(g, X + hx - 2, Y + 4, hw + 4, 3, armor); for (let i = 0; i < 12; i++) { const w = Math.round((hw + 2) * (1 - i / 13)); r(g, X + hx + hw / 2 - w / 2 + (i > 8 ? 2 : 0), Y + 4 - i, w, 1, i % 4 === 2 ? armL : armor); } }
    if (o.cls === 'mystic_archer') { r(g, X + hx - 2, Y + 2, hw + 4, 8, armor); r(g, X + hx - 2, Y + 2, hw + 4, 2, armL); r(g, X + hx - 2, Y + 8, 3, 13, armD); if (dir !== 2) r(g, X + hx + hw - 1, Y + 8, 3, 13, armD); if (dir === 1) r(g, X + hx - 2, Y + 8, hw + 4, 13, armor); }
    if (o.cls === 'shadow_summoner') { r(g, X + hx - 1, Y + 2, hw + 2, 8, armD); r(g, X + hx - 3, Y - 4, 3, 8, '#e8dcc8'); r(g, X + hx + hw, Y - 4, 3, 8, '#e8dcc8'); r(g, X + hx - 3, Y - 6, 2, 3, '#b06bff'); r(g, X + hx + hw + 1, Y - 6, 2, 3, '#b06bff'); if (dir === 1) r(g, X + hx - 1, Y + 8, hw + 2, 13, armD); }
    if (o.hs === 2) { r(g, X + hx - 2, Y + 10, 4, 17, hair); if (dir !== 2) r(g, X + hx + hw - 2, Y + 10, 4, 17, hair); else r(g, X + hx, Y + 10, 5, 16, hairD); if (dir === 1) r(g, X + hx - 1, Y + 8, hw + 2, 19, hair); }
  }
  // arma
  if (atk) { if (dir === 2) { r(g, X + 20, Y + 24, 6, 4, skin); sword(X + 25, Y + 22, true, 1); } else if (dir === 0) { r(g, X + 25, Y + 28, 4, 5, skin); sword(X + 24, Y + 26, false); } else { r(g, X + 25, Y + 18, 4, 5, skin); sword(X + 24, Y + 2, false); } }
  else if (dir === 0) sword(X + 27, Y + 18, false);
  else if (dir === 2) { r(g, X + 14, Y + 23 + sw, 5, 9, armD); r(g, X + 15, Y + 31 + sw, 4, 3, skin); sword(X + 17, Y + 16 + sw, false); }
  return outline(c);
}
function shade(hex: string, a: number) { const n = parseInt(hex.slice(1), 16), c = (v: number) => Math.max(0, Math.min(255, v + a)).toString(16).padStart(2, '0'); return '#' + c(n >> 16) + c(n >> 8 & 255) + c(n & 255); }
const heroCache = new Map<string, Cv[][]>();
const tintCache = new WeakMap<Cv, Map<string, Cv>>();
export function tintFrame(f: Cv, col: string): Cv { let m = tintCache.get(f); if (!m) { m = new Map(); tintCache.set(f, m); } let c = m.get(col); if (c) return c; c = cv(f.width, f.height); const g = ctx(c); g.drawImage(f, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, f.width, f.height); m.set(col, c); return c; }
export function heroSprites(o: Look): Cv[][] {
  const k = JSON.stringify(o); let s = heroCache.get(k); if (s) return s;
  const S = [0, 1, 2, 3, 4, 5].map(f => heroFrame(0, f, o)), N = [0, 1, 2, 3, 4, 5].map(f => heroFrame(1, f, o)), E = [0, 1, 2, 3, 4, 5].map(f => heroFrame(2, f, o));
  s = [S, N, E, E.map(flip)]; heroCache.set(k, s); return s;
}
export function lookFromGear(cls: string | undefined, hc: string, hs: number, e: { helm?: string | null; armor?: string | null; pants?: string | null; boots?: string | null; weapon?: string | null }): Look {
  const t = (k?: string | null) => k ? ITEMS[k]?.tint ?? null : null;
  const c = classOf(cls);
  const st = (k?: string | null) => k ? ITEMS[k]?.set : undefined;
  return { helmSet: st(e.helm), armorSet: st(e.armor), pantsSet: st(e.pants), bootsSet: st(e.boots), cls: c.key, hc, hs, helm: t(e.helm), armor: t(e.armor) ?? c.color, pants: t(e.pants) ?? c.pants, boots: t(e.boots), weapon: e.weapon ?? null };
}

// ---------- monstros: [quadro][direita/esquerda] ----------
const mobCache = new Map<string, Cv[][]>();
function slime(f: number) { const c = cv(36, 30), g = ctx(c), h = f ? 10 : 12, w = f ? 15 : 13; ell(g, 18, 28 - h, w, h, '#66c6e6'); ell(g, 16, 25 - h, w - 4, h - 4, '#93e0f5'); ell(g, 13, 22 - h + 1, 3, 2, '#effcff'); r(g, 12, 25 - h + 6, 3, 4, '#17344a'); r(g, 21, 25 - h + 6, 3, 4, '#17344a'); return outline(c); }
function wolf(f: number) { const c = cv(48, 38), g = ctx(c), b = '#8ea3b8', d = '#64788e', l = '#c8d6e3', s = f ? 3 : -3; r(g, 10, 14, 24, 13, b); r(g, 10, 14, 24, 4, l); r(g, 4, 11, 7, 5, b); r(g, 2, 8, 4, 5, l); r(g, 30, 8, 12, 12, b); r(g, 38, 13, 8, 5, l); r(g, 44, 13, 2, 2, '#1d2230'); r(g, 37, 11, 2, 2, '#ff6b4a'); r(g, 31, 3, 4, 7, d); r(g, 37, 3, 3, 6, d); for (const [x, o] of [[11, s], [17, -s], [26, -s], [31, s]]) r(g, x + o, 26, 4, 10, d); return outline(c); }
function golem(f: number) { const c = cv(56, 62), g = ctx(c), a = '#7f9fbe', b = '#a8c6e0', d = '#567595', s = f ? 2 : 0; r(g, 14 + s, 44, 12, 15, d); r(g, 31 - s, 44, 12, 15, d); r(g, 12, 18, 33, 28, a); r(g, 12, 18, 33, 5, b); r(g, 3, 20 + s, 10, 27, d); r(g, 44, 20 - s, 10, 27, d); r(g, 19, 6, 19, 14, a); r(g, 19, 6, 19, 3, b); r(g, 23, 12, 4, 3, '#7ff0ff'); r(g, 31, 12, 4, 3, '#7ff0ff'); for (const [x, y, h] of [[16, 11, 8], [41, 12, 7], [8, 13, 8], [48, 14, 7], [28, 25, 11]]) { r(g, x, y, 4, h, '#d6f5ff'); r(g, x + 1, y - 3, 2, 3, '#effcff'); } return outline(c); }
function boss(f: number) { const c = cv(92, 110), g = ctx(c), s = f ? 2 : 0, rb = '#3f5fa8', rb2 = '#6186d4'; for (let y = 0; y < 62; y++) { const w = 14 + y * .42 | 0; r(g, 46 - w, 42 + y, w * 2, 1, y % 9 < 2 ? rb2 : rb); } r(g, 33, 42, 26, 16, '#88a8e2'); r(g, 37, 22, 18, 20, '#dfeaf7'); r(g, 41, 30, 3, 4, '#2552c9'); r(g, 49, 30, 3, 4, '#2552c9'); r(g, 34, 20, 24, 8, '#f3f8ff'); r(g, 33, 24, 5, 42, '#f3f8ff'); r(g, 54, 24, 5, 42, '#f3f8ff'); for (const [x, h] of [[35, 8], [41, 12], [46, 16], [51, 12], [56, 8]]) r(g, x, 20 - h, 3, h, '#7fe3ff'); r(g, 75, 12, 4, 92, '#a4e8ff'); ell(g, 77, 12 + s, 8, 8, '#d9f7ff'); r(g, 67, 56, 10, 4, '#88a8e2'); for (const [x, y] of [[12, 30 + s], [8, 62 - s], [20, 14 - s]]) { r(g, x, y, 5, 10, '#7fe3ff'); r(g, x + 1, y, 1, 10, '#fff'); } return outline(c); }
function wisp(f: number) { const c = cv(28, 30), g = ctx(c), s = f ? 2 : 0; ell(g, 14, 13 + s, 8, 8, '#8dffb0'); ell(g, 12, 11 + s, 4, 4, '#e6ffe9'); r(g, 3, 8 - s, 6, 8, '#c6ffd6'); r(g, 19, 8 - s, 6, 8, '#c6ffd6'); r(g, 11, 13 + s, 2, 3, '#14432a'); r(g, 16, 13 + s, 2, 3, '#14432a'); return outline(c); }
function shadeMob(f: number) { const c = cv(36, 46), g = ctx(c), s = f ? 2 : 0; for (let y = 0; y < 26; y++) { const w = 8 + y * .35 | 0; r(g, 18 - w, 16 + y, w * 2, 1, y % 6 < 2 ? '#3a2358' : '#2a1743'); } for (let x = 0; x < 5; x++) r(g, 7 + x * 5, 40 + (x % 2) * 3 + s, 4, 3, '#2a1743'); ell(g, 18, 12, 9, 9, '#2a1743'); r(g, 13, 11, 3, 3, '#e06bff'); r(g, 20, 11, 3, 3, '#e06bff'); return outline(c, [60, 20, 100, 255]); }
function imp(f: number) { const c = cv(40, 40), g = ctx(c), s = f ? 3 : 0, b = '#a8381f'; r(g, 2, 8 + s, 10, 14 - s, '#5a1f18'); r(g, 28, 8 + s, 10, 14 - s, '#5a1f18'); r(g, 13, 14, 15, 15, b); r(g, 13, 14, 15, 3, '#d65a30'); r(g, 12, 3, 16, 13, b); r(g, 11, 0, 3, 6, '#e8dcc8'); r(g, 26, 0, 3, 6, '#e8dcc8'); r(g, 15, 7, 3, 3, '#ffe14a'); r(g, 23, 7, 3, 3, '#ffe14a'); r(g, 17, 12, 7, 2, '#3a0f0c'); r(g, 14, 28, 5, 9, '#7d2716'); r(g, 22, 28, 5, 9, '#7d2716'); r(g, 28, 24 + s, 8, 3, b); return outline(c); }
function hound(f: number) { const c = cv(56, 44), g = ctx(c), b = '#2d2629', d = '#191517', s = f ? 3 : -3; r(g, 12, 18, 28, 14, b); r(g, 12, 18, 28, 3, '#463b40'); r(g, 34, 10, 15, 14, b); r(g, 46, 16, 8, 6, '#463b40'); r(g, 50, 21, 4, 3, '#fff'); r(g, 42, 13, 3, 3, '#ff6a2b'); for (let i = 0; i < 7; i++) r(g, 14 + i * 4, 10 + (i % 2) * 4 + (f * (i % 3)), 3, 9 - (i % 2) * 3, i % 2 ? '#ff7a2b' : '#ffd76a'); r(g, 4, 14, 9, 4, b); r(g, 2, 8, 4, 8, '#ff7a2b'); for (const [x, o] of [[14, s], [21, -s], [33, -s], [38, s]]) r(g, x + o, 31, 5, 11, d); return outline(c); }
function magma(f: number) { const c = cv(60, 68), g = ctx(c), a = '#2c2529', s = f ? 2 : 0, gl = '#ff7a2b'; r(g, 15 + s, 48, 13, 18, a); r(g, 33 - s, 48, 13, 18, a); r(g, 12, 18, 37, 32, a); r(g, 3, 20 + s, 11, 30, a); r(g, 47, 20 - s, 11, 30, a); r(g, 20, 4, 21, 16, a); r(g, 24, 10, 5, 4, '#ffd76a'); r(g, 33, 10, 5, 4, '#ffd76a'); for (const [x, y, w, h] of [[18, 24, 3, 22], [30, 20, 3, 28], [40, 26, 3, 18], [20, 34, 22, 3], [6, 28, 3, 16], [50, 30, 3, 14], [19, 52, 3, 12], [38, 52, 3, 12]]) r(g, x, y, w, h, gl); r(g, 30, 30, 3, 8, '#ffd76a'); return outline(c, [15, 8, 12, 255]); }
function wyrm(f: number) { const c = cv(84, 62), g = ctx(c), b = '#4a2226', d = '#2c1417', l = '#7d3a2e', s = f ? 3 : -3; for (let i = 0; i < 22; i++) r(g, 2 + i, 26 + Math.round(i * .3 + Math.sin(i / 4 + f) * 2), 4, 8 - (i >> 3) + 3, b); r(g, 22, 20, 36, 20, b); r(g, 22, 34, 36, 6, l); for (let i = 0; i < 8; i++) r(g, 24 + i * 4, 15, 3, 5 + (i % 2) * 2, '#d9d2bb'); r(g, 54, 14, 12, 14, b); r(g, 60, 6, 18, 14, b); r(g, 72, 12, 10, 8, l); r(g, 66, 9, 3, 3, '#ffd76a'); r(g, 60, 0, 3, 8, '#d9d2bb'); r(g, 66, 1, 3, 6, '#d9d2bb'); for (let x = 72; x < 82; x += 3) r(g, x, 20, 2, 3, '#fff'); for (const [x, o] of [[26, s], [34, -s], [48, -s], [54, s]]) r(g, x + o, 39, 7, 21, d); return outline(c); }
function ignarok(f: number) { const c = cv(168, 138), g = ctx(c), b = '#6a1d1f', d = '#3e1012', l = '#b04a2c', w = f ? 8 : -6;
  for (let i = 0; i < 46; i++) { const h = Math.round(46 * (1 - i / 46)); r(g, 54 + i, 30 + w * (1 - i / 46) + (46 - h) * .2, 1, h + 8, i % 11 < 2 ? d : '#8a2a22'); } for (let i = 0; i < 44; i++) r(g, 66 - i, 22 + w + i * .15, 1, 42 - i * .7, i % 9 < 2 ? d : '#7d2420');
  for (let i = 0; i < 46; i++) r(g, 2 + i, 92 - Math.round(i * .38 + Math.sin(i / 6 + f) * 3), 6, 12 - (i >> 4) + 4, b);
  ell(g, 74, 86, 34, 24, b); ell(g, 74, 96, 30, 13, l); for (let i = 0; i < 9; i++) r(g, 48 + i * 7, 58 + Math.abs(4 - i), 4, 8 + (i % 2) * 3, '#d9d2bb');
  for (let i = 0; i < 36; i++) r(g, 96 + i * .7, 72 - i, 15, 16, i % 7 < 2 ? d : b); for (let i = 0; i < 30; i += 3) r(g, 108 + i * .7, 72 - i + 16, 8, 3, l);
  r(g, 118, 22, 30, 22, b); r(g, 142, 30, 24, 15, b); r(g, 142, 40, 24, 5, l); r(g, 130, 28, 6, 5, '#ffd76a'); r(g, 132, 29, 2, 3, '#3e1012'); r(g, 158, 33, 3, 3, '#ffb13d'); for (let x = 144; x < 166; x += 4) r(g, x, 45, 3, 5, '#fff');
  for (const [x, y, h] of [[120, 8, 15], [130, 4, 19], [114, 14, 10]]) { r(g, x, y, 4, h, '#d9d2bb'); r(g, x, y, 1, h, '#f1ecd9'); }
  for (const [x, o] of [[56, w >> 2], [68, -(w >> 2)], [88, -(w >> 2)], [98, w >> 2]]) { r(g, x + o, 104, 11, 30, d); for (let k = 0; k < 3; k++) r(g, x + o + k * 4, 134, 3, 3, '#d9d2bb'); }
  return outline(c); }
export function mobSprites(key: string): Cv[][] {
  let s = mobCache.get(key); if (s) return s;
  const f = key === 'wisp' ? wisp : key === 'shade' ? shadeMob : key === 'imp' ? imp : key === 'hound' ? hound : key === 'magma' ? magma : key === 'wyrm' ? wyrm : key === 'ignarok' ? ignarok : key === 'slime' ? slime : key === 'wolf' ? wolf : key === 'golem' ? golem : boss;
  s = [0, 1].map(i => { const c = f(i); return [c, flip(c)]; }); mobCache.set(key, s); return s;
}
export const mobSize = (k: string) => (k === 'ignarok' ? 130 : k === 'wyrm' ? 60 : k === 'magma' ? 62 : k === 'hound' ? 40 : k === 'imp' ? 32 : MOBS[k]?.boss ? 96 : k === 'golem' ? 56 : k === 'wolf' ? 36 : 28);

// ---------- ícones ----------
const iconCache = new Map<string, Cv>();
export function icon(key: string | null): Cv {
  const k = key ?? 'gold'; let c = iconCache.get(k); if (c) return c;
  c = cv(28, 28); const g = ctx(c), d = key ? ITEMS[key] : null, t = d?.tint ?? '#888', l = shade(t, 40), dk = shade(t, -35);
  if (!d) { for (const [x, y] of [[6, 14], [14, 14], [10, 8]]) { ell(g, x + 4, y + 4, 5, 4, '#e0b03a'); ell(g, x + 3, y + 3, 3, 2, '#ffe28a'); } }
  else if (d.kind === 'potion') { const col = d.heal ? '#e0425a' : '#3f7fe8'; r(g, 11, 3, 6, 3, '#a87b4a'); r(g, 11, 6, 6, 4, '#cfe3ee'); ell(g, 14, 17, 8, 7, col); ell(g, 11, 14, 3, 2, '#fff'); }
  else if (d.kind === 'jewel') { const b = d.blade!; r(g, 10, 5, 8, 3, '#fff'); r(g, 7, 8, 14, 5, b); for (let i = 0; i < 9; i++) r(g, 7 + i, 13 + i, 14 - i * 2 > 0 ? 14 - i * 2 : 1, 1, shade(b, -25 + i * 2)); r(g, 10, 9, 3, 3, '#fff'); }
  else if (d.kind === 'material') { for (const [x, y, h] of [[8, 9, 13], [13, 5, 18], [18, 11, 11]]) { r(g, x, y, 4, h, '#8fe2ff'); r(g, x, y, 1, h, '#fff'); } }
  else if (d.wtype === 'staff') { r(g, 13, 8, 3, 18, '#7a5533'); ell(g, 14, 7, 5, 5, d.blade!); r(g, 12, 5, 2, 2, '#fff'); }
  else if (d.wtype === 'bow') { for (let i = 0; i < 22; i++) r(g, 8 + Math.round(Math.sin(i / 21 * Math.PI) * 11), 3 + i, 2, 1, d.blade!); r(g, 8, 3, 1, 22, '#e8e6df'); }
  else if (d.kind === 'weapon') { const b = d.blade!; if (key === 'iron_axe') { r(g, 13, 5, 3, 20, '#6b4a2b'); ell(g, 18, 9, 6, 6, b); ell(g, 19, 8, 3, 3, '#dbe4ee'); } else { r(g, 13, 3, 4, 16, b); r(g, 13, 3, 1, 16, '#fff'); r(g, 9, 19, 12, 2, '#c9a44c'); r(g, 13, 21, 4, 5, '#6b4a2b'); } }
  else if (d.kind === 'helm') { ell(g, 14, 14, 10, 9, t); r(g, 4, 14, 20, 8, t); r(g, 8, 16, 12, 5, '#1d2230'); ell(g, 11, 9, 4, 2, l); }
  else if (d.kind === 'armor') { r(g, 7, 6, 14, 18, t); r(g, 3, 6, 5, 11, dk); r(g, 20, 6, 5, 11, dk); r(g, 10, 4, 8, 4, '#1d2230'); r(g, 13, 10, 2, 11, l); }
  else if (d.kind === 'pants') { r(g, 7, 4, 14, 8, t); r(g, 7, 12, 6, 13, t); r(g, 15, 12, 6, 13, dk); r(g, 7, 4, 14, 2, l); }
  else { r(g, 6, 5, 7, 16, t); r(g, 6, 20, 12, 5, dk); r(g, 16, 8, 6, 12, dk); r(g, 16, 20, 10, 5, t); }
  if (d?.set) {
    const S = SETS[d.set], tr = S.trim;
    if (d.kind === 'helm') {
      r(g, 8, 16, 12, 5, '#1d2230');
      if (d.set === 'dragon') { r(g, 2, 3, 3, 12, '#d9d2bb'); r(g, 23, 3, 3, 12, '#d9d2bb'); ell(g, 14, 13, 9, 8, '#d9d2bb'); r(g, 8, 11, 4, 4, '#241c2c'); r(g, 16, 11, 4, 4, '#241c2c'); r(g, 9, 12, 2, 2, tr); r(g, 17, 12, 2, 2, tr); for (let x = 7; x < 21; x += 3) r(g, x, 20, 2, 3, '#f1ecd9'); }
      else if (d.set === 'lion') { ell(g, 14, 14, 13, 12, '#b5651d'); ell(g, 14, 13, 8, 8, '#e8b93e'); r(g, 10, 10, 2, 2, '#3a2208'); r(g, 16, 10, 2, 2, '#3a2208'); r(g, 11, 14, 6, 4, '#f6dc8c'); r(g, 13, 14, 2, 2, '#3a2208'); }
      else if (d.set === 'serpent') { r(g, 3, 9, 22, 12, '#1a6b45'); ell(g, 14, 10, 8, 7, '#2fae6a'); r(g, 9, 9, 3, 2, '#ffe14a'); r(g, 16, 9, 3, 2, '#ffe14a'); r(g, 11, 13, 2, 5, '#fff'); r(g, 15, 13, 2, 5, '#fff'); }
      else if (d.set === 'phoenix') { r(g, 12, 1, 4, 11, '#ffb13d'); r(g, 8, 4, 3, 7, '#ff7a2b'); r(g, 17, 4, 3, 7, '#ff7a2b'); r(g, 8, 15, 12, 2, '#ffd76a'); }
      else if (d.set === 'axolotl') { for (let i = 0; i < 3; i++) { r(g, 0, 7 + i * 5, 6, 2, tr); r(g, 22, 7 + i * 5, 6, 2, tr); } ell(g, 14, 14, 9, 8, '#f8c2d6'); r(g, 9, 12, 3, 3, '#241c2c'); r(g, 16, 12, 3, 3, '#241c2c'); r(g, 11, 18, 6, 1, '#c0507e'); }
      else if (d.set === 'bear') { r(g, 3, 4, 7, 7, '#7a4f2a'); r(g, 18, 4, 7, 7, '#7a4f2a'); ell(g, 14, 14, 10, 9, '#7a4f2a'); r(g, 9, 11, 2, 2, '#1a120c'); r(g, 17, 11, 2, 2, '#1a120c'); r(g, 10, 14, 8, 6, tr); r(g, 13, 14, 2, 2, '#1a120c'); }
      else if (d.set === 'owl') { r(g, 3, 3, 6, 7, S.color); r(g, 19, 3, 6, 7, S.color); ell(g, 14, 14, 11, 9, S.color); ell(g, 9, 13, 4, 4, tr); ell(g, 19, 13, 4, 4, tr); r(g, 8, 12, 2, 3, '#1d1830'); r(g, 18, 12, 2, 3, '#1d1830'); r(g, 13, 15, 2, 5, '#e8b93e'); }
      else if (d.set === 'tiger') { ell(g, 14, 14, 11, 10, S.color); for (let x = 6; x < 23; x += 4) r(g, x, 5, 2, 6, tr); r(g, 8, 12, 4, 2, '#b6f06a'); r(g, 16, 12, 4, 2, '#b6f06a'); r(g, 10, 15, 8, 5, '#fff3e0'); r(g, 11, 19, 2, 4, '#fff'); r(g, 15, 19, 2, 4, '#fff'); }
      else if (d.set === 'kraken') { for (const x of [3, 8, 18, 23]) r(g, x, 14, 3, 13, '#3a1d62'); ell(g, 14, 10, 10, 8, S.color); ell(g, 14, 10, 4, 3, tr); r(g, 13, 8, 2, 5, '#14082a'); }
      else if (d.set === 'demon') { r(g, 2, 2, 3, 12, '#1d0a12'); r(g, 23, 2, 3, 12, '#1d0a12'); ell(g, 14, 15, 9, 9, S.color); r(g, 9, 13, 4, 2, tr); r(g, 15, 13, 4, 2, tr); for (let x = 9; x < 19; x += 2) r(g, x, 19, 1, 3, '#fff'); }
      else { r(g, 2, 8, 4, 11, tr); r(g, 22, 8, 4, 11, tr); r(g, 11, 13, 6, 5, '#e8b93e'); }
    } else if (d.kind === 'armor') { r(g, 7, 6, 14, 3, d.set === 'dragon' ? '#d9d2bb' : tr); if (d.set === 'dragon') for (let y = 11; y < 22; y += 3) r(g, 8, y, 12, 1, '#d9d2bb'); else { r(g, 11, 11, 6, 7, tr); r(g, 13, 13, 2, 3, '#fff'); } }
    else if (d.kind === 'pants') { r(g, 7, 4, 14, 2, tr); r(g, 7, 20, 6, 2, tr); r(g, 15, 20, 6, 2, tr); }
    else { r(g, 6, 8, 7, 2, tr); r(g, 16, 11, 6, 2, tr); }
  }
  outline(c); iconCache.set(k, c); return c;
}
