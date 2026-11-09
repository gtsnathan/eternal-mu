import { CLASS_NAME, CONFIG, HAIR_COLORS, HAIR_STYLES, ItemInst, ITEMS, itemStat, MOBS, RARITY, SHOPS, SKILLS, SLOTS, SLOT_NAMES } from '../shared/data';
import { getMap, GameMap, Npc, T } from '../shared/world';
import { cv, Cv, FRAME_H, FRAME_W, heroSprites, icon, Look, lookFromGear, mobSize, mobSprites, objSprite, tile } from './art';

const $ = <E extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as E;
const root = $('#root');
const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
async function api(path: string, body?: unknown) {
  const r = await fetch('/api/' + path, body === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error ?? 'Falha de rede.'), { status: r.status }); return j;
}
const portrait = (c: { hair_color: number; hair_style: number }) => { const s = cv(FRAME_W, FRAME_H); s.getContext('2d')!.drawImage(heroSprites({ hc: HAIR_COLORS[c.hair_color], hs: c.hair_style, weapon: 'short_sword' })[0][0], 0, 0); s.style.width = '40px'; s.style.height = '48px'; return s; };

// ---------- telas de conta ----------
function showAuth(register = false, msg = '') {
  root.innerHTML = `<div class="screen"><form class="card"><h1>ETERNAL MU</h1><div class="sub">${register ? 'Crie sua conta' : 'Um reino, centenas de heróis'}</div>
  <label>Usuário</label><input type="text" name="username" autocomplete="username" required>
  ${register ? '<label>E-mail</label><input type="email" name="email" autocomplete="email" required>' : ''}
  <label>Senha</label><input type="password" name="password" autocomplete="${register ? 'new-password' : 'current-password'}" required>
  ${register ? '<label>Confirmar senha</label><input type="password" name="confirm" autocomplete="new-password" required><label class="check"><input type="checkbox" name="terms"> Li e aceito os termos de uso</label>' : ''}
  <div class="err">${esc(msg)}</div><button class="main" style="width:100%">${register ? 'Cadastrar' : 'Entrar'}</button>
  <div style="text-align:center;margin-top:10px"><button type="button" class="link">${register ? 'Já tenho conta' : 'Criar conta'}</button></div></form></div>`;
  $('.link').onclick = () => showAuth(!register);
  const f = root.querySelector('form')!;
  f.onsubmit = async e => {
    e.preventDefault(); const d = new FormData(f), v: any = Object.fromEntries(d); if (register) v.terms = d.get('terms') === 'on';
    try { await api(register ? 'register' : 'login', v); showChars(); } catch (x: any) { $('.err').textContent = x.message; }
  };
}
async function showChars(msg = '') {
  let me: any; try { me = await api('me'); } catch (e: any) { return e.status === 401 ? showAuth(false, msg) : showAuth(false, 'Sem conexão com o servidor.'); }
  root.innerHTML = `<div class="screen"><div class="card wide"><h1>ETERNAL MU</h1><div class="sub">Conta: ${esc(me.username)}</div><div class="err">${esc(msg)}</div><div class="chars"></div>
  <div class="row">${me.characters.length < 5 ? '<button class="main" id="new">Novo personagem</button>' : ''}<button id="out">Sair</button><button id="outall">Sair de todos os dispositivos</button></div></div></div>`;
  const list = $('.chars');
  if (!me.characters.length) list.innerHTML = '<div style="color:var(--dim);text-align:center;padding:16px">Crie seu primeiro herói.</div>';
  for (const c of me.characters) {
    const row = document.createElement('div'); row.className = 'char';
    row.innerHTML = `<button class="open"><span class="pv"></span><span><b>${esc(c.name)}</b><small>${esc(c.class)} · Nível ${c.level} · ${esc(getMap(c.map).name)}</small></span></button><button class="del">Excluir</button>`;
    row.querySelector('.pv')!.appendChild(portrait(c));
    (row.querySelector('.open') as HTMLElement).onclick = () => startGame(c.id);
    (row.querySelector('.del') as HTMLElement).onclick = async () => { if (confirm(`Excluir ${c.name} para sempre?`)) { await api(`characters/${c.id}/delete`, {}); showChars(); } };
    list.appendChild(row);
  }
  const nw = root.querySelector('#new') as HTMLElement | null; if (nw) nw.onclick = showCreate;
  $('#out').onclick = async () => { await api('logout', {}); showAuth(); };
  $('#outall').onclick = async () => { await api('logout-all', {}); showAuth(); };
}
function showCreate() {
  let hc = 0, hs = 0;
  root.innerHTML = `<div class="screen"><form class="card"><h1 style="font-size:24px">NOVO HERÓI</h1><div class="sub">${CLASS_NAME}: combate corpo a corpo</div>
  <label>Nome</label><input type="text" name="name" maxlength="14" required autocomplete="off">
  <label>Cor do cabelo</label><div class="swatches" id="sc"></div><label>Estilo</label><div class="row" id="ss"></div><div class="preview"></div>
  <div class="err"></div><div class="row"><button type="button" id="back">Voltar</button><button class="main">Criar</button></div></form></div>`;
  const pv = () => { const c = portrait({ hair_color: hc, hair_style: hs }); c.style.width = '120px'; c.style.height = '144px'; $('.preview').replaceChildren(c); root.querySelectorAll('.sw').forEach((b, i) => b.classList.toggle('on', i === hc)); root.querySelectorAll('.opt').forEach((b, i) => b.classList.toggle('on', i === hs)); };
  HAIR_COLORS.forEach((col, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.style.background = col; b.setAttribute('aria-label', `Cor ${i + 1}`); b.onclick = () => { hc = i; pv(); }; $('#sc').appendChild(b); });
  HAIR_STYLES.forEach((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = n; b.onclick = () => { hs = i; pv(); }; $('#ss').appendChild(b); });
  pv(); $('#back').onclick = () => showChars();
  const f = root.querySelector('form')!;
  f.onsubmit = async e => { e.preventDefault(); try { await api('characters', { name: new FormData(f).get('name'), hairColor: hc, hairStyle: hs }); showChars(); } catch (x: any) { $('.err').textContent = x.message; } };
}

