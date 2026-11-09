import { CLASSES, HAIR_COLORS, ITEMS, MOBS, SETS, WING_THEME } from '../shared/data';
import { FRAME_H, FRAME_W, hdOf, heroSprites, lookFromGear, wingSprites, WING_ROOT } from './art';

const $ = <E extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as E;
const el = (t: string, c?: string, x?: string | number) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = String(x); return e; };
async function api(p: string, b?: unknown) { const r = await fetch('/api/' + p, b === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error ?? 'Falha de conexão.'), { status: r.status }); return j; }
const fmt = (n: number) => Number(n).toLocaleString('pt-BR');

// ---------- cena de abertura com os personagens do jogo ----------
const LINE = [{ c: 'shadow_summoner', s: 'reaper', w: 'w_staff_56', hc: 0, hs: 2 }, { c: 'mystic_archer', s: 'hummingbird', w: 'w_bow_56', hc: 2, hs: 2 }, { c: 'dark_warrior', s: 'dragon', w: 'w_sword_56', hc: 3, hs: 1 }, { c: 'arcane_wizard', s: 'sphinx', w: 'w_staff_56', hc: 5, hs: 0 }, { c: 'spell_knight', s: 'wyvern', w: 'w_axe_56', hc: 4, hs: 1 }];
function heroScene() {
  const c = $<HTMLCanvasElement>('#hero'), g = c.getContext('2d')!;
  const looks = LINE.map(l => { const name = CLASSES[l.c].name, gear = { helm: `${l.s}_helm`, armor: `${l.s}_armor`, pants: `${l.s}_pants`, boots: `${l.s}_boots`, weapon: l.w }; return { f: heroSprites(lookFromGear(name, HAIR_COLORS[l.hc], l.hs, gear))[0][0], w: wingSprites(l.c, 2), trim: SETS[l.s].trim, name }; });
  const embers = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: .02 + Math.random() * .07, r: 1 + Math.random() * 2.5 }));
  const fit = () => { const w = c.clientWidth, h = c.clientHeight, d = Math.min(devicePixelRatio || 1, 2); c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0); }; addEventListener('resize', fit); fit();
  let last = 0;
  const frame = (ts: number) => {
    requestAnimationFrame(frame); if (ts - last < 33) return; const dt = (ts - last) / 1000; last = ts; const W = c.clientWidth, H = c.clientHeight;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#120a1e'); sky.addColorStop(.55, '#4a1420'); sky.addColorStop(1, '#a8421e'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const mx = W * .5, my = H * .3, mr = Math.min(W, H) * .32, mg = g.createRadialGradient(mx, my, mr * .2, mx, my, mr * 2.2); mg.addColorStop(0, '#ffcf8a55'); mg.addColorStop(1, '#ffcf8a00'); g.fillStyle = mg; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd9a8'; g.beginPath(); g.arc(mx, my, mr * .62, 0, 6.3); g.fill(); g.fillStyle = '#f0b878'; for (const [a, b, r] of [[-.2, -.1, .13], [.25, .12, .09], [-.05, .3, .07]]) { g.beginPath(); g.arc(mx + a * mr, my + b * mr, r * mr, 0, 6.3); g.fill(); }
    const ridge = (base: number, col: string, seed: number, amp: number) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 18) g.lineTo(x, H - base - Math.abs(Math.sin(x * .011 + seed)) * amp - Math.abs(Math.sin(x * .037 + seed * 2)) * amp * .4); g.lineTo(W, H); g.fill(); };
    ridge(H * .3, '#3a1020', 1.3, H * .26); 
    g.fillStyle = '#220a16'; const cw = Math.min(W * .34, 460), cx = W / 2 - cw / 2, cb = H * .78; g.fillRect(cx, cb - H * .3, cw, H * .3); for (const [p, h, tw] of [[0, .46, .13], [.22, .38, .1], [.45, .58, .12], [.68, .38, .1], [.87, .46, .13]]) { const x = cx + p * cw, w = cw * tw; g.fillRect(x, cb - H * h, w, H * h); g.beginPath(); g.moveTo(x - 5, cb - H * h); g.lineTo(x + w / 2, cb - H * (h + .13)); g.lineTo(x + w + 5, cb - H * h); g.fill(); } g.fillStyle = '#ffb04a'; for (let i = 0; i < 9; i++) g.fillRect(cx + cw * (.08 + i * .1), cb - H * (.14 + (i % 3) * .06), 5, 9);
    ridge(H * .1, '#160810', 4.1, H * .16);
    g.imageSmoothingEnabled = false; const n = looks.length, gap = Math.min(W / n, 240), sc = Math.max(2.4, Math.min(H / 170, gap / 62));
    looks.forEach((l, i) => { const off = i - (n - 1) / 2, x = W / 2 + off * gap, dist = Math.abs(off), s = sc * (1 - dist * .09), y = H * (.98 - dist * .025) + Math.sin(ts / 700 + i) * 2, fw = FRAME_W * s, fh = FRAME_H * s; const wf = l.w[Math.floor(ts / 150 + i) % 6]; const ww = wf.width / 2 * s, wh = wf.height / 2 * s, gl = g.createRadialGradient(x, y - fh * .5, 4, x, y - fh * .5, fh * .95); gl.addColorStop(0, l.trim + '55'); gl.addColorStop(1, l.trim + '00'); g.fillStyle = gl; g.fillRect(x - fh, y - fh * 1.5, fh * 2, fh * 2); g.imageSmoothingEnabled = true; g.drawImage(wf, x - ww / 2, y - (27 + WING_ROOT) * s, ww, wh); g.imageSmoothingEnabled = false; g.drawImage(hdOf(l.f), x - fw / 2, y - fh + 6 * s, fw, fh); });
    for (const e of embers) { e.y -= e.s * dt; e.x += Math.sin(ts / 900 + e.r * 3) * .0006; if (e.y < 0) { e.y = 1; e.x = Math.random(); } g.fillStyle = e.s > .06 ? '#ffd76a' : '#ff7a2b'; g.globalAlpha = .4 + e.s * 7; g.fillRect(e.x * W, e.y * H, e.r, e.r); } g.globalAlpha = 1;
  };
  requestAnimationFrame(frame);
}

