// Regras e conteúdo do jogo. Todos os números de balanceamento ficam aqui.
export const CONFIG = {
  tickMs: 50, testCommands: true, aoiRadius: 22, pointsPerLevel: 5, maxLevel: 400, playerSpeed: 5,
  attackRange: 1.7, invSize: 45, startGold: 100, saveEveryMs: 60000, dropOwnMs: 5000, dropLifeMs: 10000,
};
export type Slot = 'weapon' | 'helm' | 'armor' | 'pants' | 'boots' | 'wings' | 'ring' | 'amulet';
export const SLOTS: Slot[] = ['weapon', 'helm', 'armor', 'pants', 'boots', 'wings', 'ring', 'amulet'];
export const SLOT_NAMES: Record<Slot, string> = { weapon: 'Arma', helm: 'Elmo', armor: 'Armadura', pants: 'Calças', boots: 'Botas', wings: 'Asas', ring: 'Anel', amulet: 'Amuleto' };
export interface ItemDef {
  key: string; name: string; kind: Slot | 'potion' | 'material' | 'jewel' | 'pack' | 'box'; lvl: number; price: number;
  dmg?: number; def?: number; hp?: number; heal?: number; mana?: number; tint?: string; blade?: string; wtype?: WType; set?: string; cls?: string; wtier?: number;
}
// Sets: cada peça equipada do mesmo set soma bônus (2 peças: defesa, 3: vida, 4: ataque %)
export interface SetDef { cls?: string; key: string; name: string; of: string; lvl: number; color: string; trim: string; cape: string; power: number; price: number; bonus: { def: number; hp: number; atk: number } }
export const SETS: Record<string, SetDef> = {
  boar: { key: 'boar', name: 'Javali de Ferro', of: 'do', lvl: 12, color: '#6a5a4e', trim: '#c9b48a', cape: '#3e332a', power: 1.3, price: 1800, bonus: { def: 5, hp: 45, atk: .06 } },
  minotaur: { key: 'minotaur', name: 'Minotauro Implacável', of: 'do', lvl: 58, color: '#5a2a1e', trim: '#e0a03a', cape: '#2e120c', power: 7.2, price: 600000, bonus: { def: 62, hp: 620, atk: .4 } },
  fox: { key: 'fox', name: 'Raposa Mística', of: 'da', lvl: 20, color: '#d9702a', trim: '#fff0d8', cape: '#8c3a14', power: 2, price: 7000, bonus: { def: 11, hp: 110, atk: .1 } },
  sphinx: { key: 'sphinx', name: 'Esfinge Astral', of: 'da', lvl: 60, color: '#c9a85a', trim: '#3a7fd0', cape: '#1f3f7a', power: 7.5, price: 700000, bonus: { def: 64, hp: 650, atk: .41 } },
  deer: { key: 'deer', name: 'Cervo Silvestre', of: 'do', lvl: 22, color: '#9a6a3c', trim: '#e8dcc0', cape: '#4a6b3a', power: 2.2, price: 9000, bonus: { def: 13, hp: 125, atk: .11 } },
  hummingbird: { key: 'hummingbird', name: 'Beija-flor Prismático', of: 'do', lvl: 56, color: '#2fa89a', trim: '#ff6ad5', cape: '#6a3fd0', power: 6.8, price: 450000, bonus: { def: 58, hp: 590, atk: .37 } },
  falcon: { key: 'falcon', name: 'Falcão Rúnico', of: 'do', lvl: 20, color: '#6a5442', trim: '#6fd6ff', cape: '#3a2c20', power: 2, price: 7000, bonus: { def: 11, hp: 110, atk: .1 } },
  wyvern: { key: 'wyvern', name: 'Wyvern Prateada', of: 'da', lvl: 58, color: '#aab6c6', trim: '#7dffb0', cape: '#4a5a6e', power: 7.2, price: 600000, bonus: { def: 62, hp: 620, atk: .4 } },
  skull: { key: 'skull', name: 'Caveira Lunar', of: 'da', lvl: 32, color: '#2e2a3a', trim: '#cfe0ff', cape: '#1a1726', power: 3.3, price: 35000, bonus: { def: 25, hp: 230, atk: .18 } },
  reaper: { key: 'reaper', name: 'Ceifador Espectral', of: 'do', lvl: 62, color: '#1a1a24', trim: '#7dfff0', cape: '#0c0c14', power: 8, price: 800000, bonus: { def: 68, hp: 700, atk: .43 } },
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
  mammoth: { key: 'mammoth', name: 'Mamute Glacial', of: 'do', lvl: 72, color: '#7a5a40', trim: '#e8f2ff', cape: '#46321f', power: 8.6, price: 1200000, bonus: { def: 78, hp: 800, atk: 0.46 } },
  titan: { key: 'titan', name: 'Titã de Obsidiana', of: 'do', lvl: 86, color: '#2a2630', trim: '#ff6a2b', cape: '#120e16', power: 10.5, price: 3000000, bonus: { def: 100, hp: 1050, atk: 0.55 } },
  djinn: { key: 'djinn', name: 'Gênio do Deserto', of: 'do', lvl: 72, color: '#2a6fc0', trim: '#ffd76a', cape: '#173f78', power: 8.6, price: 1200000, bonus: { def: 78, hp: 800, atk: 0.46 } },
  oracle: { key: 'oracle', name: 'Oráculo Solar', of: 'do', lvl: 86, color: '#e6b23a', trim: '#fff3b8', cape: '#a8561e', power: 10.5, price: 3000000, bonus: { def: 100, hp: 1050, atk: 0.55 } },
  peacock: { key: 'peacock', name: 'Pavão Real', of: 'do', lvl: 72, color: '#14808a', trim: '#6ae0ff', cape: '#0c4a5c', power: 8.6, price: 1200000, bonus: { def: 78, hp: 800, atk: 0.46 } },
  unicorn: { key: 'unicorn', name: 'Unicórnio Lunar', of: 'do', lvl: 86, color: '#eee8fa', trim: '#b48cff', cape: '#8a78c8', power: 10.5, price: 3000000, bonus: { def: 100, hp: 1050, atk: 0.55 } },
  rhino: { key: 'rhino', name: 'Rinoceronte de Ferro', of: 'do', lvl: 72, color: '#6c7480', trim: '#ffb13d', cape: '#3a4048', power: 8.6, price: 1200000, bonus: { def: 78, hp: 800, atk: 0.46 } },
  basilisk: { key: 'basilisk', name: 'Basilisco Dourado', of: 'do', lvl: 86, color: '#b8902a', trim: '#7dffb0', cape: '#5a4410', power: 10.5, price: 3000000, bonus: { def: 100, hp: 1050, atk: 0.55 } },
  mummy: { key: 'mummy', name: 'Múmia Ancestral', of: 'da', lvl: 72, color: '#c9bb92', trim: '#3fd6c0', cape: '#7a6c48', power: 8.6, price: 1200000, bonus: { def: 78, hp: 800, atk: 0.46 } },
  lich: { key: 'lich', name: 'Lich Imortal', of: 'do', lvl: 86, color: '#3a1f5a', trim: '#9dff6b', cape: '#1c0f30', power: 10.5, price: 3000000, bonus: { def: 100, hp: 1050, atk: 0.55 } },
};
// Cada classe veste somente os sets dela
for (const [c, l] of Object.entries({ dark_warrior: ['boar', 'bear', 'lion', 'tiger', 'dragon', 'minotaur', 'mammoth', 'titan'], arcane_wizard: ['salamander', 'fox', 'owl', 'phoenix', 'chimera', 'sphinx', 'djinn', 'oracle'], mystic_archer: ['axolotl', 'griffin', 'deer', 'serpent', 'pegasus', 'hummingbird', 'peacock', 'unicorn'], spell_knight: ['wolf', 'falcon', 'scorpion', 'manticore', 'hydra', 'wyvern', 'rhino', 'basilisk'], shadow_summoner: ['bat', 'spider', 'skull', 'kraken', 'demon', 'reaper', 'mummy', 'lich'] })) for (const k of l) SETS[k].cls = c;
// Sets dos mundos de alto nível (120, 180, 240 e 300): só caem dos monstros
Object.assign(SETS, {
  colosso: { cls: 'dark_warrior', key: 'colosso', name: 'Colosso de Lava', of: 'do', lvl: 120, color: '#3a1a14', trim: '#ff7a2b', cape: '#1c0c08', power: 14.2, price: 5110427, bonus: { def: 135, hp: 1420, atk: 0.67 } },
  behemoth: { cls: 'dark_warrior', key: 'behemoth', name: 'Behemoth Ancião', of: 'do', lvl: 180, color: '#4a3a2a', trim: '#ffd76a', cape: '#241a10', power: 20.8, price: 13082694, bonus: { def: 198, hp: 2080, atk: 0.88 } },
  leviata: { cls: 'dark_warrior', key: 'leviata', name: 'Leviatã das Profundezas', of: 'do', lvl: 240, color: '#14405a', trim: '#4af0ff', cape: '#08202e', power: 27.4, price: 33491697, bonus: { def: 260, hp: 2740, atk: 1.09 } },
  apocalipse: { cls: 'dark_warrior', key: 'apocalipse', name: 'Cavaleiro do Apocalipse', of: 'do', lvl: 300, color: '#1a1014', trim: '#ff4a6a', cape: '#0a0608', power: 34.0, price: 85738746, bonus: { def: 323, hp: 3400, atk: 1.3 } },
  arcanjo: { cls: 'arcane_wizard', key: 'arcanjo', name: 'Arcanjo Celeste', of: 'do', lvl: 120, color: '#e8eef8', trim: '#ffd76a', cape: '#8aa0c8', power: 14.2, price: 5110427, bonus: { def: 135, hp: 1420, atk: 0.67 } },
  eclipse: { cls: 'arcane_wizard', key: 'eclipse', name: 'Eclipse Arcano', of: 'do', lvl: 180, color: '#2a1a4a', trim: '#ffb13d', cape: '#140a28', power: 20.8, price: 13082694, bonus: { def: 198, hp: 2080, atk: 0.88 } },
  nebulosa: { cls: 'arcane_wizard', key: 'nebulosa', name: 'Nebulosa Estelar', of: 'da', lvl: 240, color: '#3a2a8a', trim: '#ff9df0', cape: '#1a1450', power: 27.4, price: 33491697, bonus: { def: 260, hp: 2740, atk: 1.09 } },
  infinito: { cls: 'arcane_wizard', key: 'infinito', name: 'Mago do Infinito', of: 'do', lvl: 300, color: '#0f1a3a', trim: '#7affd8', cape: '#060c1e', power: 34.0, price: 85738746, bonus: { def: 323, hp: 3400, atk: 1.3 } },
  kitsune: { cls: 'mystic_archer', key: 'kitsune', name: 'Kitsune de Nove Caudas', of: 'da', lvl: 120, color: '#f0a050', trim: '#fff2d8', cape: '#a8501e', power: 14.2, price: 5110427, bonus: { def: 135, hp: 1420, atk: 0.67 } },
  cervoastral: { cls: 'mystic_archer', key: 'cervoastral', name: 'Cervo Astral', of: 'do', lvl: 180, color: '#8ab0e0', trim: '#fff2b0', cape: '#3a5a8a', power: 20.8, price: 13082694, bonus: { def: 198, hp: 2080, atk: 0.88 } },
  aguia: { cls: 'mystic_archer', key: 'aguia', name: 'Águia Imperial', of: 'da', lvl: 240, color: '#7a5a2a', trim: '#ffe27a', cape: '#3a2a10', power: 27.4, price: 33491697, bonus: { def: 260, hp: 2740, atk: 1.09 } },
  aurora: { cls: 'mystic_archer', key: 'aurora', name: 'Aurora Boreal', of: 'da', lvl: 300, color: '#1a5a5a', trim: '#9dff6b', cape: '#0a2e2e', power: 34.0, price: 85738746, bonus: { def: 323, hp: 3400, atk: 1.3 } },
  cerbero: { cls: 'spell_knight', key: 'cerbero', name: 'Cérbero Rúnico', of: 'do', lvl: 120, color: '#3a1a1a', trim: '#ff7a2b', cape: '#1a0a0a', power: 14.2, price: 5110427, bonus: { def: 135, hp: 1420, atk: 0.67 } },
  grifoguerra: { cls: 'spell_knight', key: 'grifoguerra', name: 'Grifo de Guerra', of: 'do', lvl: 180, color: '#9aa6b8', trim: '#4af0ff', cape: '#4a5466', power: 20.8, price: 13082694, bonus: { def: 198, hp: 2080, atk: 0.88 } },
  paladino: { cls: 'spell_knight', key: 'paladino', name: 'Paladino Rúnico', of: 'do', lvl: 240, color: '#d8d0b8', trim: '#7fc8ff', cape: '#7a6c48', power: 27.4, price: 33491697, bonus: { def: 260, hp: 2740, atk: 1.09 } },
  valquiria: { cls: 'spell_knight', key: 'valquiria', name: 'Valquíria Eterna', of: 'da', lvl: 300, color: '#c0c8e0', trim: '#ffd76a', cape: '#4a5070', power: 34.0, price: 85738746, bonus: { def: 323, hp: 3400, atk: 1.3 } },
  banshee: { cls: 'shadow_summoner', key: 'banshee', name: 'Banshee Uivante', of: 'da', lvl: 120, color: '#2a3a4a', trim: '#bdf0ff', cape: '#141e28', power: 14.2, price: 5110427, bonus: { def: 135, hp: 1420, atk: 0.67 } },
  necromante: { cls: 'shadow_summoner', key: 'necromante', name: 'Necromante Supremo', of: 'do', lvl: 180, color: '#1a2a1a', trim: '#7dffb0', cape: '#0a140a', power: 20.8, price: 13082694, bonus: { def: 198, hp: 2080, atk: 0.88 } },
  pesadelo: { cls: 'shadow_summoner', key: 'pesadelo', name: 'Pesadelo Vivo', of: 'do', lvl: 240, color: '#2a0a2a', trim: '#ff4af0', cape: '#140414', power: 27.4, price: 33491697, bonus: { def: 260, hp: 2740, atk: 1.09 } },
  abismal: { cls: 'shadow_summoner', key: 'abismal', name: 'Senhor Abismal', of: 'do', lvl: 300, color: '#0a0a1a', trim: '#7a4aff', cape: '#04040c', power: 34.0, price: 85738746, bonus: { def: 323, hp: 3400, atk: 1.3 } },
} as Record<string, SetDef>);
export const SET_PIECES = ['helm', 'armor', 'pants', 'boots'] as const;
const PIECE = { helm: ['Elmo', 11, 40, 1], armor: ['Couraça', 20, 90, 1.6], pants: ['Grevas', 14, 50, 1.1], boots: ['Botas', 8, 30, .9] } as const;
// Asas: exclusivas por classe, em 3 níveis
export const WING_THEME: Record<string, { name: string; style: 'bat' | 'feather' | 'blade' | 'leaf' | 'bone'; c: string; c2: string }> = {
  dark_warrior: { name: 'Rubras', style: 'bat', c: '#8c1f2e', c2: '#e0425a' }, arcane_wizard: { name: 'Celestes', style: 'feather', c: '#4f7fe0', c2: '#cfe6ff' }, mystic_archer: { name: 'da Floresta', style: 'leaf', c: '#3fae6a', c2: '#d6ffa8' },
  spell_knight: { name: 'Rúnicas', style: 'blade', c: '#7a4fd0', c2: '#e0c6ff' }, shadow_summoner: { name: 'do Abismo', style: 'bone', c: '#3a2458', c2: '#d9d2bb' },
};
export const WING_TIER = [{ name: 'Noviças', lvl: 20, def: 15, hp: 100, atk: .12, abs: .1, price: 30000 }, { name: 'Ancestrais', lvl: 40, def: 45, hp: 300, atk: .22, abs: .2, price: 250000 }, { name: 'Soberanas', lvl: 60, def: 100, hp: 700, atk: .35, abs: .3, price: 1500000 },
  // asas de mundo alto (0.34): criadas a partir das Soberanas
  { name: 'Imperiais', lvl: 150, def: 320, hp: 2600, atk: .45, abs: .35, price: 15000000 }, { name: 'Divinas', lvl: 240, def: 650, hp: 5200, atk: .55, abs: .39, price: 60000000 }, { name: 'Eternas', lvl: 330, def: 1100, hp: 9000, atk: .66, abs: .43, price: 200000000 }];
