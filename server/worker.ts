import { CLASSES, CONFIG, derive, HAIR_COLORS, HAIR_STYLES } from '../shared/data';
import { getMap, MAP_IDS } from '../shared/world';
export { MapRoom } from './room';

const SESSION_MS = 30 * 864e5, COOKIE = 'em_session', ITER = 100000;
const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b as ArrayBuffer)].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = (s: string) => new Uint8Array(s.match(/../g)!.map(h => parseInt(h, 16)));
const json = (d: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });
const err = (m: string, status = 400) => json({ error: m }, status);

async function derivePw(pw: string, salt: Uint8Array, iter: number) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: iter }, k, 256));
}
async function hashPw(pw: string) { const salt = crypto.getRandomValues(new Uint8Array(16)); return `pbkdf2$${ITER}$${hex(salt)}$${hex(await derivePw(pw, salt, ITER))}`; }
async function verifyPw(pw: string, stored: string) {
  const [, it, s, h] = stored.split('$'); const got = await derivePw(pw, unhex(s), +it), want = unhex(h);
  let d = got.length ^ want.length; for (let i = 0; i < got.length; i++) d |= got[i] ^ want[i]; return d === 0;
}
const DUMMY = `pbkdf2$${ITER}$00000000000000000000000000000000$${'0'.repeat(64)}`;
const sha = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

/** Conta uma tentativa de forma atômica; devolve false se passou do limite. */
async function limit(db: D1Database, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const row = await db.prepare(`INSERT INTO rate_limits(key,count,window_start) VALUES(?1,1,?2)
    ON CONFLICT(key) DO UPDATE SET count = CASE WHEN window_start < ?3 THEN 1 ELSE count+1 END, window_start = CASE WHEN window_start < ?3 THEN ?2 ELSE window_start END
    RETURNING count`).bind(key, now, now - windowMs).first<{ count: number }>();
  return row!.count <= max;
}
function readCookie(req: Request) { const m = (req.headers.get('cookie') ?? '').match(new RegExp(`(?:^|; )${COOKIE}=([a-f0-9]{64})`)); return m?.[1] ?? null; }
async function auth(req: Request, env: Env) {
  const t = readCookie(req); if (!t) return null;
  const r = await env.DB.prepare('SELECT a.id, a.username FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?').bind(await sha(t), Date.now()).first<{ id: number; username: string }>();
  return r;
}
async function startSession(req: Request, env: Env, accountId: number, username: string) {
  const tok = hex(crypto.getRandomValues(new Uint8Array(32))), now = Date.now();
  await env.DB.prepare('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)').bind(await sha(tok), accountId, now + SESSION_MS, now).run();
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return json({ username }, 200, { 'set-cookie': `${COOKIE}=${tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MS / 1000}${secure}` });
}
const sameOrigin = (req: Request) => { const o = req.headers.get('origin'); return !o || new URL(o).host === new URL(req.url).host; };
const ip = (req: Request) => req.headers.get('cf-connecting-ip') ?? 'local';

