// Chefe Mundial: a cada 2 horas um chefe desperto aparece num mundo de caça, em rodízio.
// A agenda é calculada pelo relógio, então o site, o jogo e todas as salas sabem a mesma coisa sem conversar entre si.
export const WB_EVERY = 2 * 3600000, WB_OFFSET = 3600000, WB_LIFE = 20 * 60000, WB_WARN = 5 * 60000;
export const WB_MAPS = ['frostvale', 'eldergrove', 'infernal', 'ashen', 'celestial', 'dunas', 'pantano', 'cume', 'vulcao', 'necropole', 'sombria', 'abismo', 'caos', 'vazio'];
export const WB_NAMES: Record<string, [string, number]> = { frostvale: ['Frostvale', 2], eldergrove: ['Eldergrove', 11], infernal: ['Infernal Dominion', 22], ashen: ['Ashen Depths', 33], celestial: ['Celestial Ruins', 62], dunas: ['Dunas de Solmira', 70], pantano: ['Pântano Venenoso', 120], cume: ['Cume Glacial', 150], vulcao: ['Coração do Vulcão', 180], necropole: ['Necrópole Esquecida', 210], sombria: ['Floresta Sombria', 240], abismo: ['Abismo Cristalino', 270], caos: ['Trono do Caos', 300], vazio: ['Vazio Eterno', 340] };
export const WB_HP = 10, WB_DMG = 1.25;
/** Evento da janela que contém `now` (ou o próximo, se `next`). start em ms desde 1970. */
export function worldBoss(now: number, next = false) {
  let slot = Math.floor((now - WB_OFFSET) / WB_EVERY); if (next && now >= slot * WB_EVERY + WB_OFFSET) slot++;
  return { slot, map: WB_MAPS[((slot % WB_MAPS.length) + WB_MAPS.length) % WB_MAPS.length], start: slot * WB_EVERY + WB_OFFSET };
}
/** Próximos `n` chefes mundiais a partir de agora (o que está acontecendo entra primeiro, se ainda estiver ativo). */
export function upcomingBosses(now: number, n = 4) {
  const cur = worldBoss(now), out = [] as { slot: number; map: string; start: number; live: boolean }[];
  if (now < cur.start + WB_LIFE) out.push({ ...cur, live: now >= cur.start });
  for (let s = cur.slot + 1; out.length < n; s++) out.push({ slot: s, map: WB_MAPS[s % WB_MAPS.length], start: s * WB_EVERY + WB_OFFSET, live: false });
  return out;
}
