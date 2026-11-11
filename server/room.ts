import { masterNext, MR_RESETS, MR_GOLD, MR_POINTS, MASTER_RESETS, MASTER_MAX, MASTER_NODE_MAX, MASTER_NODES, JEWEL_PACKS, WING_TIER, WING_RECIPES, EXC_ARMOR, EXC_WEAPON, cleanSettings, DEFAULT_SETTINGS, Settings, SETS, SET_PIECES, canWield, JEWELS, isStack, STACK_MAX, classOf, CONFIG, derive, ItemInst, ITEMS, MOBS, MobDef, rollDamage, SHOPS, SLOTS, sellPrice, xpToNext, Slot, RARITY } from '../shared/data';
import { trapUp, blocked, findPath, GameMap, getMap, isSolid, MAP_IDS, step, travelList } from '../shared/world';

type Pt = { x: number; y: number };
interface Player extends Pt {
  accountId: number; eid: number; charId: number; ws: CfWebSocket; name: string; resets: number; mr: number; ml: number; mxp: number; mpts: number; mtree: Record<string, number>; buffAtk: number; buffDef: number; maxHpC: number; streak: number; streakUntil: number; trade: Trade | null; tradeFrom: { from: number; until: number } | null; cls: string; partyId: number; invite: { from: number; until: number } | null; hairColor: number; hairStyle: number;
  level: number; xp: number; points: number; str: number; agi: number; vit: number; ene: number; hp: number; mp: number; gold: number;
  map: string; items: ItemInst[]; chest: ItemInst[]; ix: number; iy: number; path: Pt[] | null; target: number; nextAtk: number; nextRepath: number; nextPotion: number;
  cds: Record<number, number>; deadUntil: number; known: Set<number>; dirty: boolean; meDirty: boolean; dirtyItems: Set<string>; delItems: Set<string>; logs: unknown[][];
  /** itens que só mudaram de quantidade (poção, pilha): gravados com UPDATE simples */
  qtyItems: Set<string>; savedRow: string; savedRank: string;
  nextMove?: number; budget: number; lastChat: number; nextTrap: number; nextRegen: number; gone: boolean; lastInvFull: number;
}
interface Trade { peer: Player; ids: Set<string>; gold: number; st: number }
interface Mob extends Pt { eid: number; def: MobDef; hx: number; hy: number; hp: number; state: 'idle' | 'chase' | 'back'; target: number; path: Pt[] | null; nextAtk: number; nextThink: number; respawnAt: number; nextNova: number; phase: number; curseUntil: number; slowUntil: number; hitBy: Map<number, number> }
interface Summon extends Pt { eid: number; owner: Player; pet: string; atk: number; expires: number; nextAtk: number }
interface Drop extends Pt { eid: number; key: string | null; gold: number; rarity: number; opts: string[]; owner: number; party: number; ownUntil: number; expires: number }

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const round = (n: number) => Math.round(n * 100) / 100;
/** Junta registros repetidos de coleta (ouro e itens empilháveis) em uma linha por gravação. */
const MERGE_LOG = new Set(['loot_gold', 'loot']);
function mergeLogs(logs: unknown[][]): unknown[][] {
  const out: unknown[][] = [], by = new Map<string, unknown[]>();
  for (const l of logs) {
    if (!MERGE_LOG.has(l[0] as string)) { out.push(l); continue; }
    const k = `${l[0]}|${l[1]}|${l[2]}`, m = by.get(k);
    if (m) { m[3] = (m[3] as number) + (l[3] as number); m[4] = (m[4] as number) + (l[4] as number); m[5] = l[5]; }
    else { const c = [...l]; by.set(k, c); out.push(c); }
  }
  return out;
}

export class MapRoom {
  private env: Env; private map!: GameMap; private mapId = '';
  private players = new Map<number, Player>(); private mobs = new Map<number, Mob>(); private drops = new Map<number, Drop>();
  private summons = new Map<number, Summon>(); private partyMode = new Map<number, number>(); private partyQ: Promise<unknown> = Promise.resolve();
  private byChar = new Map<number, Player>(); private saves = new Map<number, Promise<unknown>>();
  private nextId = 1; private timer: ReturnType<typeof setInterval> | null = null; private last = 0; private lastSave = 0;
  private cfg: Settings = DEFAULT_SETTINGS; private cfgReady: Promise<void> | null = null; private defs: Record<string, MobDef> = structuredClone(MOBS); private jewelRules = structuredClone(JEWELS);
  private tickN = 0; private announced = new Map<number, number>();
  private fx: (Pt & Record<string, unknown>)[] = [];
  private timed: { at: number; run: () => void }[] = []; private saveWarnAt = 0;
  /** Agenda algo para alguns ticks depois (golpes em sequência das habilidades). */
  private later(at: number, run: () => void) { this.timed.push({ at, run }); }

  constructor(_state: unknown, env: Env) { this.env = env; }

  async fetch(req: Request): Promise<Response> {
    const route = new URL(req.url).pathname;
    if (route === '/settings') { this.applyCfg(cleanSettings(await req.json())); this.cfgReady = Promise.resolve(); return new Response('{}'); }
    if (route === '/news') { const b: any = await req.json(); this.send_all(JSON.stringify({ t: 'news', m: b.m })); return new Response('{}'); }
    if (route === '/kick') { const b: any = await req.json(); for (const p of [...this.players.values()]) if (p.accountId === b.account) { this.send(p, { t: 'kick', m: 'Conta suspensa.' }); try { p.ws.close(4000, 'banned'); } catch { /* */ } this.leave(p); } return new Response('{}'); }
    if (route === '/player') { const b: any = await req.json(), p = this.byChar.get(b.char); if (!p) return new Response('{}'); if (b.level > p.level) p.points += (b.level - p.level) * CONFIG.pointsPerLevel; p.level = b.level; p.xp = 0; p.gold = b.gold; p.dirty = true; p.meDirty = true; for (const o of this.players.values()) o.known.delete(p.eid); await this.flush(p); return new Response('{"handled":true}'); }
    if (route === '/dropchar') { // personagem sendo excluído: tira do mapa e espera a última gravação terminar
      const b: any = await req.json(), p = this.byChar.get(b.char);
      if (p) { p.dirtyItems.clear(); p.delItems.clear(); p.qtyItems.clear(); p.logs = []; [p.savedRow, p.savedRank] = this.rowOf(p); this.send(p, { t: 'kick', m: 'Este personagem foi excluído.' }); try { p.ws.close(4000, 'deleted'); } catch { /* */ } this.leave(p); }
      await this.saves.get(b.char); return new Response('{}');
    }
    if (route === '/count') return new Response(JSON.stringify({ n: this.players.size, list: [...this.players.values()].map(p => ({ name: p.name, cls: p.cls, level: p.level, resets: p.resets, mr: p.mr })) }));
    if (route === '/addstats') { const b: any = await req.json(), p = this.byChar.get(b.char); if (!p) return new Response('{}'); const t = b.add.reduce((x: number, y: number) => x + y, 0); if (t > p.points) return new Response('{"handled":true,"error":"Pontos insuficientes."}'); p.str += b.add[0]; p.agi += b.add[1]; p.vit += b.add[2]; p.ene += b.add[3]; p.points -= t; p.dirty = true; p.meDirty = true; await this.flush(p); return new Response('{"handled":true}'); }
    if (route === '/global') { this.send_all(await req.text()); return new Response('ok'); }
    if (route === '/partychat') { const b: any = await req.json(); this.partySend(b.pid, b.msg); return new Response('ok'); }
    if (route === '/party') { await this.reloadParty(((await req.json()) as any).pid); return new Response('ok'); }
    this.init(req.headers.get('x-map')!);
    const pair = new WebSocketPair(); const client = pair[0], server = pair[1];
    server.accept();
    this.join(server, Number(req.headers.get('x-char')), new URL(req.url).searchParams.has('login')).catch(e => { console.error('join', e); try { server.close(1011, 'erro'); } catch { /* já fechado */ } });
    return new Response(null, { status: 101, webSocket: client } as ResponseInit);
  }

  private init(id: string) {
    if (this.map) return;
    this.mapId = id; this.map = getMap(id);
    for (const z of this.map.zones) for (let i = 0; i < z.n; i++) {
      const p = this.randomFree(z.cx, z.cy, z.r), def = this.defs[z.mob];
      const m: Mob = { eid: this.nextId++, def, x: p.x, y: p.y, hx: p.x, hy: p.y, hp: def.hp, state: 'idle', target: 0, path: null, nextAtk: 0, nextThink: 0, respawnAt: 0, nextNova: 0, phase: 1, curseUntil: 0, slowUntil: 0, hitBy: new Map() };
      this.mobs.set(m.eid, m);
    }
  }
  private async loadCfg() { try { const r = await this.env.DB.prepare("SELECT value FROM settings WHERE key='game'").first<{ value: string }>(); if (r) this.applyCfg(cleanSettings(JSON.parse(r.value))); } catch (e) { console.error('cfg', e); } }
  private applyCfg(c: Settings) {
    this.cfg = c;
    for (const k of Object.keys(MOBS)) {
      const base = MOBS[k], o = c.mobs[k] ?? {}, d = this.defs[k], old = d.hp;
      d.hp = Math.max(1, Math.round((o.hp ?? base.hp) * c.hp)); d.dmg = Math.round((o.dmg ?? base.dmg) * c.dmg); d.def = o.def ?? base.def; d.xp = Math.round((o.xp ?? base.xp) * c.xp); d.respawnMs = Math.round((o.respawnMs ?? base.respawnMs) * c.respawn);
      d.gold = [Math.round(base.gold[0] * c.gold), Math.round(base.gold[1] * c.gold)]; d.drops = base.drops.map(([i, ch]) => [i, Math.min(1, ch * (o.drop ?? 1) * (i.startsWith('jewel_') ? c.jewel : c.drop))]);
      if (old !== d.hp) for (const m of this.mobs.values()) if (m.def === d && m.hp > 0) m.hp = Math.max(1, Math.ceil(m.hp / old * d.hp));
    }
    for (const k of Object.keys(JEWELS)) this.jewelRules[k].chance = c.jewels[k] ?? JEWELS[k].chance;
    const jc = Object.fromEntries(Object.entries(this.jewelRules).map(([k, v]) => [k, v.chance])); for (const p of this.players.values()) this.send(p, { t: 'jc', jc });
  }
  private randomFree(cx: number, cy: number, r: number): Pt {
    for (let i = 0; i < 60; i++) { const a = Math.random() * 6.283, d = Math.random() * r, p = { x: Math.floor(cx + Math.cos(a) * d) + .5, y: Math.floor(cy + Math.sin(a) * d) + .5 }; if (!blocked(this.map, p.x, p.y)) return p; }
    return { x: Math.floor(cx) + .5, y: Math.floor(cy) + .5 };
  }

