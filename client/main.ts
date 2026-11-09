import { glowTier, JEWELS, canWield, CLASSES, classOf, CONFIG, fullSetOf, setCounts, SETS, SET_PIECES, HAIR_COLORS, HAIR_STYLES, ItemInst, ITEMS, itemStat, MOBS, RARITY, sellPrice, SHOPS, SLOTS, SLOT_NAMES } from '../shared/data';
import { findPath, getMap, GameMap, Npc, step, T } from '../shared/world';
import { tintFrame, archSprite, crystalSprite, cv, Cv, edge, FRAME_H, FRAME_W, glowSprite, heroSprites, icon, skillIcon, tilePrio, Look, lookFromGear, mobSize, mobSprites, objSprite, tile } from './art';

const $ = <E extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as E;
const root = $('#root');
const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
async function api(path: string, body?: unknown) {
  const r = await fetch('/api/' + path, body === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error ?? 'Falha de rede.'), { status: r.status }); return j;
}
const portrait = (c: { hair_color: number; hair_style: number; class: string }) => { const s = cv(FRAME_W, FRAME_H); s.getContext('2d')!.drawImage(heroSprites(lookFromGear(c.class, HAIR_COLORS[c.hair_color], c.hair_style, { weapon: classOf(c.class).weapon }))[0][0], 0, 0); s.style.width = '40px'; s.style.height = '56px'; return s; };

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
  let hc = 0, hs = 0, ck = 'dark_warrior';
  root.innerHTML = `<div class="screen"><form class="card"><h1 style="font-size:24px">NOVO HERÓI</h1><div class="sub" id="cdesc"></div><div class="row" id="sk"></div>
  <label>Nome</label><input type="text" name="name" maxlength="14" required autocomplete="off">
  <label>Cor do cabelo</label><div class="swatches" id="sc"></div><label>Estilo</label><div class="row" id="ss"></div><div class="preview"></div>
  <div class="err"></div><div class="row"><button type="button" id="back">Voltar</button><button class="main">Criar</button></div></form></div>`;
  const pv = () => { $('#cdesc').textContent = CLASSES[ck].desc; root.querySelectorAll<HTMLElement>('.clsb').forEach(b => b.classList.toggle('on', b.dataset.c === ck)); const c = portrait({ hair_color: hc, hair_style: hs, class: CLASSES[ck].name }); c.style.width = '120px'; c.style.height = '168px'; $('.preview').replaceChildren(c); root.querySelectorAll('.sw').forEach((b, i) => b.classList.toggle('on', i === hc)); root.querySelectorAll('.opt').forEach((b, i) => b.classList.toggle('on', i === hs)); };
  Object.values(CLASSES).forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt0 clsb'; b.dataset.c = c.key; b.textContent = c.name; b.style.fontSize = '11px'; b.onclick = () => { ck = c.key; pv(); }; $('#sk').appendChild(b); });
  HAIR_COLORS.forEach((col, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.style.background = col; b.setAttribute('aria-label', `Cor ${i + 1}`); b.onclick = () => { hc = i; pv(); }; $('#sc').appendChild(b); });
  HAIR_STYLES.forEach((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = n; b.onclick = () => { hs = i; pv(); }; $('#ss').appendChild(b); });
  pv(); $('#back').onclick = () => showChars();
  const f = root.querySelector('form')!;
  f.onsubmit = async e => { e.preventDefault(); try { await api('characters', { name: new FormData(f).get('name'), cls: ck, hairColor: hc, hairStyle: hs }); showChars(); } catch (x: any) { $('.err').textContent = x.message; } };
}

// ---------- jogo ----------
interface Ent { id: number; k: string; info: any; snaps: { t: number; x: number; y: number }[]; x: number; y: number; hp: number; dir: number; moving: boolean; anim: number; atkUntil: number; look?: Cv[][]; flash?: number; stepN?: number }
interface Me { hp: number; mp: number; maxHp: number; maxMp: number; xp: number; xpNext: number; level: number; points: number; str: number; agi: number; vit: number; ene: number; atk: number; def: number; gold: number; dead: boolean; loot: number; lootMs: number }
const canvas = $<HTMLCanvasElement>('#game'), g = canvas.getContext('2d')!;
let ws: WebSocket | null = null, charId = 0, running = false, you = 0, myName = '', map: GameMap | null = null, me: Me | null = null, items: ItemInst[] = [];
let ents = new Map<number, Ent>(), target = 0, auto = false, retries = 0, rtt = 0, manualClose = false, shop: Npc | null = null, pendingNpc: Npc | null = null, marker: { x: number; y: number; t: number } | null = null;
let pred: { x: number; y: number; path: { x: number; y: number }[] | null; stop: number; tx: number; ty: number; hold: number } | null = null;
let myCls = CLASSES.dark_warrior, party: { m: { id: number; name: string }[]; leader: number; mode: number; me: number } | null = null, menuFor: Ent | null = null, bolts: { x: number; y: number; tx: number; ty: number; t: number; c: string }[] = [];
let myLook: { hc: number; hs: number } = { hc: 0, hs: 0 }, Z = 2, camX = 0, camY = 0, pingTimer = 0, lastFrame = 0, reconnectTimer = 0;
const cds: Record<number, { until: number; ms: number }> = {};
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number; g?: number }
interface Txt { x: number; y: number; s: string; c: string; t: number; big: boolean }
let prints: { x: number; y: number; t: number }[] = [], menuOn = true, menuX = 8;
let parts: Part[] = [], texts: Txt[] = [], rings: { x: number; y: number; r: number; t: number; max: number; c: string; tele?: boolean }[] = [], slashes: { x: number; y: number; a: number; t: number }[] = [];
const snow: { x: number; y: number; s: number; d: number }[] = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: .03 + Math.random() * .05, d: Math.random() * 6 }));
const touch = matchMedia('(pointer:coarse)').matches; if (touch) document.body.classList.add('touch');

let ac: AudioContext | null = null;
function beep(f: number, ms: number, type: OscillatorType = 'square', vol = .03) { try { ac ??= new AudioContext(); if (ac.state === 'suspended') ac.resume(); const o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.value = f; o.frequency.exponentialRampToValueAtTime(f * .6, ac.currentTime + ms / 1000); a.gain.value = vol; a.gain.exponentialRampToValueAtTime(.001, ac.currentTime + ms / 1000); o.connect(a).connect(ac.destination); o.start(); o.stop(ac.currentTime + ms / 1000); } catch { /* sem áudio */ } }

