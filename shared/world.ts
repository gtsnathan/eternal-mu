export const T = { GRASS: 0, STONE: 1, WATER: 2, SNOW: 3, ICE: 4, DIRT: 5, LAVA: 6, ASH: 7, MOSS: 8, DUNGEON: 9, MARBLE: 10, CLOUD: 11, DWALL: 12, SAND: 13 };
export const trapUp = (now: number) => now % 3000 < 900;
export interface Obj { k: 'tree' | 'pine' | 'rock' | 'house' | 'wall' | 'fountain' | 'lamp' | 'stall' | 'barrel' | 'spire' | 'deadtree' | 'oak' | 'shroom' | 'torch' | 'pillar' | 'statue' | 'palm'; x: number; y: number; w: number; h: number; v: number }
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
  mark(1, 13, 16, 16); rect(m, 2, 14, 16, 15, T.DIRT); rect(m, 2, 19, 15, 21, T.DIRT); rect(m, 24, 2, 26, 11, T.DIRT); rect(m, 34, 9, 46, 11, T.DIRT);
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
  m.portals.push({ x: 46.5, y: 19.5, to: 'frostvale', tx: 12, ty: 70, label: 'Frostvale' },
    { x: 24.5, y: 36.5, to: 'infernal', tx: 14, ty: 80, label: 'Infernal Dominion', lvl: 20 },
    { x: 3.5, y: 20.5, to: 'eldergrove', tx: 14, ty: 80, label: 'Eldergrove', lvl: 10 }, { x: 25.5, y: 3.5, to: 'ashen', tx: 18, ty: 70, label: 'Ashen Depths', lvl: 32 }, { x: 45.5, y: 9.5, to: 'celestial', tx: 22, ty: 70, label: 'Celestial Ruins', lvl: 60 }, { x: 3.5, y: 14.5, to: 'solmira', tx: 6, ty: 20.5, label: 'Solmira', lvl: 70 });
  m.npcs.push({ id: 'alquimista', name: 'Odila, Alquimista', x: 21.5, y: 17.5, shop: 'alquimista', line: 'Frascos frescos! Não vá ao gelo sem eles.', look: 1 },
    { id: 'ferreira', name: 'Brunna, Ferreira', x: 30.5, y: 17.5, shop: 'ferreira', line: 'O aço de Valoria nunca falha.', look: 2 },
    { id: 'artifice', name: 'Alaric, Artífice de Asas', x: 23.5, y: 23, shop: 'wings', line: 'Traga-me as relíquias dos monstros e eu forjo suas asas.', look: 5 },
    { id: 'prensa', name: 'Prensa de Joias', x: 23.5, y: 26.5, shop: 'press', line: 'Junta 10 joias em um pacote ou desmonta um pacote em 10 joias.', look: 0 },
    { id: 'mestre', name: 'Mestre Ancião', x: 33.5, y: 23, shop: 'reset', line: 'Quem alcança o topo pode renascer ainda mais forte.', look: 6 },
    { id: 'bau', name: 'Baú', x: 27.5, y: 23, shop: 'chest', line: 'Seus itens ficam guardados aqui.', look: 0 },
    { id: 'armeira', name: 'Isaura, Armeira de Sets', x: 25.5, y: 15.5, shop: 'armeira', line: 'Armaduras de lenda, para quem pode pagar.', look: 4 },
    { id: 'guildas', name: 'Bertrand, Mestre das Guildas', x: 40.5, y: 21, shop: 'guild', line: 'Juntos, vocês vão mais longe. Funde sua guilda aqui.', look: 6 },
    { id: 'missoes', name: 'Capitã Lyra, Missões', x: 19.5, y: 22.5, shop: 'missoes', line: 'Tenho trabalho para quem sabe lutar. Recompensa garantida!', look: 3 },
    { id: 'guarda', name: 'Guarda Teodoro', x: 44.5, y: 17.5, line: 'O portal leva a Frostvale. Lá fora, os monstros não perdoam.', look: 3 });
  return m;
}
function solmira() {
  const m = makeMap('solmira', 'Solmira', 50, 40, true, T.SAND), r = rng(909), plaza = (x: number, y: number) => x >= 12 && x <= 38 && y >= 9 && y <= 31, road = (y: number) => y >= 18 && y <= 22;
  rect(m, 13, 10, 37, 30, T.STONE); rect(m, 2, 19, 13, 21, T.DIRT); rect(m, 37, 19, 47, 21, T.DIRT);
  for (let x = 0; x < 50; x++) for (const y of [0, 39]) obj(m, 'wall', x, y);
  for (let y = 1; y < 39; y++) for (const x of [0, 49]) obj(m, 'wall', x, y);
  rect(m, 22, 17, 28, 22, T.WATER); for (let y = 17; y <= 22; y++) for (let x = 22; x <= 28; x++) m.solid[y * 50 + x] = 1;
  ([[15, 12, 5, 3, 2], [31, 12, 5, 3, 0], [15, 27, 5, 3, 1], [31, 27, 5, 3, 2]] as number[][]).forEach(([x, y, w, h, v]) => obj(m, 'house', x, y, w, h, v));
  ([[21, 16], [29, 16], [21, 23], [29, 23], [38, 18], [38, 22], [12, 18], [12, 22]] as number[][]).forEach(([x, y]) => obj(m, 'lamp', x, y));
  ([[20, 18], [30, 21], [20, 22], [30, 17]] as number[][]).forEach(([x, y], i) => obj(m, 'palm', x, y, 1, 1, i % 2));
  obj(m, 'stall', 14, 18, 3, 2, 1); obj(m, 'stall', 33, 22, 3, 2, 0);
  for (let y = 2; y < 38; y++) for (let x = 2; x < 48; x++) if (!plaza(x, y) && !road(y) && !(y >= 2 && y <= 8) && !m.solid[y * 50 + x] && r() < .07) obj(m, r() < .75 ? 'palm' : 'rock', x, y, 1, 1, r() * 2 | 0);
  m.spawn = { x: 25.5, y: 25 };
  m.portals.push({ x: 3.5, y: 20.5, to: 'valoria', tx: 6, ty: 14.5, label: 'Valoria' }, { x: 46.5, y: 20.5, to: 'dunas', tx: 14, ty: 70, label: 'Dunas de Solmira', lvl: 70 }, ...HI_MAPS.map((h, i) => ({ x: HI_PORTAL_X[i], y: 4.5, to: h.id, tx: 18, ty: 70, label: h.name, lvl: h.lvl })));
  m.npcs.push({ id: 'alquimista', name: 'Zahra, Alquimista', x: 20.5, y: 25.5, shop: 'alquimista', line: 'Bebam antes de cruzar as dunas.', look: 1 },
    { id: 'ferreira', name: 'Kasim, Ferreiro', x: 30.5, y: 25.5, shop: 'ferreira', line: 'Lâminas temperadas ao sol do deserto.', look: 2 },
    { id: 'armeira', name: 'Samira, Armeira de Sets', x: 25.5, y: 14.5, shop: 'armeira', line: 'As armaduras mais raras do reino chegam aqui.', look: 4 },
    { id: 'bau', name: 'Baú', x: 22.5, y: 14.5, shop: 'chest', line: 'Seus itens ficam guardados aqui.', look: 0 },
    { id: 'mestre', name: 'Mestre Ancião', x: 28.5, y: 14.5, shop: 'reset', line: 'Quem alcança o topo pode renascer ainda mais forte.', look: 6 },
    { id: 'guildas', name: 'Bertrand, Mestre das Guildas', x: 38.5, y: 22.5, shop: 'guild', line: 'Juntos, vocês vão mais longe. Funde sua guilda aqui.', look: 6 },
    { id: 'missoes', name: 'Capitã Lyra, Missões', x: 33.5, y: 20.5, shop: 'missoes', line: 'Os mundos do norte estão cheios de trabalho.', look: 3 },
    { id: 'guarda', name: 'Guarda Nadir', x: 44.5, y: 17.5, line: 'Depois deste portal, só as dunas e o Rei das Areias.', look: 3 });
  return m;
}
function dunas() {
  const W = 92, H = 70, m = makeMap('dunas', 'Dunas de Solmira', W, H, false, T.SAND), r = rng(4242);
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) m.solid[y * W + x] = 1; for (let y = 0; y < H; y++) for (const x of [0, W - 1]) m.solid[y * W + x] = 1;
  const camps = [[7, 35, 7], [26, 20, 7], [26, 50, 7], [47, 14, 7], [47, 56, 7], [47, 35, 6], [68, 22, 7], [68, 50, 7], [82, 35, 9]], near = (x: number, y: number) => camps.some(([a, b, c]) => Math.hypot(x - a, y - b) < c) || Math.abs(y - 35) < 3;
  rect(m, 42, 30, 52, 40, T.ASH); rect(m, 77, 29, 87, 41, T.MARBLE);
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) if (!near(x, y) && r() < .05) { const q = r(); obj(m, q < .45 ? 'palm' : q < .75 ? 'rock' : q < .9 ? 'deadtree' : 'pillar', x, y, 1, 1, r() * 2 | 0); }
  m.spawn = { x: 7, y: 35 }; m.portals.push({ x: 3.5, y: 35.5, to: 'solmira', tx: 44, ty: 20.5, label: 'Solmira' });
  m.zones.push({ mob: 'sandscarab', n: 12, cx: 26, cy: 20, r: 6 }, { mob: 'sandscarab', n: 12, cx: 26, cy: 50, r: 6 }, { mob: 'dunemummy', n: 9, cx: 47, cy: 14, r: 6 }, { mob: 'dunemummy', n: 9, cx: 47, cy: 56, r: 6 }, { mob: 'dunemummy', n: 8, cx: 47, cy: 35, r: 5 }, { mob: 'sanddjinn', n: 8, cx: 68, cy: 22, r: 6 }, { mob: 'sanddjinn', n: 8, cx: 68, cy: 50, r: 6 }, { mob: 'khepri', n: 1, cx: 82, cy: 35, r: 1 });
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
// ---------- Mundos de alto nível: saem dos portais do norte de Solmira ----------
interface HiMap { id: string; name: string; lvl: number; seed: number; style: 'open' | 'rooms' | 'islands'; floor: number; base: number; patch?: number; patchSolid?: boolean; objs: Obj['k'][]; dens: number; mobs: [string, string, string]; boss: string; traps?: boolean }
export const HI_MAPS: HiMap[] = [
  { id: 'pantano', name: 'Pântano Venenoso', lvl: 120, seed: 501, style: 'open', floor: T.MOSS, base: T.MOSS, patch: T.WATER, patchSolid: true, objs: ['deadtree', 'shroom', 'oak'], dens: .06, mobs: ['bogtoad', 'venomspider', 'swamphag'], boss: 'hydraqueen' },
  { id: 'cume', name: 'Cume Glacial', lvl: 150, seed: 502, style: 'open', floor: T.SNOW, base: T.SNOW, patch: T.ICE, objs: ['pine', 'rock', 'spire'], dens: .06, mobs: ['frostgolem', 'icewyrm', 'frostseraph'], boss: 'glacius' },
  { id: 'vulcao', name: 'Coração do Vulcão', lvl: 180, seed: 503, style: 'open', floor: T.ASH, base: T.ASH, patch: T.LAVA, patchSolid: true, objs: ['spire', 'rock', 'deadtree'], dens: .05, mobs: ['lavagolem', 'flamehound', 'pyromancer'], boss: 'pyros' },
  { id: 'necropole', name: 'Necrópole Esquecida', lvl: 210, seed: 504, style: 'rooms', floor: T.DUNGEON, base: T.DWALL, objs: ['pillar'], dens: 0, mobs: ['wraith', 'deathknight', 'bonedragon'], boss: 'morthul', traps: true },
  { id: 'sombria', name: 'Floresta Sombria', lvl: 240, seed: 505, style: 'open', floor: T.MOSS, base: T.GRASS, patch: T.MOSS, objs: ['oak', 'tree', 'shroom', 'deadtree'], dens: .09, mobs: ['darktreant', 'shadowelf', 'nightwolf'], boss: 'sylvara' },
  { id: 'abismo', name: 'Abismo Cristalino', lvl: 270, seed: 506, style: 'rooms', floor: T.ICE, base: T.DWALL, objs: ['spire', 'pillar'], dens: 0, mobs: ['crystalgolem', 'voidsprite', 'abyssknight'], boss: 'xalathar' },
  { id: 'caos', name: 'Trono do Caos', lvl: 300, seed: 507, style: 'islands', floor: T.ASH, base: T.LAVA, objs: ['spire', 'statue'], dens: 0, mobs: ['chaosimp', 'chaoshound', 'chaoslord'], boss: 'kaorth' },
  { id: 'vazio', name: 'Vazio Eterno', lvl: 340, seed: 508, style: 'islands', floor: T.MARBLE, base: T.DWALL, objs: ['pillar', 'statue'], dens: 0, mobs: ['voidseraph', 'starbeast', 'eternalarchon'], boss: 'nihilus' },
];
/** Mesma planta de 9 áreas para todos: entrada à esquerda, chefe no fundo à direita. */
const HI_NODES = [[9, 35, 7, 6], [27, 20, 8, 7], [27, 50, 8, 7], [47, 35, 9, 7], [47, 12, 7, 5], [47, 59, 7, 5], [67, 22, 8, 7], [67, 50, 8, 7], [82, 35, 8, 10]];
const HI_LINKS = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [1, 4], [2, 5], [3, 6], [3, 7], [4, 6], [5, 7], [6, 8], [7, 8]];
function hiMap(d: HiMap, solX: number) {
  const W = 92, H = 70, m = makeMap(d.id, d.name, W, H, false, d.base), r = rng(d.seed);
  const inNode = (x: number, y: number, pad = 0) => HI_NODES.some(([cx, cy, a, b]) => Math.abs(x - cx) <= a + pad && Math.abs(y - cy) <= b + pad);
  if (d.style === 'open') {
    for (let x = 0; x < W; x++) for (const y of [0, H - 1]) m.solid[y * W + x] = 1; for (let y = 0; y < H; y++) for (const x of [0, W - 1]) m.solid[y * W + x] = 1;
    const path = (x: number, y: number) => HI_LINKS.some(([a, b]) => { const [x0, y0] = HI_NODES[a], [x1, y1] = HI_NODES[b], L = Math.hypot(x1 - x0, y1 - y0), t = Math.max(0, Math.min(1, ((x - x0) * (x1 - x0) + (y - y0) * (y1 - y0)) / (L * L))); return Math.hypot(x - (x0 + (x1 - x0) * t), y - (y0 + (y1 - y0) * t)) < 2.5; });
    if (d.patch !== undefined) for (let i = 0; i < 26; i++) { const cx = 3 + r() * (W - 6), cy = 3 + r() * (H - 6), rad = 2 + r() * 4; for (let y = Math.floor(cy - rad); y <= cy + rad; y++) for (let x = Math.floor(cx - rad); x <= cx + rad; x++) if (x > 0 && y > 0 && x < W - 1 && y < H - 1 && Math.hypot(x - cx, y - cy) <= rad && !inNode(x, y, 1) && !path(x, y)) { m.tiles[y * W + x] = d.patch; if (d.patchSolid) m.solid[y * W + x] = 1; } }
    for (const [cx, cy, a, b] of HI_NODES) for (let y = cy - b; y <= cy + b; y++) for (let x = cx - a; x <= cx + a; x++) if (((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 <= 1) m.tiles[y * W + x] = d.floor;
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) if (!m.solid[y * W + x] && !inNode(x, y, 1) && !path(x, y) && r() < d.dens) obj(m, d.objs[r() * d.objs.length | 0], x, y, 1, 1, r() * 2 | 0);
  } else {
    m.solid.fill(1); if (d.traps) m.traps = new Set();
    const floor = (x: number, y: number) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) { m.tiles[y * W + x] = d.floor; m.solid[y * W + x] = 0; } };
    for (const [cx, cy, a, b] of HI_NODES) for (let y = cy - b; y <= cy + b; y++) for (let x = cx - a; x <= cx + a; x++) if (d.style === 'rooms' || ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 <= 1) floor(x, y);
    for (const [a, b] of HI_LINKS) { const [x0, y0] = HI_NODES[a], [x1, y1] = HI_NODES[b], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); for (let o = -1; o <= 1; o++) for (let q = -1; q <= 1; q++) { floor(x + o, y + q); if (d.traps && !inNode(x + o, y + q) && r() < .05) m.traps!.add((y + q) * W + x + o); } } }
    HI_NODES.forEach(([cx, cy, a, b], n) => { if (n === 0) return; for (let i = 0; i < 6; i++) { const t = r() * 6.283, x = Math.round(cx + Math.cos(t) * (a - 2) * (.6 + r() * .4)), y = Math.round(cy + Math.sin(t) * (b - 2) * (.6 + r() * .4)); if (!m.solid[y * W + x] && Math.hypot(x - cx, y - cy) > 2.5) obj(m, d.objs[r() * d.objs.length | 0], x, y, 1, 1, r() * 2 | 0); } });
    if (d.style === 'rooms') for (const [cx, cy, a, b] of HI_NODES) for (let x = cx - a + 3; x <= cx + a - 3; x += 6) if (m.solid[(cy - b - 1) * W + x]) m.objs.push({ k: 'torch', x, y: cy - b - 1, w: 1, h: 1, v: 0 });
  }
  m.spawn = { x: 9, y: 35 }; m.portals.push({ x: 4.5, y: 35.5, to: 'solmira', tx: solX, ty: 6.5, label: 'Solmira' });
  const [a, b, c] = d.mobs;
  m.zones.push({ mob: a, n: 12, cx: 27, cy: 20, r: 6 }, { mob: a, n: 12, cx: 27, cy: 50, r: 6 }, { mob: b, n: 9, cx: 47, cy: 12, r: 5 }, { mob: b, n: 9, cx: 47, cy: 59, r: 5 }, { mob: b, n: 8, cx: 47, cy: 35, r: 6 }, { mob: c, n: 8, cx: 67, cy: 22, r: 6 }, { mob: c, n: 8, cx: 67, cy: 50, r: 6 }, { mob: d.boss, n: 1, cx: 82, cy: 35, r: 1 });
  return m;
}
const HI_PORTAL_X = [5.5, 10.5, 15.5, 20.5, 29.5, 34.5, 39.5, 44.5];
export const MAP_SCALE = 2; // quantas vezes cada lado dos mapas de caça é ampliado
const DENSE = new Set(['tree', 'pine', 'oak', 'rock', 'spire', 'deadtree']);
/** Amplia um mapa de caça mantendo caminhos, áreas e mais monstros proporcionais. */
function enlarge(m: GameMap, k = MAP_SCALE): GameMap {
  const r = rng(m.w * 31 + m.h * 17 + m.id.length), n = makeMap(m.id, m.name, m.w * k, m.h * k, m.safe, 0), objSolid = new Set(m.objs.filter(o => o.k !== 'torch').map(o => o.y * m.w + o.x));
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const i = y * m.w + x; for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) { const j = (y * k + b) * n.w + x * k + a; n.tiles[j] = m.tiles[i]; n.solid[j] = m.solid[i] && !objSolid.has(i) ? 1 : 0; } }
  for (const o of m.objs) {
    if (o.k === 'torch') { const yy = o.y * k + k - 1; for (const dx of [0, 3]) n.objs.push({ ...o, x: o.x * k + dx, y: yy }); continue; }
    const edge = o.x === 0 || o.y === 0 || o.x === m.w - 1 || o.y === m.h - 1, cells: number[][] = [[0, 0]];
    if (DENSE.has(o.k)) for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) if ((a || b) && (edge || r() < .72)) cells.push([a, b]);
    if (o.k === 'shroom' && r() < .3) cells.push([1, 1]);
    for (const [a, b] of cells) obj(n, o.k, o.x * k + a, o.y * k + b, o.w, o.h, r() < .5 ? o.v : (r() * 3 | 0) % (o.k === 'shroom' || o.k === 'pillar' || o.k === 'statue' ? 2 : 3));
  }
  n.spawn = { x: m.spawn.x * k, y: m.spawn.y * k }; n.npcs = m.npcs;
  n.portals = m.portals.map(p => ({ ...p, x: Math.floor(p.x) * k + .5, y: Math.floor(p.y) * k + .5 }));
  n.zones = m.zones.map(z => ({ ...z, cx: z.cx * k, cy: z.cy * k, r: z.r * k, n: MOBS_IS_BOSS(z.mob) ? 1 : z.n * k }));
  if (m.traps) { n.traps = new Set(); for (const t of m.traps) for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) n.traps.add(((t / m.w | 0) * k + b) * n.w + (t % m.w) * k + a); }
  return n;
}
const MOBS_IS_BOSS = (k: string) => ['boss', 'ignarok', 'aracnia', 'vorgath', 'aethon', 'khepri', ...HI_MAPS.map(h => h.boss)].includes(k);
const cache: Record<string, GameMap> = {};
/** Destinos da janela de viagem (tecla M): mesmas regras e chegadas dos portais de Valoria. */
export function travelList() { const v = getMap('valoria'); return [{ to: 'valoria', name: v.name, lvl: 0, x: v.spawn.x, y: v.spawn.y }, ...[...v.portals, ...getMap('solmira').portals.filter(g => g.to !== 'valoria')].map(g => ({ to: g.to, name: getMap(g.to).name, lvl: g.lvl ?? 0, x: g.tx, y: g.ty }))].sort((a, b) => a.lvl - b.lvl); }
export const MAP_IDS = ['valoria', 'frostvale', 'infernal', 'eldergrove', 'ashen', 'celestial', 'solmira', 'dunas', ...HI_MAPS.map(h => h.id)];
export function getMap(id: string): GameMap { const hi = HI_MAPS.findIndex(h => h.id === id); if (hi >= 0) return cache[id] ??= enlarge(hiMap(HI_MAPS[hi], HI_PORTAL_X[hi])); return cache[id] ??= id === 'solmira' ? solmira() : id === 'dunas' ? enlarge(dunas()) : id === 'frostvale' ? enlarge(frostvale()) : id === 'infernal' ? enlarge(infernal()) : id === 'eldergrove' ? enlarge(eldergrove()) : id === 'ashen' ? enlarge(ashen()) : id === 'celestial' ? enlarge(celestial()) : valoria(); }

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