const WING_ITEMS: ItemDef[] = Object.entries(WING_THEME).flatMap(([c, t]) => WING_TIER.map((w, i) => ({ key: `wing_${c}_${i}`, name: `Asas ${w.name} ${t.name}`, kind: 'wings' as const, lvl: w.lvl, price: w.price, def: w.def, hp: w.hp, tint: t.c, blade: t.c2, cls: c, wtier: i })));
// Receitas do Artífice: asas só existem por criação
export const WING_RECIPES: { gold: number; mats: [string, number][] }[] = [{ gold: 30000, mats: [['shard', 10], ['plume', 1]] }, { gold: 250000, mats: [['plume', 3], ['magma_heart', 2]] }, { gold: 1500000, mats: [['plume', 5], ['magma_heart', 5], ['ancient_scale', 1]] },
  { gold: 15000000, mats: [['ancient_scale', 10], ['chaos_feather', 5]] }, { gold: 60000000, mats: [['ancient_scale', 20], ['chaos_feather', 15], ['void_crystal', 3]] }, { gold: 200000000, mats: [['chaos_feather', 30], ['void_crystal', 12], ['jewel_eclipse', 50]] }];
// Itens excelentes: opções especiais sorteadas no drop
export const EXC_WEAPON = ['atk', 'crit', 'speed', 'lifek', 'manak'], EXC_ARMOR = ['hp', 'mp', 'absorb', 'reflect', 'goldx', 'dodge'];
export const EXC_TEXT: Record<string, string> = { atk: '+6% de ataque', crit: '+8% de crítico', speed: '+7% de velocidade de ataque', lifek: 'Recupera 8% da vida ao matar', manak: 'Recupera 10% da mana ao matar', hp: '+4% de vida', mp: '+4% de mana', absorb: '-4% de dano recebido', reflect: 'Reflete 5% do dano', goldx: '+30% de moedas', dodge: '+3% de esquiva' };
// Armas por tipo e nível
export type WType = 'sword' | 'axe' | 'staff' | 'bow' | 'mace' | 'spear' | 'gsword' | 'scepter' | 'crossbow';
export const WTYPE_NAME: Record<WType, string> = { sword: 'Espadas', gsword: 'Espadões', axe: 'Machados', mace: 'Maças e Martelos', spear: 'Lanças', staff: 'Cajados', scepter: 'Cetros', bow: 'Arcos', crossbow: 'Bestas' };
const WEAPON_TIERS: [number, number, number][] = [[12, 30, 1500], [26, 62, 8000], [44, 135, 60000], [56, 200, 400000], [70, 310, 2500000], [90, 430, 9000000], [110, 580, 25000000],
  [120, 650, 30000000], [150, 860, 42000000], [180, 1080, 59000000], [210, 1300, 82000000], [240, 1520, 115000000], [270, 1750, 160000000], [300, 1980, 225000000], [340, 2300, 315000000]];