function send(m: unknown) { if (ws?.readyState === 1) ws.send(JSON.stringify(m)); }
function startGame(id: number) { charId = id; root.innerHTML = ''; menuOn = false; $('#hud').style.display = 'block'; running = true; manualClose = false; retries = 0; connect(); if (!lastFrame) requestAnimationFrame(frame); }
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
function leave(msg = '') { manualClose = true; running = false; clearInterval(pingTimer); ws?.close(); ws = null; $('#hud').style.display = 'none'; over(''); closeWins(); canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height); lastFrame = 0; menuOn = true; requestAnimationFrame(menuFrame); ents.clear(); party = null; renderParty(); trade = null; renderTrade(); $('#invite').style.display = 'none'; $('#pmenu').style.display = 'none'; auto = false; $('#auto').style.borderColor = ''; showChars(msg); }
function setConn(ok: boolean) { const c = $('#conn'); c.textContent = ok ? `● ${rtt} ms` : '● off'; c.style.color = !ok ? '#ff6b6b' : rtt < 120 ? '#79e08a' : rtt < 250 ? '#f0cf65' : '#ff9b5e'; }
function handle(m: any) {
  switch (m.t) {
    case 'w': {
      you = m.you; myName = m.name; myCls = classOf(m.cls); myCls.skills.forEach(s => { const b = $(`[data-sk="${s.n}"] b`), ic = skillIcon(s.kind, s.color ?? (s.kind === 'summon' ? '#a58cff' : '#ffd76a')); b.replaceChildren(ic); b.parentElement!.title = s.lvl ? `${s.name} (nível ${s.lvl})` : s.name; }); myLook = { hc: m.hairColor, hs: m.hairStyle }; ents = new Map(); target = 0; pendingNpc = null; closeWin('shop'); parts = []; texts = []; rings = [];
      if (map?.id !== m.map) { map = getMap(m.map); bakeMini(); log(`— ${map.name} —`, 'sys'); }
      camX = m.x; camY = m.y; retries = 0; over(''); clearInterval(pingTimer); pingTimer = setInterval(() => send({ t: 'ping', c: performance.now() }), 3000) as unknown as number; send({ t: 'ping', c: performance.now() });
      lastInput = ''; syncInput(); break;
    }
    case 'xpg': { const a = ents.get(you); if (a) texts.push({ x: a.x, y: a.y - 1, s: `+${m.v.toLocaleString('pt-BR')} XP`, c: '#9dffb0', t: 0, big: false }); break; }
    case 'pong': rtt = Math.round(performance.now() - m.c); setConn(true); break;
    case 'me': { const lv = me?.level; me = m; updateHud(); if (lv !== undefined && lv !== m.level) beep(660, 400, 'triangle', .06); break; }
    case 'inv': items = m.items; updateHud(); renderInv(); drawPortrait(); if (shop) renderShop(); break;
    case 's': snapshot(m); break;
    case 'sys': log(m.m, 'sys'); break;
    case 'c': log(`<b>${esc(m.from)}:</b> ${esc(m.m)}`, m.ch === 'g' ? 'g' : m.ch === 'p' ? 'pt' : '', true); break;
    case 'cd': cds[m.n] = { until: performance.now() + m.ms, ms: m.ms }; break;
    case 'kick': log(m.m, 'sys'); break;
    case 'party': party = m.m ? m : null; renderParty(); break;
    case 'pinv': inviteKind = 'p'; $('#invt').textContent = `${m.from} convidou você para um grupo.`; $('#invite').style.display = 'block'; beep(700, 150, 'triangle', .05); break;
    case 'tinv': inviteKind = 't'; $('#invt').textContent = `${m.from} quer negociar com você.`; $('#invite').style.display = 'block'; beep(700, 150, 'triangle', .05); break;
    case 'tr': trade = m.m; if (m.msg) log(m.msg, 'sys'); renderTrade(); break;
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
    if (!e.snaps.length || Math.hypot(e.x - x, e.y - y) > 6) { e.x = x; e.y = y; e.snaps = []; if (id === you) pred = null; }
    e.snaps.push({ t, x, y }); if (e.snaps.length > 8) e.snaps.shift(); e.hp = hp;
  }
  for (const id of ents.keys()) if (!seen.has(id)) { ents.delete(id); if (id === target) target = 0; }
  for (const f of m.fx ?? []) effect(f);
}
function burst(x: number, y: number, n: number, c: string, sp = 3) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = sp * (.3 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 0, max: .35 + Math.random() * .35, c, s: 2 + (Math.random() * 3 | 0), g: 5 }); } }
function faceTo(e: Ent, tx: number, ty: number) { const dx = tx - e.x, dy = ty - e.y; e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 3) : dy > 0 ? 0 : 1; }
function effect(f: any) {
  const e = ents.get(f.id), now = performance.now();
  switch (f.k) {
    case 'hit': if (e) e.flash = now + 90; texts.push({ x: f.x, y: f.y, s: String(f.v), c: f.p ? '#ff7070' : f.c ? '#ffd24a' : '#fff', t: 0, big: !!f.c }); burst(f.x, f.y - .4, f.c ? 12 : 6, f.p ? '#e0425a' : '#bdf0ff'); if (f.id === target || f.p) beep(f.p ? 150 : f.c ? 420 : 260, 70); break;
    case 'miss': texts.push({ x: f.x, y: f.y, s: 'Esquiva', c: '#b9e6ff', t: 0, big: false }); break;
    case 'swing': if (e) { faceTo(e, f.tx, f.ty); e.atkUntil = now + 220; if (f.b) bolts.push({ x: e.x, y: e.y, tx: f.tx, ty: f.ty, t: 0, c: f.b }); else slashes.push({ x: e.x, y: e.y, a: Math.atan2(f.ty - e.y, f.tx - e.x), t: 0 }); } break;
    case 'bolt': if (e) { faceTo(e, f.tx, f.ty); e.atkUntil = now + 240; } bolts.push({ x: f.x, y: f.y, tx: f.tx, ty: f.ty, t: 0, c: f.b }); beep(480, 110, 'sawtooth', .025); break;
    case 'boom': rings.push({ x: f.x, y: f.y, r: f.r, t: 0, max: .3, c: f.b }); burst(f.x, f.y, 26, f.b, 6); break;
    case 'curse': rings.push({ x: f.x, y: f.y, r: 1.3, t: 0, max: .6, c: f.b }); burst(f.x, f.y - .4, 16, f.b, 2); beep(160, 260, 'triangle', .05); break;
    case 'summon': rings.push({ x: f.x, y: f.y, r: 1.6, t: 0, max: .45, c: '#c9a4ff' }); burst(f.x, f.y, 22, '#c9a4ff', 4); beep(300, 240, 'sine', .05); break;
    case 'bite': if (e) { faceTo(e, f.tx, f.ty); e.atkUntil = now + 220; } break;
    case 'spin': if (e) e.atkUntil = now + 300; rings.push({ x: f.x, y: f.y, r: f.r, t: 0, max: .35, c: '#ffe08a' }); burst(f.x, f.y, 26, '#ffd76a', 6); beep(320, 180, 'sawtooth', .04); break;
    case 'dash': for (let i = 0; i < 14; i++) { const u = i / 14; parts.push({ x: f.fx + (f.x - f.fx) * u, y: f.fy + (f.y - f.fy) * u, vx: 0, vy: 0, life: 0, max: .4, c: '#ffcf6a', s: 5 }); } beep(200, 160, 'sawtooth', .04); break;
    case 'die': if (e?.k === 'm') ghosts.push({ c: mobSprites(e.info.mob)[0][e.dir === 3 ? 1 : 0], x: f.x, y: f.y, t: 0 }); burst(f.x, f.y - .3, 26, '#d8f4ff', 5); beep(110, 260); break;
    case 'lvl': for (let i = 0; i < 44; i++) parts.push({ x: f.x + (Math.random() - .5), y: f.y, vx: 0, vy: -3 - Math.random() * 3, life: 0, max: .9, c: '#ffe08a', s: 3 }); break;
    case 'buff': rings.push({ x: f.x, y: f.y, r: 1.8, t: 0, max: .5, c: f.b }); burst(f.x, f.y - .4, 24, f.b, 3); beep(440, 220, 'triangle', .05); break;
    case 'up': if (f.ok) { for (let i = 0; i < 40; i++) parts.push({ x: f.x + (Math.random() - .5), y: f.y, vx: 0, vy: -3 - Math.random() * 3, life: 0, max: .8, c: '#ffe08a', s: 3 }); beep(780, 300, 'triangle', .06); } else { burst(f.x, f.y - .4, 20, '#8a7a9a', 3); beep(120, 300, 'sawtooth', .05); } break;
    case 'loot': { texts.push({ x: f.x, y: f.y - .4, s: `Coleta ×${f.n}`, c: '#ffe08a', t: 0, big: false }); burst(f.x, f.y - .3, 8, '#ffe08a', 2); beep(520 + f.n * 60, 90, 'triangle', .05); break; }
    case 'heal': burst(f.x, f.y - .4, 10, '#7dffa1', 2); beep(520, 120, 'sine', .05); break;
    case 'nova': rings.push({ x: f.x, y: f.y, r: f.r, t: 0, max: f.d / 1000, c: f.b ?? '#7fe3ff', tele: true }); beep(90, 900, 'sawtooth', .05); setTimeout(() => { if (running) { rings.push({ x: f.x, y: f.y, r: f.r, t: 0, max: .4, c: f.b ?? '#d9f7ff' }); burst(f.x, f.y, 70, f.b ?? '#bdf0ff', 12); beep(70, 400, 'square', .07); } }, f.d); break;
  }
}
function updateHud() {
  if (!me) return; const pct = (a: number, b: number) => `${Math.max(0, Math.min(100, a / Math.max(1, b) * 100))}%`;
  { const c = $('#lootc'); if (me.loot) { c.style.display = 'block'; c.textContent = `Coleta ×${me.loot} · +${me.loot * 5}% XP e moedas`; lootHidden = false; } else if (!lootHidden) { c.style.display = 'none'; lootHidden = true; } }
  myCls.skills.forEach(s => $(`[data-sk="${s.n}"]`).classList.toggle('lock', me!.level < (s.lvl ?? 1)));
  $<HTMLElement>('#orbh i').style.height = pct(me.hp, me.maxHp); $<HTMLElement>('#orbm i').style.height = pct(me.mp, me.maxMp); $('#orbh em').textContent = String(me.hp); $('#orbm em').textContent = String(me.mp);
  $('#nm').innerHTML = `${esc(myName)} <span>Nv ${me.level}</span>`; $('#hpb').style.width = pct(me.hp, me.maxHp); $('#mpb').style.width = pct(me.mp, me.maxMp); $('#hpt').textContent = `${me.hp}/${me.maxHp}`; $('#mpt').textContent = `${me.mp}/${me.maxMp}`; $('#xp i').style.width = pct(me.xp, me.xpNext); $('#xpt').textContent = `XP ${(me.xp / Math.max(1, me.xpNext) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% · ${me.xp.toLocaleString('pt-BR')} / ${me.xpNext.toLocaleString('pt-BR')}`;
  document.querySelectorAll<HTMLElement>('[data-pot]').forEach(b => { b.querySelector('s')!.textContent = String(items.find(i => i.key === b.dataset.pot)?.qty ?? 0); });
  $('#invinfo').dataset.gold = String(me.gold); if (!$('#invinfo').dataset.hover) $('#invinfo').textContent = `Moedas: ${me.gold}`;
  if ($('#w-char').style.display === 'block') renderChar();
  if ($('#w-shop').style.display === 'block') renderShop();
}
function drawPortrait() { const c = $<HTMLCanvasElement>('#portrait'), x = c.getContext('2d')!; x.clearRect(0, 0, 40, 48); x.imageSmoothingEnabled = false; x.drawImage(heroSprites(myGear())[0][0], 0, 8, 40, 48, 0, 0, 40, 48); }
function myGear(): Look { const by = (s: string) => items.find(i => i.equip === s)?.key ?? null; return lookFromGear(myCls.name, HAIR_COLORS[myLook.hc], myLook.hs, { helm: by('helm'), armor: by('armor'), pants: by('pants'), boots: by('boots'), weapon: by('weapon') }); }