// ---------- jogo ----------
interface Ent { id: number; k: string; info: any; snaps: { t: number; x: number; y: number }[]; x: number; y: number; hp: number; dir: number; moving: boolean; anim: number; atkUntil: number; look?: Cv[][]; }
interface Me { hp: number; mp: number; maxHp: number; maxMp: number; xp: number; xpNext: number; level: number; points: number; str: number; agi: number; vit: number; ene: number; atk: number; def: number; gold: number; dead: boolean }
const canvas = $<HTMLCanvasElement>('#game'), g = canvas.getContext('2d')!;
let ws: WebSocket | null = null, charId = 0, running = false, you = 0, myName = '', map: GameMap | null = null, me: Me | null = null, items: ItemInst[] = [];
let ents = new Map<number, Ent>(), target = 0, auto = false, retries = 0, rtt = 0, manualClose = false, shop: Npc | null = null, pendingNpc: Npc | null = null, marker: { x: number; y: number; t: number } | null = null;
let myLook: { hc: number; hs: number } = { hc: 0, hs: 0 }, Z = 2, camX = 0, camY = 0, pingTimer = 0, lastFrame = 0, reconnectTimer = 0;
const cds: Record<number, { until: number; ms: number }> = {};
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number; g?: number }
interface Txt { x: number; y: number; s: string; c: string; t: number; big: boolean }
let parts: Part[] = [], texts: Txt[] = [], rings: { x: number; y: number; r: number; t: number; max: number; c: string; tele?: boolean }[] = [], slashes: { x: number; y: number; a: number; t: number }[] = [];
const snow: { x: number; y: number; s: number; d: number }[] = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: .03 + Math.random() * .05, d: Math.random() * 6 }));
const touch = matchMedia('(pointer:coarse)').matches; if (touch) document.body.classList.add('touch');

let ac: AudioContext | null = null;
function beep(f: number, ms: number, type: OscillatorType = 'square', vol = .03) { try { ac ??= new AudioContext(); if (ac.state === 'suspended') ac.resume(); const o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.value = f; o.frequency.exponentialRampToValueAtTime(f * .6, ac.currentTime + ms / 1000); a.gain.value = vol; a.gain.exponentialRampToValueAtTime(.001, ac.currentTime + ms / 1000); o.connect(a).connect(ac.destination); o.start(); o.stop(ac.currentTime + ms / 1000); } catch { /* sem áudio */ } }

