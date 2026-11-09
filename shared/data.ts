// Regras e conteúdo do jogo. Todos os números de balanceamento ficam aqui.
export const CONFIG = {
  tickMs: 100, aoiRadius: 22, pointsPerLevel: 5, maxLevel: 400, playerSpeed: 5,
  attackRange: 1.7, invSize: 40, startGold: 100, saveEveryMs: 10000, dropOwnMs: 15000, dropLifeMs: 60000,
};
export type Slot = 'weapon' | 'helm' | 'armor' | 'pants' | 'boots';
export const SLOTS: Slot[] = ['weapon', 'helm', 'armor', 'pants', 'boots'];
export const SLOT_NAMES: Record<Slot, string> = { weapon: 'Arma', helm: 'Elmo', armor: 'Armadura', pants: 'Calças', boots: 'Botas' };
export interface ItemDef {
  key: string; name: string; kind: Slot | 'potion' | 'material'; lvl: number; price: number;
  dmg?: number; def?: number; hp?: number; heal?: number; mana?: number; tint?: string; blade?: string;
}
export const ITEMS: Record<string, ItemDef> = Object.fromEntries(([
  { key: 'pot_hp', name: 'Poção de Vida', kind: 'potion', lvl: 1, price: 20, heal: 80 },
  { key: 'pot_mp', name: 'Poção de Mana', kind: 'potion', lvl: 1, price: 20, mana: 50 },
  { key: 'shard', name: 'Estilhaço Gélido', kind: 'material', lvl: 1, price: 15 },
  { key: 'short_sword', name: 'Espada Curta', kind: 'weapon', lvl: 1, price: 120, dmg: 8, blade: '#cfd8e3' },
  { key: 'iron_axe', name: 'Machado de Ferro', kind: 'weapon', lvl: 8, price: 700, dmg: 20, blade: '#9aa7b5' },
  { key: 'frost_blade', name: 'Lâmina Boreal', kind: 'weapon', lvl: 18, price: 3500, dmg: 42, blade: '#7fe3ff' },
  { key: 'leather_helm', name: 'Capuz de Couro', kind: 'helm', lvl: 1, price: 90, def: 3, tint: '#7a5230' },
  { key: 'leather_armor', name: 'Gibão de Couro', kind: 'armor', lvl: 1, price: 150, def: 6, hp: 20, tint: '#7a5230' },
  { key: 'leather_pants', name: 'Calças de Couro', kind: 'pants', lvl: 1, price: 100, def: 4, tint: '#5e4026' },
  { key: 'leather_boots', name: 'Botas de Couro', kind: 'boots', lvl: 1, price: 80, def: 2, tint: '#4b3320' },
  { key: 'rime_helm', name: 'Elmo de Escarcha', kind: 'helm', lvl: 12, price: 1500, def: 11, hp: 40, tint: '#6aa9d8' },
  { key: 'rime_armor', name: 'Couraça de Escarcha', kind: 'armor', lvl: 12, price: 2400, def: 20, hp: 90, tint: '#5b9bd0' },
  { key: 'rime_pants', name: 'Grevas de Escarcha', kind: 'pants', lvl: 12, price: 1700, def: 14, hp: 50, tint: '#477fb0' },
  { key: 'rime_boots', name: 'Botas de Escarcha', kind: 'boots', lvl: 12, price: 1300, def: 8, hp: 30, tint: '#3c6c98' },
] as ItemDef[]).map(i => [i.key, i]));
export const RARITY = [
  { name: 'Comum', mult: 1, color: '#e8e6df' }, { name: 'Incomum', mult: 1.25, color: '#6fdc7e' }, { name: 'Raro', mult: 1.6, color: '#68b6ff' },
];
export const SHOPS: Record<string, string[]> = {
  alquimista: ['pot_hp', 'pot_mp'],
  ferreira: ['short_sword', 'leather_helm', 'leather_armor', 'leather_pants', 'leather_boots'],
};
export interface MobDef {
  key: string; name: string; level: number; hp: number; dmg: number; def: number; speed: number; detect: number; leash: number;
  attackMs: number; xp: number; respawnMs: number; gold: [number, number]; drops: [string, number][]; boss?: boolean;
}
export const MOBS: Record<string, MobDef> = {
  slime: { key: 'slime', name: 'Gelatina Gélida', level: 2, hp: 45, dmg: 9, def: 1, speed: 1.6, detect: 4.5, leash: 10, attackMs: 1500, xp: 20, respawnMs: 8000, gold: [3, 9],
    drops: [['pot_hp', .12], ['shard', .2], ['leather_boots', .03], ['leather_helm', .03]] },
  wolf: { key: 'wolf', name: 'Lobo Geladiço', level: 7, hp: 150, dmg: 22, def: 7, speed: 3.4, detect: 7, leash: 13, attackMs: 1200, xp: 70, respawnMs: 12000, gold: [10, 25],
    drops: [['pot_hp', .15], ['pot_mp', .1], ['shard', .25], ['leather_armor', .04], ['leather_pants', .04], ['iron_axe', .02]] },
  golem: { key: 'golem', name: 'Colosso de Granizo', level: 14, hp: 520, dmg: 44, def: 20, speed: 1.9, detect: 6, leash: 12, attackMs: 1800, xp: 240, respawnMs: 20000, gold: [35, 80],
    drops: [['pot_hp', .25], ['shard', .4], ['iron_axe', .05], ['rime_helm', .03], ['rime_boots', .03], ['rime_pants', .025], ['rime_armor', .02]] },
  boss: { key: 'boss', name: 'Hrímara, a Soberana', level: 24, hp: 6500, dmg: 70, def: 32, speed: 2.7, detect: 9, leash: 16, attackMs: 1400, xp: 4000, respawnMs: 600000, gold: [800, 1500], boss: true,
    drops: [['frost_blade', .5], ['rime_armor', .5], ['rime_helm', .5], ['pot_hp', 1], ['pot_mp', 1]] },
};
export const SKILLS = [
  { n: 1, name: 'Golpe Circular', mana: 12, cd: 4000, mult: 1.3, radius: 2.4 },
  { n: 2, name: 'Investida', mana: 18, cd: 7000, mult: 2, range: 7 },
];
export const BASE_STATS = { str: 28, agi: 20, vit: 25, ene: 10 };
export const CLASS_NAME = 'Dark Warrior';
export const HAIR_COLORS = ['#2b2230', '#7a4a22', '#d9b24a', '#b23a2e', '#d8dde6', '#3f6fb5'];
export const HAIR_STYLES = ['Curto', 'Espetado', 'Longo'];
export const xpToNext = (lv: number) => Math.floor(50 * Math.pow(lv, 1.9) + 40);

export interface Base { level: number; str: number; agi: number; vit: number; ene: number }
export interface ItemInst { id: string; key: string; qty: number; slot: number; equip: string | null; rarity: number }
export const itemStat = (i: ItemInst, f: 'dmg' | 'def' | 'hp') => Math.round((ITEMS[i.key][f] ?? 0) * RARITY[i.rarity].mult);
export function derive(b: Base, items: ItemInst[]) {
  let dmg = 0, def = 0, hp = 0;
  for (const i of items) if (i.equip) { dmg += itemStat(i, 'dmg'); def += itemStat(i, 'def'); hp += itemStat(i, 'hp'); }
  return {
    maxHp: Math.floor(70 + b.level * 3 + b.vit * 3 + hp), maxMp: Math.floor(20 + b.level + b.ene * 2),
    atk: Math.floor(b.str / 3 + dmg), def: Math.floor(b.agi / 5 + def),
    attackMs: Math.max(350, 1000 - b.agi * 3), crit: Math.min(.4, .05 + b.agi * .0007), dodge: Math.min(.3, b.agi * .0008),
  };
}
export const rollDamage = (atk: number, def: number, rnd: number) => Math.max(1, Math.round((atk - def * .6) * (.85 + rnd * .3)));