/** Níveis das armas e acessórios que só caem nos mundos de alto nível (um por mundo). */
export const HI_TIERS = [120, 150, 180, 210, 240, 270, 300, 340];
const HI_EPI: [string, string][] = [['da Hidra', '#9dff6b'], ['do Inverno Eterno', '#bdf0ff'], ['do Vulcão', '#ff7a2b'], ['do Lich Rei', '#7dffb0'], ['da Floresta Sombria', '#c77dff'], ['do Abismo', '#4af0ff'], ['do Caos', '#ff4a6a'], ['do Vazio Eterno', '#ff4af0']];
const HI_NOUN: Record<string, string> = { sword: 'Espada', axe: 'Machado', staff: 'Cajado', bow: 'Arco', mace: 'Martelo', spear: 'Lança', gsword: 'Montante', scepter: 'Cetro', crossbow: 'Besta' };
/** Multiplicador de dano de cada tipo (bestas e arcos um pouco menos porque atacam de longe). */
const WTYPE_DMG: Record<WType, number> = { sword: 1, axe: 1.08, staff: 1, bow: .92, mace: 1.04, spear: 1.05, gsword: 1.1, scepter: 1.03, crossbow: .96 };
const WEAPON_LINES: Record<WType, [string, string][]> = {
  sword: [['Gládio de Aço', '#d6dee8'], ['Sabre Lunar', '#b8d8ff'], ['Espada do Crepúsculo', '#c77dff'], ['Lâmina do Apocalipse', '#ff5a4a'], ['Aurora Eterna', '#fff2b0'], ['Lâmina Estelar', '#9ffcff'], ['Espada do Rei Eterno', '#ffe27a']],
  axe: [['Machadinha de Guerra', '#b4bfcc'], ['Machado Rúnico', '#7fc8ff'], ['Ceifador Sombrio', '#9a6bff'], ['Devastador Titânico', '#ffb13d'], ['Juízo Final', '#ffe9a8'], ['Machado do Cometa', '#8ff0ff'], ['Fúria dos Deuses', '#ff7ad9']],
  staff: [['Bastão de Cristal', '#9fe8ff'], ['Cajado Astral', '#8f9bff'], ['Cetro do Vazio', '#d86bff'], ['Báculo Divino', '#ffe08a'], ['Cetro do Firmamento', '#b8f0ff'], ['Cajado das Marés Astrais', '#7affd8'], ['Báculo da Criação', '#fff2b0']],
  bow: [['Arco Composto', '#9a7a4a'], ['Arco Lunar', '#b8d8ff'], ['Arco do Vento Negro', '#6d5a9a'], ['Arco Celestial', '#ffe9a8'], ['Arco do Zênite', '#ffd9f0'], ['Arco da Tempestade', '#9fd7ff'], ['Arco da Fênix Eterna', '#ffb07a']],
  mace: [['Maça de Ferro', '#b4bfcc'], ['Maça Estrelada', '#ffd76a'], ['Martelo do Trovão', '#8fd0ff'], ['Maça do Abismo', '#b06bff'], ['Malho Vulcânico', '#ff7a3c'], ['Martelo Celestial', '#fff2b0'], ['Maça do Fim dos Tempos', '#ff4a6a']],
  spear: [['Lança de Caça', '#cfd8e3'], ['Lança Glacial', '#9fe8ff'], ['Alabarda Rúnica', '#7fc8ff'], ['Tridente Abissal', '#5ad6c8'], ['Lança do Dragão', '#ff6a3c'], ['Lança Solar', '#ffe08a'], ['Lança do Eclipse', '#d86bff']],
  gsword: [['Espadão de Guerra', '#d6dee8'], ['Espadão Sanguíneo', '#ff6a6a'], ['Montante do Trovão', '#9fd0ff'], ['Espadão das Sombras', '#a67dff'], ['Montante Infernal', '#ff7a2c'], ['Espadão Dourado', '#ffe9a8'], ['Montante do Juízo', '#fff8e0']],
  scepter: [['Cetro de Âmbar', '#ffb54a'], ['Cetro Lunar', '#c9e0ff'], ['Orbe do Arcano', '#8f9bff'], ['Cetro das Almas', '#9dff6b'], ['Cetro do Inferno', '#ff5a4a'], ['Cetro Sagrado', '#fff2b0'], ['Cetro do Infinito', '#e07aff']],
  crossbow: [['Besta de Caça', '#9a7a4a'], ['Besta de Aço', '#cfd8e3'], ['Besta Glacial', '#9fe8ff'], ['Besta Sombria', '#8a6bd8'], ['Besta de Repetição', '#ffb13d'], ['Besta Celestial', '#ffe9a8'], ['Besta do Dragão', '#ff6a4a']],
};
// Acessórios: anel (ataque e vida) e amuleto (defesa e vida), para todas as classes
export const ACC_LVLS = [10, 30, 50, 70, 90, 110, 120, 150, 180, 210, 240, 270, 300, 340];
const ACC_ITEMS: ItemDef[] = [
  ...([['Anel de Cobre', '#c98a4a', '#ff8a5c', 6, 20, 3000], ['Anel de Prata Lunar', '#d6dee8', '#8fd0ff', 16, 60, 25000], ['Anel do Fogo Eterno', '#e0b03a', '#ff5a2c', 34, 140, 150000], ['Anel do Vazio', '#6b5a8a', '#c77dff', 60, 260, 900000], ['Anel dos Céus', '#e8f4ff', '#7affd8', 95, 420, 5000000], ['Anel do Imperador', '#f0cf65', '#ff4a6a', 140, 650, 15000000]] as [string, string, string, number, number, number][])
    .concat(([[160, 720], [210, 920], [260, 1120], [310, 1320], [360, 1520], [410, 1720], [460, 1920], [530, 2200]] as [number, number][]).map(([d, h], i) => [`Anel ${HI_EPI[i][0]}`, i % 2 ? '#e8f4ff' : '#f0cf65', HI_EPI[i][1], d, h, 30000000 * 1.4 ** i] as [string, string, string, number, number, number]))
    .map(([name, tint, blade, dmg, hp, price], i) => ({ key: `ring_${ACC_LVLS[i]}`, name, kind: 'ring' as const, lvl: ACC_LVLS[i], price: Math.round(price), dmg, hp, tint, blade })),
  ...([['Amuleto de Osso', '#e8e0c8', '#bdf0ff', 5, 40, 3000], ['Pingente de Jade', '#c9a44c', '#7dffb0', 14, 120, 25000], ['Colar de Rubi', '#e0b03a', '#ff4a6a', 30, 260, 150000], ['Talismã Abissal', '#7a8aa0', '#5ad6c8', 52, 480, 900000], ['Medalhão Solar', '#f0cf65', '#ffd76a', 80, 760, 5000000], ['Coração da Eternidade', '#e8f4ff', '#ff9df0', 120, 1100, 15000000]] as [string, string, string, number, number, number][])
    .concat(([[135, 1200], [175, 1500], [215, 1800], [255, 2100], [295, 2400], [335, 2700], [375, 3000], [430, 3400]] as [number, number][]).map(([d, h], i) => [`Amuleto ${HI_EPI[i][0]}`, i % 2 ? '#f0cf65' : '#e8f4ff', HI_EPI[i][1], d, h, 30000000 * 1.4 ** i] as [string, string, string, number, number, number]))
    .map(([name, tint, blade, def, hp, price], i) => ({ key: `amulet_${ACC_LVLS[i]}`, name, kind: 'amulet' as const, lvl: ACC_LVLS[i], price: Math.round(price), def, hp, tint, blade })),
];
for (const [w, l] of Object.entries(WEAPON_LINES)) l.push(...HI_EPI.map(([e, c]) => [`${HI_NOUN[w]} ${e}`, c] as [string, string]));
const WTYPES = Object.keys(WEAPON_LINES) as WType[], WTYPE_ORDER = Object.keys(WTYPE_NAME) as WType[];
const WEAPON_ITEMS: ItemDef[] = Object.entries(WEAPON_LINES).flatMap(([wt, l]) => l.map(([name, blade], i) => ({ key: `w_${wt}_${WEAPON_TIERS[i][0]}`, name, kind: 'weapon' as const, lvl: WEAPON_TIERS[i][0], dmg: Math.round(WEAPON_TIERS[i][1] * WTYPE_DMG[wt as WType]), price: WEAPON_TIERS[i][2], blade, wtype: wt as WType })));
// a chance é dividida entre os tipos para não multiplicar a quantidade de armas que cai
const wep = (lvl: number, ch: number) => WTYPES.map(w => [`w_${w}_${lvl}`, ch * 4 / WTYPES.length] as [string, number]);
const SET_ITEMS: ItemDef[] = Object.values(SETS).sort((a, b) => a.lvl - b.lvl).flatMap(s => SET_PIECES.map(p => ({ key: `${s.key}_${p}`, name: `${PIECE[p][0]} ${s.of} ${s.name}`, kind: p, lvl: s.lvl, price: Math.round(s.price * PIECE[p][3]), def: Math.round(PIECE[p][1] * s.power), hp: Math.round(PIECE[p][2] * s.power), tint: s.color, set: s.key })));
const setDrops = (s: string, ch: number) => SET_PIECES.map(p => [`${s}_${p}`, ch] as [string, number]);
export const ITEMS: Record<string, ItemDef> = Object.fromEntries(([
  { key: 'pot_hp', name: 'Poção de Vida', kind: 'potion', lvl: 1, price: 20, heal: 80 },
  { key: 'pot_mp', name: 'Poção de Mana', kind: 'potion', lvl: 1, price: 20, mana: 50 },
  { key: 'pot_hp2', name: 'Grande Poção de Vida', kind: 'potion', lvl: 1, price: 150, heal: 450 },
  { key: 'pot_mp2', name: 'Grande Poção de Mana', kind: 'potion', lvl: 1, price: 150, mana: 260 },
  { key: 'pot_hp3', name: 'Elixir de Vida', kind: 'potion', lvl: 1, price: 900, heal: 2200 },
  { key: 'pot_mp3', name: 'Elixir de Mana', kind: 'potion', lvl: 1, price: 900, mana: 1100 },
  { key: 'box_bronze', name: 'Baú de Bronze', kind: 'box', lvl: 1, price: 5000, blade: '#c98a4a' },
  { key: 'box_prata', name: 'Baú de Prata', kind: 'box', lvl: 1, price: 30000, blade: '#d6dee8' },
  { key: 'box_ouro', name: 'Baú de Ouro', kind: 'box', lvl: 1, price: 200000, blade: '#ffd76a' },
  { key: 'box_rei', name: 'Baú do Rei', kind: 'box', lvl: 1, price: 1500000, blade: '#ff6ad5' },
  { key: 'box_mitico', name: 'Baú Mítico', kind: 'box', lvl: 1, price: 6000000, blade: '#7affd8' },
  { key: 'jewel_aurora', name: 'Joia da Aurora', kind: 'jewel', lvl: 1, price: 6000, blade: '#ffe08a' },
  { key: 'jewel_destiny', name: 'Joia do Destino', kind: 'jewel', lvl: 1, price: 30000, blade: '#6fd6ff' },
  { key: 'jewel_eclipse', name: 'Joia do Eclipse', kind: 'jewel', lvl: 1, price: 120000, blade: '#d86bff' },
  { key: 'pack_aurora', name: 'Pacote de 10 Joias da Aurora', kind: 'pack', lvl: 1, price: 60000, blade: '#ffe08a' },
  { key: 'pack_destiny', name: 'Pacote de 10 Joias do Destino', kind: 'pack', lvl: 1, price: 300000, blade: '#6fd6ff' },
  { key: 'pack_eclipse', name: 'Pacote de 10 Joias do Eclipse', kind: 'pack', lvl: 1, price: 1200000, blade: '#d86bff' },
  { key: 'plume', name: 'Pluma Gélida', kind: 'material', lvl: 1, price: 2000, blade: '#cfefff' },
  { key: 'magma_heart', name: 'Coração de Magma', kind: 'material', lvl: 1, price: 8000, blade: '#ff6a2b' },
  { key: 'ancient_scale', name: 'Escama Ancestral', kind: 'material', lvl: 1, price: 60000, blade: '#ffd76a' },
  { key: 'chaos_feather', name: 'Pena do Caos', kind: 'material', lvl: 1, price: 250000, blade: '#ff5ad1' },
  { key: 'void_crystal', name: 'Cristal do Vazio', kind: 'material', lvl: 1, price: 1500000, blade: '#9a7bff' },
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
] as ItemDef[]).concat(SET_ITEMS, WING_ITEMS, WEAPON_ITEMS, ACC_ITEMS).map(i => [i.key, i]));
// Joias: faixa de melhoria, chance e quantos + perde ao falhar
export const JEWELS: Record<string, { min: number; max: number; chance: number; fail: number }> = { jewel_aurora: { min: 0, max: 6, chance: 1, fail: 0 }, jewel_destiny: { min: 6, max: 9, chance: .6, fail: 1 }, jewel_eclipse: { min: 9, max: 15, chance: .4, fail: 2 } };
/** Itens empilháveis juntam até 1000 unidades no mesmo espaço da bolsa. */
export const STACK_MAX = 1000;
export const isStack = (d: ItemDef) => d.kind === 'potion' || d.kind === 'material' || d.kind === 'box' || d.kind === 'jewel' || d.kind === 'pack';
export const JEWEL_PACKS: Record<string, string> = { jewel_aurora: 'pack_aurora', jewel_destiny: 'pack_destiny', jewel_eclipse: 'pack_eclipse' };
export const glowTier = (p: number) => p >= 13 ? '#ff6ad5' : p >= 11 ? '#ffd76a' : p >= 9 ? '#7dffb0' : p >= 7 ? '#9fc8ff' : null;
export const RARITY = [
  { name: 'Comum', mult: 1, color: '#e8e6df' }, { name: 'Incomum', mult: 1.25, color: '#6fdc7e' }, { name: 'Raro', mult: 1.6, color: '#68b6ff' }, { name: 'Excelente', mult: 1.8, color: '#7dffb0' },
  { name: 'Ancestral', mult: 2.2, color: '#ff9d3c' }, // muito raro: 2 ou 3 opções excelentes
];
export const SHOPS: Record<string, string[]> = {
  alquimista: ['pot_hp', 'pot_mp', 'pot_hp2', 'pot_mp2', 'pot_hp3', 'pot_mp3'],
  armeira: SET_ITEMS.filter(i => i.lvl <= 86).map(i => i.key),
  wings: [],
  chest: [],
  reset: [],
  press: [],
  ferreira: ['jewel_aurora', ...Object.values(ITEMS).filter(i => i.kind === 'weapon' && i.lvl < 70).sort((a, b) => WTYPE_ORDER.indexOf(a.wtype!) - WTYPE_ORDER.indexOf(b.wtype!) || a.lvl - b.lvl).map(i => i.key), 'leather_helm', 'leather_armor', 'leather_pants', 'leather_boots'],
};
export interface MobDef {
  key: string; name: string; level: number; hp: number; dmg: number; def: number; speed: number; detect: number; leash: number;
  attackMs: number; xp: number; respawnMs: number; gold: [number, number]; drops: [string, number][]; boss?: boolean; reach?: number; bolt?: string; nova?: string;
}
const EMBER: [string, number][] = [['ember_blade', 1], ['ember_axe', 1], ['ember_staff', 1], ['ember_bow', 1]];
const ember = (ch: number) => EMBER.map(([k]) => [k, ch] as [string, number]);
export const MOBS: Record<string, MobDef> = {
  spider: { key: 'spider', name: 'Aranha Tecelã', level: 11, hp: 320, dmg: 34, def: 14, speed: 3, detect: 6.5, leash: 12, attackMs: 1200, xp: 130, respawnMs: 11000, gold: [18, 40], drops: [['pot_hp', .2], ['shard', .25], ['plume', .004], ...wep(12, .008), ...setDrops('axolotl', .012), ...setDrops('bat', .012)] },
  elf: { key: 'elf', name: 'Elfo Renegado', level: 15, hp: 480, dmg: 46, def: 18, speed: 3, detect: 8, leash: 13, attackMs: 1500, xp: 230, respawnMs: 13000, gold: [28, 60], reach: 5.5, bolt: '#d6ffa8', drops: [['pot_mp', .25], ['jewel_aurora', .02], ...wep(12, .012), ...setDrops('salamander', .014), ...setDrops('wolf', .014)] },
  sprite: { key: 'sprite', name: 'Fada Sombria', level: 17, hp: 620, dmg: 58, def: 16, speed: 3.4, detect: 7, leash: 12, attackMs: 1400, xp: 300, respawnMs: 13000, gold: [32, 70], reach: 4.5, bolt: '#c77dff', drops: [['pot_mp', .3], ['jewel_aurora', .025], ['plume', .008], ...setDrops('griffin', .012)] },
  treant: { key: 'treant', name: 'Ente Corrompido', level: 19, hp: 1100, dmg: 66, def: 30, speed: 1.6, detect: 6, leash: 11, attackMs: 1800, xp: 520, respawnMs: 18000, gold: [50, 110], drops: [['pot_hp', .3], ['jewel_aurora', .03], ['plume', .012], ...setDrops('boar', .012), ...setDrops('fox', .012), ...setDrops('deer', .012), ...setDrops('falcon', .012), ...setDrops('bear', .016), ...wep(26, .006)] },
  aracnia: { key: 'aracnia', name: 'Aracnia, Mãe da Teia', level: 28, hp: 14000, dmg: 110, def: 40, speed: 3, detect: 10, leash: 18, attackMs: 1300, xp: 9000, respawnMs: 900000, gold: [2000, 4000], boss: true, reach: 2.8, nova: '#9dff6b', drops: [['pot_hp', 1], ['plume', 1], ['jewel_aurora', 1], ['jewel_destiny', .6], ...wep(26, .3), ...setDrops('owl', .15), ...setDrops('spider', .15), ...setDrops('scorpion', .15), ...setDrops('lion', .15)] },
  skeleton: { key: 'skeleton', name: 'Esqueleto Guerreiro', level: 33, hp: 3200, dmg: 150, def: 70, speed: 2.8, detect: 7, leash: 13, attackMs: 1400, xp: 1500, respawnMs: 15000, gold: [150, 300], drops: [['pot_hp', .35], ['jewel_destiny', .012], ...wep(26, .012), ...setDrops('lion', .014), ...setDrops('owl', .014)] },
  bonearcher: { key: 'bonearcher', name: 'Arqueiro Ossudo', level: 36, hp: 3600, dmg: 170, def: 66, speed: 2.6, detect: 9, leash: 14, attackMs: 1600, xp: 1900, respawnMs: 16000, gold: [170, 340], reach: 6, bolt: '#e8e0cc', drops: [['pot_mp', .35], ['jewel_destiny', .015], ...setDrops('spider', .014), ...setDrops('scorpion', .014)] },
  ashdemon: { key: 'ashdemon', name: 'Demônio das Cinzas', level: 41, hp: 7000, dmg: 240, def: 100, speed: 3, detect: 8, leash: 13, attackMs: 1500, xp: 4200, respawnMs: 22000, gold: [320, 640], drops: [['magma_heart', .05], ['jewel_destiny', .03], ['jewel_eclipse', .005], ...setDrops('tiger', .012), ...setDrops('manticore', .012), ...wep(44, .008)] },
  cryptknight: { key: 'cryptknight', name: 'Cavaleiro da Cripta', level: 47, hp: 12000, dmg: 310, def: 150, speed: 2.4, detect: 7, leash: 12, attackMs: 1600, xp: 7800, respawnMs: 26000, gold: [550, 1000], drops: [['magma_heart', .07], ['jewel_eclipse', .01], ...setDrops('skull', .014), ...setDrops('phoenix', .012), ...setDrops('kraken', .012), ...wep(44, .014)] },
  vorgath: { key: 'vorgath', name: 'Vorgath, Rei da Cripta', level: 65, hp: 200000, dmg: 560, def: 220, speed: 2.8, detect: 12, leash: 16, attackMs: 1500, xp: 260000, respawnMs: 2400000, gold: [25000, 50000], boss: true, reach: 3, nova: '#b06bff', drops: [['pot_hp', 1], ['magma_heart', 1], ['ancient_scale', .6], ['jewel_destiny', 1], ['jewel_eclipse', .7], ...wep(44, .3), ...wep(56, .08), ...setDrops('kraken', .2), ...setDrops('phoenix', .25), ...setDrops('dragon', .12)] },
  sentinel: { key: 'sentinel', name: 'Sentinela de Mármore', level: 62, hp: 30000, dmg: 480, def: 240, speed: 2.2, detect: 7, leash: 12, attackMs: 1700, xp: 26000, respawnMs: 28000, gold: [1200, 2200], drops: [['jewel_destiny', .06], ['jewel_eclipse', .02], ['ancient_scale', .006], ...setDrops('pegasus', .014), ...setDrops('hydra', .012), ...wep(56, .006)] },
  seraph: { key: 'seraph', name: 'Serafim Caído', level: 68, hp: 34000, dmg: 560, def: 200, speed: 3, detect: 9, leash: 14, attackMs: 1500, xp: 38000, respawnMs: 30000, gold: [1500, 2800], reach: 6.5, bolt: '#fff2b0', drops: [['jewel_eclipse', .03], ['ancient_scale', .01], ...setDrops('chimera', .012), ...setDrops('dragon', .012), ...wep(56, .01)] },
  ogriffin: { key: 'ogriffin', name: 'Grifo Ancião', level: 74, hp: 52000, dmg: 720, def: 260, speed: 4.2, detect: 9, leash: 15, attackMs: 1200, xp: 62000, respawnMs: 32000, gold: [2200, 4000], drops: [['jewel_eclipse', .04], ['ancient_scale', .016], ...setDrops('demon', .006), ...setDrops('chimera', .016), ...wep(56, .014)] },
  archon: { key: 'archon', name: 'Arconte Dourado', level: 82, hp: 120000, dmg: 900, def: 340, speed: 2.8, detect: 8, leash: 13, attackMs: 1700, xp: 130000, respawnMs: 40000, gold: [4000, 7000], drops: [...wep(90, .004), ['jewel_eclipse', .08], ['ancient_scale', .03], ...setDrops('minotaur', .008), ...setDrops('sphinx', .008), ...setDrops('hummingbird', .008), ...setDrops('wyvern', .008), ...setDrops('reaper', .008), ...setDrops('demon', .012), ...setDrops('dragon', .02), ...wep(70, .006)] },
  sandscarab: { key: 'sandscarab', name: 'Escaravelho das Dunas', level: 76, hp: 60000, dmg: 760, def: 280, speed: 3.6, detect: 8, leash: 13, attackMs: 1300, xp: 78000, respawnMs: 30000, gold: [2500, 4500], drops: [['jewel_destiny', .08], ['jewel_eclipse', .04], ['ancient_scale', .016], ...setDrops('mammoth', .012), ...setDrops('djinn', .012), ...setDrops('peacock', .012), ...setDrops('rhino', .012), ...setDrops('mummy', .012)] },
  dunemummy: { key: 'dunemummy', name: 'Guardião Mumificado', level: 84, hp: 130000, dmg: 950, def: 350, speed: 2.4, detect: 8, leash: 13, attackMs: 1600, xp: 140000, respawnMs: 38000, gold: [4000, 7500], drops: [...wep(90, .006), ['jewel_eclipse', .08], ['ancient_scale', .03], ...setDrops('mammoth', .016), ...setDrops('djinn', .016), ...setDrops('peacock', .016), ...setDrops('rhino', .016), ...setDrops('mummy', .016), ...wep(70, .012)] },
  sanddjinn: { key: 'sanddjinn', name: 'Djinn da Tempestade', level: 92, hp: 170000, dmg: 1100, def: 380, speed: 3, detect: 10, leash: 15, attackMs: 1500, xp: 200000, respawnMs: 42000, gold: [6000, 10000], reach: 6.5, bolt: '#6ae0ff', drops: [...wep(90, .01), ...wep(110, .003), ['jewel_eclipse', .1], ['ancient_scale', .04], ...setDrops('titan', .007), ...setDrops('oracle', .007), ...setDrops('unicorn', .007), ...setDrops('basilisk', .007), ...setDrops('lich', .007), ...wep(70, .018)] },
  khepri: { key: 'khepri', name: 'Khepri, o Rei das Areias', level: 110, hp: 900000, dmg: 1700, def: 480, speed: 3.2, detect: 14, leash: 20, attackMs: 1400, xp: 2500000, respawnMs: 3600000, gold: [120000, 200000], boss: true, reach: 3.4, nova: '#ffcf5a', drops: [...wep(90, .3), ...wep(110, .1), ['pot_hp', 1], ['ancient_scale', 1], ['jewel_eclipse', 1], ...setDrops('titan', .12), ...setDrops('oracle', .12), ...setDrops('unicorn', .12), ...setDrops('basilisk', .12), ...setDrops('lich', .12)] },
  aethon: { key: 'aethon', name: 'Aethon, o Eterno', level: 95, hp: 600000, dmg: 1400, def: 420, speed: 3.4, detect: 14, leash: 20, attackMs: 1400, xp: 1500000, respawnMs: 3600000, gold: [80000, 150000], boss: true, reach: 3.4, nova: '#fff2b0', drops: [...wep(90, .15), ['pot_hp', 1], ['ancient_scale', 1], ['jewel_eclipse', 1], ...setDrops('minotaur', .12), ...setDrops('sphinx', .12), ...setDrops('hummingbird', .12), ...setDrops('wyvern', .12), ...setDrops('reaper', .12), ...wep(70, .4), ...setDrops('demon', .2), ...setDrops('chimera', .25), ...setDrops('hydra', .25), ...setDrops('pegasus', .25), ...setDrops('dragon', .25)] },
  imp: { key: 'imp', name: 'Diabrete Cinzento', level: 22, hp: 900, dmg: 70, def: 34, speed: 2.8, detect: 7, leash: 12, attackMs: 1500, xp: 380, respawnMs: 12000, gold: [50, 110], reach: 4.5, bolt: '#ff9d3c',
    drops: [['pot_hp', .3], ['pot_mp', .25], ['shard', .3], ['jewel_aurora', .03], ['jewel_destiny', .004], ...setDrops('griffin', .012)] },
  hound: { key: 'hound', name: 'Cão de Enxofre', level: 29, hp: 1900, dmg: 110, def: 50, speed: 4, detect: 8, leash: 14, attackMs: 1100, xp: 850, respawnMs: 15000, gold: [90, 190],
    drops: [['pot_hp', .35], ['pot_mp', .25], ...setDrops('griffin', .02), ...setDrops('lion', .01), ...wep(26, .01), ...setDrops('owl', .012), ['jewel_aurora', .05], ['jewel_destiny', .01]] },
  magma: { key: 'magma', name: 'Colosso de Magma', level: 37, hp: 5200, dmg: 190, def: 85, speed: 2, detect: 6.5, leash: 12, attackMs: 1800, xp: 2400, respawnMs: 22000, gold: [220, 420],
    drops: [['pot_hp', .4], ...setDrops('lion', .02), ...setDrops('serpent', .01), ...setDrops('tiger', .012), ['magma_heart', .03], ...wep(44, .006), ...setDrops('manticore', .012), ['jewel_destiny', .03], ['jewel_eclipse', .004], ...ember(.012)] },
  wyrm: { key: 'wyrm', name: 'Serpe Carbonizada', level: 45, hp: 9500, dmg: 260, def: 120, speed: 3, detect: 8, leash: 14, attackMs: 1700, xp: 6000, respawnMs: 30000, gold: [500, 900], reach: 5.5, bolt: '#ff5a2c',
    drops: [['pot_hp', .5], ...setDrops('serpent', .025), ...setDrops('phoenix', .012), ...setDrops('kraken', .012), ['magma_heart', .06], ...wep(44, .012), ...setDrops('pegasus', .01), ['jewel_destiny', .05], ['jewel_eclipse', .012], ...ember(.03)] },
  ignarok: { key: 'ignarok', name: 'Ignarok, o Dragão Ancestral', level: 60, hp: 120000, dmg: 420, def: 170, speed: 3, detect: 12, leash: 20, attackMs: 1500, xp: 150000, respawnMs: 1800000, gold: [15000, 30000], boss: true, reach: 3.2, nova: '#ff7a2b',
    drops: [['pot_hp', 1], ['pot_mp', 1], ...ember(.4), ...setDrops('phoenix', .3), ...setDrops('dragon', .15), ...setDrops('kraken', .2), ['plume', 1], ['magma_heart', 1], ['ancient_scale', .5], ...wep(44, .2), ...wep(56, .05), ...setDrops('demon', .05), ['jewel_destiny', 1], ['jewel_eclipse', .6], ...setDrops('pegasus', .1), ...setDrops('hydra', .08), ...setDrops('chimera', .08)] },
  slime: { key: 'slime', name: 'Gelatina Gélida', level: 2, hp: 45, dmg: 9, def: 1, speed: 1.6, detect: 4.5, leash: 10, attackMs: 1500, xp: 20, respawnMs: 8000, gold: [3, 9],
    drops: [['pot_hp', .12], ['shard', .2], ['leather_boots', .03], ['leather_helm', .03]] },
  wolf: { key: 'wolf', name: 'Lobo Geladiço', level: 7, hp: 150, dmg: 22, def: 7, speed: 3.4, detect: 7, leash: 13, attackMs: 1200, xp: 70, respawnMs: 12000, gold: [10, 25],
    drops: [['pot_hp', .15], ['pot_mp', .1], ['shard', .25], ['leather_armor', .04], ['leather_pants', .04], ['iron_axe', .02], ['rune_staff', .02], ['long_bow', .02], ['jewel_aurora', .01]] },
  golem: { key: 'golem', name: 'Colosso de Granizo', level: 14, hp: 520, dmg: 44, def: 20, speed: 1.9, detect: 6, leash: 12, attackMs: 1800, xp: 240, respawnMs: 20000, gold: [35, 80],
    drops: [['pot_hp', .25], ['shard', .4], ['iron_axe', .05], ['rune_staff', .05], ['long_bow', .05], ['rime_helm', .03], ['rime_boots', .03], ['rime_pants', .025], ['rime_armor', .02], ...setDrops('griffin', .012), ['plume', .015], ['jewel_aurora', .03], ...wep(12, .02), ...setDrops('axolotl', .02), ...setDrops('salamander', .015), ...setDrops('bat', .015), ...setDrops('wolf', .015)] },
  boss: { key: 'boss', name: 'Hrímara, a Soberana', level: 24, hp: 6500, dmg: 70, def: 32, speed: 2.7, detect: 9, leash: 16, attackMs: 1400, xp: 4000, respawnMs: 600000, gold: [800, 1500], boss: true,
    drops: [['frost_blade', .4], ['glacier_staff', .4], ['aurora_bow', .4], ['rime_armor', .5], ['rime_helm', .5], ['pot_hp', 1], ['pot_mp', 1], ['plume', .6], ['jewel_aurora', 1], ['jewel_destiny', .5], ...wep(26, .2), ...setDrops('scorpion', .1), ...setDrops('spider', .1), ...setDrops('bear', .25), ...setDrops('owl', .1), ...setDrops('lion', .25), ...setDrops('serpent', .1), ...setDrops('phoenix', .04), ...setDrops('dragon', .015)] },
};
// ---------- Mundos de alto nível (120 a 380) ----------
/** Atributos crescem com o nível, calibrados para um jogador do mesmo nível com equipamento da época. */
const lerpT = (L: number, t: [number, number][]) => { for (let i = 1; i < t.length; i++) if (L <= t[i][0]) { const [a, va] = t[i - 1], [b, vb] = t[i]; return va + (vb - va) * (L - a) / (b - a); } return t[t.length - 1][1]; };
const TOP_SETS = ['titan', 'oracle', 'unicorn', 'basilisk', 'lich'];
function hiMob(key: string, name: string, L: number, o: { boss?: boolean; reach?: number; bolt?: string; nova?: string } = {}): MobDef {
  // recalibrado para quem usa o equipamento do próprio mundo (armas/sets de alto nível): ~3x mais forte que o de nível 110
  const b = !!o.boss, hp = Math.round(lerpT(L, [[120, 300000], [150, 407000], [180, 550000], [210, 693000], [240, 900000], [270, 1100000], [300, 1375000], [340, 1700000], [380, 1930000], [400, 2050000]]) * (b ? 6 : 1) / 1000) * 1000;
  const dmg = Math.round(lerpT(L, [[120, 1810], [150, 2006], [180, 2660], [210, 2940], [240, 3620], [270, 3995], [300, 4678], [340, 5240], [380, 5585], [400, 5800]]) * (b ? 1.5 : 1));
  const def = Math.round(lerpT(L, [[120, 675], [150, 925], [180, 1250], [210, 1575], [240, 2050], [270, 2500], [300, 3125], [340, 3875], [380, 4375], [400, 4600]]) * (b ? 1.2 : 1));
  // arma/acessório do nível do mundo (e o anterior); set do nível mais alto que o monstro alcança
  const wt = HI_TIERS.filter(t => t <= L).pop() ?? 110, wp = HI_TIERS[HI_TIERS.indexOf(wt) - 1] ?? 110, st = [120, 180, 240, 300].filter(t => t <= L).pop(), sets = st ? Object.values(SETS).filter(s => s.lvl === st).map(s => s.key) : TOP_SETS;
  const drops: [string, number][] = b ? [...wep(wt, .5), ...wep(wp, .6), ['ancient_scale', 1], ['jewel_eclipse', 1], ['jewel_destiny', 1], ['magma_heart', 1], ...sets.flatMap(s => setDrops(s, .2)), ['box_mitico', L >= 200 ? .5 : .25], ['chaos_feather', 1], ['chaos_feather', L >= 240 ? 1 : .6], ...(L >= 210 ? [['void_crystal', L >= 300 ? 1 : .5] as [string, number]] : [])]
    : [...wep(wt, .006), ...wep(wp, .008), ['jewel_eclipse', .1], ['ancient_scale', .05], ['magma_heart', .05], ...sets.flatMap(s => setDrops(s, .005)), ['box_mitico', L >= 200 ? .004 : .002], ['chaos_feather', L >= 150 ? .012 : .006], ...(L >= 210 ? [['void_crystal', L >= 300 ? .004 : .002] as [string, number]] : [])];
  return { key, name, level: L, hp, dmg, def, speed: b ? 3.2 : 3, detect: b ? 14 : 9, leash: b ? 20 : 14, attackMs: b ? 1400 : 1500, xp: Math.round(hp * (b ? 2.5 : 1.15)), respawnMs: b ? 3600000 : 42000, gold: b ? [L * 1400, L * 2400] : [L * 55, L * 95], drops, boss: b || undefined, reach: o.reach ?? (b ? 3.4 : undefined), bolt: o.bolt, nova: o.nova };
}
Object.assign(MOBS, Object.fromEntries([
  hiMob('bogtoad', 'Sapo do Pântano', 120), hiMob('venomspider', 'Aranha Peçonhenta', 128), hiMob('swamphag', 'Bruxa do Brejo', 135, { reach: 6, bolt: '#9dff6b' }), hiMob('hydraqueen', 'Rainha Hidra', 150, { boss: true, nova: '#9dff6b' }),
  hiMob('frostgolem', 'Golem de Gelo Eterno', 150), hiMob('icewyrm', 'Serpe Glacial', 158), hiMob('frostseraph', 'Serafim da Nevasca', 165, { reach: 6.5, bolt: '#bdf0ff' }), hiMob('glacius', 'Glacius, o Inverno', 180, { boss: true, nova: '#bdf0ff' }),
  hiMob('lavagolem', 'Golem de Lava', 180), hiMob('flamehound', 'Cão Flamejante', 188), hiMob('pyromancer', 'Piromante', 195, { reach: 6.5, bolt: '#ff7a2b' }), hiMob('pyros', 'Pyros, Senhor do Vulcão', 210, { boss: true, nova: '#ff7a2b' }),
  hiMob('wraith', 'Espectro Faminto', 210), hiMob('deathknight', 'Cavaleiro da Morte', 218), hiMob('bonedragon', 'Dragão de Ossos', 225), hiMob('morthul', 'Morthul, o Lich Rei', 240, { boss: true, nova: '#7dffb0' }),
  hiMob('darktreant', 'Ent Sombrio', 240), hiMob('shadowelf', 'Elfo das Sombras', 248, { reach: 7, bolt: '#c77dff' }), hiMob('nightwolf', 'Lobo da Noite', 255), hiMob('sylvara', 'Sylvara, Mãe da Floresta', 270, { boss: true, nova: '#d6ff6a' }),
  hiMob('crystalgolem', 'Golem de Cristal', 270), hiMob('voidsprite', 'Fada do Abismo', 278, { reach: 6.5, bolt: '#4af0ff' }), hiMob('abyssknight', 'Guardião do Abismo', 285), hiMob('xalathar', 'Xalathar, o Devorador', 300, { boss: true, nova: '#c9a0ff' }),
  hiMob('chaosimp', 'Diabrete do Caos', 300), hiMob('chaoshound', 'Cão do Caos', 310), hiMob('chaoslord', 'Lorde do Caos', 320), hiMob('kaorth', 'Kaorth, Rei do Caos', 340, { boss: true, nova: '#ff4a6a' }),
  hiMob('voidseraph', 'Serafim do Vazio', 340, { reach: 7, bolt: '#7a4aff' }), hiMob('starbeast', 'Fera Estelar', 350), hiMob('eternalarchon', 'Arconte Eterno', 360, { reach: 6.5, bolt: '#9fd8ff' }), hiMob('nihilus', 'Nihilus, o Fim', 380, { boss: true, nova: '#ff4af0' }),
].map(m => [m.key, m])));
// Baús e acessórios caem de todos os monstros, conforme o nível (chefes têm chance bem maior)
for (const m of Object.values(MOBS)) {
  const L = m.level, acc = ACC_LVLS.filter(l => l <= L + 5).pop();
  if (acc) m.drops.push([`ring_${acc}`, m.boss ? .15 : .004], [`amulet_${acc}`, m.boss ? .15 : .004]);
  if (m.boss) m.drops.push(L >= 60 ? ['box_rei', .3] : L >= 30 ? ['box_ouro', .5] : ['box_prata', .6]);
  else if (L >= 60) m.drops.push(['box_ouro', .008], ['box_prata', .006]);
  else if (L >= 30) m.drops.push(['box_prata', .01], ['box_bronze', .006]);
  else m.drops.push(['box_bronze', .012]);
}
export type SkillKind = 'spin' | 'dash' | 'splash' | 'multi' | 'summon' | 'curse' | 'buff' | 'heal' | 'drain' | 'spirits' | 'cone' | 'chain' | 'wave';
export interface Skill { lvl?: number; slow?: number; buff?: 'atk' | 'def'; heal?: number; curse?: number; n: number; name: string; kind: SkillKind; mana: number; cd: number; mult: number; radius?: number; range?: number; count?: number; pet?: string; color?: string; ms?: number; arc?: number }
export interface ClassDef {
  key: string; name: string; desc: string; base: { str: number; agi: number; vit: number; ene: number }; range: number; magic: boolean;
  atk: [number, number, number]; color: string; pants: string; weapon: string; weapons: string[]; bolt: string | null; skills: Skill[];
}
// atk = pesos de Força, Agilidade e Energia no ataque
export const CLASSES: Record<string, ClassDef> = {
  dark_warrior: { key: 'dark_warrior', name: 'Dark Warrior', desc: 'Corpo a corpo, muita resistência.', base: { str: 28, agi: 20, vit: 25, ene: 10 }, range: 1.7, magic: false, atk: [.333, 0, 0], color: '#4d5873', pants: '#373b52', weapon: 'short_sword', weapons: ['sword', 'axe', 'mace', 'spear', 'gsword'], bolt: null, skills: [
    { n: 1, name: 'Golpe Circular', kind: 'spin', mana: 12, cd: 4000, mult: 1.3, radius: 2.4 }, { n: 2, name: 'Investida', kind: 'dash', mana: 18, cd: 7000, mult: 2, range: 7 },
    { n: 3, lvl: 10, name: 'Grito de Guerra', kind: 'buff', buff: 'atk', mana: 25, cd: 25000, mult: 0, ms: 15000, color: '#ff8a5c' }, { n: 4, lvl: 25, name: 'Terremoto', kind: 'spin', mana: 40, cd: 12000, mult: 2.4, radius: 3.8 }, { n: 5, lvl: 60, name: 'Ira do Titã', kind: 'spin', mana: 60, cd: 15000, mult: 3.4, radius: 4.8, color: '#ff8a3c' }, { n: 6, lvl: 120, name: 'Lâmina do Apocalipse', kind: 'dash', mana: 90, cd: 18000, mult: 5.6, range: 10 },
    { n: 7, lvl: 40, name: 'Golpe Cortante', kind: 'cone', mana: 30, cd: 5000, mult: 2.6, radius: 3.4, range: 3.4, arc: 130, color: '#ffe3a0' }] },
  arcane_wizard: { key: 'arcane_wizard', name: 'Arcane Wizard', desc: 'Magia à distância, dano alto, pouca defesa.', base: { str: 18, agi: 18, vit: 15, ene: 32 }, range: 7, magic: true, atk: [0, 0, .4], color: '#3f4fa8', pants: '#2d3778', weapon: 'app_staff', weapons: ['staff', 'scepter'], bolt: '#8fd0ff', skills: [
    { n: 1, name: 'Bola de Fogo', kind: 'splash', mana: 10, cd: 3000, mult: 1.5, radius: 2, range: 8, color: '#ff8a3c' }, { n: 2, name: 'Tempestade de Raios', kind: 'multi', mana: 20, cd: 8000, mult: 1.4, radius: 4, count: 5, range: 8, color: '#f6f07a' },
    { n: 3, lvl: 10, name: 'Nova Gélida', kind: 'spin', mana: 22, cd: 9000, mult: 1.2, radius: 3.6, slow: 5000, color: '#7fe3ff' }, { n: 4, lvl: 25, name: 'Meteoro', kind: 'splash', mana: 45, cd: 12000, mult: 3.2, radius: 3.2, range: 9, color: '#ff5a2c' }, { n: 5, lvl: 60, name: 'Corrente de Relâmpagos', kind: 'multi', mana: 65, cd: 14000, mult: 2.8, radius: 6, count: 8, range: 10, color: '#a8e4ff' }, { n: 6, lvl: 120, name: 'Cataclismo', kind: 'splash', mana: 110, cd: 20000, mult: 5.4, radius: 5, range: 10, color: '#ff3c7a' },
    { n: 7, lvl: 40, name: 'Espíritos Malignos', kind: 'spirits', mana: 50, cd: 10000, mult: .85, radius: 4.6, count: 4, color: '#9fe8ff' }] },
  mystic_archer: { key: 'mystic_archer', name: 'Mystic Archer', desc: 'Arqueira veloz com um espírito auxiliar.', base: { str: 20, agi: 34, vit: 18, ene: 12 }, range: 8, magic: false, atk: [0, .34, 0], color: '#4f7a45', pants: '#3a5a33', weapon: 'oak_bow', weapons: ['bow', 'crossbow'], bolt: '#f1e3b8', skills: [
    { n: 1, name: 'Flecha Tripla', kind: 'multi', mana: 10, cd: 4000, mult: 1.2, radius: 3.5, count: 3, range: 9, color: '#f1e3b8' }, { n: 2, name: 'Espírito da Mata', kind: 'summon', mana: 22, cd: 12000, mult: .7, pet: 'wisp', ms: 30000 },
    { n: 3, lvl: 10, name: 'Cura da Mata', kind: 'heal', heal: .35, mana: 28, cd: 14000, mult: 0, color: '#7dffa1' }, { n: 4, lvl: 25, name: 'Chuva de Flechas', kind: 'splash', mana: 38, cd: 11000, mult: 2.4, radius: 3.6, range: 10, color: '#f1e3b8' }, { n: 5, lvl: 60, name: 'Salva Perfurante', kind: 'multi', mana: 55, cd: 13000, mult: 2.7, radius: 6, count: 7, range: 11, color: '#6ae0ff' }, { n: 6, lvl: 120, name: 'Chuva Estelar', kind: 'splash', mana: 95, cd: 19000, mult: 5, radius: 5.2, range: 11, color: '#ffe08a' },
    { n: 7, lvl: 40, name: 'Flecha Perfurante', kind: 'wave', mana: 34, cd: 8000, mult: 2.5, radius: .9, range: 10, color: '#f1e3b8' }] },
  spell_knight: { key: 'spell_knight', name: 'Spell Knight', desc: 'Híbrido de força e energia.', base: { str: 26, agi: 24, vit: 20, ene: 22 }, range: 1.7, magic: false, atk: [.2, 0, .18], color: '#7a3f5e', pants: '#552c43', weapon: 'short_sword', weapons: ['sword', 'axe', 'mace', 'gsword'], bolt: null, skills: [
    { n: 1, name: 'Lâmina Arcana', kind: 'splash', mana: 12, cd: 3500, mult: 1.6, radius: 2, range: 2.6, color: '#d58cff' }, { n: 2, name: 'Explosão Rúnica', kind: 'spin', mana: 20, cd: 7000, mult: 1.7, radius: 3 },
    { n: 3, lvl: 10, name: 'Escudo Rúnico', kind: 'buff', buff: 'def', mana: 25, cd: 25000, mult: 0, ms: 15000, color: '#c9a4ff' }, { n: 4, lvl: 25, name: 'Corte Dimensional', kind: 'dash', mana: 40, cd: 11000, mult: 3.2, range: 8 }, { n: 5, lvl: 60, name: 'Tormenta Arcana', kind: 'spin', mana: 60, cd: 14000, mult: 3.2, radius: 4.6, color: '#d58cff' }, { n: 6, lvl: 120, name: 'Julgamento Rúnico', kind: 'splash', mana: 95, cd: 18000, mult: 5.2, radius: 4.4, range: 7, color: '#ffd76a' },
    { n: 7, lvl: 40, name: 'Lâmina Rúnica', kind: 'wave', mana: 38, cd: 8000, mult: 2.8, radius: 1.1, range: 7, color: '#d58cff' }] },
  shadow_summoner: { key: 'shadow_summoner', name: 'Shadow Summoner', desc: 'Invoca sombras e amaldiçoa inimigos.', base: { str: 16, agi: 20, vit: 18, ene: 34 }, range: 6.5, magic: true, atk: [0, 0, .34], color: '#4a2f6b', pants: '#33214a', weapon: 'app_staff', weapons: ['staff', 'scepter'], bolt: '#b06bff', skills: [
    { n: 1, name: 'Invocar Sombra', kind: 'summon', mana: 22, cd: 10000, mult: 1, pet: 'shade', ms: 35000 }, { n: 2, name: 'Maldição', kind: 'curse', mana: 14, cd: 6000, mult: .8, range: 8, ms: 8000, color: '#b06bff' },
    { n: 3, lvl: 10, name: 'Dreno Vital', kind: 'drain', heal: .5, mana: 18, cd: 7000, mult: 1.6, range: 8, color: '#ff5a7a' }, { n: 4, lvl: 25, name: 'Praga Sombria', kind: 'multi', curse: 8000, mana: 42, cd: 13000, mult: 2.2, radius: 4.5, count: 6, range: 9, color: '#9dff6b' }, { n: 5, lvl: 60, name: 'Legião de Almas', kind: 'multi', curse: 10000, mana: 65, cd: 15000, mult: 2.9, radius: 6, count: 8, range: 10, color: '#c77dff' }, { n: 6, lvl: 120, name: 'Colheita da Morte', kind: 'drain', heal: .8, mana: 100, cd: 20000, mult: 5, range: 10, color: '#ff3c5a' },
    { n: 7, lvl: 40, name: 'Correntes Sombrias', kind: 'chain', mana: 40, cd: 9000, mult: 2.4, radius: 4, count: 6, range: 8, slow: 3000, color: '#b06bff' }] },
};
export const classOf = (name?: string): ClassDef => Object.values(CLASSES).find(c => c.name === name) ?? CLASSES.dark_warrior;
export const canWield = (c: ClassDef, d: ItemDef) => d.kind === 'wings' ? d.cls === c.key : d.set ? SETS[d.set].cls === c.key : d.kind !== 'weapon' || c.weapons.includes(d.wtype!);
export const HAIR_COLORS = ['#2b2230', '#7a4a22', '#d9b24a', '#b23a2e', '#d8dde6', '#3f6fb5'];
export const HAIR_STYLES = ['Curto', 'Espetado', 'Longo'];
export const xpToNext = (lv: number) => Math.floor(50 * Math.pow(lv, 1.9) + 40);