// ---------- classes ----------
function classes() {
  const box = $('#classlist'); box.replaceChildren();
  for (const k of Object.keys(CLASSES)) {
    const c = CLASSES[k], l = LINE.find(x => x.c === k)!, card = el('article', 'cls'), cv = document.createElement('canvas'); cv.width = 240; cv.height = 240; const g = cv.getContext('2d')!, gear = { helm: `${l.s}_helm`, armor: `${l.s}_armor`, pants: `${l.s}_pants`, boots: `${l.s}_boots`, weapon: l.w }, wf = wingSprites(k, 1)[2], f = heroSprites(lookFromGear(c.name, HAIR_COLORS[l.hc], l.hs, gear))[0][0], s = 3;
    g.imageSmoothingEnabled = true; g.drawImage(wf, 120 - wf.width / 2 * s / 2, 212 - (27 + WING_ROOT) * s, wf.width / 2 * s, wf.height / 2 * s); g.imageSmoothingEnabled = false; g.drawImage(hdOf(f), 120 - FRAME_W * s / 2, 212 - FRAME_H * s + 6 * s, FRAME_W * s, FRAME_H * s);
    const t = el('div', 'clst'); t.append(el('h3', '', c.name), el('p', '', c.desc)); const sk = el('ul'); c.skills.forEach(x => sk.append(el('li', '', x.name))); t.append(sk, el('small', '', `Sets: ${Object.values(SETS).filter(x => x.cls === k).sort((a, b) => a.lvl - b.lvl).map(x => x.name).join(', ')}`)); card.append(cv, t); box.append(card);
  }
}

// ---------- ranking e situação ----------
let ranking: any[] = [];
function drawRank() {
  const f = $<HTMLSelectElement>('#rankf').value, list = f ? ranking.filter(r => r.class === f) : ranking, b = $('#rankb'); b.replaceChildren();
  list.forEach((r, i) => { const tr = el('tr', i < 3 ? 'top' : ''); for (const v of [i + 1, r.name, r.class, r.resets, r.ml, r.level]) tr.append(el('td', '', v)); b.append(tr); });
  if (!list.length) { const tr = el('tr'), td = el('td', '', 'Nenhum herói ainda. Seja o primeiro!'); td.setAttribute('colspan', '6'); tr.append(td); b.append(tr); }
  const side = $('#ranks'); side.replaceChildren(); ranking.slice(0, 5).forEach((r, i) => { const row = el('li'); row.append(el('b', '', `${i + 1}. ${r.name}`), el('span', '', `R${r.resets} · Nv ${r.level}`)); side.append(row); }); if (!ranking.length) side.append(el('li', '', 'Sem heróis ainda.'));
}
async function loadPublic() {
  try { const s = await api('status'); $('#online').textContent = fmt(s.online); $('#accs').textContent = fmt(s.accounts); $('#chars').textContent = fmt(s.characters); $('#rx').textContent = `x${s.xp}`; $('#rd').textContent = `x${s.drop}`; $('#rg').textContent = `x${s.gold}`; $('#rr').textContent = s.resetLevel; document.querySelectorAll('.v-rl').forEach(e => e.textContent = s.resetLevel); document.querySelectorAll('.v-rg').forEach(e => e.textContent = fmt(s.resetGold)); document.querySelectorAll('.v-rp').forEach(e => e.textContent = fmt(s.resetPoints)); } catch { $('#online').textContent = '—'; }
  try { ranking = (await api('ranking')).ranking; drawRank(); } catch { /* sem conexão */ }
}

