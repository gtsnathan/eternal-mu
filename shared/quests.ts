// Missões de caça da Capitã Lyra (Valoria e Solmira): uma por vez, repetíveis, geradas a partir dos monstros de cada mundo.
import { MOBS } from './data';
import { MAP_IDS, getMap } from './world';

export interface Quest { id: string; mob: string; map: string; name: string; need: number; lvl: number; xp: number; gold: number; items: [string, number][]; boss: boolean }
let cache: Record<string, Quest> | null = null;
/** Lista criada só na primeira vez que alguém precisa (gerar os mapas custa um pouco). */
export function quests(): Record<string, Quest> {
  if (cache) return cache; const q: Record<string, Quest> = {};
  for (const id of MAP_IDS) {
    const m = getMap(id); if (m.safe) continue;
    for (const k of new Set(m.zones.map(z => z.mob))) {
      const d = MOBS[k]; if (!d || q[`q_${k}`]) continue; const L = d.level, boss = !!d.boss;
      const need = boss ? 1 : L < 30 ? 25 : L < 100 ? 40 : 50, avgGold = (d.gold[0] + d.gold[1]) / 2;
      const jewel = L < 40 ? 'jewel_aurora' : L < 90 ? 'jewel_destiny' : 'jewel_eclipse', box = L < 30 ? 'box_bronze' : L < 60 ? 'box_prata' : L < 120 ? 'box_ouro' : 'box_mitico';
      q[`q_${k}`] = { id: `q_${k}`, mob: k, map: m.name, boss, need, lvl: Math.max(1, L - 8), name: boss ? `Derrotar ${d.name}` : `Caçar ${need} ${d.name}`,
        xp: Math.round(d.xp * need * (boss ? 1 : .25)), gold: Math.round(avgGold * need * (boss ? 3 : 1.5)),
        items: boss ? [[L >= 120 ? 'box_mitico' : L >= 60 ? 'box_rei' : 'box_ouro', 1], [jewel, 3]] : [[box, 1], [jewel, L < 120 ? 1 : 2]] };
    }
  }
  return cache = q;
}
