// Conquistas: metas com recompensa e título. Os contadores ficam na coluna characters.ach (JSON),
// gravados junto com o resto do personagem (nenhuma linha extra no banco).
export interface Ach { id: string; cat: string; name: string; desc: string; stat: string; goal: number; gold: number; items?: [string, number][]; title?: string }
export const ACH_CATS = ['Caça', 'Chefes e eventos', 'Evolução', 'Equipamentos', 'Social'];
const A = (cat: number, id: string, name: string, desc: string, stat: string, goal: number, gold: number, items?: [string, number][], title?: string): Ach => ({ id, cat: ACH_CATS[cat], name, desc, stat, goal, gold, items, title });
export const ACHIEVEMENTS: Ach[] = [
  A(0, 'k1', 'Primeiro sangue', 'Derrote 100 monstros', 'k', 100, 20000, [['pot_hp2', 20]]),
  A(0, 'k2', 'Caçador', 'Derrote 1.000 monstros', 'k', 1000, 200000, [['jewel_aurora', 3]], 'Caçador'),
  A(0, 'k3', 'Exterminador', 'Derrote 10.000 monstros', 'k', 10000, 2000000, [['jewel_destiny', 3], ['box_ouro', 2]], 'Exterminador'),
  A(0, 'k4', 'Lenda da caça', 'Derrote 100.000 monstros', 'k', 100000, 20000000, [['jewel_eclipse', 5], ['box_mitico', 3]], 'Lenda da Caça'),
  A(0, 'gd1', 'Ouro vivo', 'Derrote 10 monstros dourados da Invasão Dourada', 'g', 10, 300000, [['box_ouro', 1]]),
  A(0, 'gd2', 'Caçador de ouro', 'Derrote 200 monstros dourados', 'g', 200, 5000000, [['box_mitico', 2]], 'Caçador de Ouro'),
  A(0, 'q1', 'Ajudante do reino', 'Conclua 10 missões da Capitã Lyra', 'q', 10, 500000, [['jewel_destiny', 2]]),
  A(0, 'q2', 'Herói do reino', 'Conclua 60 missões', 'q', 60, 10000000, [['jewel_eclipse', 5]], 'Herói do Reino'),
  A(1, 'b1', 'Matador de chefes', 'Derrote um chefe', 'b', 1, 100000, [['jewel_aurora', 2]]),
  A(1, 'b2', 'Caçador de chefes', 'Derrote 25 chefes', 'b', 25, 3000000, [['box_rei', 2]], 'Matador de Chefes'),
  A(1, 'b3', 'Flagelo dos chefes', 'Derrote 200 chefes', 'b', 200, 25000000, [['box_mitico', 3], ['jewel_eclipse', 5]], 'Flagelo dos Chefes'),
  A(1, 'w1', 'Contra o desperto', 'Ajude a derrotar um Chefe Mundial', 'w', 1, 500000, [['box_ouro', 1]]),
  A(1, 'w2', 'Desafiante do Eclipse', 'Ajude a derrotar 20 Chefes Mundiais', 'w', 20, 15000000, [['box_mitico', 2], ['chaos_feather', 5]], 'Desafiante do Eclipse'),
  A(1, 'ar1', 'Desafiante da arena', 'Participe da Arena dos Demônios', 'ar', 1, 300000, [['jewel_destiny', 2]]),
  A(1, 'ar2', 'Campeão da arena', 'Participe de 25 Arenas dos Demônios', 'ar', 25, 15000000, [['box_mitico', 2]], 'Campeão da Arena'),
  A(1, 'd1', 'Primeiro duelo', 'Vença um duelo', 'd', 1, 50000),
  A(1, 'd2', 'Duelista', 'Vença 25 duelos', 'd', 25, 2000000, [['jewel_destiny', 3]], 'Duelista'),
  A(1, 'd3', 'Gladiador', 'Vença 100 duelos', 'd', 100, 10000000, [['jewel_eclipse', 5]], 'Gladiador'),
  A(2, 'l1', 'Aventureiro', 'Chegue ao nível 50', 'lv', 50, 50000, [['pot_hp2', 30], ['pot_mp2', 30]]),
  A(2, 'l2', 'Veterano', 'Chegue ao nível 150', 'lv', 150, 500000, [['jewel_destiny', 2]]),
  A(2, 'l3', 'Campeão', 'Chegue ao nível 300', 'lv', 300, 3000000, [['box_rei', 1]]),
  A(2, 'l4', 'No topo', 'Chegue ao nível 400', 'lv', 400, 8000000, [['box_mitico', 1]], 'Veterano'),
  A(2, 'r1', 'Renascido', 'Faça o primeiro reset', 'rs', 1, 1000000, [['jewel_destiny', 3]], 'Renascido'),
  A(2, 'r2', 'Incansável', 'Chegue a 10 resets', 'rs', 10, 10000000, [['jewel_eclipse', 5]], 'Incansável'),
  A(2, 'r3', 'Imortal', 'Chegue a 25 resets', 'rs', 25, 30000000, [['box_mitico', 3]], 'Imortal'),
  A(2, 'm1', 'Mestre supremo', 'Faça um Master Reset', 'mr', 1, 50000000, [['box_mitico', 5], ['void_crystal', 3]], 'Mestre Supremo'),
  A(2, 'm2', 'Caminho do mestre', 'Chegue ao Master Level 100', 'ml', 100, 20000000, [['jewel_eclipse', 10]]),
  A(2, 'm3', 'Grão-mestre', 'Chegue ao Master Level 200', 'ml', 200, 60000000, [['box_mitico', 5]], 'Grão-Mestre'),
  A(3, 'p1', 'Brilho próprio', 'Melhore um item até +9', 'pl', 9, 1000000, [['jewel_destiny', 3]]),
  A(3, 'p2', 'Ourives', 'Melhore um item até +13', 'pl', 13, 8000000, [['jewel_eclipse', 5]], 'Ourives'),
  A(3, 'p3', 'Lendário +15', 'Melhore um item até +15', 'pl', 15, 40000000, [['box_mitico', 5]], 'Lendário'),
  A(3, 'a1', 'Primeiro voo', 'Tenha um par de asas', 'wt', 1, 100000),
  A(3, 'a2', 'Asas imperiais', 'Tenha asas Imperiais ou melhores', 'wt', 4, 10000000, [['chaos_feather', 5]], 'Imperial'),
  A(3, 'a3', 'Asas eternas', 'Tenha asas Eternas', 'wt', 6, 50000000, [['void_crystal', 5]], 'Eterno'),
  A(3, 'x1', 'Relíquia', 'Tenha um item Ancestral', 'anc', 1, 5000000, [['jewel_eclipse', 3]], 'Guardião de Relíquias'),
  A(3, 'pt1', 'Companheiro fiel', 'Tenha um pet', 'pet', 1, 100000),
  A(3, 'pt2', 'Domador de dragões', 'Tenha o Dragão Ancestral', 'pet', 5, 30000000, [['void_crystal', 3]], 'Domador de Dragões'),
  A(4, 's1', 'Irmandade', 'Entre em uma guilda', 'gu', 1, 200000),
  A(4, 's2', 'Fundador', 'Seja o mestre de uma guilda', 'gu', 2, 2000000, [['jewel_destiny', 3]], 'Fundador'),
  A(4, 'o1', 'Poupança', 'Junte 10 milhões de moedas', 'gold', 10000000, 0, [['box_ouro', 1]]),
  A(4, 'o2', 'Magnata', 'Junte 1 bilhão de moedas', 'gold', 1000000000, 0, [['box_mitico', 3]], 'Magnata'),
];
export const ACH = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
/** Estado salvo: c = contadores, u = conquistadas (ainda sem pegar), r = recompensas recebidas, t = título escolhido. */
export interface AchState { c: Record<string, number>; u: string[]; r: string[]; t: string }
export function parseAch(s: unknown): AchState {
  try { const o = JSON.parse(String(s || '{}')); return { c: o.c && typeof o.c === 'object' ? o.c : {}, u: Array.isArray(o.u) ? o.u.filter((x: string) => ACH[x]) : [], r: Array.isArray(o.r) ? o.r.filter((x: string) => ACH[x]) : [], t: ACH[o.t]?.title ? o.t : '' }; }
  catch { return { c: {}, u: [], r: [], t: '' }; }
}