  // ---------- conexão ----------
  private async join(ws: CfWebSocket, charId: number, login = false) {
    let open = true, player: Player | null = null; const early: string[] = [];
    ws.addEventListener('close', () => { open = false; if (player) this.leave(player); });
    ws.addEventListener('error', () => { open = false; if (player) this.leave(player); });
    ws.addEventListener('message', e => { if (player) this.onMessage(player, e.data); else if (early.length < 5) early.push(e.data); });
    await (this.cfgReady ??= this.loadCfg());
    if (!open) return;
    const old = this.byChar.get(charId);
    if (old) { this.send(old, { t: 'kick', m: 'Este personagem entrou em outro dispositivo.' }); try { old.ws.close(4000, 'replaced'); } catch { /* já fechado */ } this.leave(old); }
    await this.saves.get(charId);
    const db = this.env.DB;
    const [c, its] = await Promise.all([db.prepare('SELECT * FROM characters WHERE id=?').bind(charId).first(), db.prepare('SELECT * FROM items WHERE char_id=?').bind(charId).all()]);
    if (!open) return;
    if (!c || c.map !== this.mapId) { ws.close(4001, 'retry'); return; } // mudou de mapa durante a troca
    if (this.byChar.has(charId)) { ws.close(4000, 'replaced'); return; }
    const all: ItemInst[] = its.results.map((i: any) => ({ id: i.id, key: i.item_key, qty: i.qty, slot: i.slot, equip: i.equip, rarity: i.rarity, plus: i.plus ?? 0, opts: (() => { try { return i.opts ? JSON.parse(i.opts) : []; } catch { return []; } })() }));
    const items = all.filter(i => i.equip || i.slot < 1000), chest = all.filter(i => !i.equip && i.slot >= 1000);
    const p: Player = {
      accountId: c.account_id, eid: this.nextId++, charId, ws, name: c.name, resets: c.resets ?? 0, mr: c.master_resets ?? 0, ml: c.master_level ?? 0, mxp: c.master_xp ?? 0, mpts: c.master_points ?? 0, mtree: (() => { try { return c.master_tree ? JSON.parse(c.master_tree) : {}; } catch { return {}; } })(), buffAtk: 0, buffDef: 0, maxHpC: 1, streak: 0, streakUntil: 0, trade: null, tradeFrom: null, cls: c.class, partyId: 0, invite: null, hairColor: c.hair_color, hairStyle: c.hair_style, level: c.level, xp: c.xp, points: c.points, str: c.str, agi: c.agi, vit: c.vit, ene: c.ene, hp: c.hp, mp: c.mp, gold: c.gold,
      x: c.x, y: c.y, map: c.map, items, chest, ix: 0, iy: 0, path: null, target: 0, nextAtk: 0, nextRepath: 0, nextPotion: 0, cds: {}, deadUntil: 0, known: new Set(), dirty: false, meDirty: true, dirtyItems: new Set(), delItems: new Set(), logs: [], qtyItems: new Set(), savedRow: '', savedRank: '', budget: 40, lastChat: 0, nextTrap: 0, nextRegen: 0, gone: false, lastInvFull: 0,
    };
    { const a = this.mergeStacks(p, false), b = this.mergeStacks(p, true); if (a || b) p.dirty = true; } // junta joias, poções etc. em pilhas de até 1000
    { const [r, k] = this.rowOf(p); p.savedRow = r; p.savedRank = k; } // estado igual ao do banco
    if (blocked(this.map, p.x, p.y)) { p.x = this.map.spawn.x; p.y = this.map.spawn.y; }
    if (p.hp <= 0) p.hp = this.stats(p).maxHp;
    player = p; this.players.set(p.eid, p); this.byChar.set(charId, p);
    this.send(p, { t: 'w', you: p.eid, map: this.mapId, x: p.x, y: p.y, name: p.name, cls: p.cls, hairColor: p.hairColor, hairStyle: p.hairStyle, jc: Object.fromEntries(Object.entries(this.jewelRules).map(([k, v]) => [k, v.chance])) });
    this.sendInv(p); this.sendMe(p);
    if (login && Date.now() - (this.announced.get(charId) ?? 0) > 60000) { // anuncia só na entrada real, sem repetir em quedas
      this.announced.set(charId, Date.now()); if (this.announced.size > 2000) this.announced.clear();
      const msg = JSON.stringify({ t: 'ann', name: p.name, cls: p.cls }); this.send_all(msg);
      for (const id of MAP_IDS) if (id !== this.mapId) this.stub(id).fetch(new Request('https://room/global', { method: 'POST', body: msg })).catch(() => { });
    }
    const pm = await db.prepare('SELECT party_id FROM party_members WHERE char_id=?').bind(charId).first<{ party_id: number }>();
    if (pm && !p.gone) { p.partyId = pm.party_id; await this.reloadParty(pm.party_id); }
    for (const m of early) this.onMessage(p, m);
    if (!this.timer) { this.last = Date.now(); this.lastSave = this.last; this.timer = setInterval(() => this.safeTick(), CONFIG.tickMs); }
  }
  private leave(p: Player) {
    if (p.gone) return; this.cancelTrade(p, 'O outro jogador saiu.'); p.gone = true;
    this.players.delete(p.eid);
    if (this.byChar.get(p.charId) === p) this.byChar.delete(p.charId);
    p.dirty = true; this.flush(p);
    if (!this.players.size && this.timer) { clearInterval(this.timer); this.timer = null; }
  }
  private flush(p: Player) { return this.saveBatch([p]); }
  /** Colunas do personagem como texto, para comparar com o que já está no banco. */
  private rowOf(p: Player): [string, string] {
    return [JSON.stringify([p.mxp, p.mpts, JSON.stringify(p.mtree), p.xp, p.points, p.str, p.agi, p.vit, p.ene, Math.floor(p.hp), Math.floor(p.mp), p.gold, p.map, round(p.x), round(p.y)]), JSON.stringify([p.resets, p.ml, p.level, p.mr])];
  }
  /** Grava um ou mais personagens em uma única transação (trocas gravam os dois juntos). */
  private saveBatch(ps: Player[]): Promise<unknown> {
    const db = this.env.DB, dels: D1PreparedStatement[] = [], ins: D1PreparedStatement[] = [], rest: D1PreparedStatement[] = [], undo: (() => void)[] = [];
    for (const p of ps) {
      if (!p.dirty && !p.dirtyItems.size && !p.delItems.size && !p.qtyItems.size && !p.logs.length) continue;
      const logs = mergeLogs(p.logs); p.logs = [];
      // apaga antes de regravar: os índices de posição são únicos
      for (const id of p.delItems) dels.push(db.prepare('DELETE FROM items WHERE id=? AND char_id=?').bind(id, p.charId));
      const dirtyIds = [...p.dirtyItems], changed = [...p.items, ...p.chest].filter(i => p.dirtyItems.has(i.id));
      for (const i of changed) { dels.push(db.prepare('DELETE FROM items WHERE id=? AND char_id=?').bind(i.id, p.charId)); ins.push(db.prepare('INSERT INTO items(id,char_id,item_key,qty,slot,equip,rarity,plus,opts) VALUES(?,?,?,?,?,?,?,?,?)').bind(i.id, p.charId, i.key, i.qty, i.slot, i.equip, i.rarity, i.plus ?? 0, i.opts?.length ? JSON.stringify(i.opts) : null)); }
      for (const id of p.qtyItems) { if (p.dirtyItems.has(id) || p.delItems.has(id)) continue; const i = p.items.find(x => x.id === id) ?? p.chest.find(x => x.id === id); if (i) rest.push(db.prepare('UPDATE items SET qty=? WHERE id=? AND char_id=?').bind(i.qty, i.id, p.charId)); }
      // só grava o personagem se algo mudou desde a última gravação; nível/resets à parte para não mexer no índice do ranking à toa
      const [row, rank] = this.rowOf(p), oldRow = p.savedRow, oldRank = p.savedRank;
      if (row !== oldRow) rest.push(db.prepare('UPDATE characters SET master_xp=?,master_points=?,master_tree=?,xp=?,points=?,str=?,agi=?,vit=?,ene=?,hp=?,mp=?,gold=?,map=?,x=?,y=? WHERE id=?').bind(...JSON.parse(row), p.charId));
      if (rank !== oldRank) { const [rs, ml, lv, mr] = JSON.parse(rank), [, , , omr] = oldRank ? JSON.parse(oldRank) : []; rest.push(db.prepare('UPDATE characters SET resets=?,master_level=?,level=? WHERE id=?').bind(rs, ml, lv, p.charId)); if (mr !== (omr ?? 0)) rest.push(db.prepare('UPDATE characters SET master_resets=? WHERE id=?').bind(mr, p.charId)); }
      p.savedRow = row; p.savedRank = rank;
      for (const l of logs) rest.push(db.prepare('INSERT INTO item_log(char_id,action,item_id,item_key,qty,gold_delta,at) VALUES(?,?,?,?,?,?,?)').bind(p.charId, ...l));
      const delIds = [...p.delItems], qtyIds = [...p.qtyItems]; p.delItems.clear(); p.dirtyItems.clear(); p.qtyItems.clear(); p.dirty = false;
      undo.push(() => { p.dirty = true; p.savedRow = oldRow; p.savedRank = oldRank; dirtyIds.forEach(i => p.dirtyItems.add(i)); delIds.forEach(i => p.delItems.add(i)); qtyIds.forEach(i => p.qtyItems.add(i)); p.logs.unshift(...logs); });
    }
    const prev = Promise.all(ps.map(p => this.saves.get(p.charId)));
    if (!undo.length) return prev;
    const st = [...dels, ...ins, ...rest];
    if (!st.length) return prev; // nada mudou de verdade: não grava
    const run: Promise<unknown> = prev.then(() => db.batch(st)).catch(e => { console.error('save', e); if (ps.some(p => p.gone)) return db.batch(st).catch(e2 => { console.error('save retry', e2); undo.forEach(u => u()); this.saveFailed(); }); undo.forEach(u => u()); this.saveFailed(); });
    for (const p of ps) { this.saves.set(p.charId, run); run.finally(() => { if (this.saves.get(p.charId) === run) this.saves.delete(p.charId); }); }
    return run;
  }
  /** O banco recusou a gravação (ex.: limite diário do D1): avisa quem está no mapa, no máximo a cada 5 minutos. */
  private saveFailed() { const n = Date.now(); if (n - this.saveWarnAt < 300000) return; this.saveWarnAt = n; for (const p of this.players.values()) this.sys(p, '⚠ O servidor não conseguiu salvar agora. Seu progresso continua guardado e será salvo assim que possível; evite sair do jogo por alguns minutos.'); }
  private send(p: Player, m: unknown) { try { p.ws.send(JSON.stringify(m)); } catch { /* fechando */ } }
  private send_all(s: string) { for (const p of this.players.values()) try { p.ws.send(s); } catch { /* fechando */ } }
  private stats(p: Player) { const s = derive(p, p.items), n = Date.now(); if (n < p.buffAtk) s.atk = Math.floor(s.atk * 1.3); if (n < p.buffDef) s.def = Math.floor(s.def * 1.4); return s; }
  private stub(id: string) { return this.env.MAP_ROOM.get(this.env.MAP_ROOM.idFromName(id + ':e'), { locationHint: 'enam' }); }
  private sendMe(p: Player) {
    const s = this.stats(p); p.meDirty = false;
    this.send(p, { t: 'me', hp: Math.ceil(p.hp), mp: Math.floor(p.mp), maxHp: s.maxHp, maxMp: s.maxMp, xp: p.xp, xpNext: xpToNext(p.level), level: p.level, points: p.points, str: p.str, agi: p.agi, vit: p.vit, ene: p.ene, atk: s.atk, def: s.def, resets: p.resets, mr: p.mr, ml: p.ml, mxp: p.mxp, mxpNext: masterNext(p.ml), mpts: p.mpts, mtree: p.mtree, gold: p.gold, dead: p.deadUntil > 0, loot: p.streak, lootMs: Math.max(0, p.streakUntil - Date.now()) });
  }
  private sendInv(p: Player) { this.send(p, { t: 'inv', items: p.items, chest: p.chest }); }
  private sys(p: Player, m: string) { this.send(p, { t: 'sys', m }); }

