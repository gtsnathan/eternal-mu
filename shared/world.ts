export const T = { GRASS: 0, STONE: 1, WATER: 2, SNOW: 3, ICE: 4, DIRT: 5, LAVA: 6, ASH: 7, MOSS: 8, DUNGEON: 9, MARBLE: 10, CLOUD: 11, DWALL: 12 };
export const trapUp = (now: number) => now % 3000 < 900;
export interface Obj { k: 'tree' | 'pine' | 'rock' | 'house' | 'wall' | 'fountain' | 'lamp' | 'stall' | 'barrel' | 'spire' | 'deadtree' | 'oak' | 'shroom' | 'torch' | 'pillar' | 'statue'; x: number; y: number; w: number; h: number; v: number }
export interface Portal { x: number; y: number; to: string; tx: number; ty: number; label: string; lvl?: number }
export interface Npc { id: string; name: string; x: number; y: number; shop?: string; line: string; look: number }
export interface Zone { mob: string; n: number; cx: number; cy: number; r: number }
export interface GameMap {
  id: string; name: string; w: number; h: number; safe: boolean; tiles: Uint8Array; solid: Uint8Array;
  traps?: Set<number>; objs: Obj[]; spawn: { x: number; y: number }; portals: Portal[]; npcs: Npc[]; zones: Zone[];
}
function rng(s: number) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function makeMap(id: string, name: string, w: number, h: number, safe: boolean, fill: number): GameMap {
  return { id, name, w, h, safe, tiles: new Uint8Array(w * h).fill(fill), solid: new Uint8Array(w * h), objs: [], spawn: { x: 0, y: 0 }, portals: [], npcs: [], zones: [] };
}
function obj(m: GameMap, k: Obj['k'], x: number, y: number, ow = 1, oh = 1, v = 0) {
  m.objs.push({ k, x, y, w: ow, h: oh, v });
  for (let j = y; j < y + oh; j++) for (let i = x; i < x + ow; i++) m.solid[j * m.w + i] = 1;
}
const rect = (m: GameMap, x0: number, y0: number, x1: number, y1: number, t: number) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.tiles[y * m.w + x] = t; };