// ---------- janelas ----------
const openW = (w: string) => { if (window.innerWidth < 720) closeWins(); $('#w-' + w).style.display = 'block'; if (w === 'inv') renderInv(); if (w === 'char') renderChar(); if (w === 'map') renderBig(); };
function closeWin(w: string) { $('#w-' + w).style.display = 'none'; if (w === 'shop') shop = null; }
function closeWins() { ['inv', 'char', 'map', 'shop'].forEach(closeWin); }
const toggle = (w: string) => $('#w-' + w).style.display === 'block' ? closeWin(w) : openW(w);
document.querySelectorAll<HTMLElement>('[data-w]').forEach(b => b.onclick = () => toggle(b.dataset.w!));
document.querySelectorAll<HTMLElement>('[data-close]').forEach(b => b.onclick = () => closeWin(b.closest('.win')!.id.slice(2)));
function itemText(i: ItemInst) { const d = ITEMS[i.key], parts = [`${d.name}${i.plus ? ` +${i.plus}` : ''}${i.rarity ? ` (${RARITY[i.rarity].name})` : ''}`]; if (JEWELS[i.key]) parts.push(`Melhora itens de +${JEWELS[i.key].min} a +${JEWELS[i.key].max - 1} · ${JEWELS[i.key].chance * 100}%`); const a = itemStat(i, 'dmg'), b = itemStat(i, 'def'), c = itemStat(i, 'hp'); if (a) parts.push(`Dano +${a}`); if (b) parts.push(`Defesa +${b}`); if (c) parts.push(`Vida +${c}`); if (d.heal) parts.push(`Cura ${d.heal}`); if (d.mana) parts.push(`Mana ${d.mana}`); if (d.lvl > 1) parts.push(`Nível ${d.lvl}`); if (!canWield(myCls, d)) parts.push(d.set ? `Exclusivo: ${classOf(CLASSES[SETS[d.set].cls!].name).name}` : 'Outra classe'); if (d.set) parts.push(`Set ${SETS[d.set].name}`); return parts.join(' · '); }
function makeCell(i: ItemInst | undefined, click: () => void, label = '') {
  const c = document.createElement('button'); c.className = 'cell'; c.type = 'button';
  if (i) { c.style.borderColor = i.rarity ? RARITY[i.rarity].color : ''; const ic = cv(28, 28); ic.getContext('2d')!.drawImage(icon(i.key), 0, 0); c.appendChild(ic); if (i.qty > 1) { const s = document.createElement('s'); s.textContent = String(i.qty); c.appendChild(s); } if (i.plus) { const u = document.createElement('u'); u.textContent = `+${i.plus}`; u.style.color = glowTier(i.plus) ?? '#fff'; c.appendChild(u); } c.title = itemText(i); c.onclick = click; const info = $('#invinfo'); c.onpointerenter = () => { info.dataset.hover = '1'; info.textContent = itemText(i); }; c.onpointerleave = () => { delete info.dataset.hover; info.textContent = `Moedas: ${me?.gold ?? 0}`; }; }
  else c.textContent = label;
  return c;
}
function renderInv() {
  const gear = $('#gear'), grid = $('#grid'); gear.replaceChildren(); grid.replaceChildren();
  for (const s of SLOTS) { const i = items.find(x => x.equip === s); gear.appendChild(makeCell(i, () => { if (jewelSlot >= 0 && i) { send({ t: 'up', j: jewelSlot, item: i.id }); jewelSlot = -1; renderInv(); } else send({ t: 'ue', eq: s }); }, SLOT_NAMES[s])); }
  for (let n = 0; n < CONFIG.invSize; n++) { const i = items.find(x => !x.equip && x.slot === n); const cel = makeCell(i, () => { if (!i) return; if (JEWELS[i.key]) { jewelSlot = jewelSlot === n ? -1 : n; renderInv(); return; } if (jewelSlot >= 0) { send({ t: 'up', j: jewelSlot, item: i.id }); jewelSlot = -1; renderInv(); return; } if (ITEMS[i.key].kind === 'potion') send({ t: 'u', slot: n }); else if (ITEMS[i.key].kind !== 'material') send({ t: 'e', slot: n }); }); if (n === jewelSlot) cel.classList.add('jsel'); grid.appendChild(cel); }
  if (jewelSlot >= 0 && !$('#invinfo').dataset.hover) $('#invinfo').textContent = 'Joia selecionada: clique no item que quer melhorar.';
}
function renderChar() {
  if (!me) return; const P = $('#charp'), m = me, st = (k: 'str' | 'agi' | 'vit' | 'ene', n: string) => `<div class="stat"><span>${n}</span><span>${m[k]}${m.points ? `<button data-s="${k}">+1</button>` : ''}</span></div>`;
  P.innerHTML = `<div class="stat"><b>${esc(myName)}</b><span>${myCls.name} · Nível ${m.level}</span></div><div class="stat"><span>Experiência</span><span>${m.xp} / ${m.xpNext}</span></div><div class="stat" style="color:var(--gold)"><span>Pontos livres</span><span>${m.points}</span></div>${st('str', 'Força')}${st('agi', 'Agilidade')}${st('vit', 'Vitalidade')}${st('ene', 'Energia')}<div class="stat"><span>Ataque</span><span>${m.atk}</span></div><div class="stat"><span>Defesa</span><span>${m.def}</span></div>${Object.entries(setCounts(items)).map(([k, n]) => `<div class="stat" style="color:${SETS[k].trim}"><span>${esc(SETS[k].name)} (${n}/4)</span><span>${setBonus(k, n)}</span></div>`).join('')}`;
  P.querySelectorAll<HTMLElement>('[data-s]').forEach(b => b.onclick = () => send({ t: 'st', s: b.dataset.s, n: 1 }));
}
const setBonus = (k: string, n: number) => { const b = SETS[k].bonus, o: string[] = []; if (n >= 2) o.push(`+${b.def} def`); if (n >= 3) o.push(`+${b.hp} vida`); if (n >= 4) o.push(`+${Math.round(b.atk * 100)}% atq`); return o.join(' · ') || 'sem bônus'; };
function renderShop() {
  if (!shop || !me) return; const sk = `${you}|${shop.id}|${me.gold}|${JSON.stringify(items)}`; if (sk === shopKey) return; shopKey = sk; $('#shopt').textContent = shop.name; const L = $('#shopl'), npc = shop; L.replaceChildren();
  let lastSet = '';
  for (const k of SHOPS[npc.shop!].filter(x => !ITEMS[x].set || canWield(myCls, ITEMS[x]))) { const d = ITEMS[k];
    if (d.set && d.set !== lastSet) { lastSet = d.set; const S = SETS[d.set], h = document.createElement('div'); h.className = 'sethead'; const full = Object.fromEntries(SET_PIECES.map(p => [p, `${S.key}_${p}`])), pv = cv(FRAME_W, FRAME_H); pv.getContext('2d')!.drawImage(heroSprites(lookFromGear(myCls.name, HAIR_COLORS[myLook.hc], myLook.hs, { ...full, weapon: myCls.weapon }))[0][0], 0, 0); const t = document.createElement('div'); t.innerHTML = `<b style="color:${S.trim}">Set ${esc(S.name)}</b><small>Nível ${S.lvl} · 2 peças: +${S.bonus.def} defesa · 3: +${S.bonus.hp} vida · 4: +${Math.round(S.bonus.atk * 100)}% ataque</small>`; h.append(pv, t); L.appendChild(h); }
    const r = document.createElement('div'); r.className = 'shopitem'; const c = cv(28, 28); c.getContext('2d')!.drawImage(icon(k), 0, 0); c.style.imageRendering = 'pixelated'; const s = document.createElement('span'); s.textContent = `${d.name} · ${d.price.toLocaleString('pt-BR')} moedas`; const b = document.createElement('button'); b.textContent = 'Comprar'; b.disabled = me.gold < d.price; b.onclick = () => send({ t: 'b', npc: npc.id, key: k, qty: 1 }); r.append(c, s, b); L.appendChild(r); }
  const bag = items.filter(i => !i.equip).sort((a, b) => a.slot - b.slot), h = document.createElement('h4'); h.textContent = bag.length ? 'Vender da bolsa' : 'Sua bolsa está vazia'; h.className = 'shoph'; L.appendChild(h);
  for (const i of bag) { const r = document.createElement('div'); r.className = 'shopitem'; r.dataset.sell = i.key; const c = cv(28, 28); c.getContext('2d')!.drawImage(icon(i.key), 0, 0); c.style.imageRendering = 'pixelated'; const s = document.createElement('span'); s.textContent = `${ITEMS[i.key].name}${i.qty > 1 ? ` ×${i.qty}` : ''} · ${sellPrice(i)} moedas`; s.style.color = RARITY[i.rarity].color; s.title = itemText(i); const b = document.createElement('button'); b.textContent = 'Vender'; b.onclick = () => { if (i.rarity && !confirm(`Vender ${ITEMS[i.key].name} (${RARITY[i.rarity].name})?`)) return; send({ t: 'se', npc: npc.id, slot: i.slot }); }; r.append(c, s, b); L.appendChild(r); }
}
let miniBase: Cv | null = null;
const TILE_COL = ['#4c8a3f', '#a29a8b', '#2f74b5', '#e4edf6', '#a6d6ee', '#94734b', '#e8601c', '#3b3236'];
function bakeMini() { if (!map) return; miniBase = cv(map.w, map.h); const x = miniBase.getContext('2d')!; for (let j = 0; j < map.h; j++) for (let i = 0; i < map.w; i++) { const sol = map.solid[j * map.w + i], t = map.tiles[j * map.w + i]; x.fillStyle = sol && t !== T.WATER && t !== T.LAVA ? (map.safe ? '#3a5b34' : '#274c48') : TILE_COL[t]; x.fillRect(i, j, 1, 1); } }
function paintMap(c: HTMLCanvasElement, sx: number, sy: number, wv: number, hv: number) {
  if (!map || !miniBase) return; const x = c.getContext('2d')!, k = c.width / wv; x.imageSmoothingEnabled = false; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.drawImage(miniBase, sx, sy, wv, hv, 0, 0, c.width, c.height);
  const dot = (px: number, py: number, col: string, s = 3) => { x.fillStyle = col; x.fillRect((px - sx) * k - s / 2, (py - sy) * k - s / 2, s, s); };
  for (const p of map.portals) dot(p.x, p.y, '#c78bff', 5); for (const n of map.npcs) dot(n.x, n.y, '#ffe08a');
  for (const e of ents.values()) if (e.k !== 'd') dot(e.x, e.y, e.id === you ? '#fff' : e.k === 'p' ? '#6fdc7e' : '#ff5a5a');
}
function renderMini() { const e = ents.get(you); if (!e || !map) return; const w = Math.min(map.w, 42), h = w * 112 / 146, sx = Math.max(0, Math.min(map.w - w, e.x - w / 2)), sy = Math.max(0, Math.min(map.h - h, e.y - h / 2)); paintMap($<HTMLCanvasElement>('#minimap'), sx, sy, w, h); $('#where').textContent = `${map.name} ${e.x | 0},${e.y | 0}`; }
function renderBig() { if (!map) return; const c = $<HTMLCanvasElement>('#bigmap'); c.width = map.w * 5; c.height = map.h * 5; $('#mapt').firstChild!.textContent = `${map.name} `; paintMap(c, 0, 0, map.w, map.h); }

