// Toda a arte do jogo é pixel art original gerada por código: não há arquivo externo.
import { ITEMS, MOBS } from '../shared/data';
import { T, Obj } from '../shared/world';

export type Cv = HTMLCanvasElement;
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
    r(g, 0, 0, 32, 32, '#4c8a3f'); speck(40, ['#58994a', '#437c37', '#5fa350']);
    for (let i = 0; i < 5; i++) { const x = R() * 29 | 0, y = 3 + R() * 26 | 0; r(g, x, y, 1, 3, '#6bb45a'); r(g, x + 2, y + 1, 1, 2, '#6bb45a'); }
    if (v === 3) for (let i = 0; i < 4; i++) { const x = 3 + R() * 25 | 0, y = 3 + R() * 25 | 0, f = ['#f4e36b', '#f2a0c0', '#fff'][i % 3]; r(g, x, y, 2, 2, f); }
  } else if (t === T.STONE) {
    r(g, 0, 0, 32, 32, '#6e675c');
    for (let row = 0; row < 3; row++) for (let i = -1; i < 3; i++) { const x = i * 15 + (row % 2) * 7 + 1, y = row * 11, sh = ['#a29a8b', '#958d7f', '#ada596', '#8c8476'][R() * 4 | 0]; r(g, x, y, 14, 10, sh); r(g, x, y, 14, 1, '#bdb5a5'); r(g, x, y + 9, 14, 1, '#7d7568'); }
  } else if (t === T.DIRT) {
    r(g, 0, 0, 32, 32, '#94734b'); speck(44, ['#a5845a', '#826340', '#7a5c3a']);
  } else if (t === T.SNOW) {
    r(g, 0, 0, 32, 32, '#e4edf6'); speck(26, ['#d2dfec', '#f6fbff', '#c9d8e8']);
    if (v % 2) for (let i = 0; i < 12; i++) r(g, 6 + i, 18 + Math.round(Math.sin(i / 2) * 2), 2, 1, '#c5d5e7');
  } else if (t === T.ICE) {
    r(g, 0, 0, 32, 32, '#a6d6ee'); speck(16, ['#bfe5f7', '#93c8e4']);
    let x = R() * 32, y = 0; for (let i = 0; i < 26; i++) { r(g, x | 0, y | 0, 1, 1, '#e8f7ff'); x += R() * 2.4 - 1.2; y += 1.2; }
    r(g, 5 + v * 4, 6, 9, 1, '#e8f7ff');
  } else {
    r(g, 0, 0, 32, 32, '#2f74b5'); const f = frame * 8;
    for (let i = 0; i < 7; i++) { const x = (i * 13 + f + v * 5) % 32, y = (i * 9 + 3) % 30; r(g, x, y, 7, 1, '#5ba3dc'); r(g, (x + 16) % 32, (y + 15) % 31, 4, 1, '#8cc6ee'); }
  }
  tileCache.set(k, c); return c;
}

