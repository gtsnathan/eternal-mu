// Toda a arte do jogo é pixel art original gerada por código: não há arquivo externo.
import { classOf, ITEMS, MOBS, SETS, WING_THEME } from '../shared/data';
import { T, Obj } from '../shared/world';

export type Cv = HTMLCanvasElement;
// ---------- alta resolução: cada sprite ganha o dobro de pixels, com bordas suavizadas ----------
const hdCache = new WeakMap<Cv, Cv>();
export const noHd = new WeakSet<Cv>();
export const gfx = { hd: true, n: 2 as 2 | 3 };
const hd3Cache = new WeakMap<Cv, Cv>();
/** Versão 3× (AdvMAME3x): usada quando cada pixel da arte vira 3 pixels da tela, para ficar nítido sem distorcer. */
export function hd3Of(c: Cv): Cv {
  let h = hd3Cache.get(c); if (h) return h;
  const W = c.width, H = c.height, W3 = W * 3; h = document.createElement('canvas'); h.width = W3; h.height = H * 3;
  const s = new Uint32Array(c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, W, H).data.buffer), gh = h.getContext('2d')!, img = gh.createImageData(W3, H * 3), d = new Uint32Array(img.data.buffer);
  const at = (x: number, y: number) => s[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const A = at(x - 1, y - 1), B = at(x, y - 1), C = at(x + 1, y - 1), D = at(x - 1, y), E = s[y * W + x], F = at(x + 1, y), G = at(x - 1, y + 1), Hh = at(x, y + 1), I = at(x + 1, y + 1);
    const o = y * 3 * W3 + x * 3, r1 = o + W3, r2 = r1 + W3;
    if (B !== Hh && D !== F) {
      d[o] = D === B ? D : E; d[o + 1] = (D === B && E !== C) || (B === F && E !== A) ? B : E; d[o + 2] = B === F ? F : E;
      d[r1] = (D === B && E !== G) || (D === Hh && E !== A) ? D : E; d[r1 + 1] = E; d[r1 + 2] = (B === F && E !== I) || (Hh === F && E !== C) ? F : E;
      d[r2] = D === Hh ? D : E; d[r2 + 1] = (D === Hh && E !== I) || (Hh === F && E !== G) ? Hh : E; d[r2 + 2] = Hh === F ? F : E;
    } else { d[o] = d[o + 1] = d[o + 2] = d[r1] = d[r1 + 1] = d[r1 + 2] = d[r2] = d[r2 + 1] = d[r2 + 2] = E; }
  }
  gh.putImageData(img, 0, 0); hd3Cache.set(c, h); noHd.add(h); return h;
}
export function hdOf(c: Cv): Cv {
  let h = hdCache.get(c); if (h) return h;
  const W = c.width, H = c.height; h = document.createElement('canvas'); h.width = W * 2; h.height = H * 2;
  const s = new Uint32Array(c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, W, H).data.buffer), gh = h.getContext('2d')!, img = gh.createImageData(W * 2, H * 2), d = new Uint32Array(img.data.buffer);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const P = s[y * W + x], A = y ? s[(y - 1) * W + x] : P, D = y < H - 1 ? s[(y + 1) * W + x] : P, L = x ? s[y * W + x - 1] : P, R = x < W - 1 ? s[y * W + x + 1] : P, i = y * 2 * (W * 2) + x * 2, j = i + W * 2;
    d[i] = L === A && L !== D && A !== R ? A : P; d[i + 1] = A === R && A !== L && R !== D ? R : P; d[j] = D === L && D !== R && L !== A ? L : P; d[j + 1] = R === D && R !== A && D !== L ? D : P;
  }
  gh.putImageData(img, 0, 0); hdCache.set(c, h); noHd.add(h); return h;
}
/** Faz o contexto desenhar a versão em alta resolução mantendo as coordenadas originais. */
export function hdCtx(x: CanvasRenderingContext2D) {
  const o = x.drawImage.bind(x) as (...a: any[]) => void;
  (x as any).drawImage = (im: any, ...a: number[]) => {
    if (!gfx.hd || !(im instanceof HTMLCanvasElement) || noHd.has(im) || im.width > 700) return o(im, ...a);
    const n = gfx.n, h = n === 3 ? hd3Of(im) : hdOf(im);
    if (a.length === 2) o(h, a[0], a[1], im.width, im.height); else if (a.length === 4) o(h, ...a); else o(h, a[0] * n, a[1] * n, a[2] * n, a[3] * n, a[4], a[5], a[6], a[7]);
  };
}
const glowCache = new Map<string, Cv>();
/** Luz radial suave; desenhar com composição 'lighter' (ou normal, para sombras). */
export function glowSprite(col: string): Cv {
  let c = glowCache.get(col); if (c) return c; c = cv(64, 64); const g = c.getContext('2d')!, n = parseInt(col.slice(1), 16), rgb = `${n >> 16},${n >> 8 & 255},${n & 255}`, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.45, `rgba(${rgb},.42)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowCache.set(col, c); noHd.add(c); return c;
}
type G = CanvasRenderingContext2D;
export function cv(w: number, h: number): Cv { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const ctx = (c: Cv) => c.getContext('2d', { willReadFrequently: true })!;
const r = (g: G, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
function rng(s: number) { return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function ell(g: G, cx: number, cy: number, rx: number, ry: number, col: string) { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + .3)) ** 2))); r(g, cx - w, cy + y, w * 2, 1, col); } }
/** Dá volume ao sprite: luz de cima/esquerda, sombra embaixo/direita e contorno colorido. */
function outline(c: Cv, col = [24, 18, 34, 255]) {
  const g = ctx(c), d = g.getImageData(0, 0, c.width, c.height), a = d.data, W = c.width, H = c.height, o = new Uint8ClampedArray(a);
  const on = (i: number, j: number) => i >= 0 && j >= 0 && i < W && j < H && a[(j * W + i) * 4 + 3] > 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4;
    if (a[p + 3]) {
      let k = (.5 - y / H) * 16;
      if (!on(x, y - 1) || !on(x - 1, y)) k += 24; else if (!on(x, y + 1) || !on(x + 1, y)) k -= 30;
      o[p] = a[p] + k; o[p + 1] = a[p + 1] + k; o[p + 2] = a[p + 2] + k * .9; continue;
    }
    const q = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].find(([i, j]) => on(i, j));
    if (q) { const n = (q[1] * W + q[0]) * 4; o[p] = a[n] * .26 + col[0] * .74; o[p + 1] = a[n + 1] * .26 + col[1] * .74; o[p + 2] = a[n + 2] * .26 + col[2] * .74; o[p + 3] = 255; }
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
  } else if (t === T.MOSS) {
    r(g, 0, 0, 32, 32, '#2a4a30'); speck(36, ['#2f5436', '#253f2b', '#37603c', '#1f3826']); for (let i = 0; i < 3; i++) { const x = R() * 28 | 0, y = 4 + R() * 24 | 0; r(g, x, y, 1, 3, '#4f7f4a'); r(g, x + 2, y + 1, 1, 2, '#4f7f4a'); }
  } else if (t === T.DUNGEON) {
    r(g, 0, 0, 32, 32, '#2a2733'); for (let row = 0; row < 2; row++) for (let i = -1; i < 2; i++) { const x = i * 16 + (row % 2) * 8 + 1, y = row * 16 + 1, sh = ['#45404f', '#3e3a48', '#4a4555', '#413c4b'][R() * 4 | 0]; r(g, x, y, 14, 14, sh); r(g, x, y, 14, 1, '#57525f'); r(g, x, y + 13, 14, 1, '#36323f'); }
  } else if (t === T.MARBLE) {
    r(g, 0, 0, 32, 32, '#7f7890'); for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { r(g, a * 16 + 1, b * 16 + 1, 14, 14, ['#b9b3c8', '#b2acc2', '#c0bacd', '#aca6bc'][R() * 4 | 0]); r(g, a * 16 + 1, b * 16 + 1, 14, 1, '#d6d1e2'); r(g, a * 16 + 1, b * 16 + 14, 14, 1, '#918aa3'); } r(g, 15, 15, 2, 2, '#d9b45a'); let vx = R() * 30, vy = 0; for (let i = 0; i < 18; i++) { r(g, vx | 0, vy | 0, 1, 1, '#958ea8'); vx += R() * 3 - 1.5; vy += 1.6; } 
  } else if (t === T.CLOUD) {
    r(g, 0, 0, 32, 32, '#5f84c8'); for (let i = 0; i < 5; i++) { const x = (i * 13 + frame * 4 + v * 7) % 32, y = (i * 9 + 4) % 28; ell(g, x, y, 8, 3, '#8fb0e4'); ell(g, (x + 14) % 32, (y + 12) % 30, 6, 2, '#c8dcf6'); }
  } else if (t === T.DWALL) {
    r(g, 0, 0, 32, 32, '#14121c'); r(g, 0, 0, 32, 2, '#221e2c'); speck(10, ['#1c1926', '#100e17']);
    if (v === 7) { r(g, 0, 8, 32, 24, '#3a3545'); for (let y = 0; y < 3; y++) for (let x = -1; x < 3; x++) { const bx = x * 16 + (y % 2) * 8 + 1; r(g, bx, 9 + y * 8, 14, 6, y % 2 ? '#4a4556' : '#443f50'); r(g, bx, 9 + y * 8, 14, 1, '#5a5566'); } r(g, 0, 30, 32, 2, '#16131d'); r(g, 0, 6, 32, 2, '#574f63'); }
  } else if (t === T.SAND) {
    r(g, 0, 0, 32, 32, '#d9bc7a'); speck(44, ['#e4ca8c', '#ccac68', '#efd9a2', '#c2a05e']); if (v % 2) for (let y = 7 + v * 3; y < 30; y += 11) for (let x = 0; x < 32; x++) r(g, x, y + Math.round(Math.sin(x * .4 + v) * 1.4), 1, 1, '#b9975a');
  } else if (t === T.ASH) {
    r(g, 0, 0, 32, 32, '#3a3136'); speck(40, ['#453a3f', '#2f282d', '#4e4247']);
    if (v % 2) { let x = 4 + R() * 20, y = 2; for (let i = 0; i < 24; i++) { r(g, x | 0, y | 0, 1, 1, v === 3 ? '#b8431c' : '#231d21'); x += R() * 2 - 1; y += 1.1; } }
  } else if (t === T.LAVA) {
    r(g, 0, 0, 32, 32, '#d8481a'); const q = frame * 8 + v * 5;
    for (let i = 0; i < 6; i++) { const x = (i * 11 + q) % 28, y = (i * 7 + frame * 3 + 2) % 28; r(g, x, y, 9, 4, '#ff8a2b'); r(g, x + 2, y + 1, 5, 2, '#ffd76a'); }
    for (let i = 0; i < 4; i++) r(g, (i * 17 + q * 2) % 30, (i * 13 + 5) % 30, 6, 2, '#9c2a12');
  } else {
    r(g, 0, 0, 32, 32, '#2f74b5'); r(g, 0, 0, 32, 10, '#3580c0'); r(g, 0, 22, 32, 10, '#2a6aa8'); const f = frame * 8;
    for (let i = 0; i < 7; i++) { const x = (i * 13 + f + v * 5) % 32, y = (i * 9 + 3) % 30; r(g, x, y, 7, 1, '#5ba3dc'); r(g, (x + 16) % 32, (y + 15) % 31, 4, 1, '#8cc6ee'); if (i % 3 === 0) r(g, (x + 5) % 31, (y + 7) % 31, 2, 1, '#e6f6ff'); }
  }
  tileCache.set(k, c); return c;
}

const PRIO = [1, 3, 0, 3, 1, 2, 0, 2, 1, 3, 3, 0, -1, 2]; // GRASS, STONE, WATER, SNOW, ICE, DIRT
export const tilePrio = (t: number) => PRIO[t];
const edgeCache = new Map<number, Cv>();
/** Borda irregular do terreno vizinho (0 cima, 1 baixo, 2 esquerda, 3 direita) sobre este tile. */
export function edge(t: number, side: number, water: boolean): Cv {
  const k = t * 100 + side * 10 + (water ? 1 : 0); let c = edgeCache.get(k); if (c) return c;
  c = cv(32, 32); const g = ctx(c), src = tile(t, 1, 0), R = rng(k + 3), rim = water ? '#d6eefb' : t === T.STONE ? '#5f584e' : t === T.DIRT ? '#6f5535' : t === T.ASH ? '#ff7a2b' : t === T.MARBLE ? '#d9c98f' : t === T.MOSS ? '#1a3320' : t === T.SNOW ? '#b7c9de' : t === T.SAND ? '#b8975a' : '#3b6c33';
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
export function pressSprite(): Cv { return memo('press', () => { const c = cv(52, 62), g = ctx(c); r(g, 6, 44, 40, 16, '#4a4656'); r(g, 6, 44, 40, 3, '#726c82'); r(g, 9, 8, 6, 38, '#5a5668'); r(g, 37, 8, 6, 38, '#5a5668'); r(g, 6, 4, 40, 8, '#6a6478'); r(g, 6, 4, 40, 2, '#928aa4'); r(g, 22, 12, 8, 14, '#8a8498'); r(g, 16, 25, 20, 6, '#c9a44c'); r(g, 16, 25, 20, 2, '#f0cf65'); r(g, 18, 37, 16, 7, '#2a2733'); for (const [x, col] of [[20, '#ffe08a'], [25, '#6fd6ff'], [30, '#d86bff']] as [number, string][]) r(g, x, 38, 3, 3, col); r(g, 44, 18, 6, 3, '#726c82'); r(g, 48, 12, 3, 16, '#726c82'); return outline(c); }); }
export function chestSprite(): Cv { return memo('chest', () => { const c = cv(44, 40), g = ctx(c); r(g, 3, 16, 38, 22, '#7a5230'); for (let x = 3; x < 41; x += 8) r(g, x, 16, 1, 22, '#5a3b20'); r(g, 3, 6, 38, 11, '#946539'); r(g, 3, 6, 38, 2, '#b58452'); r(g, 3, 16, 38, 3, '#c9a44c'); r(g, 3, 34, 38, 3, '#c9a44c'); r(g, 3, 6, 4, 32, '#c9a44c'); r(g, 37, 6, 4, 32, '#c9a44c'); r(g, 18, 13, 8, 11, '#f0cf65'); r(g, 21, 17, 2, 4, '#5a3b20'); return outline(c); }); }
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
  else if (kind === 'spirits') { for (let i = 0; i < 3; i++) { const an = i * 2.094 + .5, x = 16 + Math.cos(an) * 8, y = 15 + Math.sin(an) * 7; ell(g, x, y, 4, 5, i ? a : '#eefaff'); r(g, x - 4, y + 3, 8, 3, i ? a : '#eefaff'); r(g, x - 2, y - 1, 1, 2, '#10162a'); r(g, x + 1, y - 1, 1, 2, '#10162a'); } }
  else if (kind === 'cone') { for (let t = 0; t < 26; t++) { const q = -1.9 + t / 26 * 2.3, R0 = 12 - Math.abs(t - 13) * .25; r(g, 8 + Math.cos(q) * R0, 24 + Math.sin(q) * R0, 3, 3, t > 8 && t < 18 ? '#fff' : a); } r(g, 5, 22, 4, 4, shade(a, -40)); }
  else if (kind === 'chain') { for (let i = 0; i < 5; i++) { const x = 4 + i * 5, y = 24 - i * 5; r(g, x, y, 6, 4, i % 2 ? '#2a1838' : a); r(g, x + 1, y + 1, 4, 2, i % 2 ? a : shade(a, -70)); } }
  else if (kind === 'wave') { for (let i = 0; i < 18; i++) r(g, 5 + i, 25 - i, 3, 3, i > 13 ? '#fff' : a); r(g, 4, 22, 6, 6, shade(a, -40)); for (let i = 0; i < 3; i++) r(g, 12 + i * 5, 23 - i * 5 - 6, 2, 2, '#ffe9a8'); }
  else if (kind === 'summon') { ell(g, 16, 16, 12, 12, shade(a, -60)); ell(g, 16, 14, 7, 7, a); r(g, 12, 12, 3, 3, '#14102a'); r(g, 18, 12, 3, 3, '#14102a'); r(g, 9, 23, 14, 3, a); }
  else { ell(g, 16, 16, 11, 11, a); ell(g, 16, 16, 7, 7, '#1d1030'); r(g, 13, 12, 2, 8, a); r(g, 18, 12, 2, 8, a); }
  return c;
}

// ---------- objetos ----------
const objCache = new Map<string, Cv>();
function memo(k: string, f: () => Cv) { let c = objCache.get(k); if (!c) { c = f(); objCache.set(k, c); } return c; }
export function objSprite(o: Obj): { c: Cv; ox: number; oy: number; sway: number } {
  if (o.k === 'tree') return { c: memo('tree' + o.v, () => { const c = cv(56, 72), g = ctx(c), pal = [['#2f6b34', '#3f8740', '#59a652'], ['#2c6440', '#3a7f55', '#58a374'], ['#4f7430', '#6c9238', '#8fb14a']][o.v], R = rng(o.v + 5); r(g, 24, 46, 9, 22, '#5b3d24'); r(g, 24, 46, 3, 22, '#7a5533'); ell(g, 28, 30, 24, 22, pal[0]); ell(g, 25, 26, 19, 17, pal[1]); ell(g, 21, 21, 11, 9, pal[2]); for (let i = 0; i < 26; i++) r(g, 8 + R() * 40 | 0, 12 + R() * 34 | 0, 3, 2, pal[R() * 3 | 0]); return outline(c); }), ox: -12, oy: -40, sway: 1 };
  if (o.k === 'palm') return { c: memo('palm' + o.v, () => { const c = cv(64, 80), g = ctx(c), a = o.v ? '#3f9a4a' : '#2f8a48', b = o.v ? '#6cc05a' : '#58b264'; for (let y = 24; y < 76; y++) { const x = 30 + Math.round(Math.sin(y * .07) * 3); r(g, x, y, 6, 1, y % 6 < 2 ? '#6b4a2b' : '#8a6238'); } for (const [dx, dy] of [[-1, -.2], [1, -.2], [-1, .35], [1, .35], [-.5, -.7], [.5, -.7]] as number[][]) for (let i = 0; i < 28; i++) { const x = 33 + dx * i, y = 24 + dy * i + i * i * .025; r(g, x, y - 2, 3, 4 - i * .1, i % 3 ? a : b); } ell(g, 33, 25, 4, 3, '#5a3c20'); return outline(c); }), ox: -16, oy: -48, sway: 1 };
  if (o.k === 'pine') return { c: memo('pine' + o.v, () => { const c = cv(48, 72), g = ctx(c), R = rng(o.v * 7 + 3); r(g, 21, 56, 7, 13, '#4f3a2a'); for (let t = 0; t < 4; t++) { const y = 8 + t * 13, w = 8 + t * 5; for (let i = 0; i < 20; i++) { const hw = Math.round(w * i / 19); r(g, 24 - hw, y + i, hw * 2, 1, i < 7 ? '#eef5fb' : (i + t) % 5 ? '#23584f' : '#1b4a44'); } for (let i = 0; i < 5; i++) r(g, 24 - w * .55 + R() * w * 1.1 | 0, y + 8 + R() * 8 | 0, 3, 2, '#dfeaf4'); } return outline(c); }), ox: -8, oy: -40, sway: 1 };
  if (o.k === 'rock') return { c: memo('rock' + o.v, () => { const c = cv(36, 32), g = ctx(c); ell(g, 18, 18, 15, 11, '#6f7c8c'); ell(g, 16, 15, 11, 8, '#8c9aab'); ell(g, 15, 11, 9, 4, '#eef5fb'); r(g, 20, 21, 7, 1, '#556170'); return outline(c); }), ox: -2, oy: -4, sway: 0 };
  if (o.k === 'lamp') return { c: memo('lamp', () => { const c = cv(24, 66), g = ctx(c); r(g, 10, 16, 4, 46, '#3c3a48'); r(g, 11, 16, 1, 46, '#646272'); r(g, 6, 60, 12, 5, '#3c3a48'); r(g, 5, 8, 14, 12, '#3c3a48'); r(g, 7, 10, 10, 8, '#ffd98a'); r(g, 8, 11, 3, 5, '#fff3c8'); r(g, 3, 5, 18, 3, '#2b2a36'); r(g, 9, 1, 6, 4, '#2b2a36'); return outline(c); }), ox: 4, oy: -36, sway: 0 };
  if (o.k === 'barrel') return { c: memo('barrel' + o.v, () => { const c = cv(30, 36), g = ctx(c), w = o.v ? '#8a5f36' : '#74502e'; r(g, 4, 6, 22, 28, w); r(g, 2, 12, 26, 16, shade(w, 12)); r(g, 2, 12, 26, 3, '#5c5a66'); r(g, 2, 25, 26, 3, '#5c5a66'); ell(g, 15, 6, 11, 4, shade(w, 30)); for (let x = 8; x < 26; x += 5) r(g, x, 10, 1, 24, shade(w, -30)); return outline(c); }), ox: 1, oy: -6, sway: 0 };
  if (o.k === 'stall') return { c: memo('stall' + o.v, () => { const c = cv(104, 92), g = ctx(c), a = o.v ? '#c4593d' : '#3e86b0'; for (const x of [6, 92]) r(g, x, 28, 5, 60, '#5b3d24'); r(g, 2, 58, 100, 26, '#7a5533'); r(g, 2, 58, 100, 4, '#a4784c'); for (let x = 0; x < 13; x++) { r(g, 2 + x * 8, 4, 8, 28, x % 2 ? a : '#efe6d2'); r(g, 2 + x * 8, 32, 8, 4 + x % 2 * 2, x % 2 ? shade(a, -30) : '#cfc5ae'); } const it = o.v ? ['#d9483b', '#e0a93a', '#79b94a'] : ['#8fd0ff', '#e0425a', '#b58cff']; for (let i = 0; i < 11; i++) { ell(g, 11 + i * 8, 53 + i % 2, 4, 4, it[i % 3]); r(g, 9 + i * 8, 50 + i % 2, 2, 2, '#fff'); } return outline(c); }), ox: 0, oy: -28, sway: 0 };
  if (o.k === 'spire') return { c: memo('spire' + o.v, () => { const c = cv(40, 72), g = ctx(c), R = rng(o.v + 91); for (let y = 0; y < 62; y++) { const w = Math.round(3 + y * .24 + Math.sin(y / 5 + o.v) * 1.4); r(g, 20 - w, 8 + y, w * 2, 1, '#2a2328'); r(g, 20 - w, 8 + y, Math.max(2, w >> 1), 1, '#463c42'); } let x = 18, y = 22; for (let i = 0; i < 36; i++) { r(g, x | 0, y | 0, 2, 2, i % 3 ? '#ff7a2b' : '#ffd76a'); x += R() * 3 - 1.5; y += 1.2; } return outline(c, [15, 8, 12, 255]); }), ox: -4, oy: -40, sway: 0 };
  if (o.k === 'deadtree') return { c: memo('dead' + o.v, () => { const c = cv(48, 68), g = ctx(c), k = '#231c1f'; r(g, 21, 26, 7, 40, k); r(g, 22, 26, 2, 40, '#3c3236'); for (const [x, y, w, d] of [[8, 26, 14, 1], [26, 18, 14, -1], [14, 12, 10, 1], [28, 34, 12, -1]] as number[][]) { r(g, x, y, w, 4, k); r(g, d > 0 ? x : x + w - 4, y - 8, 4, 9, k); } r(g, 21, 6, 5, 22, k); if (o.v) { r(g, 23, 36, 2, 10, '#ff7a2b'); r(g, 23, 40, 2, 3, '#ffd76a'); } return outline(c, [15, 8, 12, 255]); }), ox: -8, oy: -36, sway: 0 };
  if (o.k === 'oak') return { c: memo('oak' + o.v, () => { const c = cv(72, 96), g = ctx(c), R = rng(o.v + 31), pal = [['#16392a', '#1f4f38', '#2f6b48'], ['#1a3f2c', '#25593c', '#3a7a50'], ['#123228', '#1a4636', '#2a5f4a']][o.v]; r(g, 30, 56, 13, 36, '#2e2319'); r(g, 30, 56, 4, 36, '#4a3a28'); r(g, 22, 86, 28, 6, '#2e2319'); ell(g, 36, 40, 32, 30, pal[0]); ell(g, 33, 34, 26, 24, pal[1]); ell(g, 27, 26, 15, 13, pal[2]); for (let i = 0; i < 40; i++) r(g, 10 + R() * 52 | 0, 14 + R() * 46 | 0, 4, 2, pal[R() * 3 | 0]); return outline(c); }), ox: -20, oy: -62, sway: 1 };
  if (o.k === 'shroom') return { c: memo('shr' + o.v, () => { const c = cv(44, 60), g = ctx(c), cp = o.v ? '#3fd6c0' : '#b06bff'; r(g, 18, 26, 9, 32, '#d6d0c0'); r(g, 18, 26, 3, 32, '#efe9dc'); ell(g, 22, 22, 20, 14, cp); ell(g, 19, 17, 12, 7, shade(cp, 40)); r(g, 3, 28, 38, 3, shade(cp, -50)); for (const [x, y] of [[10, 16], [28, 12], [33, 21], [20, 24]]) ell(g, x, y, 2, 2, '#fff'); return outline(c); }), ox: -6, oy: -28, sway: 0 };
  if (o.k === 'torch') return { c: memo('torch', () => { const c = cv(32, 44), g = ctx(c); r(g, 13, 22, 6, 18, '#5a4a3a'); r(g, 11, 18, 10, 5, '#3c3448'); ell(g, 16, 11, 6, 9, '#ff8a2b'); ell(g, 16, 13, 3, 6, '#ffe08a'); return c; }), ox: 0, oy: -6, sway: 0 };
  if (o.k === 'pillar') return { c: memo('pil' + o.v, () => { const c = cv(40, 84), g = ctx(c), a = o.v ? '#5b5668' : '#ded9e8', b = o.v ? '#3c3847' : '#b4aec4', l = o.v ? '#756f83' : '#ffffff'; r(g, 4, 72, 32, 10, b); r(g, 4, 72, 32, 2, l); r(g, 9, 14, 22, 58, a); for (let x = 11; x < 30; x += 5) { r(g, x, 14, 2, 58, b); r(g, x + 2, 14, 1, 58, l); } r(g, 4, 4, 32, 10, a); r(g, 4, 4, 32, 2, l); r(g, 4, 12, 32, 2, b); if (!o.v) { r(g, 6, 9, 28, 2, '#d9b24a'); } return outline(c); }), ox: -4, oy: -52, sway: 0 };
  if (o.k === 'statue') return { c: memo('statue', () => { const c = cv(56, 92), g = ctx(c), a = '#d6d1e0', b = '#a8a2b8'; r(g, 12, 76, 32, 14, b); r(g, 12, 76, 32, 2, '#fff'); for (const s of [-1, 1]) for (let i = 0; i < 18; i++) r(g, 28 + s * (6 + i) - (s < 0 ? 1 : 0), 18 + i * .5, 1, 34 - i, i % 4 ? a : b); r(g, 20, 32, 16, 44, a); r(g, 20, 32, 4, 44, '#efebf5'); r(g, 22, 18, 12, 14, a); r(g, 20, 14, 16, 3, '#d9b24a'); r(g, 26, 2, 4, 24, '#d9b24a'); r(g, 22, 6, 12, 3, '#d9b24a'); return outline(c); }), ox: -12, oy: -58, sway: 0 };
  if (o.k === 'wall') return { c: memo('wall', () => { const c = cv(32, 56), g = ctx(c); r(g, 0, 8, 32, 48, '#8b8478'); for (let y = 0; y < 5; y++) for (let x = -1; x < 2; x++) { const bx = x * 16 + (y % 2) * 8; r(g, bx + 1, 13 + y * 9, 14, 8, y % 3 ? '#a39b8c' : '#978f81'); } r(g, 0, 8, 32, 5, '#c0b8a8'); r(g, 2, 0, 11, 9, '#b2aa9a'); r(g, 19, 0, 11, 9, '#b2aa9a'); return c; }), ox: 0, oy: -24, sway: 0 };
  if (o.k === 'fountain') return { c: memo('fount', () => { const c = cv(112, 124), g = ctx(c); const a = 8; for (const [x, y, w, h] of [[a, 28, 96, 8], [a, 116, 96, 8], [a, 28, 8, 96], [a + 88, 28, 8, 96]]) { r(g, x, y, w, h, '#a39b8c'); r(g, x, y, w, 2, '#d0c8b8'); } r(g, 48, 40, 16, 30, '#b5ad9d'); r(g, 50, 40, 4, 30, '#d0c8b8'); ell(g, 56, 70, 13, 4, '#8c8476'); ell(g, 56, 40, 22, 8, '#b5ad9d'); ell(g, 56, 38, 18, 5, '#5ba3dc'); ell(g, 56, 18, 9, 11, '#c8c0b0'); r(g, 54, 2, 4, 8, '#7fd0ff'); return outline(c); }), ox: -8, oy: -28, sway: 0 };
  // casa: telhado + fachada
  return { c: memo(`h${o.w}${o.h}${o.v}`, () => {
    const W = o.w * 32, H = o.h * 32 + 40, c = cv(W + 8, H), g = ctx(c), pal = [['#a4442f', '#c4593d', '#7d3022'], ['#2f6a8f', '#3e86b0', '#234f6c'], ['#5e7a3a', '#789a4a', '#465c2b']][o.v];
    const wallY = H - 54; r(g, 4, wallY, W, 54, '#d6c7a4');
    for (let x = 0; x < W; x += 28) r(g, 4 + x, wallY, 4, 54, '#7d5a3a');
    r(g, 4, wallY + 24, W, 4, '#7d5a3a'); r(g, 4, H - 6, W, 6, '#7a7468');
    r(g, W - 46, 4, 16, 28, '#6d5f54'); r(g, W - 46, 4, 16, 4, '#9a8a7a'); r(g, W - 44, 0, 12, 5, '#3c342e');
    for (const wx of [14, W - 32]) { r(g, wx, wallY + 23, 24, 5, '#6b4a2b'); for (let i = 0; i < 6; i++) r(g, wx + 1 + i * 4, wallY + 19 + (i % 2), 3, 4, ['#e0425a', '#f4e36b', '#f2a0c0'][i % 3]); r(g, wx, wallY + 22, 24, 1, '#3f8740'); }
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
const weaponCache = new Map<string, Cv>();
/** Desenho de cada arma, mais ornamentado quanto maior o nível. */
export function weaponSprite(key: string): Cv {
  let c = weaponCache.get(key); if (c) return c; c = cv(25, 52); const g = ctx(c), d = ITEMS[key], H = 52, m = 12, col = d.blade!, t = d.lvl >= 90 ? 4 : d.lvl >= 44 ? 3 : d.lvl >= 18 ? 2 : d.lvl >= 8 ? 1 : 0, lt = shade(col, 45), dk = shade(col, -55), gold = t >= 2 ? '#f0cf65' : '#b08a3c', wood = '#6b4a2b';
  if (d.wtype === 'staff') {
    const top = 14 - t; r(g, m - 1, top, 3, H - top - 1, wood); r(g, m - 1, top, 1, H - top - 1, '#8f6a42'); for (let y = top + 6; y < H - 4; y += 7) r(g, m - 1, y, 3, 1, gold);
    r(g, m - 4 - t, top - 1, 9 + t * 2, 2, gold); r(g, m - 4 - t, top - 7, 2, 7, gold); r(g, m + 3 + t, top - 7, 2, 7, gold); ell(g, m + 1, top - 7, 4 + (t >> 1), 4 + (t >> 1), col); ell(g, m, top - 8, 2, 2, lt); r(g, m - 1, top - 10, 2, 2, '#fff');
    if (t >= 2) for (const sx of [-1, 1]) { r(g, m + sx * 9, top - 4, 3, 2, gold); r(g, m + sx * 11, top - 8, 2, 5, lt); }
  } else if (d.wtype === 'bow') {
    const len = 30 + t * 3, cy = 34, top = cy - (len >> 1); for (let i = 0; i < len; i++) { const b = Math.round(Math.sin(i / (len - 1) * Math.PI) * (7 + t)); r(g, m - 7 + b, top + i, 3, 1, i % 6 < 3 ? col : dk); r(g, m - 7 + b, top + i, 1, 1, lt); }
    r(g, m - 7, top, 1, len, '#efe9d8'); r(g, m - 1 + t, cy - 3, 4, 7, wood); r(g, m - 8, top - 2, 3, 3, gold); r(g, m - 8, top + len - 1, 3, 3, gold);
    if (t >= 2) { r(g, m + 2 + t, cy - 1, 4, 3, gold); ell(g, m + 5 + t, cy, 2, 2, lt); }
  } else if (d.wtype === 'mace') {
    const R0 = 4 + (t >> 1), hy = 6 + R0; // centro da cabeça
    r(g, m - 1, hy + 2, 3, H - hy - 3, wood); r(g, m - 1, hy + 2, 1, H - hy - 3, '#8f6a42'); for (let y = H - 14; y < H - 3; y += 2) r(g, m - 1, y, 3, 1, '#3a2a1c');
    r(g, m - 2, H - 3, 5, 3, gold); r(g, m - 2, hy + R0 + 1, 5, 2, gold); if (t >= 3) r(g, m - 2, hy + R0 + 7, 5, 1, gold);
    if (t >= 2) for (const sx of [-1, 1]) for (let j = -R0 - 1; j <= R0 + 1; j++) { const w = Math.max(1, Math.round(R0 + 2 - Math.abs(j) * .55)); r(g, sx > 0 ? m + 1 : m - w, hy + j, w, 1, j < 0 ? lt : dk); }
    ell(g, m, hy, R0, R0, col); ell(g, m - 1, hy - 1, Math.max(1, R0 - 2), Math.max(1, R0 - 2), lt); r(g, m - 2, hy - 2, 2, 2, '#fff');
    const sp = t >= 1 ? 8 : 4; for (let i = 0; i < sp; i++) { const a = i / sp * 6.283 + (t >= 1 ? 0 : .785), x = m + Math.cos(a) * (R0 + 1.6), y = hy + Math.sin(a) * (R0 + 1.6); r(g, Math.round(x) - 1, Math.round(y) - 1, 2, 2, t >= 3 ? gold : dk); }
    if (t >= 3) { r(g, m - 1, hy - R0 - 6, 2, 4, gold); r(g, m - 1, hy - R0 - 7, 2, 1, '#fff'); }
  } else if (d.wtype === 'spear') {
    const bl = 10 + t, by = 2, sock = by + bl;
    r(g, m, sock, 2, H - sock - 1, wood); r(g, m, sock, 1, H - sock - 1, '#8f6a42'); for (let y = sock + 9; y < H - 3; y += 9) r(g, m - 1, y, 4, 1, gold); r(g, m - 1, H - 3, 4, 3, gold);
    for (let y = 0; y < bl; y++) { const u = y / bl, hw = Math.round((u < .7 ? Math.sin(u / .7 * Math.PI / 2) : (1 - u) / .3) * (2 + (t >> 1))); for (let x = -hw; x <= hw + 1; x++) r(g, m + x, by + y, 1, 1, x <= 0 ? (x === -hw ? '#fff' : lt) : x === hw + 1 ? dk : col); }
    r(g, m - 1, sock, 4, 3, gold);
    if (t >= 1) { r(g, m - 3 - t, sock + 3, 8 + t * 2, 2, gold); r(g, m - 3 - t, sock + 1, 2, 2, gold); r(g, m + 3 + t, sock + 1, 2, 2, gold); }
    if (t >= 2) for (let i = 0; i < 7; i++) { r(g, m - 2 - (i % 2), sock + 5 + i, 1, 1, col); r(g, m + 3 + (i % 2), sock + 5 + i, 1, 1, col); }
    if (t >= 3) for (let j = -4; j <= 4; j++) { const w = 5 - Math.abs(j); r(g, m - 1 - w, sock + 9 + j, w, 1, j < 0 ? lt : col); }
  } else if (d.wtype === 'gsword') {
    const L = 28 + t * 3, tip = H - 12 - L, hw0 = 3 + (t >= 3 ? 1 : 0), gw = 6 + t;
    r(g, m - 1, H - 4, 3, 3, gold); ell(g, m, H - 2, 2, 1, t >= 2 ? col : gold); r(g, m - 1, H - 10, 3, 6, wood); for (let y = H - 10; y < H - 4; y += 2) r(g, m - 1, y, 3, 1, '#3a2a1c');
    for (let y = tip; y < H - 12; y++) { const u = (y - tip) / L, hw = u < .1 ? Math.round(u / .1 * hw0) : hw0 + (t >= 3 && y % 6 < 2 ? 1 : 0); for (let x = -hw; x <= hw; x++) r(g, m + x, y, 1, 1, x === 0 ? (u > .1 ? dk : '#fff') : x < 0 ? (x === -hw ? '#fff' : lt) : x === hw ? dk : col); }
    if (t >= 2) for (let y = tip + 8; y < H - 16; y += 6) r(g, m, y, 1, 2, t >= 4 ? '#fff' : gold);
    r(g, m - gw, H - 12, gw * 2 + 1, 2, gold); r(g, m - gw - 1, H - 15, 2, 4, gold); r(g, m + gw, H - 15, 2, 4, gold); if (t >= 1) ell(g, m, H - 11, 2, 2, t >= 2 ? col : gold); if (t >= 3) { r(g, m - gw - 2, H - 17, 2, 2, lt); r(g, m + gw + 1, H - 17, 2, 2, lt); }
  } else if (d.wtype === 'scepter') {
    const R0 = 3 + (t >> 1), oy = 8 + R0, shaft = t >= 2 ? '#cfc6dd' : wood;
    r(g, m - 1, oy + 4, 3, H - oy - 5, shaft); r(g, m - 1, oy + 4, 1, H - oy - 5, shade(shaft, 35)); for (let y = oy + 10; y < H - 5; y += 6) r(g, m - 2, y, 5, 1, gold); r(g, m - 2, H - 5, 5, 4, gold); r(g, m, H - 2, 1, 1, col);
    if (t >= 2) for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) r(g, m + sx * (R0 + 3 + i) - (sx < 0 ? 1 : 0), oy + 2 - i, 2, 5 - (i >> 1), i % 2 ? lt : '#ffffff');
    for (let j = 0; j <= 10; j++) { const a = -1 + j / 10 * 2; for (const sx of [-1, 1]) r(g, Math.round(m + sx * Math.cos(a) * (R0 + 2)) - (sx < 0 ? 1 : 0), Math.round(oy + Math.sin(a) * (R0 + 2)), 2, 2, gold); }
    ell(g, m, oy, R0, R0, col); ell(g, m - 1, oy - 1, Math.max(1, R0 - 1), Math.max(1, R0 - 1), lt); r(g, m - 2, oy - 2, 2, 1, '#fff');
    if (t >= 3) { r(g, m - 3, oy - R0 - 4, 1, 3, gold); r(g, m, oy - R0 - 6, 1, 5, gold); r(g, m + 3, oy - R0 - 4, 1, 3, gold); }
  } else if (d.wtype === 'crossbow') {
    const ly = 18 - (t >> 1), span = 9 + (t >> 1);
    r(g, m - 1, ly - 2, 4, H - ly + 1, wood); r(g, m - 1, ly - 2, 1, H - ly + 1, '#8f6a42'); r(g, m - 2, H - 12, 6, 12, shade(wood, -15)); r(g, m + 3, H - 21, 2, 5, '#2c2632');
    if (t >= 2) { r(g, m - 1, ly + 4, 4, 2, gold); r(g, m - 2, H - 13, 6, 1, gold); }
    const limb = (yo: number, sp: number) => { for (const sx of [-1, 1]) for (let i = 0; i <= sp; i++) r(g, m + 1 + sx * i - (sx < 0 ? 1 : 0), ly + yo + Math.round((i / sp) ** 2 * 5), 2, 2, i % 4 < 2 ? col : dk); };
    limb(0, span); if (t >= 3) limb(3, span - 2);
    for (const sx of [-1, 1]) for (let i = 0; i <= 10; i++) { const u = i / 10; r(g, Math.round(m + 1 + sx * span * (1 - u)) - (sx < 0 ? 1 : 0), Math.round(ly + 5 + u * 6), 1, 1, '#efe9d8'); }
    r(g, m, ly - 12, 2, 23, '#e8e0c8'); r(g, m - 1, ly - 13, 4, 2, col); r(g, m, ly - 15, 2, 2, lt); r(g, m - 1, ly + 8, 1, 3, col); r(g, m + 2, ly + 8, 1, 3, col);
    if (t >= 2) { r(g, m - span - 1, ly + 4, 2, 2, gold); r(g, m + span + 1, ly + 4, 2, 2, gold); } if (t >= 4) ell(g, m + 1, ly + 1, 2, 2, lt);
  } else if (d.wtype === 'axe') {
    const top = 14 - t * 2; r(g, m - 1, top, 3, H - top - 1, wood); r(g, m - 1, top, 1, H - top - 1, '#8f6a42'); r(g, m - 2, H - 3, 5, 3, gold);
    const R0 = 8 + t, cy = top + 7, side = (sgn: number) => { for (let j = -R0; j <= R0; j++) { const w = Math.round(Math.sqrt(R0 * R0 - j * j) * .78) + 2; for (let i = 2; i < w + 2; i++) r(g, m + 1 + sgn * i, cy + j, 1, 1, i >= w ? lt : i < 4 ? dk : col); } }; side(1); if (t >= 1) side(-1);
    r(g, m, top - 6 - t, 2, 8, lt); if (t >= 2) { r(g, m - 1, cy - 1, 4, 3, gold); r(g, m, cy, 2, 1, '#fff'); }
  } else {
    const L = 22 + t * 4, tip = H - 11 - L; r(g, m - 1, H - 3, 3, 3, gold); r(g, m - 1, H - 9, 3, 6, wood); r(g, m - 1, H - 8, 3, 1, '#a07a4c'); r(g, m - 1, H - 6, 3, 1, '#a07a4c'); r(g, m - 4 - t, H - 11, 9 + t * 2, 2, gold); if (t >= 2) { r(g, m, H - 11, 1, 2, col); r(g, m - 4 - t, H - 13, 2, 3, gold); r(g, m + 3 + t, H - 13, 2, 3, gold); }
    for (let y = tip; y < H - 11; y++) { const u = (y - tip) / L, hw = u < .14 ? Math.max(0, Math.round(u / .14 * (2 + (t >> 1)))) : 2 + (t >> 1) - (t === 3 && (y % 7 < 2) ? 1 : 0); for (let x = -hw; x <= hw; x++) r(g, m + x, y, 1, 1, x < 0 ? lt : x > 0 ? (x === hw ? dk : col) : '#fff'); }
    if (t >= 1) for (let y = tip + 6; y < H - 14; y += 5) r(g, m, y, 1, 2, dk);
  }
  if (t >= 4) for (const [x, y] of [[m - 7, 6], [m + 8, 13], [m - 6, 24], [m + 7, 31]] as [number, number][]) { r(g, x, y - 1, 1, 3, lt); r(g, x - 1, y, 3, 1, lt); r(g, x, y, 1, 1, '#fff'); } // brilho das armas lendárias
  if (d.lvl >= 200) for (const [x, y] of [[m + 9, 4], [m - 9, 15], [m + 9, 22], [m - 8, 36], [m + 6, 42]] as [number, number][]) { r(g, x, y, 2, 2, col); r(g, x, y, 1, 1, '#fff'); } // armas dos mundos mais altos: brilho extra
  weaponCache.set(key, c); return c;
}
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
    if (!wd) return; const w = weaponSprite(o.weapon!), ranged = wd.wtype === 'bow' || wd.wtype === 'crossbow', grip = wd.wtype === 'bow' ? 34 : wd.wtype === 'crossbow' ? 37 : w.height - 8;
    if (horiz && !ranged) { g.save(); g.translate(x, y + 4); g.rotate(s > 0 ? Math.PI / 2 : -Math.PI / 2); g.drawImage(w, -(w.width >> 1), -grip); g.restore(); }
    else g.drawImage(w, x + 2 - (w.width >> 1), y + 14 - grip + (horiz ? 4 : 0));
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
    else if (['boar', 'minotaur', 'fox', 'sphinx', 'deer', 'hummingbird', 'falcon', 'wyvern', 'skull', 'reaper', 'mammoth', 'titan', 'djinn', 'oracle', 'peacock', 'unicorn', 'rhino', 'basilisk', 'mummy', 'lich'].includes(a)) { if (dir !== 1) { r(g, mid - 3, Y + 23, 9, 6, t); r(g, mid - 1, Y + 24, 5, 4, armor); r(g, mid, Y + 25, 3, 2, '#fff'); } for (let y = 23; y < 29; y += 3) { r(g, X + tx + 1, Y + y, 2, 1, t); r(g, X + tx + tw - 3, Y + y, 2, 1, t); } }
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
    } else if (a === 'boar' || a === 'minotaur') {
      const b = a === 'boar' ? '#6a5a4e' : '#5a2a1e', tusk = '#efe6cc'; r(g, h0 - 2, Y + 3, hw + 4, 12, b); r(g, h0 - 3, Y + 1, 5, 5, b); if (dir !== 2) r(g, h0 + hw - 2, Y + 1, 5, 5, b);
      if (a === 'minotaur') for (const sx of (dir === 2 ? [-1] : [-1, 1])) { const xb = sx < 0 ? h0 - 4 : h0 + hw + 1; r(g, xb, Y + 2, 3, 5, tusk); r(g, xb + sx * 3, Y - 1, 3, 5, tusk); r(g, xb + sx * 5, Y - 6, 2, 6, '#e0a03a'); }
      if (f) { r(g, X + 11, Y + 7, 3, 2, a === 'boar' ? '#2a1a10' : '#ff5a3a'); r(g, X + 19, Y + 7, 3, 2, a === 'boar' ? '#2a1a10' : '#ff5a3a'); r(g, X + 12, Y + 10, 9, 5, shade(b, 28)); r(g, X + 14, Y + 11, 2, 2, '#1a120c'); r(g, X + 17, Y + 11, 2, 2, '#1a120c'); r(g, X + 11, Y + 13, 2, 5, tusk); r(g, X + 20, Y + 13, 2, 5, tusk); } else if (dir === 2) { r(g, h0 + 8, Y + 7, 3, 2, '#2a1a10'); r(g, h0 + hw - 3, Y + 9, 8, 6, shade(b, 28)); r(g, h0 + hw, Y + 13, 2, 5, tusk); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'fox') {
      const o2 = '#d9702a', w = '#fff0d8'; r(g, h0 - 1, Y - 3, 6, 9, o2); r(g, h0 + 1, Y - 1, 2, 5, w); if (dir !== 2) { r(g, h0 + hw - 5, Y - 3, 6, 9, o2); r(g, h0 + hw - 3, Y - 1, 2, 5, w); } r(g, h0 - 2, Y + 4, hw + 4, 11, o2);
      if (f) { r(g, X + 11, Y + 8, 3, 2, '#2a4a8a'); r(g, X + 19, Y + 8, 3, 2, '#2a4a8a'); r(g, X + 12, Y + 11, 9, 4, w); r(g, X + 15, Y + 11, 3, 2, '#1a120c'); } else if (dir === 2) { r(g, h0 + 8, Y + 8, 3, 2, '#2a4a8a'); r(g, h0 + hw - 3, Y + 10, 8, 4, w); } else r(g, h0, Y + 8, hw, 12, o2);
    } else if (a === 'sphinx') {
      const go = '#c9a85a', bl = '#3a7fd0'; r(g, h0 - 3, Y + 2, hw + 6, 4, go); r(g, h0 - 4, Y + 5, 5, 20, go); if (dir !== 2) r(g, h0 + hw - 1, Y + 5, 5, 20, go); for (let y = 7; y < 25; y += 4) { r(g, h0 - 4, Y + y, 5, 2, bl); if (dir !== 2) r(g, h0 + hw - 1, Y + y, 5, 2, bl); } r(g, h0, Y + 2, hw, 10, go); r(g, X + 15, Y - 3, 3, 6, bl); r(g, X + 14, Y - 5, 5, 3, '#ffe08a');
      if (f) { r(g, X + 11, Y + 8, 3, 2, '#1a2a5a'); r(g, X + 19, Y + 8, 3, 2, '#1a2a5a'); } else if (dir === 1) r(g, h0, Y + 8, hw, 16, go);
    } else if (a === 'deer') {
      const b = '#9a6a3c', w = '#e8dcc0'; for (const sx of (dir === 2 ? [0] : [0, 1])) { const xb = sx ? h0 + hw - 2 : h0 - 1; r(g, xb, Y - 8, 3, 12, w); r(g, xb + (sx ? 2 : -3), Y - 6, 4, 2, w); r(g, xb + (sx ? 2 : -3), Y - 2, 4, 2, w); } r(g, h0 - 1, Y + 3, hw + 2, 12, b);
      if (f) { r(g, X + 11, Y + 7, 3, 3, '#1a120c'); r(g, X + 19, Y + 7, 3, 3, '#1a120c'); r(g, X + 13, Y + 11, 7, 4, w); r(g, X + 15, Y + 11, 3, 2, '#1a120c'); } else if (dir === 2) { r(g, h0 + 9, Y + 7, 3, 3, '#1a120c'); r(g, h0 + hw - 2, Y + 10, 6, 4, w); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'hummingbird') {
      const b = '#2fa89a', t = '#ff6ad5'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); for (let x = 0; x < hw; x += 3) r(g, h0 + x, Y + 2 + (x & 1), 2, 3, x % 2 ? t : '#ffd76a'); r(g, h0 - 5, Y + 5, 5, 10, t); if (dir !== 2) r(g, h0 + hw, Y + 5, 5, 10, t);
      if (f) { r(g, X + 11, Y + 7, 3, 2, '#14283a'); r(g, X + 19, Y + 7, 3, 2, '#14283a'); r(g, X + 15, Y + 9, 3, 9, '#ffd76a'); } else if (dir === 2) { r(g, h0 + 9, Y + 7, 3, 2, '#14283a'); r(g, h0 + hw - 1, Y + 9, 9, 2, '#ffd76a'); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'falcon') {
      const b = '#6a5442', t = '#6fd6ff'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); r(g, h0, Y + 2, hw, 4, '#efe6d4'); r(g, h0 - 5, Y + 6, 5, 9, b); r(g, h0 - 6, Y + 7, 3, 2, t); if (dir !== 2) { r(g, h0 + hw, Y + 6, 5, 9, b); r(g, h0 + hw + 3, Y + 7, 3, 2, t); }
      if (f) { r(g, X + 11, Y + 8, 3, 2, t); r(g, X + 19, Y + 8, 3, 2, t); r(g, X + 15, Y + 9, 3, 4, '#e8b93e'); r(g, X + 16, Y + 13, 2, 2, '#b08a2a'); } else if (dir === 2) { r(g, h0 + 9, Y + 8, 3, 2, t); r(g, h0 + hw - 1, Y + 9, 5, 3, '#e8b93e'); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'wyvern') {
      const b = '#aab6c6', t = '#7dffb0'; for (const sx of (dir === 2 ? [-1] : [-1, 1])) { const xb = sx < 0 ? h0 - 4 : h0 + hw; r(g, xb, Y + 1, 4, 11, b); r(g, xb + sx * 3, Y - 3, 3, 8, '#dbe4ee'); } r(g, h0 - 1, Y + 3, hw + 2, 12, b); for (let x = 1; x < hw; x += 4) r(g, h0 + x, Y + 3, 2, 3, '#dbe4ee');
      if (f) { r(g, X + 11, Y + 8, 3, 2, t); r(g, X + 19, Y + 8, 3, 2, t); r(g, X + 13, Y + 12, 7, 2, '#4a5a6e'); for (let x = 13; x < 20; x += 2) r(g, X + x, Y + 12, 1, 3, '#fff'); } else if (dir === 2) { r(g, h0 + 9, Y + 8, 3, 2, t); r(g, h0 + hw - 3, Y + 10, 8, 4, b); } else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'skull') {
      const b = '#e4e0d6', k = '#141019', t = '#cfe0ff'; r(g, h0 - 2, Y + 1, hw + 4, 8, '#2e2a3a'); r(g, h0 - 1, Y + 4, hw + 2, 12, b); ell(g, X + 16, Y + 1, 5, 3, t); ell(g, X + 18, Y + 0, 4, 2, '#2e2a3a');
      if (f) { r(g, X + 11, Y + 8, 4, 4, k); r(g, X + 18, Y + 8, 4, 4, k); r(g, X + 12, Y + 9, 2, 2, t); r(g, X + 19, Y + 9, 2, 2, t); r(g, X + 15, Y + 12, 3, 2, k); for (let x = 12; x < 21; x += 2) r(g, X + x, Y + 14, 1, 2, k); } else if (dir === 2) { r(g, h0 + 8, Y + 8, 4, 4, k); r(g, h0 + 9, Y + 9, 2, 2, t); } else r(g, h0, Y + 8, hw, 10, '#2e2a3a');
    } else if (a === 'reaper') {
      const b = '#1a1a24', t = '#7dfff0'; r(g, h0 - 3, Y + 1, hw + 6, 20, b); r(g, h0 - 1, Y - 2, hw + 2, 5, b); r(g, h0 + 2, Y - 3, hw - 4, 2, '#32323f');
      if (dir !== 1) { r(g, h0 + 1, Y + 6, hw - 2, 11, '#050508'); if (f) { r(g, X + 12, Y + 10, 3, 2, t); r(g, X + 18, Y + 10, 3, 2, t); } else r(g, h0 + 8, Y + 10, 3, 2, t); }
    } else if (a === 'salamander') {
      const b = '#c2452d', t = '#ffd23f'; r(g, h0 - 3, Y + 4, hw + 6, 10, b); for (let x = -2; x < hw + 2; x += 4) r(g, h0 + x, Y + 1 + (x & 2), 3, 4, t); for (const [dx, dy] of [[1, 5], [9, 4], [13, 7]]) r(g, h0 + dx, Y + dy, 2, 2, t);
      if (f) { r(g, X + 11, Y + 8, 3, 3, t); r(g, X + 19, Y + 8, 3, 3, t); r(g, X + 12, Y + 9, 1, 2, '#241c2c'); r(g, X + 20, Y + 9, 1, 2, '#241c2c'); } else if (dir === 2) r(g, h0 + 10, Y + 8, 3, 3, t); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'chimera') {
      const b = '#3a2f8f', t = '#9ff0ff'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); for (const [dx, h] of [[0, 8], [hw >> 1, 13], [hw - 3, 8]]) { r(g, h0 + dx, Y + 3 - h, 3, h, t); r(g, h0 + dx + 1, Y + 1 - h, 1, 2, '#fff'); }
      if (f) { r(g, X + 11, Y + 8, 11, 2, t); r(g, X + 15, Y + 5, 3, 3, '#fff'); } else if (dir === 2) r(g, h0 + 7, Y + 8, 7, 2, t); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'pegasus') {
      const b = '#f0e6ff', t = '#ff9fd8'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); for (let y = 0; y < 20; y += 2) r(g, X + 15, Y + y, 3, 2, y % 4 ? t : '#ffc9ea'); r(g, h0 - 6, Y + 4, 6, 3, '#fff'); r(g, h0 - 8, Y + 7, 8, 3, b); if (dir !== 2) { r(g, h0 + hw, Y + 4, 6, 3, '#fff'); r(g, h0 + hw, Y + 7, 8, 3, b); }
      if (f) { r(g, X + 11, Y + 8, 3, 2, '#5a3c8a'); r(g, X + 19, Y + 8, 3, 2, '#5a3c8a'); } else if (dir === 2) r(g, h0 + 10, Y + 8, 3, 2, '#5a3c8a'); else r(g, h0, Y + 8, hw, 12, b);
    } else if (a === 'titan') {
      const b = '#2a2630', t = '#ff6a2b'; r(g, h0 - 2, Y + 2, hw + 4, 13, b); for (const sx of (dir === 2 ? [-1] : [-1, 1])) { const xb = sx < 0 ? h0 - 5 : h0 + hw + 1; r(g, xb, Y - 1, 4, 8, b); r(g, xb + sx * 2, Y - 7, 3, 7, t); } for (let x = 1; x < hw; x += 5) r(g, h0 + x, Y + 3, 2, 2, t);
      helmFace(g, X, Y, h0, hw, f, dir, t, b);
    } else if (a === 'mammoth') {
      const b = '#7a5a40', w = '#f2ecdc'; r(g, h0 - 3, Y + 1, hw + 6, 15, b); for (let x = -3; x < hw + 3; x += 3) r(g, h0 + x, Y - 1 + (x & 1), 2, 3, '#a07c58'); for (const sx of (dir === 2 ? [-1] : [-1, 1])) { const xb = sx < 0 ? h0 - 4 : h0 + hw + 1; r(g, xb, Y + 11, 3, 9, w); r(g, xb + sx * 2, Y + 18, 3, 4, w); }
      helmFace(g, X, Y, h0, hw, f, dir, '#8fd6ff', b);
    } else if (a === 'djinn') {
      const b = '#2a6fc0', t = '#ffd76a'; r(g, h0 - 3, Y + 1, hw + 6, 9, b); for (let x = -3; x < hw + 3; x += 4) r(g, h0 + x, Y + 2, 2, 7, '#5a9ae0'); ell(g, X + 16, Y - 1, 8, 5, b); r(g, X + 14, Y + 3, 5, 5, t); r(g, X + 15, Y + 4, 3, 3, '#ff5a7a');
      helmFace(g, X, Y, h0, hw, f, dir, '#1a2a5a', b);
    } else if (a === 'oracle') {
      const b = '#e6b23a', t = '#fff3b8'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); for (let i = -3; i <= 3; i++) { const h = 11 - Math.abs(i) * 2; r(g, X + 15 + i * 4, Y + 3 - h, 3, h, i % 2 ? b : t); } r(g, X + 14, Y + 5, 5, 4, '#ff7a2b');
      helmFace(g, X, Y, h0, hw, f, dir, '#7a3a0c', b);
    } else if (a === 'peacock') {
      const b = '#14808a', t = '#6ae0ff'; for (let i = -3; i <= 3; i++) { const h = 13 - Math.abs(i) * 2, x = X + 15 + i * 4; r(g, x, Y + 2 - h, 2, h, t); r(g, x - 1, Y + 1 - h, 4, 4, '#ffd76a'); r(g, x, Y + 2 - h, 2, 2, '#1a2a7a'); } r(g, h0 - 1, Y + 3, hw + 2, 11, b);
      helmFace(g, X, Y, h0, hw, f, dir, '#ffd76a', b);
    } else if (a === 'unicorn') {
      const b = '#eee8fa', t = '#b48cff'; r(g, h0 - 1, Y + 3, hw + 2, 11, b); r(g, X + 15, Y - 11, 3, 15, '#ffe08a'); for (let y = -10; y < 3; y += 3) r(g, X + 15, Y + y, 3, 1, '#c8922a'); for (let y = 2; y < 20; y += 3) r(g, h0 - 3, Y + y, 4, 3, y % 2 ? t : '#ffc9ea'); if (dir !== 2) for (let y = 2; y < 20; y += 3) r(g, h0 + hw - 1, Y + y, 4, 3, y % 2 ? t : '#ffc9ea');
      helmFace(g, X, Y, h0, hw, f, dir, '#5a3c8a', b);
    } else if (a === 'rhino') {
      const b = '#6c7480', t = '#ffb13d'; r(g, h0 - 2, Y + 2, hw + 4, 14, b); r(g, h0 - 3, Y, 4, 6, b); if (dir !== 2) r(g, h0 + hw - 1, Y, 4, 6, b); if (dir !== 1) { const xc = dir === 2 ? h0 + hw - 1 : X + 15; r(g, xc, Y + 4, 4, 7, t); r(g, xc + 1, Y - 1, 2, 6, '#ffe08a'); }
      helmFace(g, X, Y, h0, hw, f, dir, t, b);
    } else if (a === 'basilisk') {
      const b = '#b8902a', t = '#7dffb0'; r(g, h0 - 2, Y + 3, hw + 4, 12, b); for (let x = -1; x < hw + 1; x += 3) r(g, h0 + x, Y - 3 + (x & 2), 2, 7, t); for (let y = 6; y < 14; y += 3) for (let x = (y % 2) * 2; x < hw; x += 4) r(g, h0 + x, Y + y, 2, 1, '#e6c45a');
      helmFace(g, X, Y, h0, hw, f, dir, '#ff3c3c', b);
    } else if (a === 'mummy') {
      const b = '#c9bb92', k = '#8a7c58', t = '#3fd6c0'; r(g, h0 - 1, Y + 2, hw + 2, 14, b); for (let y = 3; y < 16; y += 3) r(g, h0 - 1, Y + y, hw + 2, 1, k); r(g, h0 + hw - 1, Y + 13, 3, 9, b);
      helmFace(g, X, Y, h0, hw, f, dir, t, b);
    } else if (a === 'lich') {
      const b = '#3a1f5a', t = '#9dff6b', o2 = '#d9c98f'; r(g, h0 - 3, Y + 3, hw + 6, 14, b); r(g, h0, Y + 5, hw, 10, '#e4e0d6'); for (let i = 0; i < 5; i++) { r(g, h0 + 1 + i * ((hw - 3) / 4), Y - 4 + (i % 2) * 3, 3, 7, o2); r(g, h0 + 1 + i * ((hw - 3) / 4), Y - 5 + (i % 2) * 3, 3, 2, t); } r(g, h0, Y + 2, hw, 3, o2);
      helmFace(g, X, Y, h0, hw, f, dir, t, b);
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
function slime(f: number) { const c = cv(36, 30), g = ctx(c), h = f ? 10 : 12, w = f ? 15 : 13; ell(g, 18, 28 - h, w, h, '#4fb0d8'); ell(g, 17, 26 - h, w - 2, h - 2, '#66c6e6'); ell(g, 16, 25 - h, w - 5, h - 5, '#93e0f5'); ell(g, 13, 22 - h + 1, 3, 2, '#effcff'); for (const [bx, by] of [[24, 20], [9, 22], [21, 25]]) r(g, bx, by, 2, 2, '#bdeeff'); r(g, 7, 26, 22, 1, '#3a8fbb'); r(g, 12, 25 - h + 6, 3, 4, '#17344a'); r(g, 21, 25 - h + 6, 3, 4, '#17344a'); return outline(c); }
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
const wingCache = new Map<string, Cv[]>();
/** Asas desenhadas em camadas a partir das costas, em dobro de resolução. */
export const WING_ROOT = 66; // distância do ombro até o topo do quadro, em pixels do mundo
const AURA = ['', '', '', '#ffd76a', '#f4fbff', '#ff5ad1'];
export function wingSprites(cls: string, tier: number): Cv[] {
  const k = cls + tier; let out = wingCache.get(k); if (out) return out;
  const t = WING_THEME[cls], L = [36, 46, 58, 64, 70, 76][tier], W = (L + 8) * 2, H = WING_ROOT + L + 10 + (tier >= 4 ? Math.round(L * .55) : 0), sc = 2;
  const blade = (g: G, len: number, wid: number, base: string, tip: string, edge: string, pointed: boolean, shaft: string | null) => {
    const gr = g.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, base); gr.addColorStop(.62, base); gr.addColorStop(1, tip);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * .35, -wid, len * .78, -wid * .55); if (pointed) g.lineTo(len, 0); else g.quadraticCurveTo(len * 1.03, -wid * .1, len, wid * .25); g.quadraticCurveTo(len * .55, wid * .7, 0, 0); g.closePath();
    g.fillStyle = gr; g.fill(); g.lineWidth = .7; g.strokeStyle = edge; g.stroke();
    if (shaft) { g.beginPath(); g.moveTo(1, 0); g.lineTo(len * .92, 0); g.lineWidth = .45; g.strokeStyle = shaft; g.stroke(); }
  };
  const wing = (g: G) => {
    const dark = shade(t.c, -48), light = shade(t.c, 22);
    if (t.style === 'bat' || t.style === 'bone') {
      const n = 3 + tier, ang = (i: number) => -1.32 + i * (2.15 / (n - 1)), len = (i: number) => L * (1.05 - Math.abs(i / (n - 1) - .18) * .5), px = (i: number) => Math.cos(ang(i)) * len(i), py = (i: number) => Math.sin(ang(i)) * len(i);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(px(0), py(0));
      for (let i = 0; i < n - 1; i++) { const mx = (px(i) + px(i + 1)) / 2 * .72, my = (py(i) + py(i + 1)) / 2 * .72; g.quadraticCurveTo(mx, my, px(i + 1), py(i + 1)); }
      g.closePath(); const gr = g.createRadialGradient(0, 0, 2, 0, 0, L); gr.addColorStop(0, t.style === 'bone' ? '#1c1230' : dark); gr.addColorStop(1, t.c); g.fillStyle = gr; g.globalAlpha = t.style === 'bone' ? .86 : .96; g.fill(); g.globalAlpha = 1;
      const b = t.style === 'bone' ? t.c2 : shade(t.c, -70); g.lineCap = 'round';
      for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(px(i) * .5 + 2, py(i) * .5 - 3, px(i), py(i)); g.lineWidth = i === 0 ? 2 : 1.1; g.strokeStyle = b; g.stroke(); g.beginPath(); g.arc(px(i), py(i), i === 0 ? 1.5 : .9, 0, 6.3); g.fillStyle = t.style === 'bone' ? '#f1ecd9' : t.c2; g.fill(); }
      if (t.style === 'bat') { g.beginPath(); g.arc(px(0) * .62, py(0) * .62, 1.4, 0, 6.3); g.fillStyle = t.c2; g.fill(); }
      return;
    }
    const pointed = t.style !== 'feather', rot = (a: number, f: () => void) => { g.save(); g.rotate(a); f(); g.restore(); };
    if (t.style === 'blade') { const n = 7 + tier * 2; for (let i = n - 1; i >= 0; i--) { const u = i / (n - 1); rot(-1.3 + u * 2.3, () => blade(g, L * (1 - Math.abs(u - .25) * .55), 3.6, dark, t.c2, shade(t.c, -70), true, t.c2)); } return; }
    const upper = 8 + tier * 3; for (let i = upper - 1; i >= 0; i--) { const u = i / (upper - 1); rot(-1.3 + u * 1.12, () => blade(g, L * (.84 + Math.sin(u * 3.14) * .2), 3.6, t.c, t.c2, dark, pointed, shade(t.c, 45))); }
    const lower = 6 + tier * 2; for (let i = lower - 1; i >= 0; i--) { const u = i / (lower - 1); rot(.0 + u * 1.12, () => blade(g, L * (.76 - u * .3), 3.5, t.c, t.c2, dark, pointed, shade(t.c, 45))); }
    const sec = 7 + tier * 2; for (let i = sec - 1; i >= 0; i--) { const u = i / (sec - 1); rot(-1.15 + u * 2.1, () => blade(g, L * (.58 - Math.abs(u - .35) * .18), 3.4, light, shade(t.c2, -18), dark, pointed, null)); }
    const cov = 6 + tier; for (let i = cov - 1; i >= 0; i--) { const u = i / (cov - 1); rot(-1.1 + u * 1.95, () => blade(g, L * .32, 3.2, dark, t.c, shade(t.c, -70), pointed, null)); }
    if (tier >= 1) { g.beginPath(); g.arc(4, -1, 2.6 + tier * .6, 0, 6.3); g.fillStyle = ['', '#b08a3c', '#f0cf65', '#ffe9a8', '#e8f6ff', '#ff9ee6'][tier]; g.fill(); g.beginPath(); g.arc(4, -1, 1.3 + tier * .3, 0, 6.3); g.fillStyle = t.c2; g.fill(); }
  };
  out = [-.3, -.17, -.02, .13, .02, -.15].map(a => {
    const c = cv(W * sc, H * sc), g = ctx(c); noHd.add(c); g.scale(sc, sc); g.shadowColor = t.c2; g.shadowBlur = [0, 2, 4, 5, 6, 7][tier];
    if (tier >= 4) for (const sgn of [1, -1]) { g.save(); g.translate(W / 2 + sgn * 2, WING_ROOT + 6); g.scale(sgn * .62, .62); g.rotate(a + .95); wing(g); g.restore(); }
    if (tier >= 3) { g.shadowColor = AURA[tier]; g.shadowBlur = 6 + tier; }
    for (const sgn of [1, -1]) { g.save(); g.translate(W / 2 + sgn * 3, WING_ROOT); g.scale(sgn, 1); g.rotate(a); wing(g); g.restore(); }
    if (tier >= 3) { g.globalCompositeOperation = 'source-atop'; const gr = g.createRadialGradient(W / 2, WING_ROOT, L * .55, W / 2, WING_ROOT, L * 1.05); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, AURA[tier]); g.fillStyle = gr; g.globalAlpha = .75; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    return c;
  });
  wingCache.set(k, out); return out;
}
function helmFace(g: G, X: number, Y: number, h0: number, hw: number, f: boolean, dir: number, eye: string, back: string) { if (f) { r(g, X + 11, Y + 8, 3, 2, eye); r(g, X + 19, Y + 8, 3, 2, eye); } else if (dir === 2) r(g, h0 + 9, Y + 8, 3, 2, eye); else r(g, h0, Y + 8, hw, 12, back); }
function spiderArt(sz: number, b: string, b2: string, eye: string, f: number) { const W = sz * 2, H = Math.round(sz * 1.4), c = cv(W, H), g = ctx(c), cx = sz, cy = Math.round(H * .55); for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const y0 = cy - 6 + i * 4, kx = cx + s * (sz * .55), ky = y0 - sz * .25 + (f + i) % 2 * 3, ex = cx + s * (sz - 2), ey = cy + sz * .28 + i * 3; for (let t = 0; t <= 1; t += .04) { r(g, cx + (kx - cx) * t, y0 + (ky - y0) * t, 3, 3, b); r(g, kx + (ex - kx) * t, ky + (ey - ky) * t, 2, 2, b); } } ell(g, cx, cy + sz * .12 | 0, sz * .5 | 0, sz * .36 | 0, b); ell(g, cx - 2, cy + 2 | 0, sz * .34 | 0, sz * .22 | 0, b2); ell(g, cx, cy - sz * .24 | 0, sz * .28 | 0, sz * .22 | 0, b2); for (const x of [-5, -2, 1, 4]) r(g, cx + x, cy - sz * .3 | 0, 2, 2, eye); r(g, cx - 4, cy - sz * .08 | 0, 2, 5, '#e8dcc8'); r(g, cx + 2, cy - sz * .08 | 0, 2, 5, '#e8dcc8'); return outline(c); }
function colossus(f: number, a: string, gl: string, eye: string, extra?: (g: G) => void) { const c = cv(60, 68), g = ctx(c), s = f ? 2 : 0; r(g, 15 + s, 48, 13, 18, a); r(g, 33 - s, 48, 13, 18, a); r(g, 12, 18, 37, 32, a); r(g, 3, 20 + s, 11, 30, a); r(g, 47, 20 - s, 11, 30, a); r(g, 20, 4, 21, 16, a); r(g, 24, 10, 5, 4, eye); r(g, 33, 10, 5, 4, eye); for (const [x, y, w, h] of [[18, 24, 3, 22], [30, 20, 3, 28], [40, 26, 3, 18], [20, 34, 22, 3], [6, 28, 3, 16], [50, 30, 3, 14]]) r(g, x, y, w, h, gl); extra?.(g); return outline(c); }
function skel(f: number, bone: string, opt: { bow?: boolean; armor?: string; crown?: boolean; sz?: number }) { const k = opt.sz ?? 1, c = cv(56 * k, 64 * k), g = ctx(c), R2 = (x: number, y: number, w: number, h: number, col: string) => r(g, x * k, y * k, w * k, h * k, col), s = f ? 2 : -1, dk = shade(bone, -70), a = opt.armor; R2(22, 4, 14, 13, bone); R2(25, 9, 3, 4, dk); R2(31, 9, 3, 4, dk); R2(26, 15, 8, 3, bone); for (let x = 26; x < 34; x += 2) R2(x, 15, 1, 3, dk); R2(27, 19, 4, 18, bone); for (let y = 21; y < 33; y += 3) { R2(20, y, 18, 2, bone); } if (a) { R2(18, 19, 22, 18, a); R2(18, 19, 22, 3, shade(a, 40)); R2(27, 24, 4, 8, shade(a, -40)); R2(13, 18, 8, 6, shade(a, 30)); R2(37, 18, 8, 6, shade(a, 30)); R2(21, 2, 16, 6, a); } R2(16, 22 + s, 3, 18, bone); R2(39, 22 - s, 3, 18, bone); R2(23, 37, 4, 22, bone); R2(31, 37, 4, 22, bone); R2(20 + s, 58, 8, 3, bone); R2(30 - s, 58, 8, 3, bone); if (opt.bow) { for (let i = 0; i < 30; i++) R2(46 + Math.round(Math.sin(i / 29 * 3.14) * 6), 14 + i, 2, 1, '#6b4a2b'); R2(46, 14, 1, 30, '#e8e0cc'); } else { R2(42, 2 + (s > 0 ? 3 : 0), 4, 30, '#9aa7b5'); R2(42, 2, 2, 30, '#e6edf5'); R2(38, 30, 12, 3, '#6b4a2b'); } if (opt.crown) { R2(20, -0 + 1, 18, 4, '#d9b24a'); for (let x = 20; x < 38; x += 4) R2(x, 0, 2, 3, '#ffe08a'); R2(27, 22, 4, 4, '#b06bff'); } return outline(c); }
function winged(f: number, robe: string, wing: string, o: { halo?: string; sz?: number; head?: string }) { const k = o.sz ?? 1, W = 104 * k, H = 92 * k, c = cv(W, H), g = ctx(c), m = W / 2, R2 = (x: number, y: number, w: number, h: number, col: string) => r(g, m + x * k, y * k, w * k, h * k, col), lift = f ? -4 : 3; for (const s of [-1, 1]) for (let x = 0; x < 44; x++) { const top = 22 - Math.sin(x / 44 * 2.1) * 14 + lift * x / 44, len = 40 - x * .55 + (x % 7 < 3 ? 0 : -5); for (let y = 0; y < len; y++) R2(s * (8 + x) - (s < 0 ? 1 : 0), top + y, 1, 1, y < 3 ? '#ffffff' : x % 7 < 2 ? shade(wing, -30) : wing); } for (let y = 0; y < 44; y++) { const w = 9 + y * .32 | 0; R2(-w, 40 + y, w * 2, 1, y % 8 < 2 ? shade(robe, 30) : robe); } R2(-11, 30, 22, 14, shade(robe, 20)); R2(-8, 12, 16, 18, o.head ?? '#f0dcc4'); R2(-5, 20, 3, 3, '#3a3a6a'); R2(2, 20, 3, 3, '#3a3a6a'); R2(-10, 10, 20, 8, '#efe6c4'); R2(-10, 14, 4, 18, '#efe6c4'); R2(6, 14, 4, 18, '#efe6c4'); if (o.halo) { R2(-12, 2, 24, 2, o.halo); R2(-14, 4, 3, 2, o.halo); R2(11, 4, 3, 2, o.halo); R2(-12, 6, 24, 1, shade(o.halo, -40)); } R2(16, 22, 3, 58, '#d9b24a'); R2(13, 16, 9, 8, o.halo ?? '#fff2b0'); return outline(c); }
function ogriffin(f: number) { const c = cv(84, 72), g = ctx(c), b = '#c9a264', w = '#f4efe2', d = '#8a6a3c', s = f ? 3 : -3, wl = f ? -6 : 4; for (let x = 0; x < 34; x++) { const len = 30 - x * .5 + (x % 6 < 3 ? 0 : -4); for (let y = 0; y < len; y++) r(g, 24 + x * .9, 16 + wl * x / 34 + y - x * .4, 2, 1, y < 2 ? '#fff' : x % 6 < 2 ? '#d6c9ae' : w); } r(g, 12, 40, 44, 16, b); r(g, 12, 40, 44, 4, shade(b, 25)); r(g, 2, 36, 12, 5, b); r(g, 0, 30, 5, 10, d); r(g, 54, 28, 16, 18, w); r(g, 62, 34, 15, 8, w); r(g, 74, 36, 8, 6, '#e8b93e'); r(g, 79, 41, 3, 4, '#c98f2a'); r(g, 68, 34, 3, 3, '#1d1830'); r(g, 56, 18, 5, 12, w); for (const [x, o2] of [[16, s], [24, -s], [44, -s], [52, s]]) { r(g, x + o2, 54, 6, 15, d); r(g, x + o2 - 1, 67, 8, 3, '#e8b93e'); } return outline(c); }
function imp2(f: number) { const c = cv(70, 76), g = ctx(c), s = f ? 3 : 0, b = '#4a3a3a', gl = '#ff7a2b'; r(g, 2, 16 + s, 18, 26 - s, '#2a2024'); r(g, 50, 16 + s, 18, 26 - s, '#2a2024'); for (const x of [6, 12, 54, 60]) r(g, x, 18 + s, 2, 22 - s, gl); r(g, 22, 26, 26, 28, b); r(g, 22, 26, 26, 4, '#6a5252'); r(g, 21, 6, 28, 22, b); r(g, 18, 0, 5, 12, '#e8dcc8'); r(g, 47, 0, 5, 12, '#e8dcc8'); r(g, 27, 13, 5, 4, '#ffe14a'); r(g, 38, 13, 5, 4, '#ffe14a'); r(g, 29, 22, 12, 3, '#1a1012'); for (let x = 30; x < 40; x += 3) r(g, x, 22, 1, 3, '#fff'); for (const [x, y, h] of [[28, 32, 16], [41, 34, 12], [34, 30, 20]]) r(g, x, y, 2, h, gl); r(g, 24, 54, 8, 19, '#332628'); r(g, 38, 54, 8, 19, '#332628'); return outline(c); }
function treant(f: number) { return colossus(f, '#4a3626', '#6fbf4a', '#d6ff6a', g => { for (const [x, y, rx, ry] of [[16, 8, 9, 7], [44, 8, 9, 7], [30, 2, 10, 6], [8, 22, 6, 5], [54, 22, 6, 5]]) { ell(g, x, y, rx, ry, '#2f6b38'); ell(g, x - 2, y - 2, rx - 4, ry - 3, '#4f9a50'); } }); }
function elfArt(f: number) { return heroFrame(2, f ? 1 : 3, { hc: '#d8e8a0', hs: 2, cls: 'mystic_archer', armor: '#2f5a42', pants: '#223f30', weapon: 'long_bow' }); }
/** Recolore um sprite: gira o matiz (graus), multiplica saturação e soma luminosidade (-1 a 1). Mantém o contorno escuro. */
function tint(base: (f: number) => Cv, hue: number, sat = 1, lig = 0) {
  return (f: number) => { const s = base(f), c = cv(s.width, s.height), g = ctx(c); g.drawImage(s, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const R = d[i] / 255, G = d[i + 1] / 255, B = d[i + 2] / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B); let h = 0, sv = 0; const l = (mx + mn) / 2;
      if (l < .12) continue; if (mx !== mn) { const dd = mx - mn; sv = l > .5 ? dd / (2 - mx - mn) : dd / (mx + mn); h = mx === R ? (G - B) / dd + (G < B ? 6 : 0) : mx === G ? (B - R) / dd + 2 : (R - G) / dd + 4; h /= 6; }
      h = (h + hue / 360 + 1) % 1; sv = Math.min(1, sv * sat); const L2 = Math.max(0, Math.min(1, l + lig)), q = L2 < .5 ? L2 * (1 + sv) : L2 + sv - L2 * sv, p = 2 * L2 - q;
      const f2 = (t: number) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
      d[i] = f2(h + 1 / 3) * 255; d[i + 1] = f2(h) * 255; d[i + 2] = f2(h - 1 / 3) * 255; }
    g.putImageData(im, 0, 0); return c; };
}
const NEW_MOBS: Record<string, (f: number) => Cv> = { sandscarab: f => spiderArt(30, '#1f5a5a', '#2fa08a', '#ffd76a', f), dunemummy: f => skel(f, '#d6c9a0', { armor: '#9a8a60', sz: 1.3 as number }), sanddjinn: f => colossus(f, '#2a6fc0', '#6ae0ff', '#ffe08a'), khepri: f => skel(f, '#e9cf6a', { armor: '#1f6a7a', crown: true, sz: 2.2 }), spider: f => spiderArt(26, '#3a2c3a', '#5a4458', '#ff5a5a', f), aracnia: f => spiderArt(70, '#241a28', '#463448', '#9dff6b', f), elf: elfArt, sprite: f => { const c = cv(40, 44), g = ctx(c), s = f ? 3 : 0; r(g, 3, 8 + s, 13, 18, '#b58cff'); r(g, 24, 8 + s, 13, 18, '#b58cff'); r(g, 5, 10 + s, 9, 12, '#e0c6ff'); r(g, 26, 10 + s, 9, 12, '#e0c6ff'); ell(g, 20, 14, 7, 7, '#2a1a44'); r(g, 16, 13, 2, 2, '#ff6ad5'); r(g, 22, 13, 2, 2, '#ff6ad5'); r(g, 15, 21, 10, 14, '#5a2f9a'); r(g, 18, 35, 4, 7, '#3a1f6a'); return outline(c); }, treant, skeleton: f => skel(f, '#e0d8c4', {}), bonearcher: f => skel(f, '#d0c8b0', { bow: true }), ashdemon: imp2, cryptknight: f => skel(f, '#c8c0ac', { armor: '#3a3a52', sz: 1.3 as number }), vorgath: f => skel(f, '#efe8d4', { armor: '#3c2458', crown: true, sz: 2 }), sentinel: f => colossus(f, '#d6d1e0', '#d9b24a', '#7fe3ff'), seraph: f => winged(f, '#6a3f96', '#3a3050', { head: '#a8a0b8' }), ogriffin, archon: f => winged(f, '#d9a62e', '#fff2d0', { halo: '#ffe08a', sz: 1.25 }), aethon: f => winged(f, '#efe6ff', '#ffffff', { halo: '#fff2b0', sz: 2 }) };
// monstros dos mundos de alto nível
Object.assign(NEW_MOBS, {
  bogtoad: tint(slime, 260, 1.1, -.1), venomspider: (f: number) => spiderArt(32, '#2a3a1a', '#4a6a2a', '#d6ff3a', f), swamphag: (f: number) => skel(f, '#9ab07a', { armor: '#2f4a2a', sz: 1.2 }), hydraqueen: (f: number) => spiderArt(78, '#1a2a14', '#3a5a24', '#ff4af0', f),
  frostgolem: (f: number) => colossus(f, '#9fd8f0', '#e8fbff', '#2a6fc0'), icewyrm: tint(wyrm, 190, 1.2, .15), frostseraph: (f: number) => winged(f, '#3a7aa8', '#d8f4ff', { head: '#e8f4ff' }), glacius: tint(ignarok, 200, 1.1, .1),
  lavagolem: (f: number) => colossus(f, '#2c2529', '#ff7a2b', '#ffd76a'), flamehound: tint(hound, 10, 2.5, .12), pyromancer: (f: number) => winged(f, '#8a1f14', '#ff9a3c', { head: '#3a1a14' }), pyros: tint(ignarok, 25, 1.3, .08),
  wraith: tint(shadeMob, 200, 1, -.05), deathknight: (f: number) => skel(f, '#b8b0a0', { armor: '#1a1a2a', sz: 1.4 }), bonedragon: tint(wyrm, 0, .1, .35), morthul: (f: number) => skel(f, '#d8e8d0', { armor: '#0f3a2a', crown: true, sz: 2.2 }),
  darktreant: tint(treant, 230, 1.1, -.08), shadowelf: tint(elfArt, 130, 1.2, -.12), nightwolf: tint(wolf, 60, 1.6, -.3), sylvara: (f: number) => winged(f, '#1f4a2a', '#9dff6b', { halo: '#d6ff6a', sz: 1.9 }),
  crystalgolem: (f: number) => colossus(f, '#5a4a8a', '#c9a0ff', '#ffffff'), voidsprite: tint(NEW_MOBS.sprite, 285, 1.3, 0), abyssknight: (f: number) => colossus(f, '#1a2a4a', '#4af0ff', '#ff4a6a'), xalathar: (f: number) => winged(f, '#2a1a4a', '#7a4aff', { halo: '#c9a0ff', sz: 1.8 }),
  chaosimp: tint(imp, 280, 1.2, 0), chaoshound: tint(hound, 300, 3, .1), chaoslord: tint(imp2, 290, 1.2, -.05), kaorth: (f: number) => skel(f, '#5a2a3a', { armor: '#8a1f3a', crown: true, sz: 2.4 }),
  voidseraph: (f: number) => winged(f, '#14102a', '#3a2a6a', { head: '#0a0814', halo: '#7a4aff' }), starbeast: tint(ogriffin, 220, 1.3, -.15), eternalarchon: (f: number) => winged(f, '#3a3a5a', '#c0c8ff', { halo: '#9fd8ff', sz: 1.3 }), nihilus: (f: number) => winged(f, '#0a0820', '#4a3a8a', { halo: '#ff4af0', sz: 2.2 }),
});
/** Versão dourada de um monstro (Invasão Dourada): troca as cores por tons de ouro conforme o brilho de cada pixel. */
const goldCache = new Map<string, Cv[][]>();
export function goldSprites(key: string): Cv[][] {
  let s = goldCache.get(key); if (s) return s;
  const gold = (src: Cv) => { const c = cv(src.width, src.height), g = ctx(c); g.drawImage(src, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255; if (l < .1) continue;
      const t = Math.min(1, l * 1.25), [r0, g0, b0] = t < .5 ? [90 + t * 2 * 150, 58 + t * 2 * 120, 8 + t * 2 * 30] : [240 + (t - .5) * 2 * 15, 178 + (t - .5) * 2 * 70, 38 + (t - .5) * 2 * 170]; d[i] = r0; d[i + 1] = g0; d[i + 2] = b0; }
    g.putImageData(im, 0, 0); return c; };
  s = mobSprites(key).map(fr => fr.map(gold)); goldCache.set(key, s); return s;
}
export function mobSprites(key: string): Cv[][] {
  let s = mobCache.get(key); if (s) return s;
  const f = key === 'wisp' ? wisp : key === 'shade' ? shadeMob : NEW_MOBS[key] ?? (key === 'imp' ? imp : key === 'hound' ? hound : key === 'magma' ? magma : key === 'wyrm' ? wyrm : key === 'ignarok' ? ignarok : key === 'slime' ? slime : key === 'wolf' ? wolf : key === 'golem' ? golem : boss);
  s = [0, 1].map(i => { const c = f(i); return [c, flip(c)]; }); mobCache.set(key, s); return s;
}
export const mobSize = (k: string) => ({ bogtoad: 44, venomspider: 54, swamphag: 66, hydraqueen: 160, frostgolem: 66, icewyrm: 70, frostseraph: 84, glacius: 150, lavagolem: 70, flamehound: 50, pyromancer: 84, pyros: 160, wraith: 50, deathknight: 86, bonedragon: 80, morthul: 140, darktreant: 74, shadowelf: 56, nightwolf: 46, sylvara: 170, crystalgolem: 70, voidsprite: 46, abyssknight: 72, xalathar: 165, chaosimp: 42, chaoshound: 54, chaoslord: 84, kaorth: 160, voidseraph: 86, starbeast: 80, eternalarchon: 110, nihilus: 190, sandscarab: 52, dunemummy: 80, sanddjinn: 96, khepri: 170, spider: 38, aracnia: 150, elf: 50, sprite: 40, treant: 62, skeleton: 62, bonearcher: 62, ashdemon: 72, cryptknight: 80, vorgath: 126, sentinel: 62, seraph: 80, ogriffin: 70, archon: 110, aethon: 180 } as Record<string, number>)[k] ?? (k === 'ignarok' ? 130 : k === 'wyrm' ? 60 : k === 'magma' ? 62 : k === 'hound' ? 40 : k === 'imp' ? 32 : MOBS[k]?.boss ? 96 : k === 'golem' ? 56 : k === 'wolf' ? 36 : 28);

// ---------- ícones ----------
const iconCache = new Map<string, Cv>();
export function icon(key: string | null): Cv {
  const k = key ?? 'gold'; let c = iconCache.get(k); if (c) return c;
  c = cv(28, 28); const g = ctx(c), d = key ? ITEMS[key] : null, t = d?.tint ?? '#888', l = shade(t, 40), dk = shade(t, -35);
  if (!d) { for (const [x, y] of [[6, 14], [14, 14], [10, 8]]) { ell(g, x + 4, y + 4, 5, 4, '#e0b03a'); ell(g, x + 3, y + 3, 3, 2, '#ffe28a'); } }
  else if (d.kind === 'potion') { const col = d.heal ? '#e0425a' : '#3f7fe8', tier = (d.heal ?? 0) >= 2000 || (d.mana ?? 0) >= 1000 ? 2 : (d.heal ?? 0) >= 400 || (d.mana ?? 0) >= 250 ? 1 : 0; r(g, 11, 3, 6, 3, tier ? '#e0b03a' : '#a87b4a'); r(g, 11, 6, 6, 4, '#cfe3ee'); ell(g, 14, 17, 8 + (tier ? 1 : 0), 7 + tier, col); ell(g, 14, 19, 6, 4, shade(col, -30)); ell(g, 11, 14, 3, 2, '#fff'); if (tier) r(g, 6, 15, 16, 2, '#e0b03a'); if (tier === 2) { r(g, 10, 1, 2, 3, '#ffe9a8'); r(g, 16, 1, 2, 3, '#ffe9a8'); r(g, 13, 0, 2, 3, '#fff'); } }
  else if (d.kind === 'ring') { const b = d.blade!; ell(g, 14, 17, 9, 8, shade(t, -40)); ell(g, 14, 16, 8, 7, t); g.globalCompositeOperation = 'destination-out'; ell(g, 14, 17, 5, 4, '#000'); g.globalCompositeOperation = 'source-over'; r(g, 9, 13, 3, 1, l); ell(g, 14, 8, 5, 4, shade(t, -30)); ell(g, 14, 8, 4, 3, b); r(g, 12, 6, 2, 2, '#fff'); }
  else if (d.kind === 'amulet') { const b = d.blade!; for (let i = 0; i <= 9; i++) { r(g, 4 + i, 2 + i, 2, 2, i % 2 ? t : dk); r(g, 22 - i, 2 + i, 2, 2, i % 2 ? t : dk); } ell(g, 14, 18, 8, 8, t); ell(g, 14, 18, 6, 6, shade(b, -40)); ell(g, 14, 18, 5, 5, b); r(g, 11, 15, 3, 2, '#fff'); r(g, 13, 9, 2, 3, t); }
  else if (d.kind === 'box') { const b = d.blade!, w = '#6b4a2b'; r(g, 3, 11, 22, 14, w); r(g, 3, 6, 22, 6, shade(w, 20)); r(g, 3, 11, 22, 2, '#2c1f14'); r(g, 3, 6, 22, 1, shade(w, 45)); for (const x of [6, 20]) r(g, x, 6, 3, 19, b); r(g, 3, 19, 22, 2, b); r(g, 12, 12, 5, 6, '#2c2632'); r(g, 13, 13, 3, 3, b); r(g, 14, 14, 1, 2, '#fff'); r(g, 4, 7, 2, 1, '#fff'); }
  else if (d.kind === 'pack') { const b = d.blade!; r(g, 6, 11, 16, 14, '#8a6a3c'); r(g, 6, 11, 16, 2, '#b08a54'); r(g, 9, 7, 10, 5, '#6b4a2b'); r(g, 12, 5, 4, 3, '#c9a44c'); r(g, 10, 14, 8, 8, b); r(g, 12, 15, 3, 3, '#fff'); }
  else if (d.kind === 'jewel') { const b = d.blade!; r(g, 10, 5, 8, 3, '#fff'); r(g, 7, 8, 14, 5, b); for (let i = 0; i < 9; i++) r(g, 7 + i, 13 + i, 14 - i * 2 > 0 ? 14 - i * 2 : 1, 1, shade(b, -25 + i * 2)); r(g, 10, 9, 3, 3, '#fff'); }
  else if (d.kind === 'material') { for (const [x, y, h] of [[8, 9, 13], [13, 5, 18], [18, 11, 11]]) { r(g, x, y, 4, h, d.blade ?? '#8fe2ff'); r(g, x, y, 1, h, '#fff'); } }
  else if (d.kind === 'weapon') { const w = weaponSprite(key!); g.drawImage(w, 0, 6, w.width, w.height - 6, 7, 1, 14, 26); }
  else if (d.kind === 'helm') { ell(g, 14, 14, 10, 9, t); r(g, 4, 14, 20, 8, t); r(g, 8, 16, 12, 5, '#1d2230'); ell(g, 11, 9, 4, 2, l); }
  else if (d.kind === 'armor') { r(g, 7, 6, 14, 18, t); r(g, 3, 6, 5, 11, dk); r(g, 20, 6, 5, 11, dk); r(g, 10, 4, 8, 4, '#1d2230'); r(g, 13, 10, 2, 11, l); }
  else if (d.kind === 'pants') { r(g, 7, 4, 14, 8, t); r(g, 7, 12, 6, 13, t); r(g, 15, 12, 6, 13, dk); r(g, 7, 4, 14, 2, l); }
  else { r(g, 6, 5, 7, 16, t); r(g, 6, 20, 12, 5, dk); r(g, 16, 8, 6, 12, dk); r(g, 16, 20, 10, 5, t); }
  if (d?.kind === 'wings') { const th = WING_THEME[d.cls!]; for (let x = 0; x < 13; x++) { const top = 5 + Math.round(x * .25), bot = 22 - Math.round(x * .55) + (x % 3); r(g, 14 + x, top, 1, bot - top, x % 3 ? th.c : shade(th.c, -30)); r(g, 13 - x, top, 1, bot - top, x % 3 ? th.c : shade(th.c, -30)); r(g, 14 + x, top, 1, 2, th.c2); r(g, 13 - x, top, 1, 2, th.c2); } r(g, 12, 7, 4, 15, shade(th.c, -45)); const tc = ['', '#b08a3c', '#f0cf65', '#ffe9a8', '#e8f6ff', '#ff9ee6'][d.wtier ?? 0]; if (tc) { r(g, 12, 10, 4, 4, tc); r(g, 13, 11, 2, 2, '#fff'); } if ((d.wtier ?? 0) >= 3) for (let i = 0; i < d.wtier! - 2; i++) { r(g, 3 + i * 3, 3, 2, 2, tc); r(g, 23 - i * 3, 3, 2, 2, tc); } }
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