async function listChars(env: Env, acc: number) {
  const { results } = await env.DB.prepare('SELECT id,name,class,hair_color,hair_style,level,map FROM characters WHERE account_id=? ORDER BY id').bind(acc).all();
  return results;
}
async function api(req: Request, env: Env, path: string): Promise<Response> {
  if (req.method === 'POST' && (!sameOrigin(req) || !(req.headers.get('content-type') ?? '').includes('application/json'))) return err('Requisição inválida.', 403);
  const body: any = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const db = env.DB;
  if (path === '/api/register' && req.method === 'POST') {
    const { username, email, password, confirm, terms } = body;
    if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,16}$/.test(username)) return err('Usuário: 3 a 16 letras, números ou _.');
    if (typeof email !== 'string' || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('E-mail inválido.');
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) return err('A senha precisa ter de 8 a 128 caracteres.');
    if (password !== confirm) return err('As senhas não coincidem.');
    if (terms !== true) return err('É preciso aceitar os termos de uso.');
    if (!await limit(db, `reg:${ip(req)}`, 8, 36e5)) return err('Muitos cadastros. Tente mais tarde.', 429);
    const now = Date.now();
    try {
      const r = await db.prepare('INSERT INTO accounts(username,email,pass_hash,terms_at,created_at) VALUES(?,?,?,?,?) RETURNING id').bind(username, email, await hashPw(password), now, now).first<{ id: number }>();
      return startSession(req, env, r!.id, username);
    } catch { return err('Usuário ou e-mail já cadastrado.', 409); }
  }
  if (path === '/api/login' && req.method === 'POST') {
    const { username, password } = body;
    if (typeof username !== 'string' || typeof password !== 'string' || password.length > 128) return err('Usuário ou senha incorretos.', 401);
    if (!await limit(db, `login:${ip(req)}:${username.toLowerCase().slice(0, 32)}`, 10, 9e5)) return err('Muitas tentativas. Aguarde 15 minutos.', 429);
    const a = await db.prepare('SELECT id,username,pass_hash FROM accounts WHERE username=?').bind(username).first<{ id: number; username: string; pass_hash: string }>();
    const ok = await verifyPw(password, a?.pass_hash ?? DUMMY);
    if (!a || !ok) return err('Usuário ou senha incorretos.', 401);
    return startSession(req, env, a.id, a.username);
  }
  const me = await auth(req, env);
  if (!me) return err('Sessão expirada.', 401);
  const clear = { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` };
  if (path === '/api/logout' && req.method === 'POST') { await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(readCookie(req)!)).run(); return json({ ok: 1 }, 200, clear); }
  if (path === '/api/logout-all' && req.method === 'POST') { await db.prepare('DELETE FROM sessions WHERE account_id=?').bind(me.id).run(); return json({ ok: 1 }, 200, clear); }
  if (path === '/api/me') return json({ username: me.username, characters: await listChars(env, me.id) });
  if (path === '/api/characters' && req.method === 'POST') {
    const { name, hairColor, hairStyle } = body, cdef = Object.hasOwn(CLASSES, body.cls ?? 'dark_warrior') ? CLASSES[body.cls ?? 'dark_warrior'] : null;
    if (!cdef) return err('Classe inválida.');
    if (typeof name !== 'string' || !/^[\p{L}0-9_]{3,14}$/u.test(name)) return err('Nome: 3 a 14 letras ou números.');
    if (!Number.isInteger(hairColor) || hairColor < 0 || hairColor >= HAIR_COLORS.length || !Number.isInteger(hairStyle) || hairStyle < 0 || hairStyle >= HAIR_STYLES.length) return err('Aparência inválida.');
    const b = cdef.base, m = getMap('valoria'), st = derive({ cls: cdef.name, level: 1, ...b }, []);
    let row: { id: number } | null;
    try {
      row = await db.prepare(`INSERT INTO characters(account_id,name,class,hair_color,hair_style,str,agi,vit,ene,hp,mp,gold,map,x,y,created_at)
        SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM characters WHERE account_id=?)<5 RETURNING id`)
        .bind(me.id, name, cdef.name, hairColor, hairStyle, b.str, b.agi, b.vit, b.ene, st.maxHp, st.maxMp, CONFIG.startGold, 'valoria', m.spawn.x, m.spawn.y, Date.now(), me.id).first();
    } catch { return err('Esse nome já está em uso.', 409); }
    if (!row) return err('Limite de 5 personagens atingido.');
    const ins = 'INSERT INTO items(id,char_id,item_key,qty,slot,equip,rarity) VALUES(?,?,?,?,?,?,0)';
    await db.batch([db.prepare(ins).bind(crypto.randomUUID(), row.id, cdef.weapon, 1, -1, 'weapon'), db.prepare(ins).bind(crypto.randomUUID(), row.id, 'pot_hp', 5, 0, null), db.prepare(ins).bind(crypto.randomUUID(), row.id, 'pot_mp', 3, 1, null)]);
    return json({ characters: await listChars(env, me.id) });
  }
  const del = path.match(/^\/api\/characters\/(\d+)\/delete$/);
  if (del && req.method === 'POST') {
    await db.batch([db.prepare('DELETE FROM items WHERE char_id=(SELECT id FROM characters WHERE id=? AND account_id=?)').bind(+del[1], me.id), db.prepare('DELETE FROM characters WHERE id=? AND account_id=?').bind(+del[1], me.id)]);
    return json({ characters: await listChars(env, me.id) });
  }
  return err('Não encontrado.', 404);
}
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/ws') {
      if (req.headers.get('upgrade')?.toLowerCase() !== 'websocket') return err('WebSocket esperado.', 426);
      if (!sameOrigin(req)) return err('Origem negada.', 403);
      const me = await auth(req, env); if (!me) return err('Sessão expirada.', 401);
      const c = await env.DB.prepare('SELECT id,map FROM characters WHERE id=? AND account_id=?').bind(Number(url.searchParams.get('char')), me.id).first<{ id: number; map: string }>();
      if (!c || !MAP_IDS.includes(c.map)) return err('Personagem inválido.', 404);
      const headers = new Headers(req.headers); headers.set('x-char', String(c.id)); headers.set('x-map', c.map);
      return env.MAP_ROOM.get(env.MAP_ROOM.idFromName(c.map + ':e'), { locationHint: 'enam' }).fetch(new Request(req.url, { headers }));
    }
    if (url.pathname.startsWith('/api/')) return api(req, env, url.pathname);
    return new Response('Not found', { status: 404 });
  },
};
