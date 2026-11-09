import { MASTER_NODES, MASTER_NODE_MAX, JEWEL_PACKS, WING_RECIPES, EXC_TEXT, glowTier, JEWELS, canWield, CLASSES, classOf, CONFIG, fullSetOf, setCounts, SETS, SET_PIECES, HAIR_COLORS, HAIR_STYLES, ItemInst, ITEMS, itemStat, MOBS, RARITY, sellPrice, SHOPS, SLOTS, SLOT_NAMES } from '../shared/data';
import { trapUp, findPath, getMap, GameMap, Npc, step, T } from '../shared/world';
import { pressSprite, chestSprite, WING_ROOT, wingSprites, gfx, hdCtx, hdOf, noHd, tintFrame, archSprite, crystalSprite, cv, Cv, edge, FRAME_H, FRAME_W, glowSprite, heroSprites, icon, skillIcon, tilePrio, Look, lookFromGear, mobSize, mobSprites, objSprite, tile } from './art';

const $ = <E extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as E;
const root = $('#root');
const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
async function api(path: string, body?: unknown) {
  const r = await fetch('/api/' + path, body === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error ?? 'Falha de rede.'), { status: r.status }); return j;
}
const portrait = (c: { hair_color: number; hair_style: number; class: string }) => { const s = cv(FRAME_W * 2, FRAME_H * 2); s.getContext('2d')!.drawImage(hdOf(heroSprites(lookFromGear(c.class, HAIR_COLORS[c.hair_color], c.hair_style, { weapon: classOf(c.class).weapon }))[0][0]), 0, 0); s.style.width = '40px'; s.style.height = '56px'; return s; };

// ---------- telas de conta ----------
function showAuth(register = false, msg = '') {
  root.innerHTML = `<div class="screen"><form class="card"><h1>ETERNAL MU</h1><div class="sub">${register ? 'Crie sua conta' : 'Um reino, centenas de heróis'}</div>
  <label>Usuário</label><input type="text" name="username" autocomplete="username" required>
  ${register ? '<label>E-mail</label><input type="email" name="email" autocomplete="email" required>' : ''}
  <label>Senha</label><input type="password" name="password" autocomplete="${register ? 'new-password' : 'current-password'}" required>
  ${register ? '<label>Confirmar senha</label><input type="password" name="confirm" autocomplete="new-password" required><label class="check"><input type="checkbox" name="terms"> Li e aceito os termos de uso</label>' : ''}
  <div class="err">${esc(msg)}</div><button class="main" style="width:100%">${register ? 'Cadastrar' : 'Entrar'}</button>
  <div style="text-align:center;margin-top:10px"><button type="button" class="link">${register ? 'Já tenho conta' : 'Criar conta'}</button> <a href="/guia" style="color:var(--gold);margin-left:12px">Guia do jogador</a></div></form></div>`;
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
  <div class="row">${me.characters.length < 5 ? '<button class="main" id="new">Novo personagem</button>' : ''}<button id="site">Site</button><button id="guia">Guia</button><button id="out">Sair</button><button id="outall">Sair de todos os dispositivos</button>${me.admin ? '<button id="adm">Painel Admin</button>' : ''}</div></div></div>`;
  const list = $('.chars');
  if (!me.characters.length) list.innerHTML = '<div style="color:var(--dim);text-align:center;padding:16px">Crie seu primeiro herói.</div>';
  for (const c of me.characters) {
    const row = document.createElement('div'); row.className = 'char';
    row.innerHTML = `<button class="open"><span class="pv"></span><span><b>${esc(c.name)}</b><small>${esc(c.class)} · Nível ${c.level} · ${esc(getMap(c.map).name)}</small></span></button><button class="edit">Editar</button><button class="del">Excluir</button>`;
    row.querySelector('.pv')!.appendChild(portrait(c));
    (row.querySelector('.open') as HTMLElement).onclick = () => startGame(c.id);
    (row.querySelector('.edit') as HTMLElement).onclick = () => showCreate(c);
    (row.querySelector('.del') as HTMLElement).onclick = async () => { if (confirm(`Excluir ${c.name} para sempre?`)) { await api(`characters/${c.id}/delete`, {}); showChars(); } };
    list.appendChild(row);
  }
  const adm = root.querySelector('#adm') as HTMLElement | null; if (adm) adm.onclick = () => { location.href = '/admin'; };
  const nw = root.querySelector('#new') as HTMLElement | null; if (nw) nw.onclick = () => showCreate();
  $('#guia').onclick = () => { location.href = '/guia'; };
  $('#site').onclick = () => { location.href = '/'; };
  $('#out').onclick = async () => { await api('logout', {}); showAuth(); };
  $('#outall').onclick = async () => { await api('logout-all', {}); showAuth(); };
}
function showCreate(ed?: any) {
  let hc = ed?.hair_color ?? 0, hs = ed?.hair_style ?? 0, ck = ed ? classOf(ed.class).key : 'dark_warrior';
  root.innerHTML = `<div class="screen"><form class="card"><h1 style="font-size:24px">${ed ? esc(ed.name) : 'NOVO HERÓI'}</h1><div class="sub" id="cdesc"></div>${ed ? '' : '<div class="row" id="sk"></div><label>Nome</label><input type="text" name="name" maxlength="14" required autocomplete="off">'}
  <label>Cor do cabelo</label><div class="swatches" id="sc"></div><label>Estilo</label><div class="row" id="ss"></div><div class="preview"></div>
  <div class="err"></div><div class="row"><button type="button" id="back">Voltar</button><button class="main">${ed ? 'Salvar' : 'Criar'}</button></div></form></div>`;
  const pv = () => { $('#cdesc').textContent = CLASSES[ck].desc; root.querySelectorAll<HTMLElement>('.clsb').forEach(b => b.classList.toggle('on', b.dataset.c === ck)); const c = portrait({ hair_color: hc, hair_style: hs, class: CLASSES[ck].name }); c.style.width = '120px'; c.style.height = '168px'; $('.preview').replaceChildren(c); root.querySelectorAll('.sw').forEach((b, i) => b.classList.toggle('on', i === hc)); root.querySelectorAll('.opt').forEach((b, i) => b.classList.toggle('on', i === hs)); };
  if (!ed) Object.values(CLASSES).forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt0 clsb'; b.dataset.c = c.key; b.textContent = c.name; b.style.fontSize = '11px'; b.onclick = () => { ck = c.key; pv(); }; $('#sk').appendChild(b); });
  HAIR_COLORS.forEach((col, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.style.background = col; b.setAttribute('aria-label', `Cor ${i + 1}`); b.onclick = () => { hc = i; pv(); }; $('#sc').appendChild(b); });
  HAIR_STYLES.forEach((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = n; b.onclick = () => { hs = i; pv(); }; $('#ss').appendChild(b); });
  pv(); $('#back').onclick = () => showChars();
  const f = root.querySelector('form')!;
  f.onsubmit = async e => { e.preventDefault(); try { if (ed) { await api(`characters/${ed.id}/edit`, { hairColor: hc, hairStyle: hs }); return showChars('Personagem atualizado.'); } await api('characters', { name: new FormData(f).get('name'), cls: ck, hairColor: hc, hairStyle: hs }); showChars(); } catch (x: any) { $('.err').textContent = x.message; } };
}

// ---------- jogo ----------
interface Ent { id: number; k: string; info: any; snaps: { t: number; x: number; y: number }[]; x: number; y: number; hp: number; dir: number; moving: boolean; anim: number; atkUntil: number; look?: Cv[][]; flash?: number; stepN?: number }
interface Me { hp: number; mp: number; maxHp: number; maxMp: number; xp: number; xpNext: number; level: number; points: number; str: number; agi: number; vit: number; ene: number; atk: number; def: number; gold: number; dead: boolean; loot: number; lootMs: number; resets: number; ml: number; mxp: number; mxpNext: number; mpts: number; mtree: Record<string, number> }
const canvas = $<HTMLCanvasElement>('#game'), g = canvas.getContext('2d')!; hdCtx(g);
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
function startGame(id: number) { charId = id; root.innerHTML = ''; menuOn = false; $('#hud').style.display = 'block'; running = true; manualClose = false; retries = 0; connect(true); if (!lastFrame) requestAnimationFrame(frame); }
function over(s: string) { const o = $('#over'); o.textContent = s; o.style.display = s ? 'flex' : 'none'; }
function connect(first = false) { if (!gfxInit) { gfxInit = true; applyGfx(); }
  clearTimeout(reconnectTimer); over(retries ? 'Reconectando…' : 'Entrando no mundo…');
  ws?.close(); const sock = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?char=${charId}${first === true ? '&login=1' : ''}`); ws = sock; let portal = false;
  sock.onmessage = e => { const m = JSON.parse(e.data); if (m.t === 'portal') portal = true; else handle(m); };
  sock.onclose = async e => {
    if (ws !== sock || manualClose) return;
    if (e.code === 4000) return leave(e.reason === 'banned' ? 'Sua conta foi suspensa.' : 'Este personagem entrou em outro dispositivo.');
    if (portal) { over('Atravessando o portal…'); connect(); return; }
    setConn(false); retries++;
    if (retries > 12) return leave('Conexão perdida.');
    try { await api('me'); } catch (x: any) { if (x.status === 401) return leave('Sessão expirada.'); }
    if (ws !== sock || manualClose) return;
    over('Reconectando…'); reconnectTimer = setTimeout(() => connect(), Math.min(5000, 400 * retries)) as unknown as number;
  };
}
function leave(msg = '') { manualClose = true; running = false; clearInterval(pingTimer); ws?.close(); ws = null; $('#hud').style.display = 'none'; over(''); closeWins(); canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height); lastFrame = 0; menuOn = true; requestAnimationFrame(menuFrame); ents.clear(); party = null; renderParty(); trade = null; renderTrade(); $('#invite').style.display = 'none'; $('#pmenu').style.display = 'none'; auto = false; $('#auto').style.borderColor = ''; showChars(msg); }
function setConn(ok: boolean) { const c = $('#conn'); c.textContent = ok ? `● ${rtt} ms` : '● off'; c.style.color = !ok ? '#ff6b6b' : rtt < 120 ? '#79e08a' : rtt < 250 ? '#f0cf65' : '#ff9b5e'; }
function handle(m: any) {
  switch (m.t) {
    case 'w': {
      for (const k of Object.keys(m.jc ?? {})) JEWELS[k].chance = m.jc[k]; you = m.you; myName = m.name; myCls = classOf(m.cls); myCls.skills.forEach(s => { const b = $(`[data-sk="${s.n}"] b`), ic = hdOf(skillIcon(s.kind, s.color ?? (s.kind === 'summon' ? '#a58cff' : '#ffd76a'))); b.replaceChildren(ic); b.parentElement!.title = s.lvl ? `${s.name} (nível ${s.lvl})` : s.name; }); myLook = { hc: m.hairColor, hs: m.hairStyle }; ents = new Map(); target = 0; pendingNpc = null; closeWin('shop'); parts = []; texts = []; rings = [];
      if (map?.id !== m.map) { map = getMap(m.map); bakeMini(); log(`— ${map.name} —`, 'sys'); }
      camX = m.x; camY = m.y; retries = 0; over(''); clearInterval(pingTimer); pingTimer = setInterval(() => send({ t: 'ping', c: performance.now() }), 3000) as unknown as number; send({ t: 'ping', c: performance.now() });
      lastInput = ''; syncInput(); break;
    }
    case 'xpg': { const a = ents.get(you); if (a) texts.push({ x: a.x, y: a.y - 1, s: `+${m.v.toLocaleString('pt-BR')} XP`, c: '#9dffb0', t: 0, big: false }); break; }
    case 'ann': { const t = `${m.name} (${m.cls}) entrou no jogo`; log(t, 'sys'); const el = $('#toast'); el.textContent = t; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); beep(640, 140, 'triangle', .04); break; }
    case 'jc': for (const k of Object.keys(m.jc)) JEWELS[k].chance = m.jc[k]; break;
    case 'news': { log(`Aviso: ${m.m}`, 'sys'); const el = $('#toast'); el.textContent = m.m; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); beep(520, 240, 'triangle', .05); break; }
    case 'pong': rtt = Math.round(performance.now() - m.c); setConn(true); break;
    case 'me': { const lv = me?.level; me = m; updateHud(); if (lv !== undefined && lv !== m.level) beep(660, 400, 'triangle', .06); break; }
    case 'inv': chest = m.chest ?? []; items = m.items; updateHud(); renderInv(); drawPortrait(); if (shop) renderShop(); break;
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
  $('#nm').innerHTML = `${esc(myName)} <span>Nv ${me.level}</span>`; $('#hpb').style.width = pct(me.hp, me.maxHp); $('#mpb').style.width = pct(me.mp, me.maxMp); $('#hpt').textContent = `${me.hp}/${me.maxHp}`; $('#mpt').textContent = `${me.mp}/${me.maxMp}`; $('#xp i').style.width = pct(me.xp, me.xpNext); $('#xpt').textContent = me.level >= CONFIG.maxLevel && me.resets > 0 ? `Master Level ${me.ml} · ${(me.mxp / me.mxpNext * 100).toFixed(2).replace('.', ',')}%` : `XP ${(me.xp / Math.max(1, me.xpNext) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% · ${me.xp.toLocaleString('pt-BR')} / ${me.xpNext.toLocaleString('pt-BR')}`;
  document.querySelectorAll<HTMLElement>('[data-pot]').forEach(b => { b.querySelector('s')!.textContent = String(items.find(i => i.key === b.dataset.pot)?.qty ?? 0); });
  $('#invinfo').dataset.gold = String(me.gold); if (!$('#invinfo').dataset.hover) $('#invinfo').textContent = `Moedas: ${me.gold}`;
  if ($('#w-char').style.display === 'block') renderChar();
  if ($('#w-shop').style.display === 'block') renderShop();
}
function drawPortrait() { const c = $<HTMLCanvasElement>('#portrait'), x = c.getContext('2d')!; x.clearRect(0, 0, 80, 96); x.imageSmoothingEnabled = false; x.drawImage(hdOf(heroSprites(myGear())[0][0]), 0, 16, 80, 96, 0, 0, 80, 96); }
function myGear(): Look { const by = (s: string) => items.find(i => i.equip === s)?.key ?? null; return lookFromGear(myCls.name, HAIR_COLORS[myLook.hc], myLook.hs, { helm: by('helm'), armor: by('armor'), pants: by('pants'), boots: by('boots'), weapon: by('weapon') }); }

