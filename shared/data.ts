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
  dmg?: number; def?: number; hp?: number; heal?: number; mana?: number; tint?: string; blade?: string; wtype?: 'sword' | 'axe' | 'staff' | 'bow'; set?: string;
}
// Sets: cada peça equipada do mesmo set soma bônus (2 peças: defesa, 3: vida, 4: ataque %)
export interface SetDef { cls?: string; key: string; name: string; of: string; lvl: number; color: string; trim: string; cape: string; power: number; price: number; bonus: { def: number; hp: number; atk: number } }
export const SETS: Record<string, SetDef> = {
  salamander: { key: 'salamander', name: 'Salamandra Arcana', of: 'da', lvl: 14, color: '#c2452d', trim: '#ffd23f', cape: '#7d2416', power: 1.4, price: 2500, bonus: { def: 6, hp: 50, atk: .07 } },
  bat: { key: 'bat', name: 'Morcego Noturno', of: 'do', lvl: 14, color: '#3b2a55', trim: '#d86bff', cape: '#21163a', power: 1.4, price: 2500, bonus: { def: 6, hp: 50, atk: .07 } },
  wolf: { key: 'wolf', name: 'Lobo Rúnico', of: 'do', lvl: 16, color: '#8a98a8', trim: '#6fd6ff', cape: '#3e4c5e', power: 1.6, price: 3500, bonus: { def: 8, hp: 80, atk: .08 } },
  spider: { key: 'spider', name: 'Aranha Viúva', of: 'da', lvl: 24, color: '#241a28', trim: '#ff3b4f', cape: '#14101a', power: 2.4, price: 12000, bonus: { def: 16, hp: 140, atk: .13 } },
  scorpion: { key: 'scorpion', name: 'Escorpião Negro', of: 'do', lvl: 25, color: '#2a2430', trim: '#e8c23a', cape: '#17131c', power: 2.5, price: 14000, bonus: { def: 17, hp: 150, atk: .13 } },
  manticore: { key: 'manticore', name: 'Mantícora Carmesim', of: 'da', lvl: 36, color: '#9a2f2f', trim: '#e0b04a', cape: '#5a1616', power: 3.8, price: 55000, bonus: { def: 29, hp: 270, atk: .2 } },
  pegasus: { key: 'pegasus', name: 'Pégaso Aurora', of: 'do', lvl: 44, color: '#f0e6ff', trim: '#ff9fd8', cape: '#b48cd8', power: 5, price: 150000, bonus: { def: 40, hp: 400, atk: .27 } },
  hydra: { key: 'hydra', name: 'Hidra Sombria', of: 'da', lvl: 48, color: '#2f4a3a', trim: '#9affc8', cape: '#16281e', power: 5.8, price: 240000, bonus: { def: 48, hp: 480, atk: .31 } },
  chimera: { key: 'chimera', name: 'Quimera Estelar', of: 'da', lvl: 50, color: '#3a2f8f', trim: '#9ff0ff', cape: '#1e1752', power: 6.2, price: 300000, bonus: { def: 52, hp: 520, atk: .33 } },
  axolotl: { key: 'axolotl', name: 'Axolote Encantado', of: 'do', lvl: 12, color: '#f2a6c4', trim: '#ff5f9e', cape: '#d65a92', power: 1.25, price: 1500, bonus: { def: 5, hp: 40, atk: .06 } },
  bear: { key: 'bear', name: 'Urso Ancião', of: 'do', lvl: 18, color: '#7a4f2a', trim: '#c49a6c', cape: '#4b2f18', power: 1.8, price: 5000, bonus: { def: 10, hp: 110, atk: .09 } },
  owl: { key: 'owl', name: 'Coruja Lunar', of: 'da', lvl: 26, color: '#4a55a8', trim: '#ffe9a8', cape: '#2b3270', power: 2.6, price: 16000, bonus: { def: 18, hp: 160, atk: .14 } },
  tiger: { key: 'tiger', name: 'Tigre Escarlate', of: 'do', lvl: 34, color: '#e0762a', trim: '#1d1620', cape: '#a12a1e', power: 3.5, price: 45000, bonus: { def: 27, hp: 250, atk: .19 } },
  kraken: { key: 'kraken', name: 'Kraken Abissal', of: 'do', lvl: 42, color: '#5c3290', trim: '#56e0d0', cape: '#2d1a52', power: 4.7, price: 120000, bonus: { def: 38, hp: 370, atk: .26 } },
  demon: { key: 'demon', name: 'Demônio Soberano', of: 'do', lvl: 54, color: '#7a1430', trim: '#ffcf3a', cape: '#3a0816', power: 7, price: 500000, bonus: { def: 60, hp: 600, atk: .38 } },
  griffin: { key: 'griffin', name: 'Grifo Celeste', of: 'do', lvl: 15, color: '#c9d8ee', trim: '#7fb3e8', cape: '#3f6fb5', power: 1.5, price: 3000, bonus: { def: 8, hp: 60, atk: .08 } },
  lion: { key: 'lion', name: 'Leão Dourado', of: 'do', lvl: 22, color: '#d9a62e', trim: '#b5651d', cape: '#a8441e', power: 2.2, price: 9000, bonus: { def: 14, hp: 120, atk: .12 } },
  serpent: { key: 'serpent', name: 'Serpente Esmeralda', of: 'da', lvl: 30, color: '#2c9a60', trim: '#b7e85a', cape: '#14573a', power: 3, price: 25000, bonus: { def: 22, hp: 200, atk: .16 } },
  phoenix: { key: 'phoenix', name: 'Fênix Rubra', of: 'da', lvl: 38, color: '#c8352a', trim: '#ffb13d', cape: '#ff7a2b', power: 4, price: 70000, bonus: { def: 32, hp: 300, atk: .22 } },
  dragon: { key: 'dragon', name: 'Dragão Dessecado', of: 'do', lvl: 46, color: '#3d3547', trim: '#7dffb0', cape: '#2a2430', power: 5.5, price: 200000, bonus: { def: 45, hp: 450, atk: .3 } },
};
// Cada classe veste somente os sets dela
for (const [c, l] of Object.entries({ dark_warrior: ['bear', 'lion', 'tiger', 'dragon'], arcane_wizard: ['salamander', 'owl', 'phoenix', 'chimera'], mystic_archer: ['axolotl', 'griffin', 'serpent', 'pegasus'], spell_knight: ['wolf', 'scorpion', 'manticore', 'hydra'], shadow_summoner: ['bat', 'spider', 'kraken', 'demon'] })) for (const k of l) SETS[k].cls = c;
export const SET_PIECES = ['helm', 'armor', 'pants', 'boots'] as const;
const PIECE = { helm: ['Elmo', 11, 40, 1], armor: ['Couraça', 20, 90, 1.6], pants: ['Grevas', 14, 50, 1.1], boots: ['Botas', 8, 30, .9] } as const;
const SET_ITEMS: ItemDef[] = Object.values(SETS).sort((a, b) => a.lvl - b.lvl).flatMap(s => SET_PIECES.map(p => ({ key: `${s.key}_${p}`, name: `${PIECE[p][0]} ${s.of} ${s.name}`, kind: p, lvl: s.lvl, price: Math.round(s.price * PIECE[p][3]), def: Math.round(PIECE[p][1] * s.power), hp: Math.round(PIECE[p][2] * s.power), tint: s.color, set: s.key })));
const setDrops = (s: string, ch: number) => SET_PIECES.map(p => [`${s}_${p}`, ch] as [string, number]);
export const ITEMS: Record<string, ItemDef> = Object.fromEntries(([
  { key: 'pot_hp', name: 'Poção de Vida', kind: 'potion', lvl: 1, price: 20, heal: 80 },
  { key: 'pot_mp', name: 'Poção de Mana', kind: 'potion', lvl: 1, price: 20, mana: 50 },
  { key: 'shard', name: 'Estilhaço Gélido', kind: 'material', lvl: 1, price: 15 },
  { key: 'short_sword', name: 'Espada Curta', kind: 'weapon', lvl: 1, price: 120, dmg: 8, blade: '#cfd8e3', wtype: 'sword' },
  { key: 'app_staff', name: 'Cajado do Aprendiz', kind: 'weapon', lvl: 1, price: 120, dmg: 8, blade: '#b58cff', wtype: 'staff' },
  { key: 'oak_bow', name: 'Arco de Carvalho', kind: 'weapon', lvl: 1, price: 120, dmg: 7, blade: '#8a5a2f', wtype: 'bow' },
  { key: 'rune_staff', name: 'Cajado Rúnico', kind: 'weapon', lvl: 8, price: 700, dmg: 22, blade: '#63e0c8', wtype: 'staff' },
  { key: 'long_bow', name: 'Arco Longo', kind: 'weapon', lvl: 8, price: 700, dmg: 18, blade: '#6d7f3a', wtype: 'bow' },
  { key: 'glacier_staff', name: 'Cetro Glacial', kind: 'weapon', lvl: 18, price: 3500, dmg: 44, blade: '#7fe3ff', wtype: 'staff' },
  { key: 'aurora_bow', name: 'Arco da Aurora', kind: 'weapon', lvl: 18, price: 3500, dmg: 38, blade: '#a4f5d0', wtype: 'bow' },
  { key: 'iron_axe', name: 'Machado de Ferro', kind: 'weapon', lvl: 8, price: 700, dmg: 20, blade: '#9aa7b5', wtype: 'axe' },
  { key: 'frost_blade', name: 'Lâmina Boreal', kind: 'weapon', lvl: 18, price: 3500, dmg: 42, blade: '#7fe3ff', wtype: 'sword' },
  { key: 'ember_blade', name: 'Lâmina Ígnea', kind: 'weapon', lvl: 34, price: 18000, dmg: 90, blade: '#ff8a3c', wtype: 'sword' },
  { key: 'ember_axe', name: 'Machado de Magma', kind: 'weapon', lvl: 34, price: 18000, dmg: 98, blade: '#e8501c', wtype: 'axe' },
  { key: 'ember_staff', name: 'Cetro da Cinza Viva', kind: 'weapon', lvl: 34, price: 18000, dmg: 94, blade: '#ff5a2c', wtype: 'staff' },
  { key: 'ember_bow', name: 'Arco de Brasa', kind: 'weapon', lvl: 34, price: 18000, dmg: 82, blade: '#ff9d3c', wtype: 'bow' },
  { key: 'leather_helm', name: 'Capuz de Couro', kind: 'helm', lvl: 1, price: 90, def: 3, tint: '#7a5230' },
  { key: 'leather_armor', name: 'Gibão de Couro', kind: 'armor', lvl: 1, price: 150, def: 6, hp: 20, tint: '#7a5230' },
  { key: 'leather_pants', name: 'Calças de Couro', kind: 'pants', lvl: 1, price: 100, def: 4, tint: '#5e4026' },
  { key: 'leather_boots', name: 'Botas de Couro', kind: 'boots', lvl: 1, price: 80, def: 2, tint: '#4b3320' },
  { key: 'rime_helm', name: 'Elmo de Escarcha', kind: 'helm', lvl: 12, price: 1500, def: 11, hp: 40, tint: '#6aa9d8' },
  { key: 'rime_armor', name: 'Couraça de Escarcha', kind: 'armor', lvl: 12, price: 2400, def: 20, hp: 90, tint: '#5b9bd0' },
  { key: 'rime_pants', name: 'Grevas de Escarcha', kind: 'pants', lvl: 12, price: 1700, def: 14, hp: 50, tint: '#477fb0' },
  { key: 'rime_boots', name: 'Botas de Escarcha', kind: 'boots', lvl: 12, price: 1300, def: 8, hp: 30, tint: '#3c6c98' },
] as ItemDef[]).concat(SET_ITEMS).map(i => [i.key, i]));
export const RARITY = [
  { name: 'Comum', mult: 1, color: '#e8e6df' }, { name: 'Incomum', mult: 1.25, color: '#6fdc7e' }, { name: 'Raro', mult: 1.6, color: '#68b6ff' },
];
export const SHOPS: Record<string, string[]> = {
  alquimista: ['pot_hp', 'pot_mp'],
  armeira: SET_ITEMS.map(i => i.key),
  ferreira: ['short_sword', 'app_staff', 'oak_bow', 'leather_helm', 'leather_armor', 'leather_pants', 'leather_boots'],
};
export interface MobDef {
  key: string; name: string; level: number; hp: number; dmg: number; def: number; speed: number; detect: number; leash: number;
  attackMs: number; xp: number; respawnMs: number; gold: [number, number]; drops: [string, number][]; boss?: boolean; reach?: number; bolt?: string; nova?: string;
}
const EMBER: [string, number][] = [['ember_blade', 1], ['ember_axe', 1], ['ember_staff', 1], ['ember_bow', 1]];
const ember = (ch: number) => EMBER.map(([k]) => [k, ch] as [string, number]);
export const MOBS: Record<string, MobDef> = {
  imp: { key: 'imp', name: 'Diabrete Cinzento', level: 22, hp: 900, dmg: 70, def: 34, speed: 2.8, detect: 7, leash: 12, attackMs: 1500, xp: 380, respawnMs: 12000, gold: [50, 110], reach: 4.5, bolt: '#ff9d3c',
    drops: [['pot_hp', .3], ['pot_mp', .25], ['shard', .3], ...setDrops('griffin', .012)] },
  hound: { key: 'hound', name: 'Cão de Enxofre', level: 29, hp: 1900, dmg: 110, def: 50, speed: 4, detect: 8, leash: 14, attackMs: 1100, xp: 850, respawnMs: 15000, gold: [90, 190],
    drops: [['pot_hp', .35], ['pot_mp', .25], ...setDrops('griffin', .02), ...setDrops('lion', .01), ...setDrops('owl', .012)] },
  magma: { key: 'magma', name: 'Colosso de Magma', level: 37, hp: 5200, dmg: 190, def: 85, speed: 2, detect: 6.5, leash: 12, attackMs: 1800, xp: 2400, respawnMs: 22000, gold: [220, 420],
    drops: [['pot_hp', .4], ...setDrops('lion', .02), ...setDrops('serpent', .01), ...setDrops('tiger', .012), ...setDrops('manticore', .012), ...ember(.012)] },
  wyrm: { key: 'wyrm', name: 'Serpe Carbonizada', level: 45, hp: 9500, dmg: 260, def: 120, speed: 3, detect: 8, leash: 14, attackMs: 1700, xp: 6000, respawnMs: 30000, gold: [500, 900], reach: 5.5, bolt: '#ff5a2c',
    drops: [['pot_hp', .5], ...setDrops('serpent', .025), ...setDrops('phoenix', .012), ...setDrops('kraken', .012), ...setDrops('pegasus', .01), ...ember(.03)] },
  ignarok: { key: 'ignarok', name: 'Ignarok, o Dragão Ancestral', level: 60, hp: 120000, dmg: 420, def: 170, speed: 3, detect: 12, leash: 20, attackMs: 1500, xp: 150000, respawnMs: 1800000, gold: [15000, 30000], boss: true, reach: 3.2, nova: '#ff7a2b',
    drops: [['pot_hp', 1], ['pot_mp', 1], ...ember(.4), ...setDrops('phoenix', .3), ...setDrops('dragon', .15), ...setDrops('kraken', .2), ...setDrops('demon', .05), ...setDrops('pegasus', .1), ...setDrops('hydra', .08), ...setDrops('chimera', .08)] },
  slime: { key: 'slime', name: 'Gelatina Gélida', level: 2, hp: 45, dmg: 9, def: 1, speed: 1.6, detect: 4.5, leash: 10, attackMs: 1500, xp: 20, respawnMs: 8000, gold: [3, 9],
    drops: [['pot_hp', .12], ['shard', .2], ['leather_boots', .03], ['leather_helm', .03]] },
  wolf: { key: 'wolf', name: 'Lobo Geladiço', level: 7, hp: 150, dmg: 22, def: 7, speed: 3.4, detect: 7, leash: 13, attackMs: 1200, xp: 70, respawnMs: 12000, gold: [10, 25],
    drops: [['pot_hp', .15], ['pot_mp', .1], ['shard', .25], ['leather_armor', .04], ['leather_pants', .04], ['iron_axe', .02], ['rune_staff', .02], ['long_bow', .02]] },
  golem: { key: 'golem', name: 'Colosso de Granizo', level: 14, hp: 520, dmg: 44, def: 20, speed: 1.9, detect: 6, leash: 12, attackMs: 1800, xp: 240, respawnMs: 20000, gold: [35, 80],
    drops: [['pot_hp', .25], ['shard', .4], ['iron_axe', .05], ['rune_staff', .05], ['long_bow', .05], ['rime_helm', .03], ['rime_boots', .03], ['rime_pants', .025], ['rime_armor', .02], ...setDrops('griffin', .012), ...setDrops('axolotl', .02), ...setDrops('salamander', .015), ...setDrops('bat', .015), ...setDrops('wolf', .015)] },
  boss: { key: 'boss', name: 'Hrímara, a Soberana', level: 24, hp: 6500, dmg: 70, def: 32, speed: 2.7, detect: 9, leash: 16, attackMs: 1400, xp: 4000, respawnMs: 600000, gold: [800, 1500], boss: true,
    drops: [['frost_blade', .4], ['glacier_staff', .4], ['aurora_bow', .4], ['rime_armor', .5], ['rime_helm', .5], ['pot_hp', 1], ['pot_mp', 1], ...setDrops('scorpion', .1), ...setDrops('spider', .1), ...setDrops('bear', .25), ...setDrops('owl', .1), ...setDrops('lion', .25), ...setDrops('serpent', .1), ...setDrops('phoenix', .04), ...setDrops('dragon', .015)] },
};
export type SkillKind = 'spin' | 'dash' | 'splash' | 'multi' | 'summon' | 'curse';
export interface Skill { n: number; name: string; kind: SkillKind; mana: number; cd: number; mult: number; radius?: number; range?: number; count?: number; pet?: string; color?: string; ms?: number }
export interface ClassDef {
  key: string; name: string; desc: string; base: { str: number; agi: number; vit: number; ene: number }; range: number; magic: boolean;
  atk: [number, number, number]; color: string; pants: string; weapon: string; weapons: string[]; bolt: string | null; skills: Skill[];
}
// atk = pesos de Força, Agilidade e Energia no ataque
export const CLASSES: Record<string, ClassDef> = {
  dark_warrior: { key: 'dark_warrior', name: 'Dark Warrior', desc: 'Corpo a corpo, muita resistência.', base: { str: 28, agi: 20, vit: 25, ene: 10 }, range: 1.7, magic: false, atk: [.333, 0, 0], color: '#4d5873', pants: '#373b52', weapon: 'short_sword', weapons: ['sword', 'axe'], bolt: null, skills: [
    { n: 1, name: 'Golpe Circular', kind: 'spin', mana: 12, cd: 4000, mult: 1.3, radius: 2.4 }, { n: 2, name: 'Investida', kind: 'dash', mana: 18, cd: 7000, mult: 2, range: 7 }] },
  arcane_wizard: { key: 'arcane_wizard', name: 'Arcane Wizard', desc: 'Magia à distância, dano alto, pouca defesa.', base: { str: 18, agi: 18, vit: 15, ene: 32 }, range: 7, magic: true, atk: [0, 0, .4], color: '#3f4fa8', pants: '#2d3778', weapon: 'app_staff', weapons: ['staff'], bolt: '#8fd0ff', skills: [
    { n: 1, name: 'Bola de Fogo', kind: 'splash', mana: 10, cd: 3000, mult: 1.5, radius: 2, range: 8, color: '#ff8a3c' }, { n: 2, name: 'Tempestade de Raios', kind: 'multi', mana: 20, cd: 8000, mult: 1.4, radius: 4, count: 5, range: 8, color: '#f6f07a' }] },
  mystic_archer: { key: 'mystic_archer', name: 'Mystic Archer', desc: 'Arqueira veloz com um espírito auxiliar.', base: { str: 20, agi: 34, vit: 18, ene: 12 }, range: 8, magic: false, atk: [0, .34, 0], color: '#4f7a45', pants: '#3a5a33', weapon: 'oak_bow', weapons: ['bow'], bolt: '#f1e3b8', skills: [
    { n: 1, name: 'Flecha Tripla', kind: 'multi', mana: 10, cd: 4000, mult: 1.2, radius: 3.5, count: 3, range: 9, color: '#f1e3b8' }, { n: 2, name: 'Espírito da Mata', kind: 'summon', mana: 22, cd: 12000, mult: .7, pet: 'wisp', ms: 30000 }] },
  spell_knight: { key: 'spell_knight', name: 'Spell Knight', desc: 'Híbrido de força e energia.', base: { str: 26, agi: 24, vit: 20, ene: 22 }, range: 1.7, magic: false, atk: [.2, 0, .18], color: '#7a3f5e', pants: '#552c43', weapon: 'short_sword', weapons: ['sword', 'axe'], bolt: null, skills: [
    { n: 1, name: 'Lâmina Arcana', kind: 'splash', mana: 12, cd: 3500, mult: 1.6, radius: 2, range: 2.6, color: '#d58cff' }, { n: 2, name: 'Explosão Rúnica', kind: 'spin', mana: 20, cd: 7000, mult: 1.7, radius: 3 }] },
  shadow_summoner: { key: 'shadow_summoner', name: 'Shadow Summoner', desc: 'Invoca sombras e amaldiçoa inimigos.', base: { str: 16, agi: 20, vit: 18, ene: 34 }, range: 6.5, magic: true, atk: [0, 0, .34], color: '#4a2f6b', pants: '#33214a', weapon: 'app_staff', weapons: ['staff'], bolt: '#b06bff', skills: [
    { n: 1, name: 'Invocar Sombra', kind: 'summon', mana: 22, cd: 10000, mult: 1, pet: 'shade', ms: 35000 }, { n: 2, name: 'Maldição', kind: 'curse', mana: 14, cd: 6000, mult: .8, range: 8, ms: 8000, color: '#b06bff' }] },
};
export const classOf = (name?: string): ClassDef => Object.values(CLASSES).find(c => c.name === name) ?? CLASSES.dark_warrior;
export const canWield = (c: ClassDef, d: ItemDef) => d.set ? SETS[d.set].cls === c.key : d.kind !== 'weapon' || c.weapons.includes(d.wtype!);
export const HAIR_COLORS = ['#2b2230', '#7a4a22', '#d9b24a', '#b23a2e', '#d8dde6', '#3f6fb5'];
export const HAIR_STYLES = ['Curto', 'Espetado', 'Longo'];
export const xpToNext = (lv: number) => Math.floor(50 * Math.pow(lv, 1.9) + 40);