/** Master Level começa a contar a partir deste número de Resets. */
export const MASTER_RESETS = 1;
/** Master Reset: pede 25 Resets e nível de Reset; zera os Resets e dá pontos permanentes a cada Master Reset. */
export const MR_RESETS = 25, MR_GOLD = 50_000_000, MR_POINTS = 5000;
export const fmtRes = (resets: number, mr = 0) => mr ? `MR${mr} · R${resets}` : `R${resets}`;
export const MASTER_MAX = 200, MASTER_NODE_MAX = 30, masterNext = (ml: number) => Math.floor(5e6 * Math.pow(1.06, ml));
export const MASTER_NODES: Record<string, string> = { atk: 'Ataque +1%', def: 'Defesa +1%', hp: 'Vida +1%', crit: 'Crítico +0,3%' };
export interface Base { mtree?: Record<string, number>; cls?: string; level: number; str: number; agi: number; vit: number; ene: number }
export interface ItemInst { id: string; key: string; qty: number; slot: number; equip: string | null; rarity: number; plus?: number; opts?: string[] }
export const sellPrice = (i: ItemInst) => Math.floor(ITEMS[i.key].price * .3 * (1 + i.rarity * .5) * (1 + (i.plus ?? 0) * .3));
export const itemStat = (i: ItemInst, f: 'dmg' | 'def' | 'hp') => Math.round((ITEMS[i.key][f] ?? 0) * RARITY[i.rarity].mult * (1 + (i.plus ?? 0) * .08));
export function setCounts(items: ItemInst[]) { const m: Record<string, number> = {}; for (const i of items) { const s = i.equip && ITEMS[i.key].set; if (s) m[s] = (m[s] ?? 0) + 1; } return m; }
export const fullSetOf = (keys: (string | null | undefined)[]) => { const s = keys.map(k => k ? ITEMS[k]?.set : undefined); return s.length === 4 && s[0] && s.every(x => x === s[0]) ? s[0] : null; };
export function derive(b: Base, items: ItemInst[]) {
  let dmg = 0, def = 0, hp = 0; const w = classOf(b.cls).atk;
  for (const i of items) if (i.equip) { dmg += itemStat(i, 'dmg'); def += itemStat(i, 'def'); hp += itemStat(i, 'hp'); }
  let wa = 0, wabs = 0; const O: Record<string, number> = {}; for (const i of items) if (i.equip) { const d = ITEMS[i.key]; if (d.kind === 'wings') { wa += WING_TIER[d.wtier!].atk; wabs += WING_TIER[d.wtier!].abs; } for (const o of i.opts ?? []) O[o] = (O[o] ?? 0) + 1; }
  const q0 = (k: string) => O[k] ?? 0;
  const mt = b.mtree ?? {}, mv = (k: string) => mt[k] ?? 0;
  let pct = mv('atk') * .01; for (const [k, n] of Object.entries(setCounts(items))) { const q = SETS[k].bonus; if (n >= 2) def += q.def; if (n >= 3) hp += q.hp; if (n >= 4) pct += q.atk; }
  return {
    maxHp: Math.floor((70 + b.level * 3 + b.vit * 3 + hp) * (1 + q0('hp') * .04 + mv('hp') * .01)), maxMp: Math.floor((20 + b.level + b.ene * 2) * (1 + q0('mp') * .04)),
    atk: Math.floor((b.str * w[0] + b.agi * w[1] + b.ene * w[2] + dmg) * (1 + pct + wa + q0('atk') * .06)), def: Math.floor((b.agi / 5 + def) * (1 + mv('def') * .01)),
    attackMs: Math.max(280, (1000 - b.agi * 3) * (1 - q0('speed') * .07)), crit: Math.min(.6, .05 + b.agi * .0007 + q0('crit') * .08 + mv('crit') * .003), dodge: Math.min(.4, b.agi * .0008 + q0('dodge') * .03),
    absorb: Math.min(.6, wabs + q0('absorb') * .04), reflect: q0('reflect') * .05, goldPct: q0('goldx') * .3, lifeK: q0('lifek') * .08, manaK: q0('manak') * .1,
  };
}
export const rollDamage = (atk: number, def: number, rnd: number) => Math.max(1, Math.round((atk - def * .6) * (.85 + rnd * .3)));