// ---------- conta ----------
let regMode = false;
function authBox(msg = '') {
  const box = $('#auth'); box.replaceChildren(); const f = el('form') as HTMLFormElement, m = el('div', 'err', msg), inp = (n: string, ph: string, t = 'text') => { const i = document.createElement('input'); i.name = n; i.placeholder = ph; i.type = t; i.required = true; i.autocomplete = (n === 'password' ? (regMode ? 'new-password' : 'current-password') : n) as AutoFill; return i; };
  f.append(el('h3', '', regMode ? 'Criar conta' : 'Entrar'), inp('username', 'Usuário')); if (regMode) f.append(inp('email', 'E-mail', 'email')); f.append(inp('password', 'Senha', 'password')); if (regMode) { f.append(inp('confirm', 'Confirmar senha', 'password')); const l = el('label', 'chk'), c = document.createElement('input'); c.type = 'checkbox'; c.name = 'terms'; l.append(c, ' Aceito os termos de uso'); f.append(l); } f.append(m); const b = el('button', 'gold', regMode ? 'Cadastrar' : 'Entrar'); f.append(b); const sw = el('button', 'lnk', regMode ? 'Já tenho conta' : 'Criar conta'); (sw as HTMLButtonElement).type = 'button'; sw.onclick = () => { regMode = !regMode; authBox(); }; f.append(sw);
  f.onsubmit = async e => { e.preventDefault(); const d = new FormData(f), v: any = Object.fromEntries(d); if (regMode) v.terms = d.get('terms') === 'on'; try { await api(regMode ? 'register' : 'login', v); regMode = false; await account(); location.hash = 'conta'; show('conta'); } catch (x: any) { m.textContent = x.message; } };
  box.append(f);
}
function charCard(c: any, reload: () => void) {
  const card = el('article', 'char'), cv = document.createElement('canvas'); cv.width = 200; cv.height = 230; const g = cv.getContext('2d')!, s = 3, wk = c.gear.wings as string | undefined, f = heroSprites(lookFromGear(c.class, HAIR_COLORS[c.hair_color], c.hair_style, c.gear))[0][0];
  if (wk && ITEMS[wk]) { const wf = wingSprites(ITEMS[wk].cls!, ITEMS[wk].wtier!)[2]; g.imageSmoothingEnabled = true; g.drawImage(wf, 100 - wf.width / 2 * s / 2, 210 - (27 + WING_ROOT) * s, wf.width / 2 * s, wf.height / 2 * s); } g.imageSmoothingEnabled = false; g.drawImage(hdOf(f), 100 - FRAME_W * s / 2, 210 - FRAME_H * s + 6 * s, FRAME_W * s, FRAME_H * s);
  const info = el('div', 'info2'); info.append(el('h3', '', c.name), el('p', '', `${c.class} · Nível ${c.level} · Reset ${c.resets} · Master ${c.master_level}`), el('p', 'dim', `Moedas: ${fmt(c.gold)}`));
  const left = el('div', 'pts'); const add: Record<string, number> = { str: 0, agi: 0, vit: 0, ene: 0 }, used = () => add.str + add.agi + add.vit + add.ene, sync = () => { left.textContent = `Pontos livres: ${fmt(c.points - used())}`; for (const k in add) { (rows[k].querySelector('input') as HTMLInputElement).value = String(add[k]); rows[k].querySelector('b')!.textContent = fmt(c[k] + add[k]); } (go as HTMLButtonElement).disabled = !used(); };
  const go = el('button', 'gold', 'Aplicar pontos'), rows: Record<string, HTMLElement> = {}, m = el('div', 'err'); info.append(left);
  for (const [k, n] of [['str', 'Força'], ['agi', 'Agilidade'], ['vit', 'Vitalidade'], ['ene', 'Energia']]) { const r = el('div', 'stat'); r.append(el('span', '', n), el('b', '', fmt(c[k]))); const i = document.createElement('input'); i.type = 'number'; i.min = '0'; i.value = '0'; i.setAttribute('aria-label', n); i.oninput = () => { const other = used() - add[k]; add[k] = Math.max(0, Math.min(c.points - other, Math.floor(+i.value) || 0)); sync(); }; r.append(i); for (const q of [10, 100]) { const b = el('button', 'mini', `+${q}`) as HTMLButtonElement; b.type = 'button'; b.onclick = () => { add[k] += Math.min(q, c.points - used()); sync(); }; r.append(b); } const mx = el('button', 'mini', 'Máx') as HTMLButtonElement; mx.type = 'button'; mx.onclick = () => { add[k] += c.points - used(); sync(); }; r.append(mx); rows[k] = r; info.append(r); }
  go.onclick = async () => { m.className = 'err'; m.textContent = ''; try { await api(`characters/${c.id}/points`, add); reload(); } catch (x: any) { m.textContent = x.message; } }; const foot = el('div', 'foot'); foot.append(go); info.append(foot, m); card.append(cv, info); sync(); return card;
}
function pwBox() {
  const d = el('details', 'pwb'), f = el('form') as HTMLFormElement, m = el('div', 'err'), inp = (n: string, ph: string, ac: AutoFill) => { const i = document.createElement('input'); i.name = n; i.type = 'password'; i.placeholder = ph; i.required = true; i.autocomplete = ac; return i; }, b = el('button', 'gold', 'Salvar nova senha');
  d.append(el('summary', '', 'Alterar senha')); f.append(inp('current', 'Senha atual', 'current-password'), inp('password', 'Nova senha (mínimo 8 caracteres)', 'new-password'), inp('confirm', 'Confirmar nova senha', 'new-password'), m, b);
  f.onsubmit = async e => { e.preventDefault(); m.className = 'err'; m.textContent = ''; try { await api('password', Object.fromEntries(new FormData(f))); f.reset(); m.className = 'okm'; m.textContent = 'Senha alterada. Outros dispositivos foram desconectados.'; } catch (x: any) { m.textContent = x.message; } };
  d.append(f); return d;
}
async function account() {
  let me: any; try { me = await api('site/characters'); } catch { $('#acc').replaceChildren(el('p', 'dim', 'Entre com sua conta na coluna ao lado para ver seus personagens e distribuir pontos.')); $('#nav-out').style.display = 'none'; authBox(); return; }
  $('#nav-out').style.display = ''; const box = $('#auth'); box.replaceChildren(el('h3', '', `Olá, ${me.username}`)); const play = el('a', 'gold', 'Jogar agora') as HTMLAnchorElement; play.href = '/jogar'; const out = el('button', 'lnk', 'Sair'); out.onclick = logout; box.append(play); if (me.admin) { const a = el('a', 'lnk', 'Painel Admin') as HTMLAnchorElement; a.href = '/admin'; box.append(a); } box.append(out);
  const list = $('#acc'); list.replaceChildren(pwBox()); if (!me.characters.length) { const a = el('a', 'gold', 'Criar personagem no jogo') as HTMLAnchorElement; a.href = '/jogar'; list.append(el('p', 'dim', 'Você ainda não tem personagens.'), a); return; } for (const c of me.characters) list.append(charCard(c, account));
}
async function logout() { await api('logout', {}).catch(() => {}); await account(); }
$('#nav-out').onclick = logout;

const PAGES = ['inicio', 'conta', 'ranking', 'classes', 'ajuda'];
function show(p: string) { const k = PAGES.includes(p) ? p : 'inicio'; for (const x of PAGES) { $('#p-' + x).style.display = x === k ? 'block' : 'none'; document.querySelector(`[href="#${x}"]`)?.classList.toggle('on', x === k); } if (k !== 'inicio') scrollTo({ top: Math.min(420, $('#hero').offsetHeight), behavior: 'smooth' }); }
addEventListener('hashchange', () => show(location.hash.slice(1)));
$('#rankf').onchange = drawRank;
for (const c of Object.values(CLASSES)) { const o = document.createElement('option'); o.value = c.name; o.textContent = c.name; $('#rankf').append(o); }
void MOBS; void WING_THEME;
heroScene(); classes(); loadPublic(); account(); show(location.hash.slice(1)); setInterval(loadPublic, 60000);