function valoria() {
  const m = makeMap('valoria', 'Valoria', 50, 40, true, T.GRASS), r = rng(77);
  rect(m, 16, 12, 34, 28, T.STONE); rect(m, 34, 18, 48, 21, T.DIRT); rect(m, 23, 28, 26, 38, T.DIRT);
  const free = new Uint8Array(50 * 40);
  const mark = (x0: number, y0: number, x1: number, y1: number) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) free[y * 50 + x] = 1; };
  mark(14, 10, 36, 30); mark(34, 16, 49, 23); mark(21, 28, 28, 39); mark(1, 17, 16, 23); mark(21, 1, 29, 12); mark(33, 7, 47, 12);
  rect(m, 2, 19, 15, 21, T.DIRT); rect(m, 24, 2, 26, 11, T.DIRT); rect(m, 34, 9, 46, 11, T.DIRT);
  for (let x = 0; x < 50; x++) for (const y of [0, 39]) obj(m, 'wall', x, y);
  for (let y = 1; y < 39; y++) for (const x of [0, 49]) if (!(x === 49 && y >= 18 && y <= 21)) obj(m, 'wall', x, y);
  for (let y = 18; y <= 21; y++) m.solid[y * 50 + 49] = 1;
  ([[17, 13, 5, 3, 0], [28, 13, 6, 3, 1], [17, 24, 5, 3, 1], [29, 24, 5, 3, 2], [8, 8, 5, 3, 2], [40, 28, 6, 3, 0]] as number[][]).forEach(([x, y, w, h, v]) => { mark(x - 1, y - 2, x + w, y + h); obj(m, 'house', x, y, w, h, v); });
  obj(m, 'fountain', 24, 19, 3, 3);
  ([[23, 16], [27, 16], [22, 24], [28, 24], [36, 17], [36, 22], [43, 17], [43, 22]] as number[][]).forEach(([x, y]) => obj(m, 'lamp', x, y));
  obj(m, 'stall', 18, 20, 3, 2, 0); obj(m, 'stall', 31, 20, 3, 2, 1);
  ([[23, 13], [24, 13], [27, 26], [16, 23]] as number[][]).forEach(([x, y], i) => obj(m, 'barrel', x, y, 1, 1, i % 2));
  rect(m, 24, 19, 26, 21, T.WATER);
  rect(m, 4, 30, 11, 35, T.WATER); mark(3, 29, 12, 36); for (let y = 30; y <= 35; y++) for (let x = 4; x <= 11; x++) m.solid[y * 50 + x] = 1;
  for (let y = 1; y < 39; y++) for (let x = 1; x < 49; x++) if (!free[y * 50 + x] && !m.solid[y * 50 + x] && r() < .13) obj(m, 'tree', x, y, 1, 1, r() * 3 | 0);
  m.spawn = { x: 25.5, y: 25 };
  m.portals.push({ x: 46.5, y: 19.5, to: 'frostvale', tx: 6, ty: 35, label: 'Frostvale' },
    { x: 24.5, y: 36.5, to: 'infernal', tx: 7, ty: 40, label: 'Infernal Dominion', lvl: 20 },
    { x: 3.5, y: 20.5, to: 'eldergrove', tx: 7, ty: 40, label: 'Eldergrove', lvl: 10 }, { x: 25.5, y: 3.5, to: 'ashen', tx: 9, ty: 35, label: 'Ashen Depths', lvl: 32 }, { x: 45.5, y: 9.5, to: 'celestial', tx: 11, ty: 35, label: 'Celestial Ruins', lvl: 60 });
  m.npcs.push({ id: 'alquimista', name: 'Odila, Alquimista', x: 21.5, y: 17.5, shop: 'alquimista', line: 'Frascos frescos! Não vá ao gelo sem eles.', look: 1 },
    { id: 'ferreira', name: 'Brunna, Ferreira', x: 30.5, y: 17.5, shop: 'ferreira', line: 'O aço de Valoria nunca falha.', look: 2 },
    { id: 'artifice', name: 'Alaric, Artífice de Asas', x: 23.5, y: 23, shop: 'wings', line: 'Traga-me as relíquias dos monstros e eu forjo suas asas.', look: 5 },
    { id: 'bau', name: 'Baú', x: 27.5, y: 23, shop: 'chest', line: 'Seus itens ficam guardados aqui.', look: 0 },
    { id: 'armeira', name: 'Isaura, Armeira de Sets', x: 25.5, y: 15.5, shop: 'armeira', line: 'Armaduras de lenda, para quem pode pagar.', look: 4 },
    { id: 'guarda', name: 'Guarda Teodoro', x: 44.5, y: 17.5, line: 'O portal leva a Frostvale. Lá fora, os monstros não perdoam.', look: 3 });
  return m;
}
function frostvale() {
  const W = 90, H = 70, m = makeMap('frostvale', 'Frostvale', W, H, false, T.SNOW), r = rng(1234);
  const blk = new Uint8Array(W * H);
  const clear = (cx: number, cy: number, rad: number) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) blk[y * W + x] = 2; };
  // núcleos de bosque
  for (let i = 0; i < 70; i++) { const cx = r() * W, cy = r() * H, c = 3 + r() * 4; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if ((x - cx) ** 2 + (y - cy) ** 2 < c * c && r() < .6) blk[y * W + x] = 1; }
  let cy = 35; for (let x = 2; x < 80; x++) { cy += (r() - .5) * 1.6; cy = Math.max(22, Math.min(48, cy)); clear(x, cy, 2.6); }
  const jx = 80; for (let y = Math.round(cy); y > 12; y--) clear(jx, y, 2.6);
  const clearings: [number, number, number][] = [[6, 35, 5], [20, 28, 7], [22, 45, 7], [42, 24, 8], [46, 48, 8], [64, 30, 8], [68, 50, 8], [80, 12, 9]];
  clearings.forEach(([a, b, c]) => clear(a, b, c));
  for (let i = 0; i < 9; i++) { const a = 10 + r() * 66, b = 6 + r() * 56, c = 2 + r() * 3.5; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - a) ** 2 + (y - b) ** 2 < c * c) m.tiles[y * W + x] = T.ICE; }
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) obj(m, 'pine', x, y, 1, 1, r() * 3 | 0);
  for (let y = 1; y < H - 1; y++) for (const x of [0, W - 1]) obj(m, 'pine', x, y, 1, 1, r() * 3 | 0);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (blk[y * W + x] === 1) obj(m, r() < .12 ? 'rock' : 'pine', x, y, 1, 1, r() * 3 | 0);
    else if (!blk[y * W + x] && r() < .012) obj(m, 'rock', x, y, 1, 1, r() * 3 | 0);
  }
  m.spawn = { x: 6, y: 35 };
  m.portals.push({ x: 3.5, y: 35.5, to: 'valoria', tx: 44, ty: 20, label: 'Valoria' });
  m.zones.push({ mob: 'slime', n: 12, cx: 20, cy: 28, r: 6 }, { mob: 'slime', n: 10, cx: 22, cy: 45, r: 6 },
    { mob: 'wolf', n: 9, cx: 42, cy: 24, r: 7 }, { mob: 'wolf', n: 9, cx: 46, cy: 48, r: 7 },
    { mob: 'golem', n: 7, cx: 64, cy: 30, r: 7 }, { mob: 'golem', n: 7, cx: 68, cy: 50, r: 7 }, { mob: 'boss', n: 1, cx: 80, cy: 12, r: 1 });
  return m;
}
function infernal() {
  const W = 100, H = 80, m = makeMap('infernal', 'Infernal Dominion', W, H, false, T.ASH), r = rng(6660);
  const blk = new Uint8Array(W * H), lava = new Uint8Array(W * H), open_ = new Uint8Array(W * H);
  const clear = (cx: number, cy: number, rad: number) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) open_[y * W + x] = 1; };
  for (let i = 0; i < 34; i++) { const cx = r() * W, cy = r() * H, a = 3 + r() * 7, b = 2 + r() * 5; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 < 1) lava[y * W + x] = 1; }
  for (let i = 0; i < 60; i++) { const cx = r() * W, cy = r() * H, c = 2 + r() * 3; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if ((x - cx) ** 2 + (y - cy) ** 2 < c * c && r() < .55) blk[y * W + x] = 1; }
  let cy = 40; for (let x = 2; x < 88; x++) { cy += (r() - .5) * 1.8; cy = Math.max(26, Math.min(56, cy)); clear(x, cy, 2.4); }
  for (let y = Math.round(cy); y > 14; y--) clear(88, y, 2.4);
  ([[7, 40, 6], [22, 30, 7], [24, 52, 7], [44, 26, 8], [46, 56, 8], [68, 32, 8], [70, 58, 8], [88, 14, 11]] as number[][]).forEach(([a, b, c]) => clear(a, b, c));
  ([[22, 30, 44, 26], [24, 52, 46, 56], [44, 26, 68, 32], [46, 56, 70, 58], [22, 30, 24, 52], [68, 32, 70, 58]] as number[][]).forEach(([a, b, c, d]) => { for (let t = 0; t <= 1; t += .01) clear(a + (c - a) * t, b + (d - b) * t, 1.8); });
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) obj(m, 'spire', x, y, 1, 1, r() * 3 | 0);
  for (let y = 1; y < H - 1; y++) for (const x of [0, W - 1]) obj(m, 'spire', x, y, 1, 1, r() * 3 | 0);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x; if (open_[i]) { if (r() < .008) obj(m, 'deadtree', x, y, 1, 1, r() * 2 | 0); continue; }
    if (lava[i]) { m.tiles[i] = T.LAVA; m.solid[i] = 1; } else if (blk[i]) obj(m, r() < .25 ? 'deadtree' : 'spire', x, y, 1, 1, r() * 3 | 0);
  }
  m.objs = m.objs.filter(o => !(Math.abs(o.x - 7) < 4 && Math.abs(o.y - 40) < 4) || o.x === 0);
  for (let y = 36; y < 45; y++) for (let x = 3; x < 11; x++) m.solid[y * W + x] = 0;
  m.spawn = { x: 7, y: 40 };
  m.portals.push({ x: 3.5, y: 40.5, to: 'valoria', tx: 24.5, ty: 33, label: 'Valoria' });
  m.zones.push({ mob: 'imp', n: 12, cx: 22, cy: 30, r: 6 }, { mob: 'imp', n: 11, cx: 24, cy: 52, r: 6 }, { mob: 'hound', n: 10, cx: 44, cy: 26, r: 7 }, { mob: 'hound', n: 10, cx: 46, cy: 56, r: 7 },
    { mob: 'magma', n: 8, cx: 68, cy: 32, r: 7 }, { mob: 'wyrm', n: 6, cx: 70, cy: 58, r: 7 }, { mob: 'ignarok', n: 1, cx: 88, cy: 14, r: 1 });
  return m;
}
function eldergrove() {
  const W = 100, H = 80, m = makeMap('eldergrove', 'Eldergrove', W, H, false, T.MOSS), r = rng(4242), blk = new Uint8Array(W * H), open_ = new Uint8Array(W * H);
  const clear = (cx: number, cy: number, rad: number) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) open_[y * W + x] = 1; };
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (r() < .34) blk[y * W + x] = 1;
  let cy = 40; for (let x = 2; x < 86; x++) { cy += (r() - .5) * 1.8; cy = Math.max(24, Math.min(56, cy)); clear(x, cy, 2.5); }
  for (let y = Math.round(cy); y > 14; y--) clear(86, y, 2.5);
  const spots = [[7, 40, 6], [24, 28, 7], [26, 54, 7], [46, 24, 8], [48, 56, 7], [68, 32, 8], [70, 58, 7], [86, 14, 11]];
  spots.forEach(([a, b, c]) => clear(a, b, c));
  ([[24, 28, 46, 24], [26, 54, 48, 56], [46, 24, 68, 32], [48, 56, 70, 58], [24, 28, 26, 54], [68, 32, 70, 58]] as number[][]).forEach(([a, b, c, d]) => { for (let t = 0; t <= 1; t += .01) clear(a + (c - a) * t, b + (d - b) * t, 1.7); });
  for (let i = 0; i < 7; i++) { const a = 12 + r() * 74, b = 10 + r() * 60, c = 2 + r() * 2.5; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - a) ** 2 + (y - b) ** 2 < c * c && !open_[y * W + x]) { m.tiles[y * W + x] = T.WATER; m.solid[y * W + x] = 1; } }
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) obj(m, 'oak', x, y, 1, 1, r() * 3 | 0);
  for (let y = 1; y < H - 1; y++) for (const x of [0, W - 1]) obj(m, 'oak', x, y, 1, 1, r() * 3 | 0);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (m.solid[i]) continue; if (open_[i]) { if (r() < .015 && Math.abs(x - 7) > 4) obj(m, 'shroom', x, y, 1, 1, r() * 2 | 0); } else if (blk[i]) obj(m, r() < .14 ? 'shroom' : 'oak', x, y, 1, 1, r() * 3 | 0); }
  m.spawn = { x: 7, y: 40 }; m.portals.push({ x: 3.5, y: 40.5, to: 'valoria', tx: 6, ty: 20, label: 'Valoria' });
  m.zones.push({ mob: 'spider', n: 13, cx: 24, cy: 28, r: 6 }, { mob: 'spider', n: 11, cx: 26, cy: 54, r: 6 }, { mob: 'elf', n: 10, cx: 46, cy: 24, r: 7 }, { mob: 'sprite', n: 9, cx: 48, cy: 56, r: 6 }, { mob: 'treant', n: 8, cx: 68, cy: 32, r: 7 }, { mob: 'elf', n: 8, cx: 70, cy: 58, r: 6 }, { mob: 'aracnia', n: 1, cx: 86, cy: 14, r: 1 });
  return m;
}
function ashen() {
  const W = 92, H = 70, m = makeMap('ashen', 'Ashen Depths', W, H, false, T.DWALL), r = rng(1313); m.solid.fill(1); m.traps = new Set();
  const floor = (x: number, y: number) => { m.tiles[y * W + x] = T.DUNGEON; m.solid[y * W + x] = 0; };
  const rooms = [[9, 35, 7, 6], [27, 20, 8, 7], [27, 50, 8, 7], [47, 35, 9, 7], [47, 12, 7, 5], [47, 59, 7, 5], [67, 22, 8, 7], [67, 50, 8, 7], [81, 35, 8, 11]];
  for (const [cx, cy, a, b] of rooms) for (let y = cy - b; y <= cy + b; y++) for (let x = cx - a; x <= cx + a; x++) floor(x, y);
  const hall = (a: number, b: number) => { const [x0, y0] = rooms[a], [x1, y1] = rooms[b], cells: number[][] = []; for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let o = -1; o <= 1; o++) { floor(x, y0 + o); cells.push([x, y0 + o]); } for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let o = -1; o <= 1; o++) { floor(x1 + o, y); cells.push([x1 + o, y]); } for (const [x, y] of cells) if (!rooms.some(([cx, cy, ra, rb]) => Math.abs(x - cx) <= ra && Math.abs(y - cy) <= rb) && r() < .22) m.traps!.add(y * W + x); };
  ([[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6], [3, 7], [6, 8], [7, 8]] as number[][]).forEach(([a, b]) => hall(a, b));
  for (const [cx, cy, a, b] of rooms) { for (const sx of [-a + 2, a - 2]) { if (m.solid[(cy - b + 2) * W + cx + sx] === 0 && Math.abs(cx - 9) > 2) obj(m, 'pillar', cx + sx, cy - b + 2, 1, 1, 1); if (Math.abs(cx - 9) > 2) obj(m, 'pillar', cx + sx, cy + b - 2, 1, 1, 1); } for (let x = cx - a + 3; x <= cx + a - 3; x += 6) if (m.solid[(cy - b - 1) * W + x]) m.objs.push({ k: 'torch', x, y: cy - b - 1, w: 1, h: 1, v: 0 }); }
  m.spawn = { x: 9, y: 35 }; m.portals.push({ x: 4.5, y: 35.5, to: 'valoria', tx: 25.5, ty: 8, label: 'Valoria' });
  m.zones.push({ mob: 'skeleton', n: 12, cx: 27, cy: 20, r: 6 }, { mob: 'bonearcher', n: 10, cx: 27, cy: 50, r: 6 }, { mob: 'skeleton', n: 9, cx: 47, cy: 35, r: 6 }, { mob: 'ashdemon', n: 8, cx: 47, cy: 12, r: 4 }, { mob: 'ashdemon', n: 8, cx: 47, cy: 59, r: 4 }, { mob: 'cryptknight', n: 7, cx: 67, cy: 22, r: 6 }, { mob: 'cryptknight', n: 7, cx: 67, cy: 50, r: 6 }, { mob: 'vorgath', n: 1, cx: 81, cy: 35, r: 1 });
  return m;
}
function celestial() {
  const W = 96, H = 70, m = makeMap('celestial', 'Celestial Ruins', W, H, false, T.CLOUD), r = rng(7777); m.solid.fill(1);
  const floor = (x: number, y: number) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) { m.tiles[y * W + x] = T.MARBLE; m.solid[y * W + x] = 0; } };
  const isl = [[11, 35, 8, 7], [30, 20, 9, 8], [30, 52, 9, 8], [52, 14, 9, 7], [52, 56, 9, 7], [52, 35, 8, 7], [73, 22, 9, 8], [73, 50, 9, 8], [85, 35, 8, 11]];
  for (const [cx, cy, a, b] of isl) for (let y = cy - b; y <= cy + b; y++) for (let x = cx - a; x <= cx + a; x++) if (((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 <= 1) floor(x, y);
  const link = (a: number, b: number) => { const [x0, y0] = isl[a], [x1, y1] = isl[b], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); for (let o = -1; o <= 1; o++) for (let q = -1; q <= 1; q++) floor(x + o, y + q); } };
  ([[0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [2, 5], [3, 6], [4, 7], [5, 6], [5, 7], [6, 8], [7, 8]] as number[][]).forEach(([a, b]) => link(a, b));
  isl.forEach(([cx, cy, a, b], n) => { const c = n === 0 ? 2 : 6 + (n % 3); for (let i = 0; i < c; i++) { const t = r() * 6.283, x = Math.round(cx + Math.cos(t) * (a - 2) * (.6 + r() * .4)), y = Math.round(cy + Math.sin(t) * (b - 2) * (.6 + r() * .4)); if (!m.solid[y * W + x] && Math.hypot(x - cx, y - cy) > 2.5 && (n > 0 || x > 11)) obj(m, r() < .25 ? 'statue' : 'pillar', x, y, 1, 1, 0); } });
  m.spawn = { x: 11, y: 35 }; m.portals.push({ x: 6.5, y: 35.5, to: 'valoria', tx: 43, ty: 10, label: 'Valoria' });
  m.zones.push({ mob: 'sentinel', n: 11, cx: 30, cy: 20, r: 6 }, { mob: 'sentinel', n: 10, cx: 30, cy: 52, r: 6 }, { mob: 'seraph', n: 9, cx: 52, cy: 14, r: 6 }, { mob: 'seraph', n: 9, cx: 52, cy: 56, r: 6 }, { mob: 'ogriffin', n: 9, cx: 52, cy: 35, r: 5 }, { mob: 'archon', n: 7, cx: 73, cy: 22, r: 6 }, { mob: 'archon', n: 7, cx: 73, cy: 50, r: 6 }, { mob: 'aethon', n: 1, cx: 85, cy: 35, r: 1 });
  return m;
}
const cache: Record<string, GameMap> = {};
export const MAP_IDS = ['valoria', 'frostvale', 'infernal', 'eldergrove', 'ashen', 'celestial'];
export function getMap(id: string): GameMap { return cache[id] ??= id === 'frostvale' ? frostvale() : id === 'infernal' ? infernal() : id === 'eldergrove' ? eldergrove() : id === 'ashen' ? ashen() : id === 'celestial' ? celestial() : valoria(); }