// ---------- janelas ----------
const openW = (w: string) => { if (window.innerWidth < 720) closeWins(); $('#w-' + w).style.display = 'block'; if (w === 'inv') renderInv(); if (w === 'char') renderChar(); if (w === 'map') renderBig(); if (w === 'rank') renderRank(); };
function closeWin(w: string) { $('#w-' + w).style.display = 'none'; if (w === 'shop') shop = null; }
function closeWins() { ['inv', 'char', 'map', 'shop', 'rank'].forEach(closeWin); }
async function renderRank() { const b = $('#rankb'); b.replaceChildren(); try { const { ranking } = await api('ranking'); ranking.forEach((r: any, n: number) => { const tr = document.createElement('tr'); for (const v of [n + 1, r.name, r.class, r.resets, r.ml, r.level]) { const td = document.createElement('td'); td.textContent = String(v); tr.appendChild(td); } b.appendChild(tr); }); } catch { /* sem conexão */ } }
const toggle = (w: string) => $('#w-' + w).style.display === 'block' ? closeWin(w) : openW(w);
document.querySelectorAll<HTMLElement>('[data-w]').forEach(b => b.onclick = () => toggle(b.dataset.w!));
document.querySelectorAll<HTMLElement>('[data-close]').forEach(b => b.onclick = () => closeWin(b.closest('.win')!.id.slice(2)));
/** Compara um item com o que está equipado no mesmo lugar. Sem retorno: a classe não usa o item. */
function cmpItem(i: Pick<ItemInst, 'key' | 'rarity'> & { plus?: number; opts?: string[] }) {
  const d = ITEMS[i.key]; if (!(SLOTS as string[]).includes(d.kind) || !canWield(myCls, d)) return null;
  const inst = { id: '', qty: 1, slot: 0, equip: null, plus: 0, ...i } as ItemInst, cur = items.find(x => x.equip === d.kind);
  const score = (x: ItemInst) => itemStat(x, 'dmg') * 3 + itemStat(x, 'def') * 2 + itemStat(x, 'hp') * .5 + (x.opts?.length ?? 0) * 12 + (ITEMS[x.key].wtier ?? 0) * 300;
  const s = cur ? score(inst) - score(cur) : 1, parts: string[] = [];
  for (const [f, n] of [['dmg', 'Dano'], ['def', 'Defesa'], ['hp', 'Vida']] as const) { const v = itemStat(inst, f) - (cur ? itemStat(cur, f) : 0); if (v) parts.push(`${n} ${v > 0 ? '+' : ''}${v}`); }
  return { arrow: s > 0 ? '▲' : s < 0 ? '▼' : '=', color: s > 0 ? '#6fe38a' : s < 0 ? '#ff7a7a' : '#c9c3d6', text: cur ? (parts.length ? `Comparado ao equipado: ${parts.join(', ')}` : 'Igual ao equipado') : 'Espaço vazio: melhora seu personagem', needLevel: me ? me.level < d.lvl : false };
}
function itemText(i: ItemInst) { const d = ITEMS[i.key], parts = [`${d.name}${i.plus ? ` +${i.plus}` : ''}${i.rarity ? ` (${RARITY[i.rarity].name})` : ''}`]; if (d.kind === 'pack') parts.push('Desmonte na Prensa de Joias para usar'); if (JEWELS[i.key]) parts.push(`Melhora itens de +${JEWELS[i.key].min} a +${JEWELS[i.key].max - 1} · ${JEWELS[i.key].chance * 100}%`); const a = itemStat(i, 'dmg'), b = itemStat(i, 'def'), c = itemStat(i, 'hp'); if (a) parts.push(`Dano +${a}`); if (b) parts.push(`Defesa +${b}`); if (c) parts.push(`Vida +${c}`); if (d.heal) parts.push(`Cura ${d.heal}`); if (d.mana) parts.push(`Mana ${d.mana}`); if (d.lvl > 1) parts.push(`Nível ${d.lvl}`); if (!canWield(myCls, d)) parts.push(d.set || d.cls ? `Exclusivo: ${CLASSES[d.cls ?? SETS[d.set!].cls!].name}` : 'Outra classe'); if (d.set) parts.push(`Set ${SETS[d.set].name}`); if (!i.equip) { const cm = cmpItem(i); if (cm) parts.push(cm.text + (cm.needLevel ? ` (requer nível ${d.lvl})` : '')); } if (d.kind === 'wings') { const tw = d.wtier!; parts.push(`+${[12, 22, 35][tw]}% ataque, -${[10, 20, 30][tw]}% dano recebido`); } for (const o of i.opts ?? []) parts.push(EXC_TEXT[o]); return parts.join(' · '); }
function makeCell(i: ItemInst | undefined, click: () => void, label = '') {
  const c = document.createElement('button'); c.className = 'cell'; c.type = 'button';
  if (i) { c.style.borderColor = i.rarity ? RARITY[i.rarity].color : ''; const ic = cv(56, 56); ic.getContext('2d')!.drawImage(hdOf(icon(i.key)), 0, 0); c.appendChild(ic); if (i.qty > 1) { const s = document.createElement('s'); s.textContent = String(i.qty); c.appendChild(s); } if (i.plus) { const u = document.createElement('u'); u.textContent = `+${i.plus}`; u.style.color = glowTier(i.plus) ?? '#fff'; c.appendChild(u); } if (!i.equip) { const cm = cmpItem(i); if (cm) { const a = document.createElement('em'); a.textContent = cm.arrow; a.style.color = cm.needLevel && cm.arrow === '▲' ? '#f0cf65' : cm.color; c.appendChild(a); } } c.title = itemText(i); c.onclick = click; const info = $('#invinfo'); c.onpointerenter = () => { info.dataset.hover = '1'; info.textContent = itemText(i); }; c.onpointerleave = () => { delete info.dataset.hover; info.textContent = `Moedas: ${me?.gold ?? 0}`; }; }
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
  P.innerHTML = `<div class="stat"><b>${esc(myName)}</b><span>${myCls.name} · Nível ${m.level}</span></div><div class="stat"><span>Experiência</span><span>${m.xp} / ${m.xpNext}</span></div><div class="stat" style="color:var(--gold)"><span>Pontos livres</span><span>${m.points}</span></div>${st('str', 'Força')}${st('agi', 'Agilidade')}${st('vit', 'Vitalidade')}${st('ene', 'Energia')}<div class="stat"><span>Ataque</span><span>${m.atk}</span></div><div class="stat"><span>Defesa</span><span>${m.def}</span></div><div class="stat" style="color:var(--gold)"><span>Resets</span><span>${m.resets}</span></div><div class="stat" style="color:var(--gold)"><span>Master Level (pontos: ${m.mpts})</span><span>${m.ml}</span></div>${Object.entries(MASTER_NODES).map(([k, n]) => `<div class="stat"><span>${n}</span><span>${m.mtree[k] ?? 0}/${MASTER_NODE_MAX}${m.mpts && (m.mtree[k] ?? 0) < MASTER_NODE_MAX ? `<button data-mt="${k}">+1</button>` : ''}</span></div>`).join('')}${Object.entries(setCounts(items)).map(([k, n]) => `<div class="stat" style="color:${SETS[k].trim}"><span>${esc(SETS[k].name)} (${n}/4)</span><span>${setBonus(k, n)}</span></div>`).join('')}`;
  P.querySelectorAll<HTMLElement>('[data-s]').forEach(b => b.onclick = () => send({ t: 'st', s: b.dataset.s, n: 1 }));
  P.querySelectorAll<HTMLElement>('[data-mt]').forEach(b => b.onclick = () => send({ t: 'mt', k: b.dataset.mt }));
}
const setBonus = (k: string, n: number) => { const b = SETS[k].bonus, o: string[] = []; if (n >= 2) o.push(`+${b.def} def`); if (n >= 3) o.push(`+${b.hp} vida`); if (n >= 4) o.push(`+${Math.round(b.atk * 100)}% atq`); return o.join(' · ') || 'sem bônus'; };
function renderShop() {
  if (!shop || !me) return; const sk = `${you}|${shop.id}|${me.level}|${me.gold}|${JSON.stringify(items)}|${JSON.stringify(chest)}`; if (sk === shopKey) return; shopKey = sk; $('#shopt').textContent = shop.name; const L = $('#shopl'), npc = shop; L.replaceChildren();
  if (npc.shop === 'reset') {
    const info = document.createElement('div'); info.className = 'info'; info.textContent = 'O Reset volta o personagem ao nível 1 e zera os atributos, mas concede pontos extras permanentes a cada Reset. Itens, moedas e Master Level continuam. Com ao menos 1 Reset, ao chegar no nível máximo a XP passa a subir o Master Level.'; const st = document.createElement('div'); st.className = 'stat'; st.innerHTML = `<span>Seus resets: ${me.resets}</span><span>Nível atual: ${me.level}</span>`; const b = document.createElement('button'); b.className = 'main'; b.style.width = '100%'; b.textContent = 'Fazer Reset'; b.onclick = () => { if (confirm('Fazer Reset agora? Seu personagem volta ao nível 1.')) send({ t: 'rs' }); }; L.append(info, st, b); return;
  }
  if (npc.shop === 'press') {
    const count = (k: string) => items.filter(i => i.key === k && !i.equip).reduce((a, i) => a + i.qty, 0);
    for (const k of Object.keys(JEWEL_PACKS)) { const pk = JEWEL_PACKS[k], n = count(k), r = document.createElement('div'); r.className = 'shopitem'; const c = cv(56, 56); c.getContext('2d')!.drawImage(hdOf(icon(k)), 0, 0); const s = document.createElement('span'); s.textContent = `${ITEMS[k].name}: ${n}/10`; const b = document.createElement('button'); b.textContent = 'Juntar 10'; b.disabled = n < 10; b.onclick = () => send({ t: 'pj', key: k }); r.append(c, s, b); L.appendChild(r);
      for (const it of items.filter(i => i.key === pk && !i.equip)) { const r2 = document.createElement('div'); r2.className = 'shopitem'; const c2 = cv(56, 56); c2.getContext('2d')!.drawImage(hdOf(icon(pk)), 0, 0); const s2 = document.createElement('span'); s2.textContent = ITEMS[pk].name; const b2 = document.createElement('button'); b2.textContent = 'Desmontar'; b2.onclick = () => send({ t: 'uj', slot: it.slot }); r2.append(c2, s2, b2); L.appendChild(r2); } }
    return;
  }
  if (npc.shop === 'chest') {
    const section = (title: string, cap: string, list: ItemInst[], act: (i: ItemInst) => void, base: number) => { const h = document.createElement('h4'); h.className = 'shoph'; h.textContent = `${title} (${list.length}/${CONFIG.invSize}) ${cap}`; const gr = document.createElement('div'); gr.className = 'grid'; for (let n = 0; n < CONFIG.invSize; n++) { const it = list.find(x => x.slot === base + n); gr.appendChild(makeCell(it, () => { if (it) act(it); })); } L.append(h, gr); };
    section('Baú', '· clique para retirar', chest, i => send({ t: 'wd', slot: i.slot }), 1000); section('Bolsa', '· clique para guardar', items.filter(i => !i.equip), i => send({ t: 'dep', slot: i.slot }), 0); return;
  }
  if (npc.shop === 'wings') {
    const count = (k: string) => items.filter(i => i.key === k && !i.equip).reduce((a, i) => a + i.qty, 0), m0 = me;
    WING_RECIPES.forEach((rc, t) => { const key = `wing_${myCls.key}_${t}`, d = ITEMS[key], box = document.createElement('div'); box.className = 'sethead'; const ic = cv(56, 56); ic.getContext('2d')!.drawImage(hdOf(icon(key)), 0, 0); ic.style.cssText = 'width:42px;height:42px'; const tx = document.createElement('div'); tx.style.flex = '1'; const need: [string, number, number][] = rc.mats.map(([k, q]) => [ITEMS[k].name, count(k), q]); const prev = t > 0 ? `wing_${myCls.key}_${t - 1}` : null; if (prev) need.unshift([ITEMS[prev].name, count(prev), 1]); const lines = need.map(([n, h, q]) => `<small style="color:${h >= q ? '#79e08a' : '#ff9b8e'}">${esc(n)}: ${h}/${q}</small>`).join(''); tx.innerHTML = `<b style="color:${d.blade}">${esc(d.name)}</b><small>Nível ${d.lvl} · ${rc.gold.toLocaleString('pt-BR')} moedas</small>${lines}`; const b = document.createElement('button'); b.textContent = 'Criar'; b.disabled = m0.level < d.lvl || m0.gold < rc.gold || need.some(([, h, q]) => h < q); b.onclick = () => send({ t: 'cw', tier: t }); box.append(ic, tx, b); L.appendChild(box); });
    const h = document.createElement('div'); h.className = 'info'; h.textContent = 'Pluma Gélida: Hrímara e Colossos de Granizo. Coração de Magma: Infernal Dominion. Escama Ancestral: Ignarok.'; L.appendChild(h); return;
  }
  let lastSet = '', lastW = '';
  for (const k of SHOPS[npc.shop!].filter(x => (!ITEMS[x].set && ITEMS[x].kind !== 'wings' && ITEMS[x].kind !== 'weapon') || canWield(myCls, ITEMS[x]))) { const d = ITEMS[k];
    if (d.set && d.set !== lastSet) { lastSet = d.set; const S = SETS[d.set], h = document.createElement('div'); h.className = 'sethead'; const full = Object.fromEntries(SET_PIECES.map(p => [p, `${S.key}_${p}`])), pv = cv(FRAME_W * 2, FRAME_H * 2); pv.getContext('2d')!.drawImage(hdOf(heroSprites(lookFromGear(myCls.name, HAIR_COLORS[myLook.hc], myLook.hs, { ...full, weapon: myCls.weapon }))[0][0]), 0, 0); const t = document.createElement('div'); t.innerHTML = `<b style="color:${S.trim}">Set ${esc(S.name)}</b><small>Nível ${S.lvl} · 2 peças: +${S.bonus.def} defesa · 3: +${S.bonus.hp} vida · 4: +${Math.round(S.bonus.atk * 100)}% ataque</small>`; h.append(pv, t); L.appendChild(h); }
    if (d.kind === 'weapon' && d.wtype !== lastW) { lastW = d.wtype!; const h = document.createElement('h4'); h.className = 'shoph'; h.textContent = { sword: 'Espadas', axe: 'Machados', staff: 'Cajados', bow: 'Arcos' }[lastW]!; L.appendChild(h); }
    const r = document.createElement('div'); r.className = 'shopitem'; const c = cv(56, 56); c.getContext('2d')!.drawImage(hdOf(icon(k)), 0, 0); c.style.imageRendering = 'pixelated'; const s = document.createElement('span'); { const cm = cmpItem({ key: k, rarity: 0 }); if (cm) { const a = document.createElement('b'); a.textContent = cm.arrow; a.style.cssText = `color:${cm.color};margin-right:2px`; a.title = cm.text; r.append(a); r.title = cm.text; } } s.textContent = d.kind === 'weapon' ? `${d.name} · Nv ${d.lvl} · Dano +${d.dmg} · ${d.price.toLocaleString('pt-BR')} moedas` : `${d.name} · ${d.price.toLocaleString('pt-BR')} moedas`; if (d.kind === 'weapon' && me.level < d.lvl) s.style.color = '#ff9b8e'; const b = document.createElement('button'); b.textContent = 'Comprar'; b.disabled = me.gold < d.price || (d.kind === 'weapon' && me.level < d.lvl); b.onclick = () => send({ t: 'b', npc: npc.id, key: k, qty: 1 }); r.append(c, s, b); L.appendChild(r); }
  const bag = items.filter(i => !i.equip).sort((a, b) => a.slot - b.slot), h = document.createElement('h4'); h.textContent = bag.length ? 'Vender da bolsa' : 'Sua bolsa está vazia'; h.className = 'shoph'; L.appendChild(h);
  for (const i of bag) { const r = document.createElement('div'); r.className = 'shopitem'; r.dataset.sell = i.key; const c = cv(56, 56); c.getContext('2d')!.drawImage(hdOf(icon(i.key)), 0, 0); c.style.imageRendering = 'pixelated'; const s = document.createElement('span'); s.textContent = `${ITEMS[i.key].name}${i.qty > 1 ? ` ×${i.qty}` : ''} · ${sellPrice(i)} moedas`; s.style.color = RARITY[i.rarity].color; s.title = itemText(i); const b = document.createElement('button'); b.textContent = 'Vender'; b.onclick = () => { if (i.rarity && !confirm(`Vender ${ITEMS[i.key].name} (${RARITY[i.rarity].name})?`)) return; send({ t: 'se', npc: npc.id, slot: i.slot }); }; r.append(c, s, b); L.appendChild(r); }
}
let miniBase: Cv | null = null;
const TILE_COL = ['#4c8a3f', '#a29a8b', '#2f74b5', '#e4edf6', '#a6d6ee', '#94734b', '#e8601c', '#3b3236', '#2a4a30', '#45404f', '#e6e2ee', '#7fa3dc', '#14121c'];
function bakeMini() { if (!map) return; miniBase = cv(map.w, map.h); const x = miniBase.getContext('2d')!; for (let j = 0; j < map.h; j++) for (let i = 0; i < map.w; i++) { const sol = map.solid[j * map.w + i], t = map.tiles[j * map.w + i]; x.fillStyle = sol && t !== T.WATER && t !== T.LAVA && t !== T.CLOUD && t !== T.DWALL ? (map.safe ? '#3a5b34' : '#274c48') : TILE_COL[t]; x.fillRect(i, j, 1, 1); } }
function paintMap(c: HTMLCanvasElement, sx: number, sy: number, wv: number, hv: number) {
  if (!map || !miniBase) return; const x = c.getContext('2d')!, k = c.width / wv; x.imageSmoothingEnabled = false; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.drawImage(miniBase, sx, sy, wv, hv, 0, 0, c.width, c.height);
  const dot = (px: number, py: number, col: string, s = 3) => { x.fillStyle = col; x.fillRect((px - sx) * k - s / 2, (py - sy) * k - s / 2, s, s); };
  for (const p of map.portals) dot(p.x, p.y, '#c78bff', 5); for (const n of map.npcs) dot(n.x, n.y, '#ffe08a');
  for (const e of ents.values()) if (e.k !== 'd') dot(e.x, e.y, e.id === you ? '#fff' : e.k === 'p' ? '#6fdc7e' : '#ff5a5a');
}
function renderMini() { const e = ents.get(you); if (!e || !map) return; const w = Math.min(map.w, 42), h = w * 112 / 146, sx = Math.max(0, Math.min(map.w - w, e.x - w / 2)), sy = Math.max(0, Math.min(map.h - h, e.y - h / 2)); paintMap($<HTMLCanvasElement>('#minimap'), sx, sy, w, h); $('#where').textContent = `${map.name} ${e.x | 0},${e.y | 0}`; }
function renderBig() { if (!map) return; const c = $<HTMLCanvasElement>('#bigmap'); c.width = map.w * 4; c.height = map.h * 4; $('#mapt').firstChild!.textContent = `${map.name} `; paintMap(c, 0, 0, map.w, map.h); }