// ---------- configurações editáveis no painel /admin ----------
export interface MobOverride { hp?: number; dmg?: number; def?: number; xp?: number; respawnMs?: number; drop?: number }
export interface Settings { resetLevel: number; resetPoints: number; resetGold: number; exc: number; xp: number; gold: number; drop: number; jewel: number; hp: number; dmg: number; respawn: number; test: boolean; jewels: Record<string, number>; mobs: Record<string, MobOverride> }
export const DEFAULT_SETTINGS: Settings = { resetLevel: 400, resetPoints: 500, resetGold: 1000000, exc: 1, xp: 1, gold: 1, drop: 1, jewel: 1, hp: 1, dmg: 1, respawn: 1, test: CONFIG.testCommands, jewels: {}, mobs: {} };
const clampN = (v: unknown, lo: number, hi: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null; };
/** Aceita só campos conhecidos e dentro de limites seguros. */
export function cleanSettings(x: any): Settings {
  const s: Settings = { ...DEFAULT_SETTINGS, jewels: {}, mobs: {} };
  for (const k of ['exc', 'xp', 'gold', 'drop', 'jewel', 'hp', 'dmg', 'respawn'] as const) s[k] = clampN(x?.[k], k === 'respawn' || k === 'hp' ? .05 : 0, 1000) ?? 1;
  s.test = x?.test === true;
  s.resetLevel = Math.round(clampN(x?.resetLevel, 2, CONFIG.maxLevel) ?? 400); s.resetPoints = Math.round(clampN(x?.resetPoints, 0, 100000) ?? 500); s.resetGold = Math.round(clampN(x?.resetGold, 0, 2e9) ?? 1000000);
  for (const k of Object.keys(JEWELS)) { const v = clampN(x?.jewels?.[k], 0, 1); if (v !== null && x?.jewels?.[k] !== '' && x?.jewels?.[k] != null) s.jewels[k] = v; }
  for (const k of Object.keys(MOBS)) { const o = x?.mobs?.[k]; if (!o || typeof o !== 'object') continue; const r: MobOverride = {}; const lim: Record<keyof MobOverride, [number, number]> = { hp: [1, 1e9], dmg: [0, 1e7], def: [0, 1e6], xp: [0, 1e9], respawnMs: [1000, 864e5], drop: [0, 1000] };
    for (const f of Object.keys(lim) as (keyof MobOverride)[]) if (o[f] !== '' && o[f] != null) { const v = clampN(o[f], lim[f][0], lim[f][1]); if (v !== null) r[f] = v; } if (Object.keys(r).length) s.mobs[k] = r; }
  return s;
}