function send(m: unknown) { if (ws?.readyState === 1) ws.send(JSON.stringify(m)); }
function startGame(id: number) { charId = id; root.innerHTML = ''; $('#hud').style.display = 'block'; running = true; manualClose = false; retries = 0; connect(); if (!lastFrame) requestAnimationFrame(frame); }
function over(s: string) { const o = $('#over'); o.textContent = s; o.style.display = s ? 'flex' : 'none'; }
function connect() {
  clearTimeout(reconnectTimer); over(retries ? 'Reconectando…' : 'Entrando no mundo…');
  ws?.close(); const sock = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?char=${charId}`); ws = sock; let portal = false;
  sock.onmessage = e => { const m = JSON.parse(e.data); if (m.t === 'portal') portal = true; else handle(m); };
  sock.onclose = async e => {
    if (ws !== sock || manualClose) return;
    if (e.code === 4000) return leave('Este personagem entrou em outro dispositivo.');
    if (portal) { over('Atravessando o portal…'); connect(); return; }
    setConn(false); retries++;
    if (retries > 12) return leave('Conexão perdida.');
    try { await api('me'); } catch (x: any) { if (x.status === 401) return leave('Sessão expirada.'); }
    if (ws !== sock || manualClose) return;
    over('Reconectando…'); reconnectTimer = setTimeout(connect, Math.min(5000, 400 * retries)) as unknown as number;
  };
}
function leave(msg = '') { manualClose = true; running = false; clearInterval(pingTimer); ws?.close(); ws = null; $('#hud').style.display = 'none'; over(''); closeWins(); canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height); lastFrame = 0; ents.clear(); auto = false; $('#auto').style.borderColor = ''; showChars(msg); }
function setConn(ok: boolean) { const c = $('#conn'); c.textContent = ok ? `● ${rtt} ms` : '● off'; c.style.color = !ok ? '#ff6b6b' : rtt < 120 ? '#79e08a' : rtt < 250 ? '#f0cf65' : '#ff9b5e'; }
function handle(m: any) {
  switch (m.t) {
    case 'w': {
      you = m.you; myName = m.name; myLook = { hc: m.hairColor, hs: m.hairStyle }; ents = new Map(); target = 0; pendingNpc = null; closeWin('shop'); parts = []; texts = []; rings = [];
      if (map?.id !== m.map) { map = getMap(m.map); bakeMini(); log(`— ${map.name} —`, 'sys'); }
      camX = m.x; camY = m.y; retries = 0; over(''); clearInterval(pingTimer); pingTimer = setInterval(() => send({ t: 'ping', c: performance.now() }), 3000) as unknown as number; send({ t: 'ping', c: performance.now() });
      lastInput = ''; syncInput(); break;
    }
    case 'pong': rtt = Math.round(performance.now() - m.c); setConn(true); break;
    case 'me': { const lv = me?.level; me = m; updateHud(); if (lv !== undefined && lv !== m.level) beep(660, 400, 'triangle', .06); break; }
    case 'inv': items = m.items; updateHud(); renderInv(); drawPortrait(); break;
    case 's': snapshot(m); break;
    case 'sys': log(m.m, 'sys'); break;
    case 'c': log(`<b>${esc(m.from)}:</b> ${esc(m.m)}`, m.ch === 'g' ? 'g' : '', true); break;
    case 'cd': cds[m.n] = { until: performance.now() + m.ms, ms: m.ms }; break;
    case 'kick': log(m.m, 'sys'); break;
  }
}
function log(s: string, cls = '', html = false) { const l = $('#log'), d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = s; else d.textContent = s; l.appendChild(d); while (l.children.length > 60) l.firstChild!.remove(); l.scrollTop = l.scrollHeight; }
function snapshot(m: any) {
  const t = performance.now(), seen = new Set<number>();
  for (const n of m.n ?? []) {
    const old = ents.get(n.id);
    if (old) { old.info = n; old.look = undefined; } else ents.set(n.id, { id: n.id, k: n.k, info: n, snaps: [], x: 0, y: 0, hp: 100, dir: 0, moving: false, anim: 0, atkUntil: 0 });
  }
  for (const [id, x, y, hp] of m.e) {
    seen.add(id); const e = ents.get(id); if (!e) continue;
    if (!e.snaps.length || Math.hypot(e.x - x, e.y - y) > 6) { e.x = x; e.y = y; e.snaps = []; }
    e.snaps.push({ t, x, y }); if (e.snaps.length > 6) e.snaps.shift(); e.hp = hp;
  }
  for (const id of ents.keys()) if (!seen.has(id)) { ents.delete(id); if (id === target) target = 0; }
  for (const f of m.fx ?? []) effect(f);
}
function burst(x: number, y: number, n: number, c: string, sp = 3) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = sp * (.3 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 0, max: .35 + Math.random() * .35, c, s: 2 + (Math.random() * 3 | 0), g: 5 }); } }
function faceTo(e: Ent, tx: number, ty: number) { const dx = tx - e.x, dy = ty - e.y; e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 3) : dy > 0 ? 0 : 1; }
function effect(f: any) {
  const e = ents.get(f.id), now = performance.now();
  switch (f.k) {
    case 'hit': texts.push({ x: f.x, y: f.y, s: String(f.v), c: f.p ? '#ff7070' : f.c ? '#ffd24a' : '#fff', t: 0, big: !!f.c }); burst(f.x, f.y - .4, f.c ? 12 : 6, f.p ? '#e0425a' : '#bdf0ff'); if (f.id === target || f.p) beep(f.p ? 150 : f.c ? 420 : 260, 70); break;
    case 'miss': texts.push({ x: f.x, y: f.y, s: 'Esquiva', c: '#b9e6ff', t: 0, big: false }); break;
    case 'swing': if (e) { faceTo(e, f.tx, f.ty); e.atkUntil = now + 220; slashes.push({ x: e.x, y: e.y, a: Math.atan2(f.ty - e.y, f.tx - e.x), t: 0 }); } break;
    case 'bite': if (e) { faceTo(e, f.tx, f.ty); e.atkUntil = now + 220; } break;
    case 'spin': if (e) e.atkUntil = now + 300; rings.push({ x: f.x, y: f.y, r: f.r, t: 0, max: .35, c: '#ffe08a' }); burst(f.x, f.y, 26, '#ffd76a', 6); beep(320, 180, 'sawtooth', .04); break;
    case 'dash': for (let i = 0; i < 14; i++) { const u = i / 14; parts.push({ x: f.fx + (f.x - f.fx) * u, y: f.fy + (f.y - f.fy) * u, vx: 0, vy: 0, life: 0, max: .4, c: '#ffcf6a', s: 5 }); } beep(200, 160, 'sawtooth', .04); break;
    case 'die': burst(f.x, f.y - .3, 26, '#d8f4ff', 5); beep(110, 260); break;
    case 'lvl': for (let i = 0; i < 44; i++) parts.push({ x: f.x + (Math.random() - .5), y: f.y, vx: 0, vy: -3 - Math.random() * 3, life: 0, max: .9, c: '#ffe08a', s: 3 }); break;
    case 'heal': burst(f.x, f.y - .4, 10, '#7dffa1', 2); beep(520, 120, 'sine', .05); break;
    case 'nova': rings.push({ x: f.x, y: f.y, r: f.r, t: 0, max: f.d / 1000, c: '#7fe3ff', tele: true }); beep(90, 900, 'sawtooth', .05); setTimeout(() => { if (running) { rings.push({ x: f.x, y: f.y, r: f.r, t: 0, max: .4, c: '#d9f7ff' }); burst(f.x, f.y, 70, '#bdf0ff', 12); beep(70, 400, 'square', .07); } }, f.d); break;
  }
}
function updateHud() {
  if (!me) return; const pct = (a: number, b: number) => `${Math.max(0, Math.min(100, a / Math.max(1, b) * 100))}%`;
  $('#nm').innerHTML = `${esc(myName)} <span>Nv ${me.level}</span>`; $('#hpb').style.width = pct(me.hp, me.maxHp); $('#mpb').style.width = pct(me.mp, me.maxMp); $('#hpt').textContent = `${me.hp}/${me.maxHp}`; $('#mpt').textContent = `${me.mp}/${me.maxMp}`; $('#xp i').style.width = pct(me.xp, me.xpNext);
  document.querySelectorAll<HTMLElement>('[data-pot]').forEach(b => { b.querySelector('s')!.textContent = String(items.find(i => i.key === b.dataset.pot)?.qty ?? 0); });
  $('#invinfo').dataset.gold = String(me.gold); if (!$('#invinfo').dataset.hover) $('#invinfo').textContent = `Moedas: ${me.gold}`;
  if ($('#w-char').style.display === 'block') renderChar();
  if ($('#w-shop').style.display === 'block') renderShop();
}
function drawPortrait() { const c = $<HTMLCanvasElement>('#portrait'), x = c.getContext('2d')!; x.clearRect(0, 0, 40, 48); x.imageSmoothingEnabled = false; x.drawImage(heroSprites(myGear())[0][0], 0, 0); }
function myGear(): Look { const by = (s: string) => items.find(i => i.equip === s)?.key ?? null; return lookFromGear(HAIR_COLORS[myLook.hc], myLook.hs, { helm: by('helm'), armor: by('armor'), pants: by('pants'), boots: by('boots'), weapon: by('weapon') }); }

// ---------- janelas ----------
const openW = (w: string) => { if (window.innerWidth < 720) closeWins(); $('#w-' + w).style.display = 'block'; if (w === 'inv') renderInv(); if (w === 'char') renderChar(); if (w === 'map') renderBig(); };
function closeWin(w: string) { $('#w-' + w).style.display = 'none'; if (w === 'shop') shop = null; }
function closeWins() { ['inv', 'char', 'map', 'shop'].forEach(closeWin); }
const toggle = (w: string) => $('#w-' + w).style.display === 'block' ? closeWin(w) : openW(w);
document.querySelectorAll<HTMLElement>('[data-w]').forEach(b => b.onclick = () => toggle(b.dataset.w!));
document.querySelectorAll<HTMLElement>('[data-close]').forEach(b => b.onclick = () => closeWin(b.closest('.win')!.id.slice(2)));
function itemText(i: ItemInst) { const d = ITEMS[i.key], parts = [`${d.name}${i.rarity ? ` (${RARITY[i.rarity].name})` : ''}`]; const a = itemStat(i, 'dmg'), b = itemStat(i, 'def'), c = itemStat(i, 'hp'); if (a) parts.push(`Dano +${a}`); if (b) parts.push(`Defesa +${b}`); if (c) parts.push(`Vida +${c}`); if (d.heal) parts.push(`Cura ${d.heal}`); if (d.mana) parts.push(`Mana ${d.mana}`); if (d.lvl > 1) parts.push(`Nível ${d.lvl}`); return parts.join(' · '); }
function makeCell(i: ItemInst | undefined, click: () => void, label = '') {
  const c = document.createElement('button'); c.className = 'cell'; c.type = 'button';
  if (i) { c.style.borderColor = i.rarity ? RARITY[i.rarity].color : ''; const ic = cv(28, 28); ic.getContext('2d')!.drawImage(icon(i.key), 0, 0); c.appendChild(ic); if (i.qty > 1) { const s = document.createElement('s'); s.textContent = String(i.qty); c.appendChild(s); } c.title = itemText(i); c.onclick = click; const info = $('#invinfo'); c.onpointerenter = () => { info.dataset.hover = '1'; info.textContent = itemText(i); }; c.onpointerleave = () => { delete info.dataset.hover; info.textContent = `Moedas: ${me?.gold ?? 0}`; }; }
  else c.textContent = label;
  return c;
}
function renderInv() {
  const gear = $('#gear'), grid = $('#grid'); gear.replaceChildren(); grid.replaceChildren();
  for (const s of SLOTS) { const i = items.find(x => x.equip === s); gear.appendChild(makeCell(i, () => send({ t: 'ue', eq: s }), SLOT_NAMES[s])); }
  for (let n = 0; n < CONFIG.invSize; n++) { const i = items.find(x => !x.equip && x.slot === n); grid.appendChild(makeCell(i, () => { if (!i) return; if (shop) send({ t: 'se', npc: shop.id, slot: n }); else if (ITEMS[i.key].kind === 'potion') send({ t: 'u', slot: n }); else if (ITEMS[i.key].kind !== 'material') send({ t: 'e', slot: n }); })); }
}
function renderChar() {
  if (!me) return; const P = $('#charp'), m = me, st = (k: 'str' | 'agi' | 'vit' | 'ene', n: string) => `<div class="stat"><span>${n}</span><span>${m[k]}${m.points ? `<button data-s="${k}">+1</button>` : ''}</span></div>`;
  P.innerHTML = `<div class="stat"><b>${esc(myName)}</b><span>${CLASS_NAME} · Nível ${m.level}</span></div><div class="stat"><span>Experiência</span><span>${m.xp} / ${m.xpNext}</span></div><div class="stat" style="color:var(--gold)"><span>Pontos livres</span><span>${m.points}</span></div>${st('str', 'Força')}${st('agi', 'Agilidade')}${st('vit', 'Vitalidade')}${st('ene', 'Energia')}<div class="stat"><span>Ataque</span><span>${m.atk}</span></div><div class="stat"><span>Defesa</span><span>${m.def}</span></div>`;
  P.querySelectorAll<HTMLElement>('[data-s]').forEach(b => b.onclick = () => send({ t: 'st', s: b.dataset.s, n: 1 }));
}
function renderShop() {
  if (!shop || !me) return; $('#shopt').textContent = shop.name; const L = $('#shopl'), npc = shop; L.replaceChildren();
  for (const k of SHOPS[npc.shop!]) { const d = ITEMS[k], r = document.createElement('div'); r.className = 'shopitem'; const c = cv(28, 28); c.getContext('2d')!.drawImage(icon(k), 0, 0); c.style.imageRendering = 'pixelated'; const s = document.createElement('span'); s.textContent = `${d.name} · ${d.price} moedas`; const b = document.createElement('button'); b.textContent = 'Comprar'; b.disabled = me.gold < d.price; b.onclick = () => send({ t: 'b', npc: npc.id, key: k, qty: 1 }); r.append(c, s, b); L.appendChild(r); }
}
let miniBase: Cv | null = null;
const TILE_COL = ['#4c8a3f', '#a29a8b', '#2f74b5', '#e4edf6', '#a6d6ee', '#94734b'];
function bakeMini() { if (!map) return; miniBase = cv(map.w, map.h); const x = miniBase.getContext('2d')!; for (let j = 0; j < map.h; j++) for (let i = 0; i < map.w; i++) { const sol = map.solid[j * map.w + i], t = map.tiles[j * map.w + i]; x.fillStyle = sol && t !== T.WATER ? (map.safe ? '#3a5b34' : '#274c48') : TILE_COL[t]; x.fillRect(i, j, 1, 1); } }
function paintMap(c: HTMLCanvasElement, sx: number, sy: number, wv: number, hv: number) {
  if (!map || !miniBase) return; const x = c.getContext('2d')!, k = c.width / wv; x.imageSmoothingEnabled = false; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.drawImage(miniBase, sx, sy, wv, hv, 0, 0, c.width, c.height);
  const dot = (px: number, py: number, col: string, s = 3) => { x.fillStyle = col; x.fillRect((px - sx) * k - s / 2, (py - sy) * k - s / 2, s, s); };
  for (const p of map.portals) dot(p.x, p.y, '#c78bff', 5); for (const n of map.npcs) dot(n.x, n.y, '#ffe08a');
  for (const e of ents.values()) if (e.k !== 'd') dot(e.x, e.y, e.id === you ? '#fff' : e.k === 'p' ? '#6fdc7e' : '#ff5a5a');
}
function renderMini() { const e = ents.get(you); if (!e || !map) return; const w = Math.min(map.w, 42), h = w * 112 / 146, sx = Math.max(0, Math.min(map.w - w, e.x - w / 2)), sy = Math.max(0, Math.min(map.h - h, e.y - h / 2)); paintMap($<HTMLCanvasElement>('#minimap'), sx, sy, w, h); $('#where').textContent = `${map.name} ${e.x | 0},${e.y | 0}`; }
function renderBig() { if (!map) return; const c = $<HTMLCanvasElement>('#bigmap'); c.width = map.w * 5; c.height = map.h * 5; $('#mapt').firstChild!.textContent = `${map.name} `; paintMap(c, 0, 0, map.w, map.h); }

// ---------- entrada ----------
const keys = new Set<string>(); let joy = { x: 0, y: 0 }, lastInput = '';
function syncInput() { let x = joy.x + (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0), y = joy.y + (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } x = Math.round(x * 10) / 10; y = Math.round(y * 10) / 10; const s = `${x},${y}`; if (s !== lastInput) { lastInput = s; send({ t: 'i', x, y }); if (x || y) { target = 0; pendingNpc = null; marker = null; } } }
function nearestMob(r: number) { const a = ents.get(you); if (!a) return null; let b: Ent | null = null, bd = r; for (const e of ents.values()) if (e.k === 'm') { const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < bd) { bd = d; b = e; } } return b; }
function attack(e: Ent) { target = e.id; send({ t: 'a', id: e.id }); }
function skill(n: number) { let t = ents.get(target); if (!t || t.k !== 'm') { const nm = nearestMob(8); if (nm && n === 2) { attack(nm); t = nm; } } send({ t: 'k', n, id: t?.id ?? 0 }); }
function potion(k: string) { const i = items.find(x => x.key === k && !x.equip); if (i) send({ t: 'u', slot: i.slot }); }
const tgtTyping = () => document.activeElement === $('#chati');
addEventListener('keydown', e => {
  if (!running || (e.target as HTMLElement).tagName === 'INPUT' && e.key !== 'Enter' && e.key !== 'Escape') return;
  const k = e.key.toLowerCase();
  if (e.key === 'Enter') { const i = $<HTMLInputElement>('#chati'); if (!tgtTyping()) { e.preventDefault(); i.focus(); } return; }
  if (e.key === 'Escape') { $('#chati').blur(); closeWins(); return; }
  if ('wasd'.includes(k)) { keys.add(k); syncInput(); } else if (e.repeat) return;
  else if (k === '1' || k === '2') skill(+k); else if (k === 'q') potion('pot_hp'); else if (k === 'e') potion('pot_mp'); else if (k === 'i') toggle('inv'); else if (k === 'c') toggle('char'); else if (k === 'm') toggle('map'); else if (k === ' ') { const m = nearestMob(10); if (m) attack(m); }
});
addEventListener('keyup', e => { if (keys.delete(e.key.toLowerCase())) syncInput(); });
addEventListener('blur', () => { keys.clear(); joy = { x: 0, y: 0 }; if (running) syncInput(); });
let chan: 'l' | 'g' = 'l';
$('#chan').onclick = () => { chan = chan === 'l' ? 'g' : 'l'; $('#chan').textContent = chan === 'l' ? 'Local' : 'Global'; };
$<HTMLFormElement>('#chatf').onsubmit = e => { e.preventDefault(); const i = $<HTMLInputElement>('#chati'); if (i.value.trim()) send({ t: 'c', ch: chan, m: i.value }); i.value = ''; i.blur(); };
$('#exit').onclick = () => leave();
$('#auto').onclick = () => { auto = !auto; $('#auto').style.borderColor = auto ? 'var(--gold)' : ''; };
$('#atk').onclick = () => { const m = nearestMob(12); if (m) attack(m); };
document.querySelectorAll<HTMLElement>('[data-sk]').forEach(b => b.onclick = () => skill(+b.dataset.sk!));
document.querySelectorAll<HTMLElement>('[data-pot]').forEach(b => b.onclick = () => potion(b.dataset.pot!));
const stick = $('#stick'), knob = stick.querySelector('i') as HTMLElement; let stickId = -1;
const moveStick = (e: PointerEvent) => { const b = stick.getBoundingClientRect(); let x = (e.clientX - b.left - b.width / 2) / 50, y = (e.clientY - b.top - b.height / 2) / 50; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } knob.style.transform = `translate(${x * 40}px,${y * 40}px)`; joy = l < .18 ? { x: 0, y: 0 } : { x, y }; syncInput(); };
stick.onpointerdown = e => { stickId = e.pointerId; stick.setPointerCapture(stickId); moveStick(e); };
stick.onpointermove = e => { if (e.pointerId === stickId) moveStick(e); };
stick.onpointerup = stick.onpointercancel = () => { stickId = -1; joy = { x: 0, y: 0 }; knob.style.transform = ''; syncInput(); };
canvas.addEventListener('pointerdown', e => {
  if (!map || !running) return;
  const dpr = canvas.width / canvas.clientWidth, wx = (e.clientX * dpr / Z + camX * 32 - canvas.width / Z / 2) / 32, wy = (e.clientY * dpr / Z + camY * 32 - canvas.height / Z / 2) / 32;
  let best: Ent | null = null, bd = 1.2;
  for (const en of ents.values()) if (en.k === 'm') { const sz = mobSize(en.info.mob) / 32, d = Math.hypot(en.x - wx, en.y - sz / 2 - wy); if (d < Math.max(bd, sz * .7)) { bd = d; best = en; } }
  if (best) return attack(best);
  for (const n of map.npcs) if (Math.hypot(n.x - wx, n.y - .6 - wy) < 1.1) { const a = ents.get(you); pendingNpc = n; target = 0; if (a && Math.hypot(a.x - n.x, a.y - n.y) > 2.5) send({ t: 'g', x: n.x, y: n.y + 1.4 }); return; }
  target = 0; pendingNpc = null; marker = { x: wx, y: wy, t: 0 }; closeWin('shop'); send({ t: 'g', x: wx, y: wy });
});
function resize() { const dpr = Math.min(devicePixelRatio || 1, 3), W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr); canvas.width = W; canvas.height = H; Z = Math.max(1, Math.round(Math.min(W / (22 * 32), H / (13 * 32)))); }
addEventListener('resize', resize); resize();

// ---------- render ----------
let miniAt = 0, autoAt = 0;
function frame(ts: number) {
  if (!running) return; requestAnimationFrame(frame);
  const dt = Math.min(.1, (ts - (lastFrame || ts)) / 1000); lastFrame = ts; if (!map) return;
  const renderT = ts - 130;
  for (const e of ents.values()) {
    const px = e.x, py = e.y; const s = e.snaps;
    if (e.id === you) { const l = s[s.length - 1]; if (l) { const k = Math.min(1, dt * 16); e.x += (l.x - e.x) * k; e.y += (l.y - e.y) * k; } }
    else if (s.length) { let a = s[0], b = s[s.length - 1]; for (let i = 0; i < s.length - 1; i++) if (s[i].t <= renderT && s[i + 1].t >= renderT) { a = s[i]; b = s[i + 1]; break; } const u = b.t > a.t ? Math.max(0, Math.min(1, (renderT - a.t) / (b.t - a.t))) : 1; if (renderT > s[s.length - 1].t) { e.x = b.x; e.y = b.y; } else { e.x = a.x + (b.x - a.x) * u; e.y = a.y + (b.y - a.y) * u; } }
    const dx = e.x - px, dy = e.y - py, mv = Math.hypot(dx, dy); e.moving = mv > .003;
    if (e.moving) { e.anim += mv * 1.8; if (ts > e.atkUntil) e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 3) : dy > 0 ? 0 : 1; }
  }
  const a = ents.get(you);
  if (a) {
    const k = Math.min(1, dt * 12); camX += (a.x - camX) * k; camY += (a.y - camY) * k;
    if (pendingNpc && Math.hypot(a.x - pendingNpc.x, a.y - pendingNpc.y) < 2.6) { const n = pendingNpc; pendingNpc = null; log(`${n.name}: ${n.line}`, 'sys'); if (n.shop) { shop = n; renderShop(); openW('shop'); } }
    if (shop && Math.hypot(a.x - shop.x, a.y - shop.y) > 3.8) closeWin('shop');
    if (target && !ents.has(target)) target = 0;
    if (auto && ts > autoAt && me && !me.dead && !map.safe && !target) { autoAt = ts + 350; const m = nearestMob(14); if (m) attack(m); }
  }
  const W = canvas.width, H = canvas.height, vw = W / Z, vh = H / Z;
  const cx = Math.max(vw / 2, Math.min(map.w * 32 - vw / 2, camX * 32)), cy = Math.max(vh / 2, Math.min(map.h * 32 - vh / 2, camY * 32));
  const ox = Math.round(vw / 2 - (vw > map.w * 32 ? map.w * 16 : cx)), oy = Math.round(vh / 2 - (vh > map.h * 32 ? map.h * 16 : cy));
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#0a0814'; g.fillRect(0, 0, W, H); g.setTransform(Z, 0, 0, Z, ox * Z, oy * Z);
  const x0 = Math.max(0, Math.floor(-ox / 32)), y0 = Math.max(0, Math.floor(-oy / 32)), x1 = Math.min(map.w - 1, Math.ceil((-ox + vw) / 32)), y1 = Math.min(map.h - 1, Math.ceil((-oy + vh) / 32));
  const wf = Math.floor(ts / 260) % 4;
  for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const t = map.tiles[j * map.w + i], v = (i * 7 + j * 13) % 4; g.drawImage(tile(t, v, t === T.WATER ? wf : 0), i * 32, j * 32); }
  // marcador e portais
  if (marker) { marker.t += dt; const u = marker.t / .5; if (u > 1) marker = null; else { g.strokeStyle = '#ffe08a'; g.lineWidth = 1; g.globalAlpha = 1 - u; g.strokeRect(marker.x * 32 - 8 + u * 4, marker.y * 32 - 5 + u * 3, 16 - u * 8, 10 - u * 6); g.globalAlpha = 1; } }
  for (const p of map.portals) { const X = p.x * 32, Y = p.y * 32, pul = Math.sin(ts / 300) * 3; g.fillStyle = '#4a2a8a'; ell2(X, Y, 26, 14); g.fillStyle = '#9a6bff'; ell2(X, Y, 21 + pul, 11 + pul / 2); g.fillStyle = '#e4d3ff'; ell2(X, Y, 11, 5); if (Math.random() < .4) parts.push({ x: p.x + (Math.random() - .5) * 1.2, y: p.y, vx: 0, vy: -2.2, life: 0, max: .7, c: '#c9a4ff', s: 3 }); }
  for (const e of ents.values()) if (e.k === 'd') { const s = icon(e.info.key), bo = Math.sin(ts / 220 + e.id) * 2; g.fillStyle = '#0006'; ell2(e.x * 32, e.y * 32 + 6, 9, 3); if (e.info.rarity) { g.fillStyle = RARITY[e.info.rarity].color + '66'; ell2(e.x * 32, e.y * 32, 16, 12); } g.drawImage(s, e.x * 32 - 14, e.y * 32 - 18 + bo); }
  // ordenação por profundidade
  const draw: { y: number; f: () => void }[] = [];
  for (const o of map.objs) { if (o.x + o.w < x0 - 2 || o.x > x1 + 2 || o.y + o.h < y0 || o.y > y1 + 3) continue; const y = o.y + o.h; draw.push({ y, f: () => drawObj(o, ts) }); }
  for (const n of map.npcs) { if (n.x < x0 - 2 || n.x > x1 + 2 || n.y < y0 - 2 || n.y > y1 + 2) continue; draw.push({ y: n.y, f: () => drawNpc(n) }); }
  for (const e of ents.values()) if (e.k !== 'd') draw.push({ y: e.y, f: () => drawEnt(e, ts) });
  draw.sort((p, q) => p.y - q.y).forEach(d => d.f());
  // efeitos
  rings = rings.filter(r => (r.t += dt) < r.max); for (const r of rings) { const u = r.t / r.max; g.strokeStyle = r.c; g.lineWidth = r.tele ? 2 : 4; g.globalAlpha = r.tele ? .9 : 1 - u; g.beginPath(); g.ellipse(r.x * 32, r.y * 32, (r.tele ? u : .3 + u * .7) * r.r * 32, (r.tele ? u : .3 + u * .7) * r.r * 22, 0, 0, 6.3); g.stroke(); if (r.tele) { g.globalAlpha = .18; g.fillStyle = r.c; g.beginPath(); g.ellipse(r.x * 32, r.y * 32, r.r * 32, r.r * 22, 0, 0, 6.3); g.fill(); } g.globalAlpha = 1; }
  slashes = slashes.filter(s => (s.t += dt) < .18); for (const s of slashes) { g.strokeStyle = '#fff'; g.globalAlpha = 1 - s.t / .18; g.lineWidth = 4; g.beginPath(); g.arc(s.x * 32, s.y * 32 - 18, 30, s.a - 1 + s.t * 7, s.a + .2 + s.t * 7); g.stroke(); g.globalAlpha = 1; }
  parts = parts.filter(p => (p.life += dt) < p.max); for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g ?? 0) * dt; g.globalAlpha = 1 - p.life / p.max; g.fillStyle = p.c; g.fillRect(Math.round(p.x * 32), Math.round(p.y * 32 - 8), p.s, p.s); } g.globalAlpha = 1;
  // nomes, barras e números
  g.textAlign = 'center';
  for (const n of map.npcs) label(n.x * 32, n.y * 32 - 50, n.name, '#ffe08a');
  for (const p of map.portals) label(p.x * 32, p.y * 32 - 30, '» ' + p.label, '#d6bcff');
  for (const e of ents.values()) {
    if (e.k === 'd') { if (e.info.key) label(e.x * 32, e.y * 32 - 22, ITEMS[e.info.key].name, RARITY[e.info.rarity].color); continue; }
    const h = e.k === 'p' ? 50 : mobSize(e.info.mob) + 10, X = Math.round(e.x * 32), Y = Math.round(e.y * 32) - h, boss = e.k === 'm' && MOBS[e.info.mob].boss, bw = boss ? 72 : 32;
    if (e.k === 'p' || e.id === target || boss) label(X, Y - 6, e.k === 'p' ? e.info.name : `${MOBS[e.info.mob].name} Nv${MOBS[e.info.mob].level}`, e.id === target ? '#ffd24a' : e.k === 'p' ? '#fff' : '#ffb4a8');
    g.fillStyle = '#0a0814'; g.fillRect(X - bw / 2 - 1, Y - 3, bw + 2, 5); g.fillStyle = e.k === 'p' ? '#58d36a' : '#e0425a'; g.fillRect(X - bw / 2, Y - 2, bw * e.hp / 100, 3);
  }
  texts = texts.filter(t => (t.t += dt) < .85); for (const t of texts) { const u = t.t / .85; g.font = `bold ${t.big ? 17 : 12}px ui-monospace,monospace`; g.globalAlpha = 1 - u * u; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#0a0814'; const y = t.y * 32 - 38 - u * 26; g.strokeText(t.s, t.x * 32, y); g.fillStyle = t.c; g.fillText(t.s, t.x * 32, y); } g.globalAlpha = 1;
  // clima e iluminação
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!map.safe) {
    g.fillStyle = '#fff'; for (const f of snow) { f.y += f.s * dt * 5; f.x += Math.sin(ts / 900 + f.d) * .0006; if (f.y > 1) f.y = 0; g.fillRect(((f.x % 1) + 1) % 1 * W, f.y * H, 2 * Z, 2 * Z); }
    g.fillStyle = '#3660a822'; g.fillRect(0, 0, W, H);
  }
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .42, W / 2, H / 2, Math.max(W, H) * .72); vg.addColorStop(0, '#0a081400'); vg.addColorStop(1, map.safe ? '#1a103055' : '#0a1a4088'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (me?.dead) { g.fillStyle = '#50000066'; g.fillRect(0, 0, W, H); }
  document.querySelectorAll<HTMLElement>('[data-sk]').forEach(b => { const c = cds[+b.dataset.sk!], el = b.querySelector('.cd') as HTMLElement; el.style.height = c && c.until > ts ? `${(c.until - ts) / c.ms * 100}%` : '0'; });
  if (ts > miniAt) { miniAt = ts + 200; renderMini(); }
}
function ell2(x: number, y: number, rx: number, ry: number) { g.beginPath(); g.ellipse(Math.round(x), Math.round(y), Math.max(.1, rx), Math.max(.1, ry), 0, 0, 6.3); g.fill(); }
function label(x: number, y: number, s: string, c: string) { g.font = 'bold 10px ui-monospace,monospace'; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#0a0814cc'; g.strokeText(s, Math.round(x), Math.round(y)); g.fillStyle = c; g.fillText(s, Math.round(x), Math.round(y)); }
function drawObj(o: GameMap['objs'][number], ts: number) {
  const s = objSprite(o), X = o.x * 32 + s.ox, Y = o.y * 32 + s.oy;
  if (o.k === 'tree' || o.k === 'pine' || o.k === 'rock') { g.fillStyle = '#0a081433'; ell2(o.x * 32 + 16, o.y * 32 + 26, 19, 7); }
  if (o.k === 'fountain' && Math.random() < .5) parts.push({ x: o.x + 1.5 + (Math.random() - .5) * .2, y: o.y + 1, vx: (Math.random() - .5) * 2, vy: -3.5, life: 0, max: .6, c: '#a8dcff', s: 2, g: 12 });
  if (s.sway) { const cut = 34, sw = Math.round(Math.sin(ts / 700 + o.x * 1.7 + o.y) * 1.4); g.drawImage(s.c, 0, 0, s.c.width, cut, X + sw, Y, s.c.width, cut); g.drawImage(s.c, 0, cut, s.c.width, s.c.height - cut, X, Y + cut, s.c.width, s.c.height - cut); }
  else g.drawImage(s.c, X, Y);
}
const npcLooks: Look[] = [{ hc: '#000', hs: 0 }, { hc: '#d8dde6', hs: 2, robe: '#6a3f96' }, { hc: '#b23a2e', hs: 0, armor: '#7a5230', weapon: 'iron_axe', boots: '#3c2a1c' }, { hc: '#2b2230', hs: 0, helm: '#8b95a6', armor: '#8b95a6', pants: '#5c6577', weapon: 'short_sword' }];
function drawNpc(n: Npc) { g.fillStyle = '#0a081455'; ell2(n.x * 32, n.y * 32 + 2, 12, 4); g.drawImage(heroSprites(npcLooks[n.look])[0][0], Math.round(n.x * 32 - FRAME_W / 2), Math.round(n.y * 32 - FRAME_H + 6)); }
function drawEnt(e: Ent, ts: number) {
  const X = Math.round(e.x * 32), Y = Math.round(e.y * 32);
  if (e.k === 'p') {
    e.look ??= heroSprites(e.id === you && items.length ? myGear() : lookFromGear(HAIR_COLORS[e.info.hc], e.info.hs, e.info));
    const f = e.hp <= 0 ? 5 : ts < e.atkUntil ? 4 : e.moving ? [0, 1, 0, 3][Math.floor(e.anim) % 4] : 0;
    if (e.id === target) { g.strokeStyle = '#ffd24a'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y + 3, 14, 6, 0, 0, 6.3); g.stroke(); }
    g.fillStyle = '#0a081455'; ell2(X, Y + 3, 12, 4); g.drawImage(e.look[e.dir][f], X - FRAME_W / 2, Y - FRAME_H + 6); return;
  }
  const sp = mobSprites(e.info.mob), sz = mobSize(e.info.mob), fr = Math.floor(ts / 280 + e.id) % 2, c = sp[fr][e.dir === 3 ? 1 : 0], lunge = ts < e.atkUntil ? 4 : 0;
  if (e.id === target) { g.strokeStyle = '#ff5a5a'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y + 2, sz * .55, sz * .24, 0, 0, 6.3); g.stroke(); }
  g.fillStyle = '#0a081455'; ell2(X, Y + 2, sz * .45, sz * .17); g.drawImage(c, X - c.width / 2 + (e.dir === 3 ? -lunge : lunge), Y - c.height + 6);
}
showChars();