// ---------- entrada ----------
let joy = { x: 0, y: 0 }, lastInput = '';
function syncInput() { let x = joy.x, y = joy.y; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } x = Math.round(x * 10) / 10; y = Math.round(y * 10) / 10; const s = `${x},${y}`; if (s !== lastInput) { lastInput = s; send({ t: 'i', x, y }); if (x || y) { target = 0; pendingNpc = null; marker = null; const a = ents.get(you); if (a && !pred) pred = { x: a.x, y: a.y, path: null, stop: 0, tx: 0, ty: 0, hold: 0 }; } } }
function nearestMob(r: number) { const a = ents.get(you); if (!a) return null; let b: Ent | null = null, bd = r; for (const e of ents.values()) if (e.k === 'm') { const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < bd) { bd = d; b = e; } } return b; }
function startPred(x: number, y: number, stop = 0) { const a = ents.get(you); if (!a || !map || me?.dead) return; const path = findPath(map, a.x, a.y, x, y); if (path) pred = { x: a.x, y: a.y, path, stop, tx: x, ty: y, hold: performance.now() + 700 }; }
function attack(e: Ent) { target = e.id; send({ t: 'a', id: e.id }); const a = ents.get(you); if (!a) return; if (Math.hypot(a.x - e.x, a.y - e.y) <= myCls.range) { faceTo(a, e.x, e.y); a.atkUntil = performance.now() + 180; pred = null; } else startPred(e.x, e.y, myCls.range - .05); }
function skill(n: number) { const sk = myCls.skills.find(s => s.n === n)!; let t = ents.get(target); if (sk.kind !== 'spin' && sk.kind !== 'summon' && sk.kind !== 'buff' && sk.kind !== 'heal' && (!t || t.k !== 'm')) { const nm = nearestMob(sk.range ?? 8); if (nm) { attack(nm); t = nm; } } send({ t: 'k', n, id: t?.id ?? 0 }); }
function potion(k: string) { const i = items.find(x => x.key === k && !x.equip); if (i) send({ t: 'u', slot: i.slot }); }
const tgtTyping = () => document.activeElement === $('#chati');
addEventListener('keydown', e => {
  if (!running || (e.target as HTMLElement).tagName === 'INPUT' && e.key !== 'Enter' && e.key !== 'Escape') return;
  const k = e.key.toLowerCase();
  if (e.key === 'Enter') { const i = $<HTMLInputElement>('#chati'); if (!tgtTyping()) { e.preventDefault(); i.focus(); } return; }
  if (e.key === 'Escape') { $('#chati').blur(); closeWins(); return; }
  if (e.repeat) return;
  if (k === '1' || k === '2' || k === '3' || k === '4') selectSkill(+k); else if (k === 'q') potion('pot_hp'); else if (k === 'e') potion('pot_mp'); else if (k === 'i') toggle('inv'); else if (k === 'c') toggle('char'); else if (k === 'm') toggle('map'); else if (k === ' ') { const m = nearestMob(10); if (m) attack(m); }
});
addEventListener('blur', () => { holding = false; joy = { x: 0, y: 0 }; if (running) syncInput(); });
let chan: 'l' | 'g' | 'p' = 'l';
$('#chan').onclick = () => { chan = chan === 'l' ? 'g' : chan === 'g' ? 'p' : 'l'; $('#chan').textContent = { l: 'Local', g: 'Global', p: 'Grupo' }[chan]; };
$('#inva').onclick = () => { send({ t: inviteKind === 't' ? 'ta' : 'pa' }); $('#invite').style.display = 'none'; };
$('#invd').onclick = () => { send({ t: inviteKind === 't' ? 'td' : 'pd' }); $('#invite').style.display = 'none'; };
$('#pminv').onclick = () => { if (menuFor) send({ t: 'pi', id: menuFor.id }); $('#pmenu').style.display = 'none'; };
$('#pmtrade').onclick = () => { if (menuFor) send({ t: 'ti', id: menuFor.id }); $('#pmenu').style.display = 'none'; };
$('#tcancel').onclick = () => send({ t: 'td' });
$('#tok').onclick = () => send({ t: 'tk' });
$<HTMLInputElement>('#tgold').onchange = () => pushOffer();
function pushOffer(ids?: string[]) { if (!trade) return; const v = Math.max(0, Math.floor(+$<HTMLInputElement>('#tgold').value || 0)); send({ t: 'to', ids: ids ?? trade.mine.items.map((i: ItemInst) => i.id), gold: Math.min(v, me?.gold ?? 0) }); }
function renderTrade() {
  const W_ = $('#w-trade'); if (!trade) { W_.style.display = 'none'; return; } W_.style.display = 'block';
  const row = (host: HTMLElement, list: ItemInst[]) => { host.replaceChildren(); for (let n = 0; n < 12; n++) host.appendChild(makeCell(list[n], () => { })); };
  $('#tname').textContent = trade.name; row($('#tmine'), trade.mine.items); row($('#ttheirs'), trade.theirs.items);
  const g = $<HTMLInputElement>('#tgold'); if (document.activeElement !== g) g.value = String(trade.mine.gold); $('#ttg').textContent = `Moedas oferecidas: ${trade.theirs.gold.toLocaleString('pt-BR')}`;
  const st = ['Escolhendo', 'Oferta travada', 'Confirmou'], mine = trade.mine.st, th = trade.theirs.st; $('#tstm').textContent = st[mine]; $('#tstt').textContent = st[th];
  const b = $<HTMLButtonElement>('#tok'); b.textContent = mine === 0 ? 'Travar oferta' : mine === 1 && th >= 1 ? 'Confirmar troca' : 'Aguardando'; b.disabled = !(mine === 0 || (mine === 1 && th >= 1));
  const bag = $('#tbag'); bag.replaceChildren(); const sel = trade.mine.items.map((i: ItemInst) => i.id);
  for (const i of items.filter(x => !x.equip).sort((a, b2) => a.slot - b2.slot)) { if (sel.includes(i.id)) continue; bag.appendChild(makeCell(i, () => pushOffer([...sel, i.id]))); }
  const hostM = $('#tmine'); trade.mine.items.forEach((i: ItemInst, n: number) => { (hostM.children[n] as HTMLElement).onclick = () => pushOffer(sel.filter((x: string) => x !== i.id)); });
}
function renderParty() {
  const P = $('#party'); P.replaceChildren(); P.style.display = party ? 'block' : 'none'; if (!party) return;
  const lead = party.leader === party.me;
  for (const m of party.m) { const r = document.createElement('div'); r.className = 'pm'; r.dataset.n = m.name; r.innerHTML = `<span>${m.id === party.leader ? '★ ' : ''}${esc(m.name)}</span><div class="bar hp"><i></i></div>`; if (lead && m.id !== party.me) { const k = document.createElement('button'); k.textContent = '×'; k.onclick = () => send({ t: 'pk', char: m.id }); r.prepend(k); } P.appendChild(r); }
  const f = document.createElement('div'); f.className = 'row';
  const md = document.createElement('button'); md.textContent = `XP: ${party.mode ? 'por nível' : 'igual'}`; md.disabled = !lead; md.onclick = () => send({ t: 'pm' });
  const l = document.createElement('button'); l.textContent = 'Sair'; l.onclick = () => send({ t: 'pl' }); f.append(md, l); P.appendChild(f);
}
$<HTMLFormElement>('#chatf').onsubmit = e => { e.preventDefault(); const i = $<HTMLInputElement>('#chati'); if (i.value.trim()) send({ t: 'c', ch: chan, m: i.value }); i.value = ''; i.blur(); };
$('#exit').onclick = () => leave();
$('#auto').onclick = () => { auto = !auto; $('#auto').style.borderColor = auto ? 'var(--gold)' : ''; };
$('#atk').onclick = () => { const m = nearestMob(12); if (m) attack(m); };
document.querySelectorAll<HTMLElement>('[data-sk]').forEach(b => b.onclick = () => touch ? skill(+b.dataset.sk!) : selectSkill(+b.dataset.sk!));
document.querySelectorAll<HTMLElement>('[data-pot]').forEach(b => b.onclick = () => potion(b.dataset.pot!));
const stick = $('#stick'), knob = stick.querySelector('i') as HTMLElement; let stickId = -1;
const moveStick = (e: PointerEvent) => { const b = stick.getBoundingClientRect(); let x = (e.clientX - b.left - b.width / 2) / 50, y = (e.clientY - b.top - b.height / 2) / 50; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } knob.style.transform = `translate(${x * 40}px,${y * 40}px)`; joy = l < .18 ? { x: 0, y: 0 } : { x, y }; syncInput(); };
stick.onpointerdown = e => { stickId = e.pointerId; stick.setPointerCapture(stickId); moveStick(e); };
stick.onpointermove = e => { if (e.pointerId === stickId) moveStick(e); };
stick.onpointerup = stick.onpointercancel = () => { stickId = -1; joy = { x: 0, y: 0 }; knob.style.transform = ''; syncInput(); };
let viewX = 0, viewY = 0, holding = false, holdAt = 0, curX = 0, curY = 0, activeSkill = 1;
const toWorld = (cx: number, cy: number) => { const dpr = canvas.width / canvas.clientWidth; return { x: (cx * dpr / Z - viewX) / 32, y: (cy * dpr / Z - viewY) / 32 }; };
function mobAt(wx: number, wy: number) { let best: Ent | null = null, bd = 1.2; for (const en of ents.values()) if (en.k === 'm') { const sz = mobSize(en.info.mob) / 32, d = Math.hypot(en.x - wx, en.y - sz / 2 - wy); if (d < Math.max(bd, sz * .7)) { bd = d; best = en; } } return best; }
function selectSkill(n: number) { activeSkill = n; document.querySelectorAll<HTMLElement>('[data-sk]').forEach(b => b.classList.toggle('sel', +b.dataset.sk! === n)); }
selectSkill(1);
canvas.addEventListener('contextmenu', e => e.preventDefault());
function pixelCursor(c1: string, c2: string, attack: boolean) { const c = cv(32, 32), x = c.getContext('2d')!, r = (a: number, b: number, w: number, h: number, k: string) => { x.fillStyle = k; x.fillRect(a, b, w, h); }; for (let i = 0; i < 14; i++) { r(2 + i, 2 + i, 4, 3, '#1a1426'); r(3 + i, 3 + i, 2, 1, i < 3 ? '#fff' : c1); } for (let i = 0; i < 6; i++) r(9 + i, 19 - i, 2, 2, c2); r(16, 17, 6, 3, '#6b4a2b'); r(20, 19, 3, 6, '#6b4a2b'); return `url(${c.toDataURL()}) 2 2, ${attack ? 'crosshair' : 'default'}`; }
const curNormal = pixelCursor('#e8dfc9', '#e9c46a', false), curAttack = pixelCursor('#ff6b5a', '#ff9d3c', true); let curAtk: boolean | null = null, curCheck = 0;
canvas.addEventListener('pointermove', e => { curX = e.clientX; curY = e.clientY; const n = performance.now(); if (n > curCheck && map) { curCheck = n + 60; const w = toWorld(e.clientX, e.clientY), at = !!mobAt(w.x, w.y); if (at !== curAtk) { curAtk = at; canvas.style.cursor = at ? curAttack : curNormal; } } });
addEventListener('pointerup', () => { holding = false; });
canvas.addEventListener('pointerdown', e => {
  if (!map || !running) return;
  curX = e.clientX; curY = e.clientY;
  const { x: wx, y: wy } = toWorld(e.clientX, e.clientY);
  if (e.button === 2) { const m = mobAt(wx, wy); if (m) target = m.id; skill(activeSkill); return; } // botão direito: habilidade selecionada
  if (e.button !== 0) return;
  $('#pmenu').style.display = 'none';
  const best = mobAt(wx, wy);
  if (best) return attack(best);
  for (const en of ents.values()) if (en.k === 'p' && en.id !== you && Math.hypot(en.x - wx, en.y - .6 - wy) < .9) {
    $('#pminv').style.display = party?.m.some(m => m.name === en.info.name) ? 'none' : ''; menuFor = en; $('#pmname').textContent = en.info.name; const pm = $('#pmenu'); pm.style.display = 'block'; pm.style.left = `${Math.min(innerWidth - 170, e.clientX)}px`; pm.style.top = `${Math.min(innerHeight - 90, e.clientY)}px`; return;
  }
  for (const n of map.npcs) if (Math.hypot(n.x - wx, n.y - .6 - wy) < 1.1) { const a = ents.get(you); pendingNpc = n; target = 0; if (a && Math.hypot(a.x - n.x, a.y - n.y) > 2.5) { send({ t: 'g', x: n.x, y: n.y + 1.4 }); startPred(n.x, n.y + 1.4); } return; }
  target = 0; pendingNpc = null; marker = { x: wx, y: wy, t: 0 }; closeWin('shop'); send({ t: 'g', x: wx, y: wy }); startPred(wx, wy);
  if (e.pointerType === 'mouse') { holding = true; holdAt = performance.now() + 250; } // segurar: segue o cursor
});
function resize() { const dpr = 1, W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr); canvas.width = W; canvas.height = H; Z = Math.max(1, Math.round(Math.min(W / (22 * 32), H / (13 * 32)))); }
addEventListener('resize', resize); resize(); requestAnimationFrame(menuFrame);
document.querySelectorAll<HTMLElement>('[data-pot]').forEach(b => { const c = cv(28, 28); c.getContext('2d')!.drawImage(icon(b.dataset.pot!), 0, 0); c.className = 'pi'; b.insertBefore(c, b.querySelector('s')); b.title = b.dataset.pot === 'pot_hp' ? 'Vida' : 'Mana'; [...b.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove()); });
{ const c = cv(28, 28); c.getContext('2d')!.drawImage(icon('short_sword'), 0, 0); c.className = 'pi'; $('#atk').appendChild(c); [...$('#atk').childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove()); }