// ---------- entrada ----------
let joy = { x: 0, y: 0 }, lastInput = '';
function syncInput() { let x = joy.x, y = joy.y; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } x = Math.round(x * 10) / 10; y = Math.round(y * 10) / 10; const s = `${x},${y}`; if (s !== lastInput) { lastInput = s; send({ t: 'i', x, y }); if (x || y) { target = 0; pendingNpc = null; marker = null; const a = ents.get(you); if (a && !pred) pred = { x: a.x, y: a.y, path: null, stop: 0, tx: 0, ty: 0, hold: 0 }; } } }
function nearestMob(r: number) { const a = ents.get(you); if (!a) return null; let b: Ent | null = null, bd = r; for (const e of ents.values()) if (e.k === 'm') { const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < bd) { bd = d; b = e; } } return b; }
function startPred(x: number, y: number, stop = 0) { const a = ents.get(you); if (!a || !map || me?.dead) return; const path = findPath(map, a.x, a.y, x, y); if (path) pred = { x: a.x, y: a.y, path, stop, tx: x, ty: y, hold: performance.now() + 700 }; }
function attack(e: Ent) { target = e.id; send({ t: 'a', id: e.id }); const a = ents.get(you); if (!a) return; if (Math.hypot(a.x - e.x, a.y - e.y) <= myCls.range) { faceTo(a, e.x, e.y); a.atkUntil = performance.now() + 180; pred = null; } else startPred(e.x, e.y, myCls.range - .05); }
let holdAtk = false, holdSkill = false, skillAt = 0, queued: { n: number; until: number } | null = null, warnAt = 0;
function warn(s: string) { const a = ents.get(you), n = performance.now(); if (a && n > warnAt) { warnAt = n + 900; texts.push({ x: a.x, y: a.y - 1.1, s, c: '#ffb0a0', t: 0, big: false }); } }
function skill(n: number, quiet = false) {
  const sk = myCls.skills.find(s => s.n === n)!, now = performance.now(), a = ents.get(you); if (!a || !me) return;
  if (me.level < (sk.lvl ?? 1)) { if (!quiet) warn(`Nível ${sk.lvl}`); return; }
  if ((cds[n]?.until ?? 0) > now) return;
  if (me.mp < sk.mana) { warn('Sem mana'); return; }
  const needs = sk.kind !== 'spin' && sk.kind !== 'summon' && sk.kind !== 'buff' && sk.kind !== 'heal'; let t = ents.get(target);
  if (needs && (!t || t.k !== 'm')) { const nm = nearestMob(Math.max(sk.range ?? 8, 8)); if (!nm) { if (!quiet) warn('Sem alvo'); return; } attack(nm); t = nm; }
  if (needs && t && Math.hypot(t.x - a.x, t.y - a.y) > (sk.range ?? 8)) { queued = { n, until: now + 4000 }; attack(t); return; }
  send({ t: 'k', n, id: t?.id ?? 0 });
}
function potion(k: string) { const i = items.find(x => x.key === k && !x.equip); if (i) send({ t: 'u', slot: i.slot }); }
const tgtTyping = () => document.activeElement === $('#chati');
addEventListener('keydown', e => {
  if (!running || (e.target as HTMLElement).tagName === 'INPUT' && e.key !== 'Enter' && e.key !== 'Escape') return;
  const k = e.key.toLowerCase();
  if (e.key === 'Enter') { const i = $<HTMLInputElement>('#chati'); if (!tgtTyping()) { e.preventDefault(); i.focus(); } return; }
  if (e.key === 'Escape') { $('#chati').blur(); closeWins(); return; }
  if (e.repeat) return;
  if (k === '1' || k === '2' || k === '3' || k === '4') selectSkill(+k); else if (k === 'd') keyPlayerMenu(); else if (k === 'q') potion('pot_hp'); else if (k === 'e') potion('pot_mp'); else if (k === 'i') toggle('inv'); else if (k === 'c') toggle('char'); else if (k === 'm') toggle('map'); else if (k === ' ') { const m = nearestMob(10); if (m) attack(m); }
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
function playerMenu(en: Ent, cx: number, cy: number) { $('#pminv').style.display = party?.m.some(m => m.name === en.info.name) ? 'none' : ''; menuFor = en; $('#pmname').textContent = en.info.name; const pm = $('#pmenu'); pm.style.display = 'block'; pm.style.left = `${Math.max(8, Math.min(innerWidth - 170, cx))}px`; pm.style.top = `${Math.max(8, Math.min(innerHeight - 110, cy))}px`; }
/** Tecla D: abre grupo/troca do jogador sob o cursor ou, sem ninguém ali, do mais próximo. */
function keyPlayerMenu() { const a = ents.get(you); if (!a) return; const w = toWorld(curX, curY); let best: Ent | null = null, bd = 1e9; for (const e of ents.values()) if (e.k === 'p' && e.id !== you && Math.hypot(e.x - a.x, e.y - a.y) <= 8) { const d = Math.hypot(e.x - w.x, e.y - .6 - w.y) < 1.2 ? -1 : Math.hypot(e.x - a.x, e.y - a.y); if (d < bd) { bd = d; best = e; } } if (best) playerMenu(best, curX || innerWidth / 2, curY || innerHeight / 2); else log('Nenhum jogador por perto.', 'sys'); }
function mobAt(wx: number, wy: number) { let best: Ent | null = null, bd = 1.2; for (const en of ents.values()) if (en.k === 'm') { const sz = mobSize(en.info.mob) / 32, d = Math.hypot(en.x - wx, en.y - sz / 2 - wy); if (d < Math.max(bd, sz * .7)) { bd = d; best = en; } } return best; }
function selectSkill(n: number) { activeSkill = n; document.querySelectorAll<HTMLElement>('[data-sk]').forEach(b => b.classList.toggle('sel', +b.dataset.sk! === n)); }
selectSkill(1);
canvas.addEventListener('contextmenu', e => e.preventDefault());
function pixelCursor(c1: string, c2: string, attack: boolean) { const c = cv(32, 32), x = c.getContext('2d')!, r = (a: number, b: number, w: number, h: number, k: string) => { x.fillStyle = k; x.fillRect(a, b, w, h); }; for (let i = 0; i < 14; i++) { r(2 + i, 2 + i, 4, 3, '#1a1426'); r(3 + i, 3 + i, 2, 1, i < 3 ? '#fff' : c1); } for (let i = 0; i < 6; i++) r(9 + i, 19 - i, 2, 2, c2); r(16, 17, 6, 3, '#6b4a2b'); r(20, 19, 3, 6, '#6b4a2b'); return `url(${c.toDataURL()}) 2 2, ${attack ? 'crosshair' : 'default'}`; }
const curNormal = pixelCursor('#e8dfc9', '#e9c46a', false), curAttack = pixelCursor('#ff6b5a', '#ff9d3c', true); let curAtk: boolean | null = null, curCheck = 0;
canvas.addEventListener('pointermove', e => { curX = e.clientX; curY = e.clientY; const n = performance.now(); if (n > curCheck && map) { curCheck = n + 60; const w = toWorld(e.clientX, e.clientY), at = !!mobAt(w.x, w.y); if (at !== curAtk) { curAtk = at; canvas.style.cursor = at ? curAttack : curNormal; } } });
addEventListener('pointerup', () => { holding = false; holdAtk = false; holdSkill = false; });
canvas.addEventListener('pointerdown', e => {
  if (!map || !running) return;
  curX = e.clientX; curY = e.clientY;
  const { x: wx, y: wy } = toWorld(e.clientX, e.clientY);
  if (e.button === 2) { const m = mobAt(wx, wy); if (m) target = m.id; skill(activeSkill); if (e.pointerType === 'mouse') holdSkill = true; return; } // botão direito: habilidade selecionada
  if (e.button !== 0) return;
  $('#pmenu').style.display = 'none';
  const best = mobAt(wx, wy);
  if (best) { if (e.pointerType === 'mouse') holdAtk = true; return attack(best); }
  if (e.pointerType !== 'mouse') for (const en of ents.values()) if (en.k === 'p' && en.id !== you && Math.hypot(en.x - wx, en.y - .6 - wy) < .9) { playerMenu(en, e.clientX, e.clientY); return; }
  for (const n of map.npcs) if (Math.hypot(n.x - wx, n.y - .6 - wy) < 1.1) { const a = ents.get(you); pendingNpc = n; target = 0; if (a && Math.hypot(a.x - n.x, a.y - n.y) > 2.5) { send({ t: 'g', x: n.x, y: n.y + 1.4 }); startPred(n.x, n.y + 1.4); } return; }
  autoAt = performance.now() + 1500; target = 0; pendingNpc = null; marker = { x: wx, y: wy, t: 0 }; closeWin('shop'); send({ t: 'g', x: wx, y: wy }); startPred(wx, wy);
  if (e.pointerType === 'mouse') { holding = true; holdAt = performance.now() + 250; } // segurar: segue o cursor
});
// Qualidade: 2 alto (densidade da tela e bloom), 1 médio, 0 baixo. Em Auto, reduz sozinho se o FPS cair.
let quality = 2, gfxAuto = true, gfxHold = 0, frameAcc = 0, frameN = 0;
try { const v = localStorage.getItem('em_gfx'); if (v !== null && v !== 'auto') { quality = +v; gfxAuto = false; } } catch { /* sem armazenamento */ }
gfx.hd = quality > 0;
function resize() { const rs = quality === 2 && devicePixelRatio >= 1.5 ? 2 : 1, cssW = innerWidth, cssH = innerHeight; canvas.width = Math.round(cssW * rs); canvas.height = Math.round(cssH * rs); Z = Math.max(1, Math.round(Math.min(cssW / (22 * 32), cssH / (13 * 32)))) * rs; }
function applyGfx() { gfx.hd = quality > 0; resize(); chunks.clear(); labels.clear(); $('#gfx').textContent = gfxAuto ? 'Gráf: Auto' : `Gráf: ${['Baixo', 'Médio', 'Alto'][quality]}`; }
$('#gfx').onclick = () => { if (gfxAuto) { gfxAuto = false; quality = 2; } else if (quality > 0) quality--; else { gfxAuto = true; quality = 2; } try { localStorage.setItem('em_gfx', gfxAuto ? 'auto' : String(quality)); } catch { /* */ } gfxHold = performance.now() + 4000; applyGfx(); };
addEventListener('resize', resize); resize(); requestAnimationFrame(menuFrame);
document.querySelectorAll<HTMLElement>('[data-pot]').forEach(b => { const c = cv(56, 56); c.getContext('2d')!.drawImage(hdOf(icon(b.dataset.pot!)), 0, 0); c.className = 'pi'; b.insertBefore(c, b.querySelector('s')); b.title = b.dataset.pot === 'pot_hp' ? 'Vida' : 'Mana'; [...b.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove()); });
{ const c = cv(56, 56); c.getContext('2d')!.drawImage(hdOf(icon('short_sword')), 0, 0); c.className = 'pi'; $('#atk').appendChild(c); [...$('#atk').childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove()); }

// ---------- render ----------
let chest: ItemInst[] = [], editId = 0;
let jewelSlot = -1, gfxInit = false;
const bloomC = cv(16, 16), bloomX = bloomC.getContext('2d')!; noHd.add(bloomC);
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
  if (gfxAuto && quality > 0) { frameAcc += dt; if (++frameN >= 90) { const avg = frameAcc / 90; frameAcc = 0; frameN = 0; if (avg > .03 && ts > gfxHold) { quality--; gfxHold = ts + 3000; applyGfx(); return; } } }
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
    if (auto && ts > autoAt && me && !me.dead && !map.safe) { autoAt = ts + 280; autoPlay(a, ts); }
  }
  const W = canvas.width, H = canvas.height, vw = W / Z, vh = H / Z;
  const cx = Math.max(vw / 2, Math.min(map.w * 32 - vw / 2, camX * 32)), cy = Math.max(vh / 2, Math.min(map.h * 32 - vh / 2, camY * 32));
  const ox = Math.round((vw / 2 - (vw > map.w * 32 ? map.w * 16 : cx)) * Z) / Z, oy = Math.round((vh / 2 - (vh > map.h * 32 ? map.h * 16 : cy)) * Z) / Z;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#0a0814'; g.fillRect(0, 0, W, H); g.setTransform(Z, 0, 0, Z, ox * Z, oy * Z);
  viewX = ox; viewY = oy;
  if (a) {
    if (holdAtk && !target) { const w = toWorld(curX, curY), m = mobAt(w.x, w.y) ?? nearestMob(7); if (m) attack(m); }
    if (holdSkill && ts > skillAt) { skillAt = ts + 180; const w = toWorld(curX, curY), m = mobAt(w.x, w.y); if (m) target = m.id; skill(activeSkill, true); }
    if (queued) { const q = queued, sk = myCls.skills.find(s => s.n === q.n)!, t = ents.get(target); if (ts > q.until || !t) queued = null; else if (Math.hypot(t.x - a.x, t.y - a.y) <= (sk.range ?? 8)) { queued = null; send({ t: 'k', n: q.n, id: t.id }); } }
  }
  if (holding && ts > holdAt) { holdAt = ts + 200; const w = toWorld(curX, curY); target = 0; pendingNpc = null; send({ t: 'g', x: w.x, y: w.y }); startPred(w.x, w.y); }
  const x0 = Math.max(0, Math.floor(-ox / 32)), y0 = Math.max(0, Math.floor(-oy / 32)), x1 = Math.min(map.w - 1, Math.ceil((-ox + vw) / 32)), y1 = Math.min(map.h - 1, Math.ceil((-oy + vh) / 32));
  const wf = Math.floor(ts / 260) % 4;
  if (chunkMap !== map.id) buildRows(map);
  const cs: { cx: number; cy: number; ch: ReturnType<typeof chunk> }[] = [];
  for (let cy = Math.floor(y0 / CH); cy <= Math.floor(y1 / CH); cy++) for (let cx = Math.floor(x0 / CH); cx <= Math.floor(x1 / CH); cx++) cs.push({ cx, cy, ch: chunk(map, cx, cy) });
  for (const c of cs) for (let n = 0; n < c.ch.anim.length; n += 2) { const i = c.ch.anim[n], j = c.ch.anim[n + 1]; g.drawImage(tile(map.tiles[j * map.w + i], (i * 7 + j * 13) % 4, wf), i * 32, j * 32); }
  for (const c of cs) g.drawImage(c.ch.c, c.cx * CH * 32, c.cy * CH * 32, CH * 32, CH * 32);
  if (map.traps) { const up = trapUp(Date.now()); for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) if (map.traps.has(j * map.w + i)) { const X0 = i * 32, Y0 = j * 32; g.fillStyle = '#1a1722'; g.fillRect(X0 + 3, Y0 + 3, 26, 26); g.fillStyle = up ? '#e0e6ee' : '#57525f'; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { const sx = X0 + 7 + a * 8, sy = Y0 + 7 + b * 8; if (up) { g.fillRect(sx, sy - 5, 2, 8); g.fillStyle = '#ff5a4a'; g.fillRect(sx, sy - 6, 2, 2); g.fillStyle = '#e0e6ee'; } else g.fillRect(sx, sy, 2, 2); } } }
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
    for (let i = 0; i < 4; i++) { const rad = 260 + i * 60, cxx = camWX + Math.sin(ts / 21000 + i * 1.9) * vw * .6, cyy = camWY + Math.cos(ts / 17000 + i * 2.7) * vh * .6; g.globalAlpha = map.id === 'celestial' ? .2 : map.id === 'frostvale' ? .16 : map.id === 'infernal' ? .22 : .1; g.drawImage(glowSprite(map.id === 'frostvale' || map.id === 'celestial' ? '#ffffff' : map.id === 'infernal' ? '#120609' : '#0a0814'), cxx - rad, cyy - rad * .6, rad * 2, rad * 1.2); }
    g.globalAlpha = 1; g.imageSmoothingEnabled = sm;
    if (map.safe) for (let i = 0; i < 10; i++) { const bx = camWX + Math.sin(ts / 3100 + i * 2.1) * vw * .46 + Math.sin(ts / 700 + i) * 14, by = camWY + Math.cos(ts / 2700 + i * 1.3) * vh * .42 + Math.sin(ts / 430 + i) * 8, w = Math.floor(ts / 120 + i) % 2 ? 3 : 1; g.fillStyle = ['#f4e36b', '#f2a0c0', '#8fd0ff'][i % 3]; g.fillRect(Math.round(bx - w), Math.round(by), w, 3); g.fillRect(Math.round(bx + 1), Math.round(by), w, 3); }
    if (Math.random() < .5) { const ri = x0 + Math.floor(Math.random() * (x1 - x0 + 1)), rj = y0 + Math.floor(Math.random() * (y1 - y0 + 1)), tt = map.tiles[rj * map.w + ri]; if (tt === T.LAVA) parts.push({ x: ri + Math.random(), y: rj + .9, vx: 0, vy: -1.6, life: 0, max: .5, c: '#ffd76a', s: 3, g: 3 }); else if (tt === T.WATER) parts.push({ x: ri + Math.random(), y: rj + Math.random() + .3, vx: 0, vy: 0, life: 0, max: .3, c: '#ffffff', s: 2 }); else if (tt === T.ICE) parts.push({ x: ri + Math.random(), y: rj + Math.random() + .3, vx: 0, vy: 0, life: 0, max: .4, c: '#ffffff', s: 2 }); }
  }
  // luz do dia/noite e fontes de luz
  const night = map.id === 'ashen' ? .95 : map.id === 'celestial' ? 0 : map.id === 'eldergrove' ? Math.max(.42, nightFactor()) : nightFactor(), vx0 = x0 * 32, vy0 = y0 * 32;
  if (night > .02) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = lerpCol(map.safe ? [255, 246, 232] : map.id === 'infernal' ? [255, 214, 190] : map.id === 'eldergrove' ? [214, 240, 214] : map.id === 'celestial' ? [255, 248, 228] : [226, 236, 255], [122, 130, 188], night); g.fillRect(0, 0, W, H); } g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.setTransform(Z, 0, 0, Z, ox * Z, oy * Z);
  const light = (x: number, y: number, r: number, c: string, al: number) => { g.globalAlpha = Math.min(1, al); g.drawImage(glowSprite(c), x - r, y - r, r * 2, r * 2); };
  for (const p of map.portals) light(p.x * 32, p.y * 32 - 26, 96 + Math.sin(ts / 300) * 8, '#8a55ff', .55 + night * .35);
  if (map.id === 'infernal') for (let j = y0 - y0 % 4; j <= y1; j += 4) for (let i = x0 - x0 % 4; i <= x1; i += 4) if (map.tiles[j * map.w + i] === T.LAVA) light(i * 32 + 16, j * 32 + 16, 118 + Math.sin(ts / 300 + i + j) * 6, '#ff5a1c', .34);
  for (const o of vis) {
    if (o.k === 'spire' && (o.x + o.y) % 4 === 0) light(o.x * 32 + 16, o.y * 32 - 6, 44, '#ff6a2b', .3);
    if (o.k === 'torch') light(o.x * 32 + 16, o.y * 32 + 8, 130 + Math.sin(ts / 110 + o.x) * 7, '#ff9a4a', .9);
    if (o.k === 'shroom') light(o.x * 32 + 16, o.y * 32 - 8, 62, o.v ? '#3fd6c0' : '#b06bff', .55);
    if (o.k === 'lamp') light(o.x * 32 + 16, o.y * 32 - 22, 80 + Math.sin(ts / 170 + o.x) * 3, '#ffb45a', .18 + night * .7);
    else if (o.k === 'house' && night > .1) for (const wx of [18, o.w * 32 - 28]) light(o.x * 32 - 4 + wx + 8, (o.y + o.h) * 32 - 39, 34, '#ffc66a', night * .8);
    else if (o.k === 'rock' && (o.x + o.y) % 5 === 0) light(o.x * 32 + 16, o.y * 32 + 2, 52, '#4fc6ff', .3 + night * .4); }
  for (const b of bolts) { const u = b.t / .16; light((b.x + (b.tx - b.x) * u) * 32, (b.y + (b.ty - b.y) * u) * 32 - 18, 34, b.c, .9); }
  for (const r of rings) if (!r.tele) light(r.x * 32, r.y * 32, r.r * 40, r.c, .5 * (1 - r.t / r.max));
  for (const e of ents.values()) { if (e.k === 'd' && e.info.rarity) light(e.x * 32, e.y * 32, 34, RARITY[e.info.rarity].color, .5); if (e.k === 's') light(e.x * 32, e.y * 32 - 14, 46, e.info.mob === 'wisp' ? '#6dff9c' : '#a04dff', .6); if (e.k === 'm' && MOBS[e.info.mob].boss) light(e.x * 32, e.y * 32 - 50, 130, MOBS[e.info.mob].nova ?? '#59c8ff', .15 + night * .15); if (e.k === 'p' && e.info.weapon && ITEMS[e.info.weapon].lvl >= 26) light(e.x * 32 + (e.dir === 3 ? -12 : 12), e.y * 32 - 34, 34, ITEMS[e.info.weapon].blade!, .4 + Math.sin(ts / 240 + e.id) * .12); if (e.k === 'p' && e.info.wings && ITEMS[e.info.wings].wtier === 2 && Math.random() < .35) parts.push({ x: e.x + (Math.random() - .5) * 2.6, y: e.y - .4 - Math.random(), vx: 0, vy: .6, life: 0, max: .9, c: ITEMS[e.info.wings].blade!, s: 2 }); if (e.k === 'p') { const fs = fullSetOf(SET_PIECES.map(p => e.info[p])); if (fs) { const col = SETS[fs].key === 'dragon' ? '#7dffb0' : SETS[fs].trim; light(e.x * 32, e.y * 32 + 2, 46 + Math.sin(ts / 260) * 4, col, .3); if (Math.random() < .25) parts.push({ x: e.x + (Math.random() - .5) * .9, y: e.y + .1, vx: 0, vy: -1.4, life: 0, max: .8, c: col, s: 2 }); } } if (e.id === you && night > .05) light(e.x * 32, e.y * 32 - 18, 130, '#ffdca0', night * .4); }
  if (map.safe && night > .15) for (let i = 0; i < 12; i++) light(-ox + vw / 2 + Math.sin(ts / 3900 + i * 3.1) * vw * .47, -oy + vh / 2 + Math.cos(ts / 3300 + i * 1.7) * vh * .44, 13, '#c6ff7a', night * (.5 + Math.sin(ts / 310 + i * 2) * .4));
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false;
  if (quality === 2 && 'filter' in g) {
    const bw = W >> 3, bh = H >> 3; if (bloomC.width !== bw || bloomC.height !== bh) { bloomC.width = bw; bloomC.height = bh; }
    bloomX.globalCompositeOperation = 'copy'; (bloomX as any).filter = 'brightness(.55) contrast(3)'; bloomX.drawImage(canvas, 0, 0, bw, bh); (bloomX as any).filter = 'none';
    g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true; g.globalCompositeOperation = 'lighter'; g.globalAlpha = .22; g.drawImage(bloomC, 0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false; g.setTransform(Z, 0, 0, Z, ox * Z, oy * Z);
  }
  // nomes, barras e números
  g.textAlign = 'center';
  for (const n of map.npcs) { label(n.x * 32, n.y * 32 - 50, n.name, '#ffe08a'); if (n.shop && n.id !== 'bau' && n.id !== 'prensa') label(n.x * 32, n.y * 32 - 62 + Math.sin(ts / 260) * 2, '$', '#ffd76a'); }
  for (const p of map.portals) label(p.x * 32, p.y * 32 - 92, `» ${p.label}${p.lvl ? ` (Nv ${p.lvl})` : ''}`, me && p.lvl && me.level < p.lvl ? '#ff9b8e' : '#d6bcff');
  for (const e of ents.values()) {
    if (e.k === 's') continue;
    if (e.k === 'd') { label(e.x * 32, e.y * 32 - 22, e.info.key ? `${cmpItem({ key: e.info.key, rarity: e.info.rarity })?.arrow === '▲' ? '▲ ' : ''}${ITEMS[e.info.key].name}` : `${e.info.gold} moedas`, e.info.key ? (ITEMS[e.info.key].set ? '#ffd76a' : RARITY[e.info.rarity].color) : '#f0d27a'); continue; }
    const h = e.k === 'p' ? 50 : mobSize(e.info.mob) + 10, X = Math.round(e.x * 32), Y = Math.round(e.y * 32) - h, boss = e.k === 'm' && MOBS[e.info.mob].boss, bw = boss ? 72 : 32;
    if (e.k === 'p' || e.id === target || boss) label(X, Y - 6, e.k === 'p' ? `${e.info.res ? `[R${e.info.res}] ` : ''}${e.info.name}` : `${MOBS[e.info.mob].name} Nv${MOBS[e.info.mob].level}`, e.id === target ? '#ffd24a' : e.k === 'p' ? '#fff' : '#ffb4a8');
    g.fillStyle = '#0a0814'; g.fillRect(X - bw / 2 - 1, Y - 3, bw + 2, 6); g.fillStyle = '#3a2f4a'; g.fillRect(X - bw / 2, Y - 2, bw, 4); { const w = Math.round(bw * e.hp / 100); g.fillStyle = e.k !== 'p' ? '#e0425a' : e.hp > 50 ? '#58d36a' : e.hp > 25 ? '#f0cf65' : '#ff6b6b'; g.fillRect(X - bw / 2, Y - 2, w, 4); g.fillStyle = '#ffffff66'; g.fillRect(X - bw / 2, Y - 2, w, 1); }
  }
  texts = texts.filter(t => (t.t += dt) < .85); for (const t of texts) { const u = t.t / .85; g.font = `bold ${Math.round((t.big ? 17 : 12) * (1 + Math.max(0, .12 - t.t) * 4))}px system-ui,Segoe UI,Roboto,sans-serif`; g.globalAlpha = 1 - u * u; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#0a0814'; const y = t.y * 32 - 38 - u * 26; g.strokeText(t.s, t.x * 32, y); g.fillStyle = t.c; g.fillText(t.s, t.x * 32, y); } g.globalAlpha = 1;
  // clima e iluminação
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (map.id === 'infernal') { for (const f of snow) { f.y -= f.s * dt * 4; f.x += Math.sin(ts / 700 + f.d) * .0008; if (f.y < 0) f.y = 1; g.globalAlpha = .45 + f.s * 7; g.fillStyle = f.s > .055 ? '#ffd76a' : '#ff7a2b'; g.fillRect(Math.round(((f.x % 1) + 1) % 1 * W), Math.round(f.y * H), 2 * Z, 2 * Z); } g.globalAlpha = 1; }
  else if (!map.safe) {
    g.fillStyle = map.id === 'eldergrove' ? '#b6f06a' : map.id === 'celestial' ? '#ffe9a8' : map.id === 'ashen' ? '#6a6478' : '#fff'; for (const f of snow) { f.y += f.s * dt * 5; f.x += Math.sin(ts / 900 + f.d) * .0006; if (f.y > 1) f.y = 0; g.globalAlpha = .35 + f.s * 8; const sz = (f.s > .055 ? 3 : 2) * Z; g.fillRect(Math.round(((f.x % 1) + 1) % 1 * W), Math.round(f.y * H), sz, sz); } g.globalAlpha = 1;
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
  if (!l) { const m = g.font; g.font = 'bold 10px system-ui,Segoe UI,Roboto,sans-serif'; const w = Math.ceil(g.measureText(s).width) + 8; g.font = m; l = cv(w * Z, 16 * Z); noHd.add(l); const b = l.getContext('2d')!; b.scale(Z, Z); b.font = 'bold 10px system-ui,Segoe UI,Roboto,sans-serif'; b.textAlign = 'center'; b.lineJoin = 'round'; b.lineWidth = 3; b.strokeStyle = '#0a0814cc'; b.strokeText(s, w / 2, 12); b.fillStyle = c; b.fillText(s, w / 2, 12); if (labels.size > 400) labels.clear(); labels.set(k, l); }
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
  else if (t === T.MOSS) { if (n < 7) { p(X + 1, Y + 4, 2, 4, '#d6d0c0'); p(X - 1, Y + 1, 6, 3, n % 2 ? '#3fd6c0' : '#b06bff'); } else if (n < 16) for (let a = 0; a < 5; a++) p(X + a * 2, Y + 5 - (a % 3) * 2, 1, 3 + (a % 3) * 2, a % 2 ? '#4f8f50' : '#2f6b3a'); }
  else if (t === T.DUNGEON) { if (n < 5) { p(X, Y + 3, 10, 2, '#b8b09e'); p(X - 1, Y + 2, 2, 4, '#cfc7b4'); p(X + 9, Y + 2, 2, 4, '#cfc7b4'); } else if (n < 8) { p(X, Y, 7, 6, '#b8b09e'); p(X + 1, Y + 2, 2, 2, '#1a1416'); p(X + 4, Y + 2, 2, 2, '#1a1416'); } else if (n < 16) { let a = X; for (let k = 0; k < 8; k++) { p(a, Y + k, 1, 1, '#23202b'); a += (h >> k) % 3 - 1; } } }
  else if (t === T.ASH) {
    if (n < 3) { p(X, Y, 7, 6, '#cfc7b4'); p(X + 1, Y + 6, 5, 2, '#a8a08e'); p(X + 1, Y + 2, 2, 2, '#1a1416'); p(X + 4, Y + 2, 2, 2, '#1a1416'); }
    else if (n < 7) { p(X, Y + 3, 11, 2, '#b8b09e'); p(X - 1, Y + 2, 2, 4, '#cfc7b4'); p(X + 10, Y + 2, 2, 4, '#cfc7b4'); }
    else if (n < 13) { let a = X; for (let k = 0; k < 8; k++) { p(a, Y + k, 2, 1, k % 3 ? '#ff7a2b' : '#ffd76a'); a += (h >> k) % 3 - 1; } }
  }
}
function objShadow(x: CanvasRenderingContext2D, o: GameMap['objs'][number]) {
  const sh = glowSprite('#0a0814'), put = (cx: number, cy: number, rx: number, ry: number) => x.drawImage(sh, cx - rx, cy - ry, rx * 2, ry * 2), X = o.x * 32 + 16, Y = o.y * 32;
  if (o.k === 'tree' || o.k === 'pine') put(X, Y + 28, 28, 11); else if (o.k === 'oak') put(X, Y + 28, 34, 13); else if (o.k === 'rock' || o.k === 'lamp' || o.k === 'barrel' || o.k === 'spire' || o.k === 'deadtree' || o.k === 'shroom' || o.k === 'pillar' || o.k === 'statue') put(X, Y + 28, 20, 8); else if (o.k === 'house' || o.k === 'stall') put(o.x * 32 + o.w * 16, (o.y + o.h) * 32, o.w * 18, 12);
}
/** Bloco 12×12 do chão já desenhado: tiles, bordas e sombras saem prontos de uma vez. */
function chunk(m: GameMap, cx: number, cy: number) {
  const k = `${cx},${cy}`; let ch = chunks.get(k); if (ch) { chunks.delete(k); chunks.set(k, ch); return ch; }
  const S = gfx.hd ? 2 : 1, c = cv(CH * 32 * S, CH * 32 * S), x = c.getContext('2d')!, anim: number[] = [], x0 = cx * CH, y0 = cy * CH; noHd.add(c); hdCtx(x); x.imageSmoothingEnabled = false; x.scale(S, S); x.translate(-x0 * 32, -y0 * 32);
  for (let j = y0; j < Math.min(m.h, y0 + CH); j++) for (let i = x0; i < Math.min(m.w, x0 + CH); i++) {
    const t = m.tiles[j * m.w + i], v = (i * 7 + j * 13) % 4;
    if (t === T.WATER || t === T.LAVA || t === T.CLOUD) anim.push(i, j); else x.drawImage(tile(t, t === T.DWALL && j + 1 < m.h && m.tiles[(j + 1) * m.w + i] !== T.DWALL ? 7 : v, 0), i * 32, j * 32);
    if (t === T.DWALL) continue;
    const P = tilePrio(t), nb = (a: number, b: number, side: number) => { if (a < 0 || b < 0 || a >= m.w || b >= m.h) return; const nt = m.tiles[b * m.w + a]; if (tilePrio(nt) > P) x.drawImage(edge(nt, side, t === T.WATER), i * 32, j * 32); };
    nb(i, j - 1, 0); nb(i, j + 1, 1); nb(i - 1, j, 2); nb(i + 1, j, 3);
    if (t !== T.STONE && t !== T.WATER && t !== T.LAVA && t !== T.CLOUD && t !== T.MARBLE && t !== T.DUNGEON) { const q = (Math.sin(i * .37 + j * .11) + Math.sin(j * .29 - i * .17) + 2) / 4; x.fillStyle = t === T.GRASS ? '#123a1a' : t === T.MOSS ? '#0a1a10' : t === T.ASH ? '#120609' : '#6a8fc8'; x.globalAlpha = q * .2; x.fillRect(i * 32, j * 32, 32, 32); x.globalAlpha = 1; }
    if (!m.solid[j * m.w + i]) decal(x, t, i, j);
  }
  x.imageSmoothingEnabled = true; x.globalAlpha = .55;
  for (let r = Math.max(0, y0 - 4); r < Math.min(m.h, y0 + CH + 2); r++) for (const o of objRows[r]) if (o.x + o.w >= x0 - 2 && o.x <= x0 + CH + 2) objShadow(x, o);
  ch = { c, anim }; chunks.set(k, ch); if (chunks.size > 20) chunks.delete(chunks.keys().next().value!); return ch;
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
const npcLooks: Look[] = [{ hc: '#000', hs: 0 }, { hc: '#d8dde6', hs: 2, robe: '#6a3f96' }, { hc: '#b23a2e', hs: 0, armor: '#7a5230', weapon: 'iron_axe', boots: '#3c2a1c' }, { hc: '#2b2230', hs: 0, helm: '#8b95a6', armor: '#8b95a6', pants: '#5c6577', weapon: 'short_sword' }, lookFromGear('Dark Warrior', '#d9b24a', 2, { helm: null, armor: 'lion_armor', pants: 'lion_pants', boots: 'lion_boots', weapon: 'frost_blade' }), { hc: '#d8dde6', hs: 1, armor: '#3e5a9a', pants: '#2a3a68', boots: '#c9a44c' }, { hc: '#e8e6df', hs: 2, robe: '#7a2f3a', weapon: 'glacier_staff' }];
const skillLock: Record<number, number> = {}, lootTried = new Set<number>();
/** Modo Auto: usa poções, habilidades, ataca o monstro mais próximo e recolhe o que cair. */
function autoPlay(a: Ent, ts: number) {
  const m0 = me!, ready = (s: { n: number; mana: number; lvl?: number }) => m0.level >= (s.lvl ?? 1) && m0.mp >= s.mana && ts > (cds[s.n]?.until ?? 0) && ts > (skillLock[s.n] ?? 0), cast = (s: { n: number }, id: number) => { skillLock[s.n] = ts + 500; send({ t: 'k', n: s.n, id }); };
  if (m0.hp < m0.maxHp * .4) potion('pot_hp'); else if (m0.mp < m0.maxMp * .25) potion('pot_mp');
  const near = nearestMob(14), heal = myCls.skills.find(s => s.kind === 'heal');
  if (heal && m0.hp < m0.maxHp * .6 && ready(heal)) return cast(heal, 0);
  let t = ents.get(target); if (!t || t.k !== 'm') t = undefined;
  if (!t) {
    let drop: Ent | null = null, bd = 6; for (const e of ents.values()) if (e.k === 'd' && !lootTried.has(e.id)) { const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < bd) { bd = d; drop = e; } }
    if (drop) { lootTried.add(drop.id); if (lootTried.size > 300) lootTried.clear(); send({ t: 'g', x: drop.x, y: drop.y }); startPred(drop.x, drop.y); autoAt = ts + Math.min(1400, 250 + bd * 210); return; }
    if (near) { attack(near); t = near; } else return;
  }
  const dist = Math.hypot(t.x - a.x, t.y - a.y);
  for (const s of [...myCls.skills].reverse()) {
    if (!ready(s)) continue;
    if (s.kind === 'buff' || s.kind === 'summon') { if (dist < 9) return cast(s, 0); continue; }
    if (s.kind === 'heal') continue;
    if (s.kind === 'spin' ? dist <= s.radius! - .2 : dist <= (s.range ?? 8) - .2) return cast(s, t.id);
  }
}
function drawNpc(n: Npc) { if (n.id === 'prensa') { shadow(n.x * 32, n.y * 32 + 4, 28, 9); g.drawImage(pressSprite(), Math.round(n.x * 32) - 26, Math.round(n.y * 32) - 56); return; } if (n.id === 'bau') { shadow(n.x * 32, n.y * 32 + 4, 24, 8); g.drawImage(chestSprite(), Math.round(n.x * 32) - 22, Math.round(n.y * 32) - 34); return; } if (n.id === 'artifice') { const w = wingSprites('arcane_wizard', 1)[Math.floor(performance.now() / 135) % 6], fw = w.width / 2; g.imageSmoothingEnabled = true; g.drawImage(w, Math.round(n.x * 32 - fw / 2), Math.round(n.y * 32) - 27 - WING_ROOT, fw, w.height / 2); g.imageSmoothingEnabled = false; } shadow(n.x * 32, n.y * 32 + 2, 15, 6); g.drawImage(heroSprites(npcLooks[n.look])[0][0], Math.round(n.x * 32 - FRAME_W / 2), Math.round(n.y * 32 - FRAME_H + 6)); }
function drawEnt(e: Ent, ts: number) {
  const X = Math.round(e.x * 32), Y = Math.round(e.y * 32);
  if (e.k === 'p') {
    e.look ??= heroSprites(e.id === you && items.length ? myGear() : lookFromGear(e.info.cls, HAIR_COLORS[e.info.hc], e.info.hs, e.info));
    const Yb = Y + (!e.moving && ts > e.atkUntil ? Math.round(Math.sin(ts / 420 + e.id) * .7) : 0);
    const f = e.hp <= 0 ? 5 : ts < e.atkUntil ? 4 : e.moving ? [0, 1, 0, 3][Math.floor(e.anim) % 4] : 0;
    if (e.id === target) { g.strokeStyle = '#ffd24a'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y + 3, 14, 6, 0, 0, 6.3); g.stroke(); }
    shadow(X, Y + 3, 15, 6); const wd = e.info.wings ? ITEMS[e.info.wings] : null, wf2 = wd ? wingSprites(wd.cls!, wd.wtier!)[Math.floor(ts / (e.moving ? 75 : 135) + e.id) % 6] : null, drawW = () => { if (!wf2) return; const fw = wf2.width / 2, fh = wf2.height / 2, nw = e.dir === 2 || e.dir === 3 ? fw * .62 : fw; g.imageSmoothingEnabled = true; g.drawImage(wf2, Math.round(X - nw / 2), Yb - 27 - WING_ROOT, nw, fh); g.imageSmoothingEnabled = false; }; if (e.dir !== 1) drawW(); g.drawImage(e.look[e.dir][f], X - FRAME_W / 2, Yb - FRAME_H + 6); if (e.dir === 1) drawW(); { const tier = glowTier(e.info.plus ?? 0); if (tier) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .11 + Math.sin(ts / 260) * .07; g.drawImage(tintFrame(e.look[e.dir][f], tier), X - FRAME_W / 2, Yb - FRAME_H + 6); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; if ((e.info.plus ?? 0) >= 13 && Math.random() < .3) parts.push({ x: e.x + (Math.random() - .5) * .8, y: e.y - Math.random(), vx: 0, vy: -1, life: 0, max: .6, c: tier, s: 2 }); } }
    if (ts < (e.flash ?? 0)) { g.globalCompositeOperation = 'lighter'; g.drawImage(e.look[e.dir][f], X - FRAME_W / 2, Yb - FRAME_H + 6); g.globalCompositeOperation = 'source-over'; } return;
  }
  const sp = mobSprites(e.info.mob), sz = mobSize(e.info.mob), fr = Math.floor(ts / 280 + e.id) % 2, c = sp[fr][e.dir === 3 ? 1 : 0], lunge = ts < e.atkUntil ? 4 : 0;
  if (e.id === target) { g.strokeStyle = '#ff5a5a'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y + 2, sz * .55, sz * .24, 0, 0, 6.3); g.stroke(); }
  shadow(X, Y + 2, sz * .55, sz * .22); g.drawImage(c, X - c.width / 2 + (e.dir === 3 ? -lunge : lunge), Y - c.height + 6); if (ts < (e.flash ?? 0)) { g.globalCompositeOperation = 'lighter'; g.drawImage(c, X - c.width / 2 + (e.dir === 3 ? -lunge : lunge), Y - c.height + 6); g.globalCompositeOperation = 'source-over'; }
}
showChars();