  // ---------- comandos do cliente: nada aqui confia em valores calculados pelo cliente ----------
  private onMessage(p: Player, raw: unknown) {
    if (p.gone || typeof raw !== 'string' || raw.length > 400) return;
    if (--p.budget < -30) { try { p.ws.close(4002, 'flood'); } catch { /* */ } return; }
    if (p.budget < 0) return;
    let m: any; try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'ping') return this.send(p, { t: 'pong', c: m.c });
    if (m.t === 'c') return this.chat(p, m);
    if (p.deadUntil) return;
    const now = Date.now();
    if (p.trade && ['b', 'se', 'u', 'e', 'ue', 'up', 'cw', 'dep', 'wd', 'pj', 'uj', 'mv', 'x', 'xa', 'org'].includes(m.t)) return this.sys(p, 'Termine a troca primeiro.');
    switch (m.t) {
      case 'i': {
        if (!Number.isFinite(m.x) || !Number.isFinite(m.y)) return;
        const l = Math.hypot(m.x, m.y); p.ix = l > 1 ? m.x / l : m.x; p.iy = l > 1 ? m.y / l : m.y;
        if (l > .01) { p.path = null; p.target = 0; }
        return;
      }
      case 'g': if (Number.isFinite(m.x) && Number.isFinite(m.y)) { p.target = 0; p.path = findPath(this.map, p.x, p.y, m.x, m.y); } return;
      case 'a': if (this.mobs.get(m.id)?.hp && !this.map.safe) { p.target = m.id; p.nextRepath = 0; } return;
      case 'k': return this.skill(p, m.n, m.id, now);
      case 'u': return this.usePotion(p, m.slot, now);
      case 'e': return this.equip(p, m.slot);
      case 'x': return this.discard(p, [m.slot]);
      case 'org': { const a = this.mergeStacks(p, false), b = this.mergeStacks(p, true); if (a || b) { p.dirty = true; this.sendInv(p); } return this.sys(p, a || b ? `Pilhas juntadas (até ${STACK_MAX} por espaço).` : 'Suas pilhas já estão organizadas.'); }
      case 'xa': return this.discard(p, Array.isArray(m.slots) ? m.slots.slice(0, CONFIG.invSize) : []);
      case 'ue': return this.unequip(p, m.eq);
      case 'st': return this.addStat(p, m.s, m.n);
      case 'b': return this.buy(p, m.npc, m.key, m.qty);
      case 'se': return this.sell(p, m.npc, m.slot, m.all === true);
      case 'pj': return this.packJewels(p, m.key);
      case 'uj': return this.unpackJewels(p, m.slot);
      case 'mv': return this.moveTo(p, m.to, now);
      case 'rs': return this.doReset(p);
      case 'mrs': return this.doMasterReset(p);
      case 'mt': return this.spendMaster(p, m.k);
      case 'dep': return this.chestDeposit(p, m.slot);
      case 'wd': return this.chestWithdraw(p, m.slot);
      case 'cw': return this.craftWings(p, m.tier);
      case 'up': return this.upgrade(p, m.j, m.item);
      case 'ti': return this.tradeInvite(p, m.id);
      case 'ta': return this.tradeAccept(p);
      case 'td': if (p.trade) this.cancelTrade(p, `${p.name} cancelou a troca.`); p.tradeFrom = null; return;
      case 'to': return this.tradeOffer(p, m.ids, m.gold);
      case 'tk': return this.tradeConfirm(p);
      case 'pi': return this.invite(p, m.id);
      case 'pa': return this.enqueueParty(() => this.acceptInvite(p));
      case 'pd': p.invite = null; return;
      case 'pl': return this.enqueueParty(() => this.leaveParty(p.partyId, p.charId));
      case 'pk': return this.enqueueParty(() => this.kick(p, m.char));
      case 'pm': return this.enqueueParty(() => this.setMode(p));
    }
  }
  private chat(p: Player, m: any) {
    const now = Date.now();
    if (typeof m.m !== 'string' || now - p.lastChat < 700) return;
    const txt = m.m.trim().slice(0, 160); if (!txt) return; p.lastChat = now;
    if (this.cfg.test && /^\/teste(\s|$)/i.test(txt)) return this.testKit(p, txt, now);
    if (m.ch === 'p') {
      if (!p.partyId) return this.sys(p, 'Você não está em um grupo.');
      const msg = JSON.stringify({ t: 'c', ch: 'p', from: p.name, m: txt });
      this.partySend(p.partyId, msg);
      for (const id of MAP_IDS) if (id !== this.mapId) this.stub(id).fetch(new Request('https://room/partychat', { method: 'POST', body: JSON.stringify({ pid: p.partyId, msg }) })).catch(() => { });
      return;
    }
    const msg = JSON.stringify({ t: 'c', ch: m.ch === 'g' ? 'g' : 'l', from: p.name, m: txt });
    if (m.ch === 'g') {
      this.send_all(msg);
      for (const id of MAP_IDS) if (id !== this.mapId) this.stub(id).fetch(new Request('https://room/global', { method: 'POST', body: msg })).catch(() => { });
    } else for (const o of this.players.values()) if (dist(o, p) < CONFIG.aoiRadius) try { o.ws.send(msg); } catch { /* */ }
  }
  private addStat(p: Player, s: unknown, n: unknown) {
    if (!(s === 'str' || s === 'agi' || s === 'vit' || s === 'ene') || !Number.isInteger(n) || (n as number) < 1 || (n as number) > p.points) return;
    p[s] += n as number; p.points -= n as number; p.dirty = true; p.meDirty = true;
  }
  private freeSlot(p: Player) { const used = new Set(p.items.filter(i => !i.equip).map(i => i.slot)); for (let i = 0; i < CONFIG.invSize; i++) if (!used.has(i)) return i; return -1; }
  private give(p: Player, key: string, qty: number, rarity: number, reason: string, opts: string[] = []): boolean {
    const def = ITEMS[key];
    let it: ItemInst | undefined;
    if (isStack(def)) { // completa as pilhas que já existem e abre espaços novos só para o que sobrar (até 1000 cada)
      if (this.slotsNeeded(p, key, qty) > this.freeSlots(p)) return false;
      let left = qty;
      for (const s of p.items.filter(i => i.key === key && !i.equip && i.qty < STACK_MAX).sort((a, b) => a.slot - b.slot)) { if (!left) break; const add = Math.min(left, STACK_MAX - s.qty); s.qty += add; left -= add; this.qtyChanged(p, s); it ??= s; }
      while (left > 0) { const n = Math.min(left, STACK_MAX), s: ItemInst = { id: crypto.randomUUID(), key, qty: n, slot: this.freeSlot(p), equip: null, rarity, plus: 0, opts }; p.items.push(s); p.dirtyItems.add(s.id); left -= n; it ??= s; }
    } else { const slot = this.freeSlot(p); if (slot < 0) return false; it = { id: crypto.randomUUID(), key, qty, slot, equip: null, rarity, plus: 0, opts }; p.items.push(it); p.dirtyItems.add(it.id); }
    p.logs.push([reason, it!.id, key, qty, 0, Date.now()]);
    if (rarity === 4) for (const o of this.players.values()) this.sys(o, `✦ ${p.name} encontrou ${def.name} Ancestral!`);
    return true;
  }
  private freeSlots(p: Player) { return CONFIG.invSize - p.items.filter(i => !i.equip).length; }
  /** Quantos espaços novos da bolsa seriam usados para receber qty unidades deste item. */
  private slotsNeeded(p: Player, key: string, qty: number) {
    if (!isStack(ITEMS[key])) return 1;
    const room = p.items.filter(i => i.key === key && !i.equip && i.qty < STACK_MAX).reduce((a, i) => a + STACK_MAX - i.qty, 0);
    return Math.max(0, Math.ceil((qty - room) / STACK_MAX));
  }
  /** Reorganiza pilhas do mesmo item: o mínimo de espaços, cada um com até 1000. Devolve true se mudou algo. */
  private mergeStacks(p: Player, inChest: boolean) {
    const list = inChest ? p.chest : p.items, by = new Map<string, ItemInst[]>(); let changed = false;
    for (const it of list) if (!it.equip && ITEMS[it.key] && isStack(ITEMS[it.key])) { const g = by.get(it.key); if (g) g.push(it); else by.set(it.key, [it]); }
    for (const its of by.values()) {
      const total = its.reduce((a, i) => a + i.qty, 0), need = Math.ceil(total / STACK_MAX);
      if (its.length === need && its.every(i => i.qty <= STACK_MAX)) continue;
      its.sort((a, b) => a.slot - b.slot); let left = total; changed = true;
      its.forEach((it, n) => {
        if (n < need) { const q = Math.min(STACK_MAX, left); left -= q; if (it.qty !== q) { it.qty = q; this.qtyChanged(p, it); } }
        else { list.splice(list.indexOf(it), 1); p.dirtyItems.delete(it.id); p.qtyItems.delete(it.id); p.delItems.add(it.id); }
      });
      while (left > 0) { // pilha grande demais (ex.: 1000 poções): divide em espaços livres; sem espaço, o resto fica na última pilha
        const used = new Set(list.filter(i => !i.equip).map(i => i.slot)); let s = -1; for (let i = 0; i < CONFIG.invSize; i++) if (!used.has((inChest ? 1000 : 0) + i)) { s = (inChest ? 1000 : 0) + i; break; }
        if (s < 0) { const last = its[Math.min(need, its.length) - 1]; last.qty += left; this.qtyChanged(p, last); break; }
        const q = Math.min(STACK_MAX, left), n: ItemInst = { id: crypto.randomUUID(), key: its[0].key, qty: q, slot: s, equip: null, rarity: 0, plus: 0, opts: [] }; list.push(n); p.dirtyItems.add(n.id); left -= q;
      }
    }
    return changed;
  }
  private takeOne(p: Player, it: ItemInst) {
    if (--it.qty <= 0) { p.items.splice(p.items.indexOf(it), 1); p.dirtyItems.delete(it.id); p.qtyItems.delete(it.id); p.delItems.add(it.id); } else this.qtyChanged(p, it);
  }
  /** Item já gravado que só mudou a quantidade: 1 linha (UPDATE) em vez de apagar e regravar (~8 linhas com os índices). */
  private qtyChanged(p: Player, it: ItemInst) { if (!p.dirtyItems.has(it.id)) p.qtyItems.add(it.id); }
  private invAt(p: Player, slot: unknown) { return Number.isInteger(slot) ? p.items.find(i => !i.equip && i.slot === slot) : undefined; }
  private usePotion(p: Player, slot: unknown, now: number) {
    const it = this.invAt(p, slot); if (!it || now < p.nextPotion) return;
    const d = ITEMS[it.key]; if (d.kind === 'box') return this.openBox(p, it, now); if (d.kind !== 'potion') return;
    const s = this.stats(p); p.nextPotion = now + 700;
    p.hp = Math.min(s.maxHp, p.hp + (d.heal ?? 0)); p.mp = Math.min(s.maxMp, p.mp + (d.mana ?? 0));
    this.takeOne(p, it); p.logs.push(['use', it.id, it.key, 1, 0, now]);
    p.dirty = true; p.meDirty = true; this.sendInv(p); this.fx.push({ k: 'heal', x: p.x, y: p.y, id: p.eid });
  }
  /** Abre um baú: sempre dá moedas e mais 1 ou 2 prêmios sorteados (joias, poções ou equipamento que a classe usa). */
  private openBox(p: Player, it: ItemInst, now: number) {
    const T: Record<string, { gold: [number, number]; picks: number; lvl: [number, number]; exc: number; anc: number; table: [number, string, number][] }> = {
      box_bronze: { gold: [2000, 8000], picks: 1, lvl: [1, 26], exc: .04, anc: 0, table: [[40, 'pot_hp2', 10], [35, 'jewel_aurora', 1], [25, 'gear', 1]] },
      box_prata: { gold: [10000, 40000], picks: 1, lvl: [26, 56], exc: .1, anc: .01, table: [[30, 'jewel_aurora', 2], [30, 'jewel_destiny', 1], [30, 'gear', 1], [10, 'pot_hp3', 5]] },
      box_ouro: { gold: [50000, 200000], picks: 2, lvl: [50, 90], exc: .15, anc: .03, table: [[30, 'jewel_destiny', 2], [25, 'jewel_eclipse', 1], [35, 'gear', 1], [10, 'ancient_scale', 1]] },
      box_rei: { gold: [300000, 1000000], picks: 2, lvl: [86, 110], exc: .3, anc: .1, table: [[30, 'jewel_eclipse', 2], [50, 'gear', 1], [20, 'ancient_scale', 2]] },
    }, b = T[it.key]; if (!b) return;
    const cls = classOf(p.cls), pool = Object.values(ITEMS).filter(d => SLOTS.includes(d.kind as Slot) && d.kind !== 'wings' && d.lvl >= b.lvl[0] && d.lvl <= b.lvl[1] && canWield(cls, d));
    const prizes: { key: string; qty: number; rarity: number; opts: string[] }[] = [];
    for (let n = 0; n < b.picks; n++) {
      let r = Math.random() * 100, row = b.table[b.table.length - 1]; for (const t of b.table) { if (r < t[0]) { row = t; break; } r -= t[0]; }
      if (row[1] !== 'gear' || !pool.length) { prizes.push({ key: row[1] === 'gear' ? 'jewel_aurora' : row[1], qty: row[2], rarity: 0, opts: [] }); continue; }
      const d = pool[Math.floor(Math.random() * pool.length)], q = Math.random(), anc = q < b.anc, exc = !anc && q < b.anc + b.exc;
      const ops = [...(d.kind === 'weapon' || d.kind === 'ring' ? EXC_WEAPON : EXC_ARMOR)].sort(() => Math.random() - .5);
      prizes.push({ key: d.key, qty: 1, rarity: anc ? 4 : exc ? 3 : Math.random() < .15 ? 2 : Math.random() < .35 ? 1 : 0, opts: anc ? ops.slice(0, Math.random() < .3 ? 3 : 2) : exc ? ops.slice(0, Math.random() < .3 ? 2 : 1) : [] });
    }
    // espaço na bolsa: joias ocupam 1 espaço cada; o baú libera o dele se for o último
    const need = prizes.reduce((a, x) => a + this.slotsNeeded(p, x.key, x.qty), 0) - (it.qty === 1 ? 1 : 0);
    const free = CONFIG.invSize - p.items.filter(i => !i.equip).length; if (free < need) return this.sys(p, `Libere ${need} espaço(s) na bolsa para abrir o ${ITEMS[it.key].name}.`);
    p.nextPotion = now + 700; this.takeOne(p, it); p.logs.push(['box_open', it.id, it.key, 1, 0, now]);
    const g = Math.floor((b.gold[0] + Math.random() * (b.gold[1] - b.gold[0])) * (this.cfg.gold || 1)); p.gold += g; p.logs.push(['box_gold', null, it.key, 0, g, now]);
    const got = [`${g.toLocaleString('pt-BR')} moedas`];
    for (const x of prizes) if (this.give(p, x.key, x.qty, x.rarity, 'box', x.opts)) got.push(`${x.qty > 1 ? x.qty + 'x ' : ''}${ITEMS[x.key].name}${x.rarity ? ` (${RARITY[x.rarity].name})` : ''}`);
    p.dirty = true; p.meDirty = true; this.sendInv(p); this.fx.push({ k: 'up', x: p.x, y: p.y, id: p.eid, ok: 1, v: 0 });
    this.sys(p, `${ITEMS[it.key].name} aberto: ${got.join(', ')}.`);
  }
  /** Joga fora itens da bolsa (some de vez; fica registrado no histórico de itens). */
  private discard(p: Player, slots: unknown[]) {
    const now = Date.now(); let n = 0;
    for (const s of slots) { const it = this.invAt(p, s); if (!it) continue; p.items.splice(p.items.indexOf(it), 1); p.dirtyItems.delete(it.id); p.qtyItems.delete(it.id); p.delItems.add(it.id); p.logs.push(['discard', it.id, it.key, it.qty, 0, now]); n++; }
    if (n) { this.sendInv(p); this.sys(p, n === 1 ? 'Item descartado.' : `${n} itens descartados.`); }
  }
  private equip(p: Player, slot: unknown) {
    const it = this.invAt(p, slot); if (!it) return; const d = ITEMS[it.key];
    if (!SLOTS.includes(d.kind as Slot)) return;
    if (p.level < d.lvl) return this.sys(p, `Requer nível ${d.lvl}.`);
    if (!canWield(classOf(p.cls), d)) return this.sys(p, 'Sua classe não usa este item.');
    const cur = p.items.find(i => i.equip === d.kind);
    const was = it.slot; it.equip = d.kind; it.slot = -1; p.dirtyItems.add(it.id);
    if (cur) { cur.equip = null; cur.slot = was; p.dirtyItems.add(cur.id); }
    this.afterGear(p);
  }
  private unequip(p: Player, eq: unknown) {
    const it = p.items.find(i => i.equip === eq); if (!it) return;
    const slot = this.freeSlot(p); if (slot < 0) return this.sys(p, 'Inventário cheio.');
    it.equip = null; it.slot = slot; p.dirtyItems.add(it.id); this.afterGear(p);
  }
  private afterGear(p: Player) {
    const s = this.stats(p); p.hp = Math.min(p.hp, s.maxHp); p.dirty = true; p.meDirty = true; this.sendInv(p);
    for (const o of this.players.values()) o.known.delete(p.eid);
  }
  private nearNpc(p: Player, id: unknown) { const n = this.map.npcs.find(x => x.id === id); return n?.shop && dist(p, n) <= 4 ? n : null; }
  private buy(p: Player, npc: unknown, key: unknown, qty: unknown) {
    const n = this.nearNpc(p, npc); if (!n || typeof key !== 'string' || !SHOPS[n.shop!].includes(key) || !Number.isInteger(qty) || (qty as number) < 1 || (qty as number) > 50) return;
    const d = ITEMS[key], stack = isStack(d), q = stack ? qty as number : 1, cost = d.price * q;
    if (p.gold < cost) return this.sys(p, 'Moedas insuficientes.');
    if (!this.give(p, key, q, 0, 'buy')) return this.sys(p, 'Inventário cheio.');
    p.gold -= cost; p.logs.push(['buy_pay', null, key, q, -cost, Date.now()]); p.dirty = true; p.meDirty = true; this.sendInv(p);
  }
  private sell(p: Player, npc: unknown, slot: unknown, all = false) {
    const it = this.invAt(p, slot); if (!this.nearNpc(p, npc) || !it) return;
    const n = all ? it.qty : 1, v = sellPrice(it) * n;
    if (n === it.qty) { p.items.splice(p.items.indexOf(it), 1); p.dirtyItems.delete(it.id); p.qtyItems.delete(it.id); p.delItems.add(it.id); } else this.takeOne(p, it);
    p.gold += v; p.logs.push(['sell', it.id, it.key, n, v, Date.now()]); p.dirty = true; p.meDirty = true; this.sendInv(p);
    if (n > 1) this.sys(p, `Vendido: ${n}x ${ITEMS[it.key].name} por ${v.toLocaleString('pt-BR')} moedas.`);
  }

  // ---------- combate ----------
  private skill(p: Player, n: unknown, id: unknown, now: number) {
    const sk = classOf(p.cls).skills.find(x => x.n === n); if (sk && p.level < (sk.lvl ?? 1)) return this.sys(p, `Disponível no nível ${sk.lvl}.`);
    if (!sk || (this.map.safe && sk.kind !== 'buff' && sk.kind !== 'heal') || now < (p.cds[sk.n] ?? 0) || p.mp < sk.mana) return;
    const s = this.stats(p), m = this.mobs.get(id as number), targeted = sk.kind !== 'spin' && sk.kind !== 'spirits' && sk.kind !== 'summon' && sk.kind !== 'buff' && sk.kind !== 'heal';
    if (targeted && (!m || m.hp <= 0 || dist(m, p) > sk.range!)) return;
    p.mp -= sk.mana; p.cds[sk.n] = now + sk.cd; p.nextAtk = now + s.attackMs;
    const atk = s.atk * sk.mult, around = (c: Pt, r: number) => [...this.mobs.values()].filter(x => x.hp > 0 && dist(x, c) <= r);
    switch (sk.kind) {
      case 'spin': this.fx.push({ k: 'spin', x: p.x, y: p.y, id: p.eid, r: sk.radius }); for (const x of around(p, sk.radius!)) { if (sk.slow) x.slowUntil = now + sk.slow; this.hit(p, x, atk, s.crit); } break;
      case 'dash': {
        const from = { x: p.x, y: p.y }, d = dist(m!, p), ux = (m!.x - p.x) / (d || 1), uy = (m!.y - p.y) / (d || 1);
        for (let t = 0; t < d - 1; t += .2) step(this.map, p, ux * .2, uy * .2);
        p.path = null; this.fx.push({ k: 'dash', x: p.x, y: p.y, id: p.eid, fx: from.x, fy: from.y });
        if (dist(m!, p) <= CONFIG.attackRange + 1) this.hit(p, m!, atk, s.crit); break;
      }
      case 'splash':
        this.fx.push({ k: 'bolt', x: p.x, y: p.y, id: p.eid, tx: m!.x, ty: m!.y, b: sk.color }, { k: 'boom', x: m!.x, y: m!.y, r: sk.radius, b: sk.color });
        for (const x of around(m!, sk.radius!)) this.hit(p, x, atk, s.crit); break;
      case 'multi': {
        const list = around(m!, sk.radius!).sort((a, b) => dist(a, m!) - dist(b, m!)).slice(0, sk.count);
        for (const x of list) { this.fx.push({ k: 'bolt', x: p.x, y: p.y, id: p.eid, tx: x.x, ty: x.y, b: sk.color }); if (sk.curse) x.curseUntil = now + sk.curse; this.hit(p, x, atk, s.crit); } break;
      }
      case 'spirits': { // espíritos giram em volta do mago e atingem tudo ao redor várias vezes
        this.fx.push({ k: 'spirits', x: p.x, y: p.y, id: p.eid, r: sk.radius, b: sk.color, d: sk.count! * 300 });
        for (let i = 0; i < sk.count!; i++) this.later(now + i * 300, () => { if (p.gone || p.deadUntil) return; for (const x of around(p, sk.radius!)) this.hit(p, x, atk, s.crit); });
        break;
      }
      case 'cone': { // corte em leque à frente do personagem
        const a0 = Math.atan2(m!.y - p.y, m!.x - p.x), half = (sk.arc ?? 120) / 360 * Math.PI;
        this.fx.push({ k: 'cone', x: p.x, y: p.y, id: p.eid, a: round(a0), r: sk.radius, w: half, b: sk.color });
        for (const x of around(p, sk.radius!)) { let da = Math.abs(Math.atan2(x.y - p.y, x.x - p.x) - a0); if (da > Math.PI) da = 2 * Math.PI - da; if (da <= half || dist(x, p) < .8) this.hit(p, x, atk, s.crit); }
        break;
      }
      case 'wave': { // lâmina/flecha que atravessa todos em linha reta
        const d = dist(m!, p) || 1, ux = (m!.x - p.x) / d, uy = (m!.y - p.y) / d, L = sk.range!, w = sk.radius ?? 1;
        this.fx.push({ k: 'wave', x: p.x, y: p.y, id: p.eid, tx: round(p.x + ux * L), ty: round(p.y + uy * L), b: sk.color });
        for (const x of this.mobs.values()) { if (x.hp <= 0) continue; const rx = x.x - p.x, ry = x.y - p.y, along = rx * ux + ry * uy, side = Math.abs(rx * uy - ry * ux); if (along >= -.3 && along <= L && side <= w) this.hit(p, x, atk, s.crit); }
        break;
      }
      case 'chain': { // corrente que pula de monstro em monstro, prende (deixa lento) e perde força a cada pulo
        const done = new Set<number>(), pts: number[][] = [[round(p.x), round(p.y)]]; let cur = m!, k = 1;
        for (let i = 0; i < sk.count!; i++) {
          done.add(cur.eid); pts.push([round(cur.x), round(cur.y)]);
          const tg = cur, mul = k; this.later(now + i * 90, () => { if (p.gone || tg.hp <= 0) return; if (sk.slow) tg.slowUntil = Date.now() + sk.slow; this.hit(p, tg, atk * mul, s.crit); });
          k *= .85; let nx: Mob | undefined, bd = sk.radius!;
          for (const x of this.mobs.values()) if (x.hp > 0 && !done.has(x.eid) && x.state !== 'back') { const dd = dist(x, cur); if (dd < bd) { bd = dd; nx = x; } }
          if (!nx) break; cur = nx;
        }
        this.fx.push({ k: 'chain', x: p.x, y: p.y, id: p.eid, pts, b: sk.color });
        break;
      }
      case 'buff': if (sk.buff === 'atk') p.buffAtk = now + sk.ms!; else p.buffDef = now + sk.ms!; this.fx.push({ k: 'buff', x: p.x, y: p.y, id: p.eid, b: sk.color }); break;
      case 'heal': for (const o of this.players.values()) if ((o === p || (p.partyId && o.partyId === p.partyId)) && !o.deadUntil && dist(o, p) <= 9) { o.hp = Math.min(this.stats(o).maxHp, o.hp + this.stats(o).maxHp * sk.heal!); o.dirty = true; o.meDirty = true; this.fx.push({ k: 'heal', x: o.x, y: o.y, id: o.eid }); } break;
      case 'drain': { this.fx.push({ k: 'bolt', x: m!.x, y: m!.y, id: p.eid, tx: p.x, ty: p.y, b: sk.color }); const b4 = m!.hp; this.hit(p, m!, atk, s.crit); p.hp = Math.min(s.maxHp, p.hp + Math.max(0, b4 - m!.hp) * sk.heal!); break; }
      case 'curse': m!.curseUntil = now + sk.ms!; this.fx.push({ k: 'curse', x: m!.x, y: m!.y, id: m!.eid, b: sk.color }); this.hit(p, m!, atk, s.crit); break;
      case 'summon': {
        for (const o of this.summons.values()) if (o.owner === p) this.summons.delete(o.eid);
        const eid = this.nextId++; this.summons.set(eid, { eid, owner: p, pet: sk.pet!, x: p.x, y: p.y, atk, expires: now + sk.ms!, nextAtk: 0 });
        this.fx.push({ k: 'summon', x: p.x, y: p.y, id: p.eid }); break;
      }
    }
    if (targeted) { p.target = m!.eid; p.nextRepath = 0; }
    p.dirty = true; p.meDirty = true;
    this.send(p, { t: 'cd', n: sk.n, ms: sk.cd });
  }
  // ---------- trocas ----------
  private tradeInvite(p: Player, id: unknown) {
    const t = this.players.get(id as number); if (!t || t === p || p.trade || dist(t, p) > 8) return;
    if (t.trade) return this.sys(p, `${t.name} já está em uma troca.`);
    t.tradeFrom = { from: p.eid, until: Date.now() + 30000 }; this.send(t, { t: 'tinv', from: p.name }); this.sys(p, `Pedido de troca enviado a ${t.name}.`);
  }
  private tradeAccept(p: Player) {
    const f = p.tradeFrom; p.tradeFrom = null; if (!f || Date.now() > f.until || p.trade) return;
    const o = this.players.get(f.from); if (!o || o.trade || o.deadUntil || p.deadUntil || dist(o, p) > 8) return this.sys(p, 'A troca não está mais disponível.');
    p.trade = { peer: o, ids: new Set(), gold: 0, st: 0 }; o.trade = { peer: p, ids: new Set(), gold: 0, st: 0 }; this.sendTrade(p); this.sendTrade(o);
  }
  private sendTrade(p: Player) {
    const t = p.trade; if (!t) return; const o = t.peer, ot = o.trade!, list = (x: Player, tr: Trade) => x.items.filter(i => tr.ids.has(i.id));
    this.send(p, { t: 'tr', m: { name: o.name, mine: { items: list(p, t), gold: t.gold, st: t.st }, theirs: { items: list(o, ot), gold: ot.gold, st: ot.st } } });
  }
  private cancelTrade(p: Player, msg: string) {
    const t = p.trade; if (!t) return; const o = t.peer; p.trade = null; o.trade = null;
    this.send(p, { t: 'tr', m: null, msg }); this.send(o, { t: 'tr', m: null, msg });
  }
  private tradeOffer(p: Player, ids: unknown, gold: unknown) {
    const t = p.trade; if (!t || !Array.isArray(ids) || ids.length > 20 || !Number.isInteger(gold) || (gold as number) < 0 || (gold as number) > p.gold) return;
    const ok = new Set(p.items.filter(i => !i.equip).map(i => i.id)); if (!ids.every(i => typeof i === 'string' && ok.has(i))) return;
    t.ids = new Set(ids as string[]); t.gold = gold as number; t.st = 0; t.peer.trade!.st = 0; this.sendTrade(p); this.sendTrade(t.peer);
  }
  private tradeConfirm(p: Player) {
    const t = p.trade; if (!t) return; const ot = t.peer.trade!;
    if (t.st === 0) t.st = 1; else if (t.st === 1 && ot.st >= 1) t.st = 2; else return;
    if (t.st === 2 && ot.st === 2) return this.tradeCommit(p);
    this.sendTrade(p); this.sendTrade(t.peer);
  }
  private tradeCommit(a: Player) {
    const ta = a.trade!, b = ta.peer, tb = b.trade!, now = Date.now();
    const outA = a.items.filter(i => ta.ids.has(i.id) && !i.equip), outB = b.items.filter(i => tb.ids.has(i.id) && !i.equip);
    const bagN = (x: Player) => x.items.filter(i => !i.equip).length;
    if (outA.length !== ta.ids.size || outB.length !== tb.ids.size || ta.gold > a.gold || tb.gold > b.gold) return this.cancelTrade(a, 'Troca inválida: os itens mudaram.');
    if (bagN(a) - outA.length + outB.length > CONFIG.invSize || bagN(b) - outB.length + outA.length > CONFIG.invSize) return this.cancelTrade(a, 'Sem espaço na bolsa para concluir a troca.');
    a.items = a.items.filter(i => !ta.ids.has(i.id)); b.items = b.items.filter(i => !tb.ids.has(i.id));
    const move = (from: Player, to: Player, list: ItemInst[]) => { for (const i of list) { from.dirtyItems.delete(i.id); from.delItems.add(i.id); from.logs.push(['trade_out', i.id, i.key, i.qty, 0, now]); }
      for (const i of list) { i.slot = this.freeSlot(to); to.items.push(i); to.delItems.delete(i.id); to.dirtyItems.add(i.id); to.logs.push(['trade_in', i.id, i.key, i.qty, 0, now]); } };
    move(a, b, outA); move(b, a, outB);
    a.gold += tb.gold - ta.gold; b.gold += ta.gold - tb.gold; a.logs.push(['trade_gold', null, null, 0, tb.gold - ta.gold, now]); b.logs.push(['trade_gold', null, null, 0, ta.gold - tb.gold, now]);
    a.trade = null; b.trade = null; a.dirty = b.dirty = true; a.meDirty = b.meDirty = true; this.saveBatch([a, b]);
    for (const x of [a, b]) { this.send(x, { t: 'tr', m: null, msg: 'Troca concluída!' }); this.sendInv(x); }
  }
  private upgrade(p: Player, slot: unknown, id: unknown) {
    const j = this.invAt(p, slot), rule = j && this.jewelRules[j.key], it = p.items.find(i => i.id === id); if (!j || !rule || !it || !SLOTS.includes(ITEMS[it.key].kind as Slot)) return;
    const cur = it.plus ?? 0; if (cur < rule.min || cur >= rule.max) return this.sys(p, `${ITEMS[j.key].name} serve para itens de +${rule.min} até +${rule.max - 1}.`);
    this.takeOne(p, j); const win = Math.random() < rule.chance, was = cur; it.plus = win ? cur + 1 : Math.max(rule.min, cur - rule.fail); p.dirtyItems.add(it.id); p.dirty = true; p.logs.push([win ? 'upgrade_ok' : 'upgrade_fail', it.id, it.key, it.plus, 0, Date.now()]);
    this.fx.push({ k: 'up', x: p.x, y: p.y, id: p.eid, ok: win ? 1 : 0, v: it.plus }); this.sys(p, win ? `${ITEMS[it.key].name} agora é +${it.plus}!` : `A melhoria falhou: ${ITEMS[it.key].name} ${was === it.plus ? 'manteve' : 'caiu para'} +${it.plus}.`);
    this.afterGear(p);
  }
  /** Comando /teste: kit para testar o jogo. Desligue com CONFIG.testCommands = false antes de abrir ao público. */
  private testKit(p: Player, txt: string, now: number) {
    if (p.trade || p.deadUntil) return;
    const list = Object.values(SETS).filter(s => s.cls === classOf(p.cls).key).sort((a, b) => a.lvl - b.lvl), n = Number(txt.split(/\s+/)[1]), set = list[Number.isInteger(n) && n >= 1 && n <= list.length ? n - 1 : list.length - 1];
    if (p.items.filter(i => !i.equip).length + 14 > CONFIG.invSize) return this.sys(p, 'Libere 14 espaços na bolsa para usar /teste.');
    for (const piece of SET_PIECES) this.give(p, `${set.key}_${piece}`, 1, 0, 'test');
    this.give(p, 'jewel_aurora', 3, 0, 'test'); this.give(p, 'jewel_destiny', 3, 0, 'test'); this.give(p, 'jewel_eclipse', 3, 0, 'test');
    { const lv = Math.max(p.level, set.lvl, 20), t = lv >= 60 ? 2 : lv >= 40 ? 1 : 0; this.give(p, `wing_${classOf(p.cls).key}_${t}`, 1, 0, 'test'); if (p.level < 20) { p.points += (20 - p.level) * CONFIG.pointsPerLevel; p.level = 20; p.xp = 0; } }
    p.gold += 500000; p.logs.push(['test_gold', null, null, 0, 500000, now]);
    if (p.level < set.lvl) { p.points += (set.lvl - p.level) * CONFIG.pointsPerLevel; p.level = set.lvl; p.xp = 0; const s = this.stats(p); p.hp = s.maxHp; p.mp = s.maxMp; }
    p.dirty = true; p.meDirty = true; this.sendInv(p); for (const o of this.players.values()) o.known.delete(p.eid);
    this.sys(p, `Teste: Set ${set.name}, joias e 500.000 moedas. Abra a Bolsa (I) para equipar.`);
  }
  private chestDeposit(p: Player, slot: unknown) {
    const it = this.invAt(p, slot); if (!it || !this.nearNpc(p, 'bau')) return;
    const used = new Set(p.chest.map(i => i.slot)); let s = -1; for (let i = 0; i < CONFIG.invSize; i++) if (!used.has(1000 + i)) { s = 1000 + i; break; }
    if (s < 0) return this.sys(p, 'O baú está cheio.');
    p.items.splice(p.items.indexOf(it), 1); it.slot = s; p.chest.push(it); p.dirtyItems.add(it.id); p.dirty = true; p.logs.push(['chest_in', it.id, it.key, it.qty, 0, Date.now()]); this.sendInv(p);
  }
  private chestWithdraw(p: Player, slot: unknown) {
    const it = p.chest.find(i => i.slot === slot); if (!it || !this.nearNpc(p, 'bau')) return;
    const s = this.freeSlot(p); if (s < 0) return this.sys(p, 'Inventário cheio.');
    p.chest.splice(p.chest.indexOf(it), 1); it.slot = s; p.items.push(it); p.dirtyItems.add(it.id); p.dirty = true; p.logs.push(['chest_out', it.id, it.key, it.qty, 0, Date.now()]); this.sendInv(p);
  }
  private packJewels(p: Player, key: unknown) {
    const pack = JEWEL_PACKS[key as string]; if (typeof key !== 'string' || !pack || !Object.hasOwn(JEWEL_PACKS, key) || !this.nearNpc(p, 'prensa')) return;
    const have = p.items.filter(i => i.key === key && !i.equip).reduce((a, i) => a + i.qty, 0); if (have < 10) return this.sys(p, 'São necessárias 10 joias iguais na bolsa.');
    for (let n = 0; n < 10; n++) this.takeOne(p, p.items.find(i => i.key === key && !i.equip)!);
    this.give(p, pack, 1, 0, 'pack'); p.dirty = true; this.sendInv(p); this.sys(p, `Criado: ${ITEMS[pack].name}.`);
  }
  private unpackJewels(p: Player, slot: unknown) {
    const it = this.invAt(p, slot); if (!it || ITEMS[it.key].kind !== 'pack' || !this.nearNpc(p, 'prensa')) return;
    const key = Object.keys(JEWEL_PACKS).find(k => JEWEL_PACKS[k] === it.key)!; if (this.slotsNeeded(p, key, 10) > this.freeSlots(p) + (it.qty === 1 ? 1 : 0)) return this.sys(p, 'Libere 1 espaço na bolsa para desmontar.'); this.takeOne(p, it); p.logs.push(['unpack', it.id, it.key, 1, 0, Date.now()]); this.give(p, key, 10, 0, 'unpack'); p.dirty = true; this.sendInv(p); this.sys(p, `Desmontado: 10x ${ITEMS[key].name}.`);
  }
  private moveTo(p: Player, to: unknown, now: number) {
    const d = travelList().find(x => x.to === to); if (!d || d.to === this.mapId) return;
    if (p.level < d.lvl) return this.sys(p, `${d.name} exige nível ${d.lvl}.`);
    if (now < (p.nextMove ?? 0)) return this.sys(p, 'Aguarde alguns segundos para viajar de novo.');
    p.nextMove = now + 5000; this.travel(p, d.to, d.x, d.y);
  }
  /** Master Reset: com 25 Resets e no nível de Reset, zera os Resets, volta ao nível 1 e ganha pontos permanentes. Master Level, itens e moedas restantes continuam. */
  private doMasterReset(p: Player) {
    if (!this.nearNpc(p, 'mestre')) return;
    if (p.resets < MR_RESETS) return this.sys(p, `O Master Reset pede ${MR_RESETS} Resets (você tem ${p.resets}).`);
    if (p.level < this.cfg.resetLevel) return this.sys(p, `É preciso alcançar o nível ${this.cfg.resetLevel}.`);
    const cost = MR_GOLD * (p.mr + 1); if (p.gold < cost) return this.sys(p, `São necessárias ${cost.toLocaleString('pt-BR')} moedas.`);
    const b = classOf(p.cls).base; p.gold -= cost; p.mr++; p.resets = 0; p.level = 1; p.xp = 0; p.str = b.str; p.agi = b.agi; p.vit = b.vit; p.ene = b.ene; p.points = p.mr * MR_POINTS;
    const s = this.stats(p); p.hp = s.maxHp; p.mp = s.maxMp; p.logs.push(['master_reset', null, null, p.mr, -cost, Date.now()]); p.dirty = true; p.meDirty = true; this.flush(p);
    for (const o of this.players.values()) { o.known.delete(p.eid); this.sys(o, `✦ ${p.name} completou o Master Reset ${p.mr}!`); }
    this.fx.push({ k: 'lvl', x: p.x, y: p.y, id: p.eid });
  }
  private doReset(p: Player) {
    if (!this.nearNpc(p, 'mestre')) return;
    if (p.level < this.cfg.resetLevel) return this.sys(p, `É preciso alcançar o nível ${this.cfg.resetLevel}.`);
    const cost = this.cfg.resetGold * (p.resets + 1); if (p.gold < cost) return this.sys(p, `São necessárias ${cost.toLocaleString('pt-BR')} moedas.`);
    const b = classOf(p.cls).base; p.gold -= cost; p.resets++; p.level = 1; p.xp = 0; p.str = b.str; p.agi = b.agi; p.vit = b.vit; p.ene = b.ene; p.points = p.resets * this.cfg.resetPoints + p.mr * MR_POINTS;
    const s = this.stats(p); p.hp = s.maxHp; p.mp = s.maxMp; p.logs.push(['reset', null, null, p.resets, -cost, Date.now()]); p.dirty = true; p.meDirty = true; this.flush(p);
    for (const o of this.players.values()) { o.known.delete(p.eid); this.sys(o, `${p.name} completou o Reset ${p.resets}!`); }
    this.fx.push({ k: 'lvl', x: p.x, y: p.y, id: p.eid });
  }
  private spendMaster(p: Player, k: unknown) {
    if (typeof k !== 'string' || !Object.hasOwn(MASTER_NODES, k) || p.mpts < 1 || (p.mtree[k] ?? 0) >= MASTER_NODE_MAX) return;
    p.mtree[k] = (p.mtree[k] ?? 0) + 1; p.mpts--; p.dirty = true; p.meDirty = true;
  }
  private craftWings(p: Player, tier: unknown) {
    const n = this.nearNpc(p, 'artifice'), r = WING_RECIPES[tier as number]; if (!n || !r || !Number.isInteger(tier)) return;
    const c = classOf(p.cls).key, t = tier as number, have = (k: string) => p.items.filter(i => i.key === k && !i.equip).reduce((a, i) => a + i.qty, 0);
    const prev = t > 0 ? p.items.find(i => i.key === `wing_${c}_${t - 1}` && !i.equip) : undefined;
    if (t > 0 && !prev) return this.sys(p, 'Tire as asas do nível anterior e deixe-as na bolsa.');
    if (p.level < WING_TIER[t].lvl) return this.sys(p, `Requer nível ${WING_TIER[t].lvl}.`);
    if (p.gold < r.gold || r.mats.some(([k, q]) => have(k) < q)) return this.sys(p, 'Faltam materiais ou moedas.');
    if (!prev && this.freeSlot(p) < 0) return this.sys(p, 'Inventário cheio.');
    const now = Date.now(), keepPlus = prev?.plus ?? 0;
    for (const [k, q] of r.mats) for (let left = q; left > 0; left--) this.takeOne(p, p.items.find(i => i.key === k && !i.equip)!);
    if (prev) { p.items.splice(p.items.indexOf(prev), 1); p.dirtyItems.delete(prev.id); p.delItems.add(prev.id); p.logs.push(['craft_consume', prev.id, prev.key, 1, 0, now]); }
    p.gold -= r.gold; p.logs.push(['craft_pay', null, null, 0, -r.gold, now]);
    const key = `wing_${c}_${t}`; this.give(p, key, 1, 0, 'craft'); const made = p.items.find(i => i.key === key && !i.equip && !i.plus)!; made.plus = keepPlus;
    p.dirty = true; p.meDirty = true; this.sendInv(p); this.fx.push({ k: 'up', x: p.x, y: p.y, id: p.eid, ok: 1, v: 0 }); this.sys(p, `Você criou: ${ITEMS[key].name}!`);
  }
  private bumpLoot(p: Player, now: number) { p.streak = Math.min(10, (now < p.streakUntil ? p.streak : 0) + 1); p.streakUntil = now + 15000; p.meDirty = true; }
  // ---------- grupos ----------
  private enqueueParty(f: () => Promise<unknown>) { this.partyQ = this.partyQ.then(f).catch(e => console.error('party', e)); }
  private partySend(pid: number, msg: string) { for (const o of this.players.values()) if (o.partyId === pid) try { o.ws.send(msg); } catch { /* */ } }
  private invite(p: Player, id: unknown) {
    const t = this.players.get(id as number); if (!t || t === p || dist(t, p) > CONFIG.aoiRadius) return;
    if (t.partyId) return this.sys(p, `${t.name} já está em um grupo.`);
    t.invite = { from: p.charId, until: Date.now() + 30000 };
    this.send(t, { t: 'pinv', from: p.name }); this.sys(p, `Convite enviado a ${t.name}.`);
  }
  private async acceptInvite(p: Player) {
    const inv = p.invite; p.invite = null; if (!inv || Date.now() > inv.until || p.partyId || p.gone) return;
    const lead = this.byChar.get(inv.from); if (!lead) return this.sys(p, 'Quem convidou não está mais neste mapa.');
    const db = this.env.DB; let pid = lead.partyId;
    if (!pid) {
      const r = await db.prepare('INSERT INTO parties(leader_char,mode,created_at) VALUES(?,0,?) RETURNING id').bind(lead.charId, Date.now()).first<{ id: number }>();
      pid = r!.id; await db.prepare('INSERT INTO party_members(char_id,party_id,name) VALUES(?,?,?)').bind(lead.charId, pid, lead.name).run(); lead.partyId = pid;
    }
    let added = 0;
    try { added = (await db.prepare('INSERT INTO party_members(char_id,party_id,name) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM party_members WHERE party_id=?)<5').bind(p.charId, pid, p.name, pid).run()).meta.changes; } catch { /* já em grupo */ }
    if (!added) this.sys(p, 'Não foi possível entrar: o grupo está cheio.');
    await this.partyChanged(pid);
  }
  private async leaveParty(pid: number, charId: number) {
    if (!pid) return;
    await this.env.DB.prepare('DELETE FROM party_members WHERE char_id=? AND party_id=?').bind(charId, pid).run();
    await this.partyChanged(pid);
  }
  private async kick(p: Player, char: unknown) {
    if (!p.partyId || char === p.charId || !Number.isInteger(char)) return;
    const r = await this.env.DB.prepare('SELECT leader_char FROM parties WHERE id=?').bind(p.partyId).first<{ leader_char: number }>();
    if (r?.leader_char === p.charId) await this.leaveParty(p.partyId, char as number);
  }
  private async setMode(p: Player) {
    if (!p.partyId) return;
    const c = await this.env.DB.prepare('UPDATE parties SET mode=1-mode WHERE id=? AND leader_char=?').bind(p.partyId, p.charId).run();
    if (c.meta.changes) await this.partyChanged(p.partyId);
  }
  private async partyChanged(pid: number) {
    await this.reloadParty(pid);
    await Promise.all(MAP_IDS.filter(id => id !== this.mapId).map(id => this.stub(id).fetch(new Request('https://room/party', { method: 'POST', body: JSON.stringify({ pid }) })).catch(() => { })));
  }
  /** Relê o grupo no banco e atualiza quem está neste mapa; desfaz grupos com menos de 2. */
  private async reloadParty(pid: number) {
    const db = this.env.DB;
    let rows = (await db.prepare('SELECT m.char_id,m.name,p.leader_char,p.mode FROM party_members m JOIN parties p ON p.id=m.party_id WHERE m.party_id=? ORDER BY m.char_id').bind(pid).all()).results;
    if (rows.length < 2) { await db.batch([db.prepare('DELETE FROM party_members WHERE party_id=?').bind(pid), db.prepare('DELETE FROM parties WHERE id=?').bind(pid)]); rows = []; }
    else if (!rows.some(r => r.char_id === r.leader_char)) { await db.prepare('UPDATE parties SET leader_char=? WHERE id=?').bind(rows[0].char_id, pid).run(); rows = rows.map(r => ({ ...r, leader_char: rows[0].char_id })); }
    const ids = new Set(rows.map(r => r.char_id));
    for (const o of this.players.values()) if (o.partyId === pid && !ids.has(o.charId)) { o.partyId = 0; this.send(o, { t: 'party', m: null }); }
    if (!rows.length) { this.partyMode.delete(pid); return; }
    this.partyMode.set(pid, rows[0].mode);
    const roster = { t: 'party', mode: rows[0].mode, leader: rows[0].leader_char, m: rows.map(r => ({ id: r.char_id, name: r.name })) };
    for (const r of rows) { const o = this.byChar.get(r.char_id); if (o) { o.partyId = pid; this.send(o, { ...roster, me: o.charId }); } }
  }
  private shareXp(owner: Player, xp: number, at: Pt) {
    const grp = owner.partyId ? [...this.players.values()].filter(o => o.partyId === owner.partyId && !o.deadUntil && dist(o, at) <= CONFIG.aoiRadius) : [];
    if (grp.length < 2) return this.addXp(owner, xp);
    const total = xp * (1 + .1 * (grp.length - 1)), byLevel = this.partyMode.get(owner.partyId) === 1, sum = grp.reduce((a, o) => a + o.level, 0);
    for (const o of grp) this.addXp(o, Math.floor(byLevel ? total * o.level / sum : total / grp.length));
  }
  private hit(p: Player, m: Mob, atk: number, crit: number) {
    if (m.state === 'back') return;
    const isCrit = Math.random() < crit; const def = m.def.def * (classOf(p.cls).magic ? .5 : 1) * (Date.now() < m.curseUntil ? .6 : 1); let dmg = rollDamage(atk, def, Math.random()); if (isCrit) dmg = Math.round(dmg * 1.6);
    m.hp -= dmg; m.hitBy.set(p.charId, (m.hitBy.get(p.charId) ?? 0) + dmg);
    this.fx.push({ k: 'hit', x: m.x, y: m.y, id: m.eid, v: dmg, c: isCrit ? 1 : 0 });
    if (m.state === 'idle') { m.state = 'chase'; m.target = p.eid; }
    if (m.hp <= 0) this.killMob(m, p);
  }
  private killMob(m: Mob, killer: Player) {
    m.hp = 0; m.respawnAt = Date.now() + m.def.respawnMs; m.path = null; m.state = 'idle'; m.target = 0;
    this.fx.push({ k: 'die', x: m.x, y: m.y, id: m.eid });
    { const ks = this.stats(killer); if (ks.lifeK || ks.manaK) { killer.hp = Math.min(ks.maxHp, killer.hp + ks.maxHp * ks.lifeK); killer.mp = Math.min(ks.maxMp, killer.mp + ks.maxMp * ks.manaK); killer.meDirty = true; killer.dirty = true; } }
    let topChar = killer.charId, top = 0; for (const [c, d] of m.hitBy) if (d > top) { top = d; topChar = c; }
    const owner = this.byChar.get(topChar) ?? killer; m.hitBy.clear();
    this.shareXp(owner, m.def.xp, m);
    const [lo, hi] = m.def.gold, now = Date.now();
    const drop = (key: string | null, gold: number, rarity: number, opts: string[] = []) => { const a = Math.random() * 6.283, d = Math.random() * 1.2; let x = m.x + Math.cos(a) * d, y = m.y + Math.sin(a) * d; if (isSolid(this.map, x, y)) { x = m.x; y = m.y; } const eid = this.nextId++; this.drops.set(eid, { eid, x: round(x), y: round(y), key, gold, rarity, opts, owner: owner.charId, party: owner.partyId, ownUntil: now + CONFIG.dropOwnMs, expires: now + CONFIG.dropLifeMs }); };
    drop(null, lo + Math.floor(Math.random() * (hi - lo + 1)), 0);
    for (const [key, ch] of m.def.drops) if (Math.random() < ch) { const k = ITEMS[key].kind, gear = SLOTS.includes(k as Slot), anc = gear && k !== 'wings' && Math.random() < .003 * this.cfg.exc, exc = gear && k !== 'wings' && Math.random() < .03 * this.cfg.exc; if (anc || exc) { const pool = [...(k === 'weapon' || k === 'ring' ? EXC_WEAPON : EXC_ARMOR)].sort(() => Math.random() - .5); drop(key, 0, anc ? 4 : 3, pool.slice(0, anc ? (Math.random() < .3 ? 3 : 2) : Math.random() < .25 ? 2 : 1)); continue; } const r = !gear ? 0 : Math.random() < .08 ? 2 : Math.random() < .3 ? 1 : 0; drop(key, 0, r); }
    if (m.def.boss) for (const o of this.players.values()) this.sys(o, `${m.def.name} foi derrotada por ${owner.name}!`);
  }
  private addXp(p: Player, xp: number) {
    const gain = Math.floor(xp * (1 + p.streak * .05)); p.xp += gain; p.dirty = true; p.meDirty = true; this.send(p, { t: 'xpg', v: gain });
    if (p.level >= CONFIG.maxLevel) { if (p.resets >= MASTER_RESETS && p.ml < MASTER_MAX) { p.mxp += gain; let up = false; while (p.ml < MASTER_MAX && p.mxp >= masterNext(p.ml)) { p.mxp -= masterNext(p.ml); p.ml++; p.mpts++; up = true; } if (up) { this.fx.push({ k: 'lvl', x: p.x, y: p.y, id: p.eid }); this.sys(p, `Master Level ${p.ml}! +1 ponto mestre (tecla C).`); } } p.xp = 0; return; }
    let up = false;
    while (p.level < CONFIG.maxLevel && p.xp >= xpToNext(p.level)) { p.xp -= xpToNext(p.level); p.level++; p.points += CONFIG.pointsPerLevel; up = true; }
    if (up) { const s = this.stats(p); p.hp = s.maxHp; p.mp = s.maxMp; this.fx.push({ k: 'lvl', x: p.x, y: p.y, id: p.eid }); this.sys(p, `Você alcançou o nível ${p.level}! +${CONFIG.pointsPerLevel} pontos (tecla C).`); for (const o of this.players.values()) o.known.delete(p.eid); }
  }
  private hurt(p: Player, raw: number, now: number, mob?: Mob) {
    if (p.deadUntil || p.gone) return;
    const s = this.stats(p);
    if (Math.random() < s.dodge) { this.fx.push({ k: 'miss', x: p.x, y: p.y, id: p.eid }); return; }
    const dmg = Math.max(1, Math.round(rollDamage(raw, s.def, Math.random()) * (1 - s.absorb)));
    if (mob && s.reflect && mob.hp > 0) { mob.hp -= Math.ceil(dmg * s.reflect); if (mob.hp <= 0) this.killMob(mob, p); }
    p.hp -= dmg; p.dirty = true; p.meDirty = true;
    this.fx.push({ k: 'hit', x: p.x, y: p.y, id: p.eid, v: dmg, c: 0, p: 1 });
    if (p.hp <= 0) { this.cancelTrade(p, 'A troca foi cancelada.'); p.hp = 0; p.deadUntil = now + 3000; p.path = null; p.target = 0; p.ix = p.iy = 0; this.fx.push({ k: 'die', x: p.x, y: p.y, id: p.eid }); this.sys(p, 'Você morreu. Retornando a Valoria…'); }
  }
  private travel(p: Player, map: string, x: number, y: number) {
    this.cancelTrade(p, 'A troca foi cancelada.'); p.map = map; p.x = x; p.y = y; p.path = null; p.target = 0; p.gone = true; p.dirty = true;
    this.players.delete(p.eid); if (this.byChar.get(p.charId) === p) this.byChar.delete(p.charId);
    if (!this.players.size && this.timer) { clearInterval(this.timer); this.timer = null; }
    this.flush(p).then(() => { this.send(p, { t: 'portal' }); try { p.ws.close(1000, 'portal'); } catch { /* */ } });
  }

  // ---------- simulação ----------
  private safeTick() { try { this.tick(); } catch (e) { console.error('tick', e); } }
  private follow(e: Pt & { path: Pt[] | null }, dist_: number) {
    while (e.path && dist_ > 0) {
      const n = e.path[0]; if (!n) { e.path = null; break; }
      const d = dist(e, n);
      if (d <= dist_) { if (!blocked(this.map, n.x, n.y)) { e.x = n.x; e.y = n.y; } dist_ -= d; e.path.shift(); if (!e.path.length) e.path = null; }
      else { step(this.map, e, (n.x - e.x) / d * dist_, (n.y - e.y) / d * dist_); dist_ = 0; }
    }
  }
  private tick() {
    const now = Date.now(), dt = Math.min(.25, (now - this.last) / 1000); this.last = now;
    for (const p of this.players.values()) this.tickPlayer(p, dt, now);
    for (const m of this.mobs.values()) this.tickMob(m, dt, now);
    if (this.timed.length) { const due = this.timed.filter(t => t.at <= now); if (due.length) { this.timed = this.timed.filter(t => t.at > now); for (const t of due) t.run(); } }
    this.separateMobs();
    this.tickSummons(now, dt);
    for (const d of this.drops.values()) if (now > d.expires) this.drops.delete(d.eid);
    if (++this.tickN % (this.players.size > 30 ? 2 : 1) === 0) { for (const p of this.players.values()) this.snapshot(p); this.fx = []; }
    if (now - this.lastSave >= CONFIG.saveEveryMs) { this.lastSave = now; for (const p of this.players.values()) this.flush(p); }
  }
  private tickSummons(now: number, dt: number) {
    for (const s of this.summons.values()) {
      if (s.owner.gone || s.owner.deadUntil || now > s.expires) { this.summons.delete(s.eid); continue; }
      let best: Mob | null = null, bd = 7;
      for (const m of this.mobs.values()) if (m.hp > 0 && m.state !== 'back' && dist(m, s.owner) <= 9) { const d = dist(m, s); if (d < bd) { bd = d; best = m; } }
      const goal: Pt | null = best && bd > 1.3 ? best : !best && dist(s, s.owner) > 2 ? s.owner : null;
      if (goal) { const d = dist(goal, s) || 1, v = 5 * dt; if (d > 6) { s.x = s.owner.x; s.y = s.owner.y; } else step(this.map, s, (goal.x - s.x) / d * v, (goal.y - s.y) / d * v); }
      else if (best && now >= s.nextAtk) { s.nextAtk = now + 1100; this.fx.push({ k: 'bite', x: s.x, y: s.y, id: s.eid, tx: best.x, ty: best.y }); this.hit(s.owner, best, s.atk, 0); }
    }
  }
  /** Evita que monstros perseguindo o mesmo alvo ocupem o mesmo ponto. */
  private separateMobs() {
    const list = [...this.mobs.values()].filter(m => m.hp > 0 && m.state === 'chase');
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j], d = dist(a, b) || .01, min = a.def.boss || b.def.boss ? 1.6 : .85;
      if (d < min) { const k = (min - d) * .25 / d, dx = (a.x - b.x) * k, dy = (a.y - b.y) * k; step(this.map, a, dx, dy); step(this.map, b, -dx, -dy); }
    }
  }
  private tickPlayer(p: Player, dt: number, now: number) {
    p.budget = Math.min(40, p.budget + dt * 25);
    const s = this.stats(p); p.maxHpC = s.maxHp;
    if (p.streak && now > p.streakUntil) { p.streak = 0; p.meDirty = true; }
    if (p.trade && dist(p, p.trade.peer) > 10) this.cancelTrade(p, 'Vocês se afastaram demais.');
    if (p.deadUntil) {
      if (now >= p.deadUntil) {
        p.deadUntil = 0; p.hp = Math.ceil(s.maxHp / 2); p.mp = Math.ceil(s.maxMp / 2); p.meDirty = true;
        const home = getMap('valoria').spawn;
        if (this.mapId === 'valoria') { p.x = home.x; p.y = home.y; p.dirty = true; } else this.travel(p, 'valoria', home.x, home.y);
      }
      return;
    }
    if (now >= p.nextRegen) { p.nextRegen = now + 2000; const hp = Math.min(s.maxHp, p.hp + s.maxHp * .012), mp = Math.min(s.maxMp, p.mp + s.maxMp * .04); if (hp !== p.hp || mp !== p.mp) { p.hp = hp; p.mp = mp; p.meDirty = true; p.dirty = true; } }
    if (this.map.traps && now >= p.nextTrap && trapUp(now) && this.map.traps.has(Math.floor(p.y) * this.map.w + Math.floor(p.x))) { p.nextTrap = now + 900; this.hurt(p, s.maxHp * .12 + s.def, now); if (p.deadUntil) return; }
    const dst = CONFIG.playerSpeed * dt;
    if (p.ix || p.iy) { step(this.map, p, p.ix * dst, p.iy * dst); p.dirty = true; }
    else if (p.target) {
      const m = this.mobs.get(p.target);
      if (!m || m.hp <= 0) { p.target = 0; p.path = null; }
      else if (dist(p, m) > classOf(p.cls).range) {
        if (now >= p.nextRepath) { p.nextRepath = now + 400; p.path = findPath(this.map, p.x, p.y, m.x, m.y, 600); }
        this.follow(p, dst); p.dirty = true;
      } else {
        p.path = null;
        if (now >= p.nextAtk) { p.nextAtk = now + s.attackMs; this.fx.push({ k: 'swing', x: p.x, y: p.y, id: p.eid, tx: m.x, ty: m.y, b: classOf(p.cls).bolt }); this.hit(p, m, s.atk, s.crit); }
      }
    } else if (p.path) { this.follow(p, dst); p.dirty = true; }
    for (const d of this.drops.values()) if (dist(d, p) <= 1.2 && (d.owner === p.charId || (d.party && d.party === p.partyId) || now > d.ownUntil)) {
      if (d.key === null) { const g = Math.ceil(d.gold * (1 + p.streak * .05) * (1 + s.goldPct)); p.gold += g; p.logs.push(['loot_gold', null, null, 0, g, now]); p.dirty = true; p.meDirty = true; this.drops.delete(d.eid); this.bumpLoot(p, now); this.fx.push({ k: 'loot', x: p.x, y: p.y, id: p.eid, n: p.streak }); }
      else if (this.give(p, d.key, 1, d.rarity, 'loot', d.opts)) { p.dirty = true; this.drops.delete(d.eid); this.bumpLoot(p, now); this.fx.push({ k: 'loot', x: p.x, y: p.y, id: p.eid, n: p.streak }); this.sendInv(p); this.sys(p, `Obteve: ${ITEMS[d.key].name}`); }
      else if (now - p.lastInvFull > 5000) { p.lastInvFull = now; this.sys(p, 'Inventário cheio.'); }
    }
    for (const g of this.map.portals) if (Math.hypot(p.x - g.x, p.y - g.y) < .9) {
      if (g.lvl && p.level < g.lvl) { if (now - p.lastInvFull > 3000) { p.lastInvFull = now; this.sys(p, `Este portal exige nível ${g.lvl}.`); } continue; }
      this.travel(p, g.to, g.tx, g.ty); return;
    }
    if (p.meDirty) this.sendMe(p);
  }
  private nearestPlayer(m: Mob, r: number) { let best: Player | null = null, bd = r; for (const p of this.players.values()) { if (p.deadUntil) continue; const d = dist(m, p); if (d <= bd) { bd = d; best = p; } } return best; }
  private tickMob(m: Mob, dt: number, now: number) {
    if (m.hp <= 0) { if (now >= m.respawnAt) { m.hp = m.def.hp; m.x = m.hx; m.y = m.hy; m.state = 'idle'; m.phase = 1; m.nextNova = 0; } return; }
    const def = m.def;
    if (m.state === 'back') {
      if (now >= m.nextThink) { m.nextThink = now + 500; m.path = findPath(this.map, m.x, m.y, m.hx, m.hy, 800); }
      this.follow(m, def.speed * 1.8 * dt);
      if (Math.hypot(m.x - m.hx, m.y - m.hy) < 1 || !m.path) { m.state = 'idle'; m.hp = def.hp; m.phase = 1; m.hitBy.clear(); }
      return;
    }
    if (m.state === 'idle') {
      const t = this.nearestPlayer(m, def.detect);
      if (t) { m.state = 'chase'; m.target = t.eid; m.nextThink = 0; }
      else { if (now >= m.nextThink) { m.nextThink = now + 2500 + Math.random() * 4000; if (Math.random() < .5) { const p = this.randomFree(m.hx, m.hy, 3); m.path = findPath(this.map, m.x, m.y, p.x, p.y, 120); } } this.follow(m, def.speed * .45 * dt); return; }
    }
    let t = this.players.get(m.target);
    if (!t || t.deadUntil) { t = this.nearestPlayer(m, def.detect) ?? undefined; if (!t) { m.state = 'back'; m.nextThink = 0; return; } m.target = t.eid; }
    if (Math.hypot(m.x - m.hx, m.y - m.hy) > def.leash) { m.state = 'back'; m.target = 0; m.nextThink = 0; return; }
    if (def.boss) this.bossLogic(m, now);
    const d = dist(m, t), reach = def.reach ?? (def.boss ? 2.2 : 1.4);
    if (d > reach) {
      if (now >= m.nextThink) { m.nextThink = now + 500; m.path = findPath(this.map, m.x, m.y, t.x, t.y, 500); }
      this.follow(m, def.speed * dt * (now < m.slowUntil ? .5 : 1));
    } else if (now >= m.nextAtk) {
      m.nextAtk = now + def.attackMs; this.fx.push(def.bolt ? { k: 'bolt', x: m.x, y: m.y, id: m.eid, tx: t.x, ty: t.y, b: def.bolt } : { k: 'bite', x: m.x, y: m.y, id: m.eid, tx: t.x, ty: t.y });
      this.hurt(t, def.dmg * (m.phase === 2 ? 1.35 : 1) * (now < m.curseUntil ? .7 : 1), now, m);
    }
  }
  private bossLogic(m: Mob, now: number) {
    if (m.phase === 1 && m.hp < m.def.hp / 2) { m.phase = 2; m.nextNova = now + 800; for (const o of this.players.values()) this.sys(o, `${m.def.name} entra em fúria!`); }
    if (!m.nextNova) m.nextNova = now + 4000;
    if (now < m.nextNova) return;
    m.nextNova = now + (m.phase === 2 ? 5000 : 8000);
    const at = { x: m.x, y: m.y }, r = 5, delay = 1300;
    this.fx.push({ k: 'nova', x: at.x, y: at.y, r, d: delay, b: m.def.nova });
    setTimeout(() => { const n = Date.now(); for (const p of this.players.values()) if (dist(p, at) <= r) this.hurt(p, m.def.dmg * 1.5, n); }, delay);
  }
  private snapshot(p: Player) {
    const R = CONFIG.aoiRadius, seen = new Set<number>(), news: unknown[] = [], e: unknown[] = [];
    const near = (o: Pt) => Math.abs(o.x - p.x) < R && Math.abs(o.y - p.y) < R;
    const note = (id: number, full: () => unknown) => { seen.add(id); if (!p.known.has(id)) { p.known.add(id); news.push(full()); } };
    for (const o of this.players.values()) if (near(o)) {
      note(o.eid, () => { const by = (s: string) => o.items.find(i => i.equip === s)?.key ?? null; return { id: o.eid, k: 'p', name: o.name, cls: o.cls, lv: o.level, hc: o.hairColor, hs: o.hairStyle, res: o.resets, mr: o.mr, wings: by('wings'), plus: Math.floor(o.items.filter(i => i.equip && i.equip !== 'wings').reduce((a, i) => a + (i.plus ?? 0), 0) / 5), weapon: by('weapon'), helm: by('helm'), armor: by('armor'), pants: by('pants'), boots: by('boots') }; });
      e.push([o.eid, round(o.x), round(o.y), Math.ceil(o.hp / o.maxHpC * 100)]);
    }
    for (const m of this.mobs.values()) if (m.hp > 0 && near(m)) { note(m.eid, () => ({ id: m.eid, k: 'm', mob: m.def.key })); e.push([m.eid, round(m.x), round(m.y), Math.ceil(m.hp / m.def.hp * 100)]); }
    for (const s of this.summons.values()) if (near(s)) { note(s.eid, () => ({ id: s.eid, k: 's', mob: s.pet })); e.push([s.eid, round(s.x), round(s.y), 100]); }
    for (const d of this.drops.values()) if (near(d)) { note(d.eid, () => ({ id: d.eid, k: 'd', key: d.key, rarity: d.rarity, gold: d.gold })); e.push([d.eid, d.x, d.y, 0]); }
    for (const id of p.known) if (!seen.has(id)) p.known.delete(id);
    const fx = this.fx.filter(near);
    this.send(p, fx.length || news.length ? { t: 's', e, n: news, fx } : { t: 's', e });
  }
}