// ---------- render ----------
let jewelSlot = -1;
let ghosts: { c: Cv; x: number; y: number; t: number }[] = [];
let inviteKind = 'p', trade: any = null, lootHidden = true;
let miniAt = 0, autoAt = 0; const cdEl: Record<number, HTMLElement> = {}, cdVal: Record<number, string> = {}; let shopKey = '';
function menuFrame(ts: number) {
  if (!menuOn || running) return; requestAnimationFrame(menuFrame);
  const m = getMap('valoria'), W = canvas.width, H = canvas.height, zm = Math.max(2, Z), vw = W / zm, vh = H / zm;
  menuX = 25 + Math.sin(ts / 16000) * 8; const ox = Math.round(vw / 2 - menuX * 32), oy = Math.round(vh / 2 - 20 * 32);
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#0a0814'; g.fillRect(0, 0, W, H); g.setTransform(zm, 0, 0, zm, ox * zm, oy * zm);
  const x0 = Math.max(0, Math.floor(-ox / 32)), y0 = Math.max(0, Math.floor(-oy / 32)), x1 = Math.min(m.w - 1, Math.ceil((-ox + vw) / 32)), y1 = Math.min(m.h - 1, Math.ceil((-oy + vh) / 32));
  for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const t = m.tiles[j * m.w + i]; g.drawImage(tile(t, (i * 7 + j * 13) % 4, t === T.WATER ? Math.floor(ts / 260) % 4 : 0), i * 32, j * 32); }
  m.objs.filter(o => o.x + o.w >= x0 - 2 && o.x <= x1 + 2 && o.y + o.h >= y0 && o.y <= y1 + 3).sort((a, b) => a.y + a.h - b.y - b.h).forEach(o => { const s = objSprite(o); g.drawImage(s.c, o.x * 32 + s.ox, o.y * 32 + s.oy); });
}
function frame(ts: number) {
  if (!running) return; requestAnimationFrame(frame);
  const dt = Math.min(.1, (ts - (lastFrame || ts)) / 1000); lastFrame = ts; if (!map) return;
  const renderT = ts - 85;
  for (const e of ents.values()) {
    const px = e.x, py = e.y; const s = e.snaps;
    if (e.id === you && pred && s.length) {
      const l = s[s.length - 1], sp = CONFIG.playerSpeed * dt; let active = false;
      if (joy.x || joy.y) { step(map, pred, joy.x * sp, joy.y * sp); pred.path = null; active = true; }
      else if (pred.path) { let left = sp; while (left > 0 && pred.path?.length) { if (pred.stop && Math.hypot(pred.x - pred.tx, pred.y - pred.ty) <= pred.stop) { pred.path = null; break; } const n = pred.path[0], d = Math.hypot(n.x - pred.x, n.y - pred.y); if (d <= left) { pred.x = n.x; pred.y = n.y; left -= d; pred.path.shift(); } else { pred.x += (n.x - pred.x) / d * left; pred.y += (n.y - pred.y) / d * left; left = 0; } } active = !!pred.path?.length; if (!active) pred.path = null; }
      if (active) pred.hold = ts + 700;
      const err = Math.hypot(l.x - pred.x, l.y - pred.y);
      if (err > 4 || me?.dead || (!active && (err < .3 || ts > pred.hold))) pred = null; else { const k = Math.min(1, dt * 30); e.x += (pred.x - e.x) * k; e.y += (pred.y - e.y) * k; }
    }
    if (e.id === you && pred) { /* previsão local ativa */ }
    else if (e.id === you) { const l = s[s.length - 1], p0 = s[s.length - 2]; if (l) { let tx = l.x, ty = l.y; if (p0 && l.t > p0.t) { const age = Math.min(110, ts - l.t), span = l.t - p0.t; tx += (l.x - p0.x) / span * age; ty += (l.y - p0.y) / span * age; } const k = Math.min(1, dt * 22); e.x += (tx - e.x) * k; e.y += (ty - e.y) * k; } }
    else if (s.length) { let a = s[0], b = s[s.length - 1]; for (let i = 0; i < s.length - 1; i++) if (s[i].t <= renderT && s[i + 1].t >= renderT) { a = s[i]; b = s[i + 1]; break; } const u = b.t > a.t ? Math.max(0, Math.min(1, (renderT - a.t) / (b.t - a.t))) : 1; if (renderT > s[s.length - 1].t) { e.x = b.x; e.y = b.y; } else { e.x = a.x + (b.x - a.x) * u; e.y = a.y + (b.y - a.y) * u; } }
    const dx = e.x - px, dy = e.y - py, mv = Math.hypot(dx, dy); e.moving = mv > .003;
    if (e.moving && e.k === 'p' && Math.floor(e.anim / 2) !== e.stepN) { e.stepN = Math.floor(e.anim / 2); const tt = map.tiles[Math.floor(e.y) * map.w + Math.floor(e.x)]; if (tt === T.SNOW) { prints.push({ x: e.x + (e.stepN % 2 ? .12 : -.12), y: e.y, t: 0 }); if (prints.length > 140) prints.shift(); } else if (tt !== T.WATER) parts.push({ x: e.x, y: e.y + .1, vx: (Math.random() - .5) * .8, vy: -.5, life: 0, max: .35, c: tt === T.DIRT ? '#b79a70' : '#d8d2c2', s: 2 }); }
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
  const ox = Math.round((vw / 2 - (vw > map.w * 32 ? map.w * 16 : cx)) * Z) / Z, oy = Math.round((vh / 2 - (vh > map.h * 32 ? map.h * 16 : cy)) * Z) / Z;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#0a0814'; g.fillRect(0, 0, W, H); g.setTransform(Z, 0, 0, Z, ox * Z, oy * Z);
  viewX = ox; viewY = oy;
  if (holding && ts > holdAt) { holdAt = ts + 200; const w = toWorld(curX, curY); target = 0; pendingNpc = null; send({ t: 'g', x: w.x, y: w.y }); startPred(w.x, w.y); }
  const x0 = Math.max(0, Math.floor(-ox / 32)), y0 = Math.max(0, Math.floor(-oy / 32)), x1 = Math.min(map.w - 1, Math.ceil((-ox + vw) / 32)), y1 = Math.min(map.h - 1, Math.ceil((-oy + vh) / 32));
  const wf = Math.floor(ts / 260) % 4;
  if (chunkMap !== map.id) buildRows(map);
  const cs: { cx: number; cy: number; ch: ReturnType<typeof chunk> }[] = [];
  for (let cy = Math.floor(y0 / CH); cy <= Math.floor(y1 / CH); cy++) for (let cx = Math.floor(x0 / CH); cx <= Math.floor(x1 / CH); cx++) cs.push({ cx, cy, ch: chunk(map, cx, cy) });
  for (const c of cs) for (let n = 0; n < c.ch.anim.length; n += 2) { const i = c.ch.anim[n], j = c.ch.anim[n + 1]; g.drawImage(tile(map.tiles[j * map.w + i], (i * 7 + j * 13) % 4, wf), i * 32, j * 32); }
  for (const c of cs) g.drawImage(c.ch.c, c.cx * CH * 32, c.cy * CH * 32);
  prints = prints.filter(p => (p.t += dt) < 9); for (const p of prints) { g.fillStyle = `rgba(120,145,185,${.55 * (1 - p.t / 9)})`; g.fillRect(Math.round(p.x * 32) - 2, Math.round(p.y * 32), 4, 3); }
  // marcador e portais
  if (marker) { marker.t += dt; const u = marker.t / .5; if (u > 1) marker = null; else { g.strokeStyle = '#ffe08a'; g.lineWidth = 1; g.globalAlpha = 1 - u; g.strokeRect(marker.x * 32 - 8 + u * 4, marker.y * 32 - 5 + u * 3, 16 - u * 8, 10 - u * 6); g.globalAlpha = 1; } }
  for (const p of map.portals) { const X = p.x * 32, Y = p.y * 32, pul = Math.sin(ts / 300) * 2; g.fillStyle = '#3a2070'; ell2(X, Y + 8, 34, 10); g.fillStyle = '#6a3fd0'; ell2(X, Y - 26, 25, 40 + pul); g.fillStyle = '#9a6bff'; ell2(X, Y - 26, 19 + pul, 33); g.fillStyle = '#e4d3ff'; for (let i = 0; i < 8; i++) { const q = ts / 500 + i * .785, rr = 8 + (i % 3) * 5; g.fillRect(Math.round(X + Math.cos(q) * rr) - 1, Math.round(Y - 26 + Math.sin(q) * rr * 1.7) - 1, 3, 3); } if (Math.random() < .4) parts.push({ x: p.x + (Math.random() - .5) * 1.2, y: p.y, vx: 0, vy: -2.2, life: 0, max: .7, c: '#c9a4ff', s: 3 }); }
  for (const e of ents.values()) if (e.k === 'd') { const s = icon(e.info.key), bo = Math.sin(ts / 220 + e.id) * 2; g.fillStyle = '#0006'; ell2(e.x * 32, e.y * 32 + 6, 9, 3); if (e.info.rarity || (e.info.key && ITEMS[e.info.key].set)) { const col = e.info.rarity ? RARITY[e.info.rarity].color : '#ffd76a'; g.fillStyle = col + '66'; ell2(e.x * 32, e.y * 32, 16, 12); g.globalAlpha = .28 + Math.sin(ts / 180) * .1; g.fillStyle = col; g.fillRect(Math.round(e.x * 32) - 3, Math.round(e.y * 32) - 90, 6, 90); g.globalAlpha = 1; } g.drawImage(s, e.x * 32 - 14, e.y * 32 - 18 + bo); }
  // ordenação por profundidade
  const draw: { y: number; f: () => void }[] = [];
  const vis: GameMap['objs'] = []; for (let r = Math.max(0, y0 - 4); r <= Math.min(map.h - 1, y1 + 4); r++) for (const o of objRows[r]) if (o.x + o.w >= x0 - 3 && o.x <= x1 + 3) vis.push(o);
  for (const o of vis) draw.push({ y: o.y + o.h, f: () => drawObj(o, ts) });
  for (const p of map.portals) draw.push({ y: p.y + .3, f: () => { const c = archSprite(); g.drawImage(c, p.x * 32 - 42, p.y * 32 - 84); } });
  for (const n of map.npcs) { if (n.x < x0 - 2 || n.x > x1 + 2 || n.y < y0 - 2 || n.y > y1 + 2) continue; draw.push({ y: n.y, f: () => drawNpc(n) }); }
  for (const e of ents.values()) if (e.k !== 'd') draw.push({ y: e.y, f: () => drawEnt(e, ts) });
  draw.sort((p, q) => p.y - q.y).forEach(d => d.f());
  ghosts = ghosts.filter(z => (z.t += dt) < .5); for (const z of ghosts) { const u = z.t / .5; g.globalAlpha = 1 - u; g.drawImage(z.c, Math.round(z.x * 32 - z.c.width / 2), Math.round(z.y * 32 - z.c.height + 6 - u * 14)); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - u) * .7; g.drawImage(z.c, Math.round(z.x * 32 - z.c.width / 2), Math.round(z.y * 32 - z.c.height + 6 - u * 14)); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  // efeitos
  rings = rings.filter(r => (r.t += dt) < r.max); for (const r of rings) { const u = r.t / r.max; g.strokeStyle = r.c; g.lineWidth = r.tele ? 2 : 4; g.globalAlpha = r.tele ? .9 : 1 - u; g.beginPath(); g.ellipse(r.x * 32, r.y * 32, (r.tele ? u : .3 + u * .7) * r.r * 32, (r.tele ? u : .3 + u * .7) * r.r * 22, 0, 0, 6.3); g.stroke(); if (r.tele) { g.globalAlpha = .18; g.fillStyle = r.c; g.beginPath(); g.ellipse(r.x * 32, r.y * 32, r.r * 32, r.r * 22, 0, 0, 6.3); g.fill(); } g.globalAlpha = 1; }
  slashes = slashes.filter(s => (s.t += dt) < .18); for (const s of slashes) { g.globalAlpha = 1 - s.t / .18; g.strokeStyle = '#8fd0ff'; g.lineWidth = 7; g.beginPath(); g.arc(s.x * 32, s.y * 32 - 18, 30, s.a - 1.1 + s.t * 7, s.a + .3 + s.t * 7); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(s.x * 32, s.y * 32 - 18, 31, s.a - .9 + s.t * 7, s.a + .3 + s.t * 7); g.stroke(); g.globalAlpha = 1; }
  bolts = bolts.filter(b => (b.t += dt) < .16); for (const b of bolts) { const u = b.t / .16, px = b.x + (b.tx - b.x) * u, py = b.y + (b.ty - b.y) * u; parts.push({ x: px, y: py - .4, vx: (Math.random() - .5) * 1.4, vy: (Math.random() - .5) * 1.4, life: 0, max: .28, c: b.c, s: 3 }); g.fillStyle = b.c; g.fillRect(Math.round(px * 32) - 5, Math.round(py * 32) - 23, 10, 10); g.fillStyle = '#fff'; g.fillRect(Math.round(px * 32) - 2, Math.round(py * 32) - 20, 4, 4); }
  parts = parts.filter(p => (p.life += dt) < p.max); if (parts.length > 260) parts.splice(0, parts.length - 260); for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g ?? 0) * dt; g.globalAlpha = 1 - p.life / p.max; g.fillStyle = p.c; g.fillRect(Math.round(p.x * 32), Math.round(p.y * 32 - 8), p.s, p.s); } g.globalAlpha = 1;
  // vida no ambiente
  { const camWX = -ox + vw / 2, camWY = -oy + vh / 2, sm = g.imageSmoothingEnabled;
    g.imageSmoothingEnabled = true;
    for (let i = 0; i < 4; i++) { const rad = 260 + i * 60, cxx = camWX + Math.sin(ts / 21000 + i * 1.9) * vw * .6, cyy = camWY + Math.cos(ts / 17000 + i * 2.7) * vh * .6; g.globalAlpha = map.id === 'frostvale' ? .16 : map.id === 'infernal' ? .22 : .1; g.drawImage(glowSprite(map.id === 'frostvale' ? '#ffffff' : map.id === 'infernal' ? '#120609' : '#0a0814'), cxx - rad, cyy - rad * .6, rad * 2, rad * 1.2); }
    g.globalAlpha = 1; g.imageSmoothingEnabled = sm;
    if (map.safe) for (let i = 0; i < 10; i++) { const bx = camWX + Math.sin(ts / 3100 + i * 2.1) * vw * .46 + Math.sin(ts / 700 + i) * 14, by = camWY + Math.cos(ts / 2700 + i * 1.3) * vh * .42 + Math.sin(ts / 430 + i) * 8, w = Math.floor(ts / 120 + i) % 2 ? 3 : 1; g.fillStyle = ['#f4e36b', '#f2a0c0', '#8fd0ff'][i % 3]; g.fillRect(Math.round(bx - w), Math.round(by), w, 3); g.fillRect(Math.round(bx + 1), Math.round(by), w, 3); }
    if (Math.random() < .5) { const ri = x0 + Math.floor(Math.random() * (x1 - x0 + 1)), rj = y0 + Math.floor(Math.random() * (y1 - y0 + 1)), tt = map.tiles[rj * map.w + ri]; if (tt === T.LAVA) parts.push({ x: ri + Math.random(), y: rj + .9, vx: 0, vy: -1.6, life: 0, max: .5, c: '#ffd76a', s: 3, g: 3 }); else if (tt === T.WATER) parts.push({ x: ri + Math.random(), y: rj + Math.random() + .3, vx: 0, vy: 0, life: 0, max: .3, c: '#ffffff', s: 2 }); else if (tt === T.ICE) parts.push({ x: ri + Math.random(), y: rj + Math.random() + .3, vx: 0, vy: 0, life: 0, max: .4, c: '#ffffff', s: 2 }); }
  }
  // luz do dia/noite e fontes de luz
  const night = nightFactor(), vx0 = x0 * 32, vy0 = y0 * 32;
  if (night > .02) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = lerpCol(map.safe ? [255, 246, 232] : map.id === 'infernal' ? [255, 214, 190] : [226, 236, 255], [122, 130, 188], night); g.fillRect(0, 0, W, H); } g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.setTransform(Z, 0, 0, Z, ox * Z, oy * Z);
  const light = (x: number, y: number, r: number, c: string, al: number) => { g.globalAlpha = Math.min(1, al); g.drawImage(glowSprite(c), x - r, y - r, r * 2, r * 2); };
  for (const p of map.portals) light(p.x * 32, p.y * 32 - 26, 96 + Math.sin(ts / 300) * 8, '#8a55ff', .55 + night * .35);
  if (map.id === 'infernal') for (let j = y0 - y0 % 4; j <= y1; j += 4) for (let i = x0 - x0 % 4; i <= x1; i += 4) if (map.tiles[j * map.w + i] === T.LAVA) light(i * 32 + 16, j * 32 + 16, 118 + Math.sin(ts / 300 + i + j) * 6, '#ff5a1c', .34);
  for (const o of vis) {
    if (o.k === 'spire' && (o.x + o.y) % 4 === 0) light(o.x * 32 + 16, o.y * 32 - 6, 44, '#ff6a2b', .3);
    if (o.k === 'lamp') light(o.x * 32 + 16, o.y * 32 - 22, 80 + Math.sin(ts / 170 + o.x) * 3, '#ffb45a', .18 + night * .7);
    else if (o.k === 'house' && night > .1) for (const wx of [18, o.w * 32 - 28]) light(o.x * 32 - 4 + wx + 8, (o.y + o.h) * 32 - 39, 34, '#ffc66a', night * .8);
    else if (o.k === 'rock' && (o.x + o.y) % 5 === 0) light(o.x * 32 + 16, o.y * 32 + 2, 52, '#4fc6ff', .3 + night * .4); }
  for (const b of bolts) { const u = b.t / .16; light((b.x + (b.tx - b.x) * u) * 32, (b.y + (b.ty - b.y) * u) * 32 - 18, 34, b.c, .9); }
  for (const r of rings) if (!r.tele) light(r.x * 32, r.y * 32, r.r * 40, r.c, .5 * (1 - r.t / r.max));
  for (const e of ents.values()) { if (e.k === 'd' && e.info.rarity) light(e.x * 32, e.y * 32, 34, RARITY[e.info.rarity].color, .5); if (e.k === 's') light(e.x * 32, e.y * 32 - 14, 46, e.info.mob === 'wisp' ? '#6dff9c' : '#a04dff', .6); if (e.k === 'm' && MOBS[e.info.mob].boss) light(e.x * 32, e.y * 32 - 50, 130, MOBS[e.info.mob].nova ?? '#59c8ff', .35 + night * .3); if (e.k === 'p') { const fs = fullSetOf(SET_PIECES.map(p => e.info[p])); if (fs) { const col = SETS[fs].key === 'dragon' ? '#7dffb0' : SETS[fs].trim; light(e.x * 32, e.y * 32 + 2, 46 + Math.sin(ts / 260) * 4, col, .3); if (Math.random() < .25) parts.push({ x: e.x + (Math.random() - .5) * .9, y: e.y + .1, vx: 0, vy: -1.4, life: 0, max: .8, c: col, s: 2 }); } } if (e.id === you && night > .05) light(e.x * 32, e.y * 32 - 18, 130, '#ffdca0', night * .4); }
  if (map.safe && night > .15) for (let i = 0; i < 12; i++) light(-ox + vw / 2 + Math.sin(ts / 3900 + i * 3.1) * vw * .47, -oy + vh / 2 + Math.cos(ts / 3300 + i * 1.7) * vh * .44, 13, '#c6ff7a', night * (.5 + Math.sin(ts / 310 + i * 2) * .4));
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false;
  // nomes, barras e números
  g.textAlign = 'center';
  for (const n of map.npcs) { label(n.x * 32, n.y * 32 - 50, n.name, '#ffe08a'); if (n.shop) label(n.x * 32, n.y * 32 - 62 + Math.sin(ts / 260) * 2, '$', '#ffd76a'); }
  for (const p of map.portals) label(p.x * 32, p.y * 32 - 92, `» ${p.label}${p.lvl ? ` (Nv ${p.lvl})` : ''}`, me && p.lvl && me.level < p.lvl ? '#ff9b8e' : '#d6bcff');
  for (const e of ents.values()) {
    if (e.k === 's') continue;
    if (e.k === 'd') { label(e.x * 32, e.y * 32 - 22, e.info.key ? ITEMS[e.info.key].name : `${e.info.gold} moedas`, e.info.key ? (ITEMS[e.info.key].set ? '#ffd76a' : RARITY[e.info.rarity].color) : '#f0d27a'); continue; }
    const h = e.k === 'p' ? 50 : mobSize(e.info.mob) + 10, X = Math.round(e.x * 32), Y = Math.round(e.y * 32) - h, boss = e.k === 'm' && MOBS[e.info.mob].boss, bw = boss ? 72 : 32;
    if (e.k === 'p' || e.id === target || boss) label(X, Y - 6, e.k === 'p' ? e.info.name : `${MOBS[e.info.mob].name} Nv${MOBS[e.info.mob].level}`, e.id === target ? '#ffd24a' : e.k === 'p' ? '#fff' : '#ffb4a8');
    g.fillStyle = '#0a0814'; g.fillRect(X - bw / 2 - 1, Y - 3, bw + 2, 6); g.fillStyle = '#3a2f4a'; g.fillRect(X - bw / 2, Y - 2, bw, 4); { const w = Math.round(bw * e.hp / 100); g.fillStyle = e.k !== 'p' ? '#e0425a' : e.hp > 50 ? '#58d36a' : e.hp > 25 ? '#f0cf65' : '#ff6b6b'; g.fillRect(X - bw / 2, Y - 2, w, 4); g.fillStyle = '#ffffff66'; g.fillRect(X - bw / 2, Y - 2, w, 1); }
  }
  texts = texts.filter(t => (t.t += dt) < .85); for (const t of texts) { const u = t.t / .85; g.font = `bold ${Math.round((t.big ? 17 : 12) * (1 + Math.max(0, .12 - t.t) * 4))}px ui-monospace,monospace`; g.globalAlpha = 1 - u * u; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#0a0814'; const y = t.y * 32 - 38 - u * 26; g.strokeText(t.s, t.x * 32, y); g.fillStyle = t.c; g.fillText(t.s, t.x * 32, y); } g.globalAlpha = 1;
  // clima e iluminação
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (map.id === 'infernal') { for (const f of snow) { f.y -= f.s * dt * 4; f.x += Math.sin(ts / 700 + f.d) * .0008; if (f.y < 0) f.y = 1; g.globalAlpha = .45 + f.s * 7; g.fillStyle = f.s > .055 ? '#ffd76a' : '#ff7a2b'; g.fillRect(Math.round(((f.x % 1) + 1) % 1 * W), Math.round(f.y * H), 2 * Z, 2 * Z); } g.globalAlpha = 1; }
  else if (!map.safe) {
    g.fillStyle = '#fff'; for (const f of snow) { f.y += f.s * dt * 5; f.x += Math.sin(ts / 900 + f.d) * .0006; if (f.y > 1) f.y = 0; g.globalAlpha = .35 + f.s * 8; const sz = (f.s > .055 ? 3 : 2) * Z; g.fillRect(Math.round(((f.x % 1) + 1) % 1 * W), Math.round(f.y * H), sz, sz); } g.globalAlpha = 1;
  }
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .42, W / 2, H / 2, Math.max(W, H) * .72); vg.addColorStop(0, '#0a081400'); vg.addColorStop(1, map.safe ? '#1a103040' : map.id === 'infernal' ? '#40080888' : '#0a1a4060'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (me?.dead) { g.fillStyle = '#50000066'; g.fillRect(0, 0, W, H); }
  for (const n of [1, 2, 3, 4]) { const c = cds[n], el = cdEl[n] ??= document.querySelector(`[data-sk="${n}"] .cd`) as HTMLElement, h = c && c.until > ts ? `${Math.ceil((c.until - ts) / c.ms * 20) * 5}%` : '0'; if (cdVal[n] !== h) { cdVal[n] = h; el.style.height = h; } }
  if (ts > miniAt) { miniAt = ts + 200; renderMini(); { const te = ents.get(target), tf = $('#tframe'); if (te?.k === 'm') { const d = MOBS[te.info.mob]; tf.style.display = 'block'; $('#tfn').textContent = `${d.name} · Nv ${d.level}`; $('#tfb').style.width = `${te.hp}%`; } else if (tf.style.display !== 'none') tf.style.display = 'none'; } if (party) document.querySelectorAll<HTMLElement>('.pm').forEach(r => { const e = [...ents.values()].find(x => x.k === 'p' && x.info.name === r.dataset.n), b = r.querySelector('i') as HTMLElement; b.style.width = `${e ? e.hp : 0}%`; r.style.opacity = e ? '1' : '.55'; }); }
}
function ell2(x: number, y: number, rx: number, ry: number) { g.beginPath(); g.ellipse(Math.round(x), Math.round(y), Math.max(.1, rx), Math.max(.1, ry), 0, 0, 6.3); g.fill(); }
const labels = new Map<string, Cv>();
function label(x: number, y: number, s: string, c: string) {
  const k = `${Z}|${c}|${s}`; let l = labels.get(k);
  if (!l) { const m = g.font; g.font = 'bold 10px ui-monospace,monospace'; const w = Math.ceil(g.measureText(s).width) + 8; g.font = m; l = cv(w * Z, 16 * Z); const b = l.getContext('2d')!; b.scale(Z, Z); b.font = 'bold 10px ui-monospace,monospace'; b.textAlign = 'center'; b.lineJoin = 'round'; b.lineWidth = 3; b.strokeStyle = '#0a0814cc'; b.strokeText(s, w / 2, 12); b.fillStyle = c; b.fillText(s, w / 2, 12); if (labels.size > 400) labels.clear(); labels.set(k, l); }
  g.drawImage(l, Math.round(x - l.width / Z / 2), Math.round(y - 12), l.width / Z, l.height / Z);
}
const CH = 12, chunks = new Map<string, { c: Cv; anim: number[] }>(); let chunkMap = '', objRows: GameMap['objs'][] = [];
function buildRows(m: GameMap) { chunks.clear(); chunkMap = m.id; objRows = Array.from({ length: m.h }, () => []); for (const o of m.objs) objRows[o.y].push(o); }
/** Detalhes espalhados no chão, sempre iguais para o mesmo lugar do mapa. */
function decal(x: CanvasRenderingContext2D, t: number, i: number, j: number) {
  const h = (Math.imul(i, 73856093) ^ Math.imul(j, 19349663)) >>> 0, n = h % 100, X = i * 32 + 4 + (h >> 7) % 20, Y = j * 32 + 4 + (h >> 12) % 20, p = (cx: number, cy: number, w: number, hh: number, c: string) => { x.fillStyle = c; x.fillRect(cx, cy, w, hh); };
  if (t === T.GRASS) {
    if (n < 6) { const c = ['#f4e36b', '#f2a0c0', '#ffffff', '#b58cff'][h % 4]; for (const [a, b] of [[0, 0], [6, 3], [2, 7], [9, 8]]) { p(X + a + 1, Y + b + 2, 1, 3, '#2f6b34'); p(X + a, Y + b, 3, 3, c); p(X + a + 1, Y + b + 1, 1, 1, '#f4c23e'); } }
    else if (n < 9) { p(X + 1, Y + 4, 2, 4, '#e8e0cc'); p(X - 1, Y + 1, 6, 3, '#c8402f'); p(X, Y + 1, 1, 1, '#fff'); p(X + 3, Y + 2, 1, 1, '#fff'); }
    else if (n < 14) { p(X, Y + 2, 5, 3, '#7c8078'); p(X + 1, Y + 1, 3, 2, '#a4a89e'); p(X + 8, Y + 4, 3, 2, '#8a8e84'); }
    else if (n < 24) for (let a = 0; a < 5; a++) p(X + a * 2, Y + 5 - (a % 3) * 2, 1, 3 + (a % 3) * 2, a % 2 ? '#74bb5f' : '#3e7a36');
  } else if (t === T.STONE) {
    if (n < 6) { let a = X, b = Y; for (let k = 0; k < 9; k++) { p(a, b, 1, 1, '#5f584e'); a += (k % 3) - 1; b += 1; } }
    else if (n < 11) { p(X, Y, 8, 2, '#5f8450'); p(X + 2, Y + 2, 5, 1, '#4b7040'); }
    else if (n < 13) { p(X, Y, 3, 2, '#c4823a'); p(X + 1, Y + 1, 1, 2, '#8a5a2f'); }
  } else if (t === T.DIRT) {
    if (n < 18) { p(X, Y, 4, 2, '#7a7468'); p(X + 1, Y, 2, 1, '#a39b8c'); }
    else if (n < 30) { p(i * 32 + 6, j * 32, 2, 32, '#7a5c3a'); p(i * 32 + 22, j * 32, 2, 32, '#7a5c3a'); }
  } else if (t === T.SNOW) {
    if (n < 4) { p(X, Y + 2, 6, 3, '#8c9aab'); p(X + 1, Y + 1, 4, 2, '#eef5fb'); }
    else if (n < 7) { p(X, Y + 4, 9, 1, '#6b5a4a'); p(X + 3, Y + 2, 1, 3, '#6b5a4a'); p(X + 6, Y + 1, 1, 4, '#6b5a4a'); }
    else if (n < 12) { p(X, Y + 4, 12, 2, '#f8fcff'); p(X + 2, Y + 3, 8, 1, '#ffffff'); p(X, Y + 6, 12, 1, '#c5d5e7'); }
  } else if (t === T.ICE) { if (n < 20) { p(X, Y, 1, 5, '#fff'); p(X - 2, Y + 2, 5, 1, '#fff'); } }
  else if (t === T.ASH) {
    if (n < 3) { p(X, Y, 7, 6, '#cfc7b4'); p(X + 1, Y + 6, 5, 2, '#a8a08e'); p(X + 1, Y + 2, 2, 2, '#1a1416'); p(X + 4, Y + 2, 2, 2, '#1a1416'); }
    else if (n < 7) { p(X, Y + 3, 11, 2, '#b8b09e'); p(X - 1, Y + 2, 2, 4, '#cfc7b4'); p(X + 10, Y + 2, 2, 4, '#cfc7b4'); }
    else if (n < 13) { let a = X; for (let k = 0; k < 8; k++) { p(a, Y + k, 2, 1, k % 3 ? '#ff7a2b' : '#ffd76a'); a += (h >> k) % 3 - 1; } }
  }
}
function objShadow(x: CanvasRenderingContext2D, o: GameMap['objs'][number]) {
  const sh = glowSprite('#0a0814'), put = (cx: number, cy: number, rx: number, ry: number) => x.drawImage(sh, cx - rx, cy - ry, rx * 2, ry * 2), X = o.x * 32 + 16, Y = o.y * 32;
  if (o.k === 'tree' || o.k === 'pine') put(X, Y + 28, 28, 11); else if (o.k === 'rock' || o.k === 'lamp' || o.k === 'barrel' || o.k === 'spire' || o.k === 'deadtree') put(X, Y + 28, 20, 8); else if (o.k === 'house' || o.k === 'stall') put(o.x * 32 + o.w * 16, (o.y + o.h) * 32, o.w * 18, 12);
}
/** Bloco 12×12 do chão já desenhado: tiles, bordas e sombras saem prontos de uma vez. */
function chunk(m: GameMap, cx: number, cy: number) {
  const k = `${cx},${cy}`; let ch = chunks.get(k); if (ch) { chunks.delete(k); chunks.set(k, ch); return ch; }
  const c = cv(CH * 32, CH * 32), x = c.getContext('2d')!, anim: number[] = [], x0 = cx * CH, y0 = cy * CH; x.imageSmoothingEnabled = false; x.translate(-x0 * 32, -y0 * 32);
  for (let j = y0; j < Math.min(m.h, y0 + CH); j++) for (let i = x0; i < Math.min(m.w, x0 + CH); i++) {
    const t = m.tiles[j * m.w + i], v = (i * 7 + j * 13) % 4;
    if (t === T.WATER || t === T.LAVA) anim.push(i, j); else x.drawImage(tile(t, v, 0), i * 32, j * 32);
    const P = tilePrio(t), nb = (a: number, b: number, side: number) => { if (a < 0 || b < 0 || a >= m.w || b >= m.h) return; const nt = m.tiles[b * m.w + a]; if (tilePrio(nt) > P) x.drawImage(edge(nt, side, t === T.WATER), i * 32, j * 32); };
    nb(i, j - 1, 0); nb(i, j + 1, 1); nb(i - 1, j, 2); nb(i + 1, j, 3);
    if (t !== T.STONE && t !== T.WATER && t !== T.LAVA) { const q = (Math.sin(i * .37 + j * .11) + Math.sin(j * .29 - i * .17) + 2) / 4; x.fillStyle = t === T.GRASS ? '#123a1a' : t === T.ASH ? '#120609' : '#6a8fc8'; x.globalAlpha = q * .2; x.fillRect(i * 32, j * 32, 32, 32); x.globalAlpha = 1; }
    if (!m.solid[j * m.w + i]) decal(x, t, i, j);
  }
  x.imageSmoothingEnabled = true; x.globalAlpha = .55;
  for (let r = Math.max(0, y0 - 4); r < Math.min(m.h, y0 + CH + 2); r++) for (const o of objRows[r]) if (o.x + o.w >= x0 - 2 && o.x <= x0 + CH + 2) objShadow(x, o);
  ch = { c, anim }; chunks.set(k, ch); if (chunks.size > 36) chunks.delete(chunks.keys().next().value!); return ch;
}
function shadow(x: number, y: number, rx: number, ry: number) { const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = true; g.globalAlpha = .55; g.drawImage(glowSprite('#0a0814'), x - rx, y - ry, rx * 2, ry * 2); g.globalAlpha = 1; g.imageSmoothingEnabled = sm; }
const lerpCol = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
function nightFactor() { const p = Date.now() / 1200000 % 1; return Math.max(0, Math.min(1, Math.sin(p * 6.283) * 1.7 - .25)); } // ciclo de 20 minutos, igual para todos
function drawObj(o: GameMap['objs'][number], ts: number) {
  let s = objSprite(o), X = o.x * 32 + s.ox, Y = o.y * 32 + s.oy;
  if (o.k === 'rock' && (o.x + o.y) % 5 === 0) { g.drawImage(crystalSprite(o.v % 2), o.x * 32 - 2, o.y * 32 - 14); return; }
  if (o.k === 'house' && Math.random() < .05) parts.push({ x: o.x + o.w * .75, y: o.y - .9, vx: .2, vy: -.7, life: 0, max: 1.8, c: '#c9c9d6', s: 4 });
  if (o.k === 'fountain' && Math.random() < .5) parts.push({ x: o.x + 1.5 + (Math.random() - .5) * .2, y: o.y + 1, vx: (Math.random() - .5) * 2, vy: -3.5, life: 0, max: .6, c: '#a8dcff', s: 2, g: 12 });
  if (s.sway) { const q = Math.sin(ts / 700 + o.x * 1.7 + o.y) * 2, a = 18, b = 38; g.drawImage(s.c, 0, 0, s.c.width, a, X + Math.round(q), Y, s.c.width, a); g.drawImage(s.c, 0, a, s.c.width, b - a, X + Math.round(q * .5), Y + a, s.c.width, b - a); g.drawImage(s.c, 0, b, s.c.width, s.c.height - b, X, Y + b, s.c.width, s.c.height - b); }
  else g.drawImage(s.c, X, Y);
}
const npcLooks: Look[] = [{ hc: '#000', hs: 0 }, { hc: '#d8dde6', hs: 2, robe: '#6a3f96' }, { hc: '#b23a2e', hs: 0, armor: '#7a5230', weapon: 'iron_axe', boots: '#3c2a1c' }, { hc: '#2b2230', hs: 0, helm: '#8b95a6', armor: '#8b95a6', pants: '#5c6577', weapon: 'short_sword' }, lookFromGear('Dark Warrior', '#d9b24a', 2, { helm: null, armor: 'lion_armor', pants: 'lion_pants', boots: 'lion_boots', weapon: 'frost_blade' })];
function drawNpc(n: Npc) { shadow(n.x * 32, n.y * 32 + 2, 15, 6); g.drawImage(heroSprites(npcLooks[n.look])[0][0], Math.round(n.x * 32 - FRAME_W / 2), Math.round(n.y * 32 - FRAME_H + 6)); }
function drawEnt(e: Ent, ts: number) {
  const X = Math.round(e.x * 32), Y = Math.round(e.y * 32);
  if (e.k === 'p') {
    e.look ??= heroSprites(e.id === you && items.length ? myGear() : lookFromGear(e.info.cls, HAIR_COLORS[e.info.hc], e.info.hs, e.info));
    const Yb = Y + (!e.moving && ts > e.atkUntil ? Math.round(Math.sin(ts / 420 + e.id) * .7) : 0);
    const f = e.hp <= 0 ? 5 : ts < e.atkUntil ? 4 : e.moving ? [0, 1, 0, 3][Math.floor(e.anim) % 4] : 0;
    if (e.id === target) { g.strokeStyle = '#ffd24a'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y + 3, 14, 6, 0, 0, 6.3); g.stroke(); }
    shadow(X, Y + 3, 15, 6); g.drawImage(e.look[e.dir][f], X - FRAME_W / 2, Yb - FRAME_H + 6); { const tier = glowTier(e.info.plus ?? 0); if (tier) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .11 + Math.sin(ts / 260) * .07; g.drawImage(tintFrame(e.look[e.dir][f], tier), X - FRAME_W / 2, Yb - FRAME_H + 6); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; if ((e.info.plus ?? 0) >= 13 && Math.random() < .3) parts.push({ x: e.x + (Math.random() - .5) * .8, y: e.y - Math.random(), vx: 0, vy: -1, life: 0, max: .6, c: tier, s: 2 }); } }
    if (ts < (e.flash ?? 0)) { g.globalCompositeOperation = 'lighter'; g.drawImage(e.look[e.dir][f], X - FRAME_W / 2, Yb - FRAME_H + 6); g.globalCompositeOperation = 'source-over'; } return;
  }
  const sp = mobSprites(e.info.mob), sz = mobSize(e.info.mob), fr = Math.floor(ts / 280 + e.id) % 2, c = sp[fr][e.dir === 3 ? 1 : 0], lunge = ts < e.atkUntil ? 4 : 0;
  if (e.id === target) { g.strokeStyle = '#ff5a5a'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y + 2, sz * .55, sz * .24, 0, 0, 6.3); g.stroke(); }
  shadow(X, Y + 2, sz * .55, sz * .22); g.drawImage(c, X - c.width / 2 + (e.dir === 3 ? -lunge : lunge), Y - c.height + 6); if (ts < (e.flash ?? 0)) { g.globalCompositeOperation = 'lighter'; g.drawImage(c, X - c.width / 2 + (e.dir === 3 ? -lunge : lunge), Y - c.height + 6); g.globalCompositeOperation = 'source-over'; }
}
showChars();