export const isSolid = (m: GameMap, x: number, y: number) => { const i = Math.floor(x), j = Math.floor(y); return i < 0 || j < 0 || i >= m.w || j >= m.h || m.solid[j * m.w + i] === 1; };
const R = .3;
export const blocked = (m: GameMap, x: number, y: number) => isSolid(m, x - R, y - R) || isSolid(m, x + R, y - R) || isSolid(m, x - R, y + R) || isSolid(m, x + R, y + R);
export function step(m: GameMap, p: { x: number; y: number }, dx: number, dy: number) {
  if (!blocked(m, p.x + dx, p.y)) p.x += dx;
  if (!blocked(m, p.x, p.y + dy)) p.y += dy;
}
/** A* em grade com limite de nós; devolve centros dos tiles a seguir. */
export function findPath(m: GameMap, sx: number, sy: number, tx: number, ty: number, limit = 1500): { x: number; y: number }[] | null {
  const W = m.w, start = Math.floor(sy) * W + Math.floor(sx); let goal = Math.floor(ty) * W + Math.floor(tx);
  const tgx = goal % W, tgy = goal / W | 0;
  if (isSolid(m, tgx, tgy)) { // alvo sólido: usa um vizinho livre
    let best = -1, bd = 1e9;
    for (let d = 1; d < 4 && best < 0; d++) for (let y = -d; y <= d; y++) for (let x = -d; x <= d; x++) if (!isSolid(m, tgx + x, tgy + y)) { const c = (tgx + x - sx) ** 2 + (tgy + y - sy) ** 2; if (c < bd) { bd = c; best = (tgy + y) * W + tgx + x; } }
    if (best < 0) return null; goal = best;
  }
  const h = (i: number) => Math.hypot(i % W - goal % W, (i / W | 0) - (goal / W | 0));
  const g = new Map([[start, 0]]), from = new Map<number, number>(), open = [start], closed = new Set<number>();
  for (let n = 0; open.length && n < limit; n++) {
    let bi = 0, bf = 1e12; for (let i = 0; i < open.length; i++) { const f = g.get(open[i])! + h(open[i]); if (f < bf) { bf = f; bi = i; } }
    const c = open[bi]; open[bi] = open[open.length - 1]; open.pop();
    if (c === goal) { const out: { x: number; y: number }[] = []; for (let k = c; k !== start; k = from.get(k)!) out.push({ x: k % W + .5, y: (k / W | 0) + .5 }); return out.reverse(); }
    closed.add(c);
    const cx = c % W, cy = c / W | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const nx = cx + dx, ny = cy + dy;
      if (isSolid(m, nx, ny) || (dx && dy && (isSolid(m, cx + dx, cy) || isSolid(m, cx, cy + dy)))) continue;
      const k = ny * W + nx; if (closed.has(k)) continue;
      const ng = g.get(c)! + (dx && dy ? 1.414 : 1);
      if (ng < (g.get(k) ?? 1e12)) { if (!g.has(k)) open.push(k); g.set(k, ng); from.set(k, c); }
    }
  }
  return null;
}