// ---------- objetos ----------
const objCache = new Map<string, Cv>();
function memo(k: string, f: () => Cv) { let c = objCache.get(k); if (!c) { c = f(); objCache.set(k, c); } return c; }
export function objSprite(o: Obj): { c: Cv; ox: number; oy: number; sway: number } {
  if (o.k === 'tree') return { c: memo('tree' + o.v, () => { const c = cv(56, 72), g = ctx(c), pal = [['#2f6b34', '#3f8740', '#59a652'], ['#2c6440', '#3a7f55', '#58a374'], ['#4f7430', '#6c9238', '#8fb14a']][o.v], R = rng(o.v + 5); r(g, 24, 46, 9, 22, '#5b3d24'); r(g, 24, 46, 3, 22, '#7a5533'); ell(g, 28, 30, 24, 22, pal[0]); ell(g, 25, 26, 19, 17, pal[1]); ell(g, 21, 21, 11, 9, pal[2]); for (let i = 0; i < 26; i++) r(g, 8 + R() * 40 | 0, 12 + R() * 34 | 0, 3, 2, pal[R() * 3 | 0]); return outline(c); }), ox: -12, oy: -40, sway: 1 };
  if (o.k === 'pine') return { c: memo('pine' + o.v, () => { const c = cv(48, 72), g = ctx(c), R = rng(o.v * 7 + 3); r(g, 21, 56, 7, 13, '#4f3a2a'); for (let t = 0; t < 4; t++) { const y = 8 + t * 13, w = 8 + t * 5; for (let i = 0; i < 20; i++) { const hw = Math.round(w * i / 19); r(g, 24 - hw, y + i, hw * 2, 1, i < 7 ? '#eef5fb' : (i + t) % 5 ? '#23584f' : '#1b4a44'); } for (let i = 0; i < 5; i++) r(g, 24 - w * .55 + R() * w * 1.1 | 0, y + 8 + R() * 8 | 0, 3, 2, '#dfeaf4'); } return outline(c); }), ox: -8, oy: -40, sway: 1 };
  if (o.k === 'rock') return { c: memo('rock' + o.v, () => { const c = cv(36, 32), g = ctx(c); ell(g, 18, 18, 15, 11, '#6f7c8c'); ell(g, 16, 15, 11, 8, '#8c9aab'); ell(g, 15, 11, 9, 4, '#eef5fb'); r(g, 20, 21, 7, 1, '#556170'); return outline(c); }), ox: -2, oy: -4, sway: 0 };
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
export interface Look { hc: string; hs: number; helm?: string | null; armor?: string | null; pants?: string | null; boots?: string | null; weapon?: string | null; robe?: string }
export const FRAME_W = 40, FRAME_H = 48;
function heroFrame(dir: number, f: number, o: Look): Cv {
  const c = cv(FRAME_W, FRAME_H), g = ctx(c), X = 4; // desloca o sprite 32 px para caber a arma
  if (f === 5) { // caído
    r(g, X + 3, 36, 26, 8, o.armor ?? '#4d5873'); r(g, X + 24, 34, 9, 9, '#e8b88f'); r(g, X + 25, 33, 8, 5, o.hc); r(g, X - 2, 38, 6, 5, o.boots ?? '#2c2632'); return outline(c);
  }
  const step = f === 1 ? 1 : f === 3 ? -1 : 0, atk = f === 4, bob = step ? 1 : 0;
  const skin = '#e8b88f', skinD = '#c98f66', armor = o.robe ?? o.armor ?? '#4d5873', armD = shade(armor, -28), armL = shade(armor, 28), pants = o.robe ? shade(o.robe, -20) : o.pants ?? '#373b52', boots = o.boots ?? '#2c2632';
  const wd = o.weapon ? ITEMS[o.weapon] : null, blade = wd?.blade ?? '#cfd8e3', isAxe = o.weapon === 'iron_axe';
  const sword = (x: number, y: number, horiz: boolean, s = 1) => {
    if (!wd) return;
    if (horiz) { r(g, x, y + 3, 3 * s > 0 ? 4 : 4, 2, '#6b4a2b'); const bx = s > 0 ? x + 4 : x - 12; r(g, bx, y + 2, 12, 4, blade); r(g, bx, y + 2, 12, 1, '#fff'); if (isAxe) r(g, s > 0 ? x + 10 : x - 12, y - 2, 6, 12, blade); }
    else { r(g, x + 1, y + 13, 2, 5, '#6b4a2b'); r(g, x - 2, y + 12, 8, 2, '#c9a44c'); r(g, x, y, 4, 12, blade); r(g, x, y, 1, 12, '#fff'); if (isAxe) r(g, x + 3, y, 7, 8, blade); if (o.weapon === 'frost_blade') r(g, x + 1, y - 3, 2, 3, '#d9f7ff'); }
  };
  const Y = 2 - bob;
  if (dir === 1 && !atk) sword(X + 24, Y + 18, false);
  // pernas
  if (dir === 2) {
    r(g, X + 12 + step * 3, Y + 32, 7, 8, pants); r(g, X + 12 + step * 3, Y + 39, 9, 4, boots);
    r(g, X + 13 - step * 3, Y + 32, 7, 8, shade(pants, -16)); r(g, X + 13 - step * 3, Y + 39, 9, 4, boots);
  } else {
    const l = step > 0 ? 2 : 0, rr = step < 0 ? 2 : 0;
    r(g, X + 10, Y + 32, 6, 9 - l, pants); r(g, X + 10, Y + 40 - l, 6, 4, boots);
    r(g, X + 17, Y + 32, 6, 9 - rr, pants); r(g, X + 17, Y + 40 - rr, 6, 4, boots);
  }
  // tronco
  const tx = dir === 2 ? 10 : 8, tw = dir === 2 ? 13 : 17;
  r(g, X + tx, Y + 20, tw, 13, armor); r(g, X + tx, Y + 20, tw, 2, armL); r(g, X + tx, Y + 31, tw, 2, armD); r(g, X + tx, Y + 29, tw, 2, '#b08a3c');
  if (dir === 0) { r(g, X + 15, Y + 22, 3, 7, armL); }
  // braços
  const sw = atk ? 0 : step * 2;
  if (dir !== 2) { r(g, X + 4, Y + 21 + sw, 4, 11, armD); r(g, X + 4, Y + 31 + sw, 4, 3, skin); if (!atk) { r(g, X + 25, Y + 21 - sw, 4, 11, armD); r(g, X + 25, Y + 31 - sw, 4, 3, skin); } }
  // cabeça
  const hx = dir === 2 ? 9 : 8, hw = dir === 2 ? 14 : 17;
  r(g, X + hx, Y + 8, hw, 13, skin); r(g, X + hx, Y + 19, hw, 2, skinD);
  if (dir === 0) { r(g, X + 11, Y + 13, 3, 4, '#2b2230'); r(g, X + 19, Y + 13, 3, 4, '#2b2230'); r(g, X + 11, Y + 13, 1, 1, '#fff'); r(g, X + 19, Y + 13, 1, 1, '#fff'); r(g, X + 15, Y + 18, 3, 1, skinD); }
  if (dir === 2) { r(g, X + 18, Y + 13, 3, 4, '#2b2230'); r(g, X + 18, Y + 13, 1, 1, '#fff'); }
  const hair = o.hc, hairD = shade(hair, -30), hairL = shade(hair, 35);
  if (o.helm) { const hm = o.helm; r(g, X + hx - 1, Y + 4, hw + 2, 9, hm); r(g, X + hx - 1, Y + 4, hw + 2, 2, shade(hm, 35)); r(g, X + hx - 1, Y + 12, hw + 2, 2, shade(hm, -30)); if (dir === 1) r(g, X + hx, Y + 8, hw, 12, hm); }
  else {
    r(g, X + hx - 1, Y + 4, hw + 2, 7, hair); r(g, X + hx + 2, Y + 4, hw - 6, 2, hairL);
    if (dir === 0) { r(g, X + hx - 1, Y + 10, 3, 5, hair); r(g, X + hx + hw - 2, Y + 10, 3, 5, hair); r(g, X + 12, Y + 10, 5, 2, hairD); }
    if (dir === 1) r(g, X + hx - 1, Y + 8, hw + 2, 12, hair);
    if (dir === 2) r(g, X + hx - 1, Y + 8, 7, 10, hair);
    if (o.hs === 1) for (let i = 0; i < 4; i++) r(g, X + hx + i * 5 - 1, Y + 1 + (i % 2) * 2, 4, 4, hair);
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
export function heroSprites(o: Look): Cv[][] {
  const k = JSON.stringify(o); let s = heroCache.get(k); if (s) return s;
  const S = [0, 1, 2, 3, 4, 5].map(f => heroFrame(0, f, o)), N = [0, 1, 2, 3, 4, 5].map(f => heroFrame(1, f, o)), E = [0, 1, 2, 3, 4, 5].map(f => heroFrame(2, f, o));
  s = [S, N, E, E.map(flip)]; heroCache.set(k, s); return s;
}
export function lookFromGear(hc: string, hs: number, e: { helm?: string | null; armor?: string | null; pants?: string | null; boots?: string | null; weapon?: string | null }): Look {
  const t = (k?: string | null) => k ? ITEMS[k]?.tint ?? null : null;
  return { hc, hs, helm: t(e.helm), armor: t(e.armor), pants: t(e.pants), boots: t(e.boots), weapon: e.weapon ?? null };
}

// ---------- monstros: [quadro][direita/esquerda] ----------
const mobCache = new Map<string, Cv[][]>();
function slime(f: number) { const c = cv(36, 30), g = ctx(c), h = f ? 10 : 12, w = f ? 15 : 13; ell(g, 18, 28 - h, w, h, '#66c6e6'); ell(g, 16, 25 - h, w - 4, h - 4, '#93e0f5'); ell(g, 13, 22 - h + 1, 3, 2, '#effcff'); r(g, 12, 25 - h + 6, 3, 4, '#17344a'); r(g, 21, 25 - h + 6, 3, 4, '#17344a'); return outline(c); }
function wolf(f: number) { const c = cv(48, 38), g = ctx(c), b = '#8ea3b8', d = '#64788e', l = '#c8d6e3', s = f ? 3 : -3; r(g, 10, 14, 24, 13, b); r(g, 10, 14, 24, 4, l); r(g, 4, 11, 7, 5, b); r(g, 2, 8, 4, 5, l); r(g, 30, 8, 12, 12, b); r(g, 38, 13, 8, 5, l); r(g, 44, 13, 2, 2, '#1d2230'); r(g, 37, 11, 2, 2, '#ff6b4a'); r(g, 31, 3, 4, 7, d); r(g, 37, 3, 3, 6, d); for (const [x, o] of [[11, s], [17, -s], [26, -s], [31, s]]) r(g, x + o, 26, 4, 10, d); return outline(c); }
function golem(f: number) { const c = cv(56, 62), g = ctx(c), a = '#7f9fbe', b = '#a8c6e0', d = '#567595', s = f ? 2 : 0; r(g, 14 + s, 44, 12, 15, d); r(g, 31 - s, 44, 12, 15, d); r(g, 12, 18, 33, 28, a); r(g, 12, 18, 33, 5, b); r(g, 3, 20 + s, 10, 27, d); r(g, 44, 20 - s, 10, 27, d); r(g, 19, 6, 19, 14, a); r(g, 19, 6, 19, 3, b); r(g, 23, 12, 4, 3, '#7ff0ff'); r(g, 31, 12, 4, 3, '#7ff0ff'); for (const [x, y, h] of [[16, 11, 8], [41, 12, 7], [8, 13, 8], [48, 14, 7], [28, 25, 11]]) { r(g, x, y, 4, h, '#d6f5ff'); r(g, x + 1, y - 3, 2, 3, '#effcff'); } return outline(c); }
function boss(f: number) { const c = cv(92, 110), g = ctx(c), s = f ? 2 : 0, rb = '#3f5fa8', rb2 = '#6186d4'; for (let y = 0; y < 62; y++) { const w = 14 + y * .42 | 0; r(g, 46 - w, 42 + y, w * 2, 1, y % 9 < 2 ? rb2 : rb); } r(g, 33, 42, 26, 16, '#88a8e2'); r(g, 37, 22, 18, 20, '#dfeaf7'); r(g, 41, 30, 3, 4, '#2552c9'); r(g, 49, 30, 3, 4, '#2552c9'); r(g, 34, 20, 24, 8, '#f3f8ff'); r(g, 33, 24, 5, 42, '#f3f8ff'); r(g, 54, 24, 5, 42, '#f3f8ff'); for (const [x, h] of [[35, 8], [41, 12], [46, 16], [51, 12], [56, 8]]) r(g, x, 20 - h, 3, h, '#7fe3ff'); r(g, 75, 12, 4, 92, '#a4e8ff'); ell(g, 77, 12 + s, 8, 8, '#d9f7ff'); r(g, 67, 56, 10, 4, '#88a8e2'); for (const [x, y] of [[12, 30 + s], [8, 62 - s], [20, 14 - s]]) { r(g, x, y, 5, 10, '#7fe3ff'); r(g, x + 1, y, 1, 10, '#fff'); } return outline(c); }
export function mobSprites(key: string): Cv[][] {
  let s = mobCache.get(key); if (s) return s;
  const f = key === 'slime' ? slime : key === 'wolf' ? wolf : key === 'golem' ? golem : boss;
  s = [0, 1].map(i => { const c = f(i); return [c, flip(c)]; }); mobCache.set(key, s); return s;
}
export const mobSize = (k: string) => (MOBS[k]?.boss ? 96 : k === 'golem' ? 56 : k === 'wolf' ? 36 : 28);

// ---------- ícones ----------
const iconCache = new Map<string, Cv>();
export function icon(key: string | null): Cv {
  const k = key ?? 'gold'; let c = iconCache.get(k); if (c) return c;
  c = cv(28, 28); const g = ctx(c), d = key ? ITEMS[key] : null, t = d?.tint ?? '#888', l = shade(t, 40), dk = shade(t, -35);
  if (!d) { for (const [x, y] of [[6, 14], [14, 14], [10, 8]]) { ell(g, x + 4, y + 4, 5, 4, '#e0b03a'); ell(g, x + 3, y + 3, 3, 2, '#ffe28a'); } }
  else if (d.kind === 'potion') { const col = d.heal ? '#e0425a' : '#3f7fe8'; r(g, 11, 3, 6, 3, '#a87b4a'); r(g, 11, 6, 6, 4, '#cfe3ee'); ell(g, 14, 17, 8, 7, col); ell(g, 11, 14, 3, 2, '#fff'); }
  else if (d.kind === 'material') { for (const [x, y, h] of [[8, 9, 13], [13, 5, 18], [18, 11, 11]]) { r(g, x, y, 4, h, '#8fe2ff'); r(g, x, y, 1, h, '#fff'); } }
  else if (d.kind === 'weapon') { const b = d.blade!; if (key === 'iron_axe') { r(g, 13, 5, 3, 20, '#6b4a2b'); ell(g, 18, 9, 6, 6, b); ell(g, 19, 8, 3, 3, '#dbe4ee'); } else { r(g, 13, 3, 4, 16, b); r(g, 13, 3, 1, 16, '#fff'); r(g, 9, 19, 12, 2, '#c9a44c'); r(g, 13, 21, 4, 5, '#6b4a2b'); } }
  else if (d.kind === 'helm') { ell(g, 14, 14, 10, 9, t); r(g, 4, 14, 20, 8, t); r(g, 8, 16, 12, 5, '#1d2230'); ell(g, 11, 9, 4, 2, l); }
  else if (d.kind === 'armor') { r(g, 7, 6, 14, 18, t); r(g, 3, 6, 5, 11, dk); r(g, 20, 6, 5, 11, dk); r(g, 10, 4, 8, 4, '#1d2230'); r(g, 13, 10, 2, 11, l); }
  else if (d.kind === 'pants') { r(g, 7, 4, 14, 8, t); r(g, 7, 12, 6, 13, t); r(g, 15, 12, 6, 13, dk); r(g, 7, 4, 14, 2, l); }
  else { r(g, 6, 5, 7, 16, t); r(g, 6, 20, 12, 5, dk); r(g, 16, 8, 6, 12, dk); r(g, 16, 20, 10, 5, t); }
  outline(c); iconCache.set(k, c); return c;
}