// ---------- Diário: recompensa de login (7 dias seguidos) e 3 missões do dia ----------
/** Dia corrido no horário de Brasília (UTC-3): muda à meia-noite de Brasília. */
export const dayNum = (now: number) => Math.floor((now - 3 * 3600000) / 864e5);
export const LOGIN_REWARDS: { gold: number; items: [string, number][] }[] = [
  { gold: 30000, items: [['pot_hp2', 20], ['pot_mp2', 20]] }, { gold: 60000, items: [['jewel_aurora', 3]] }, { gold: 100000, items: [['jewel_destiny', 2]] },
  { gold: 150000, items: [['box_ouro', 1]] }, { gold: 220000, items: [['jewel_eclipse', 2]] }, { gold: 300000, items: [['box_rei', 1]] }, { gold: 500000, items: [['box_mitico', 1], ['jewel_eclipse', 3]] },
];
export interface DailyTask { stat: string; goal: number; name: string; item: [string, number] }
const TASKS: DailyTask[] = [
  { stat: 'b', goal: 1, name: 'Derrote 1 chefe', item: ['box_ouro', 1] },
  { stat: 'q', goal: 2, name: 'Conclua 2 missões da Capitã Lyra', item: ['jewel_destiny', 2] },
  { stat: 'w', goal: 1, name: 'Ajude a derrotar um Chefe Mundial', item: ['box_rei', 1] },
  { stat: 'g', goal: 5, name: 'Derrote 5 monstros dourados', item: ['jewel_eclipse', 1] },
  { stat: 'd', goal: 1, name: 'Vença um duelo', item: ['jewel_destiny', 2] },
  { stat: 'ar', goal: 1, name: 'Participe da Arena dos Demônios', item: ['box_ouro', 1] },
];
/** As 3 missões do dia: sempre "derrotar monstros" e mais 2 que mudam todo dia (iguais para todo mundo). */
export function dailyTasks(day: number): DailyTask[] {
  const a = day % TASKS.length, b = (a + 1 + (Math.floor(day / TASKS.length) % (TASKS.length - 1))) % TASKS.length;
  return [{ stat: 'k', goal: 400, name: 'Derrote 400 monstros', item: ['jewel_aurora', 3] }, TASKS[a], TASKS[b === a ? (a + 1) % TASKS.length : b]];
}
/** Moedas do Diário crescem com o nível do personagem (resets contam como 400 níveis). */
export const dailyGold = (base: number, level: number, resets: number) => Math.round(base * (1 + (Math.min(level + resets * 400, 4000)) / 200));