export interface Base { cls?: string; level: number; str: number; agi: number; vit: number; ene: number }
export interface ItemInst { id: string; key: string; qty: number; slot: number; equip: string | null; rarity: number }
export const sellPrice = (i: ItemInst) => Math.floor(ITEMS[i.key].price * .3 * (1 + i.rarity * .5));
export const itemStat = (i: ItemInst, f: 'dmg' | 'def' | 'hp') => Math.round((ITEMS[i.key][f] ?? 0) * RARITY[i.rarity].mult);
export function setCounts(items: ItemInst[]) { const m: Record<string, number> = {}; for (const i of items) { const s = i.equip && ITEMS[i.key].set; if (s) m[s] = (m[s] ?? 0) + 1; } return m; }
export const fullSetOf = (keys: (string | null | undefined)[]) => { const s = keys.map(k => k ? ITEMS[k]?.set : undefined); return s.length === 4 && s[0] && s.every(x => x === s[0]) ? s[0] : null; };
export function derive(b: Base, items: ItemInst[]) {
  let dmg = 0, def = 0, hp = 0; const w = classOf(b.cls).atk;
  for (const i of items) if (i.equip) { dmg += itemStat(i, 'dmg'); def += itemStat(i, 'def'); hp += itemStat(i, 'hp'); }
  let pct = 0; for (const [k, n] of Object.entries(setCounts(items))) { const q = SETS[k].bonus; if (n >= 2) def += q.def; if (n >= 3) hp += q.hp; if (n >= 4) pct += q.atk; }
  return {
    maxHp: Math.floor(70 + b.level * 3 + b.vit * 3 + hp), maxMp: Math.floor(20 + b.level + b.ene * 2),
    atk: Math.floor((b.str * w[0] + b.agi * w[1] + b.ene * w[2] + dmg) * (1 + pct)), def: Math.floor(b.agi / 5 + def),
    attackMs: Math.max(350, 1000 - b.agi * 3), crit: Math.min(.4, .05 + b.agi * .0007), dodge: Math.min(.3, b.agi * .0008),
  };
}
export const rollDamage = (atk: number, def: number, rnd: number) => Math.max(1, Math.round((atk - def * .6) * (.85 + rnd * .3)));
