# Eternal MU · versão 0.19

MMORPG 2D em pixel art com servidor autoritativo em Cloudflare Workers, Durable Objects (um por mapa) e D1.

## Publicar

```bash
npm install
npx wrangler login
npx wrangler d1 create eternal-mu
```

Copie o `database_id` exibido para `wrangler.toml`, no lugar de `COLE_AQUI_O_ID_DO_D1`. Depois:

```bash
npx wrangler d1 migrations apply eternal-mu --remote
npx wrangler deploy
```

Para publicar via GitHub, faça o passo do banco acima, envie o repositório e conecte-o em Workers & Pages. O `public/game.js` já vem compilado, então não é preciso comando de build.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra `http://localhost:8787`. Para testar com dois jogadores, use uma janela normal e uma anônima.

## Controles

| Ação | Computador | Celular |
|---|---|---|
| Mover | Botão esquerdo (segure para seguir o cursor) | Joystick |
| Atacar | Botão esquerdo no monstro, ou Espaço | Atacar |
| Habilidades | Botão direito usa a selecionada; 1 e 2 selecionam | Botões 1 e 2 |
| Poções | Q e E | Vida e Mana |
| Bolsa, personagem, mapa | I, C, M | Bolsa, Perfil, Mapa |
| Chat | Enter | Campo de chat |
| Grupo e troca | D com o cursor no jogador | Toque no jogador |

## Comando de teste

No chat, `/teste` dá o set mais forte da sua classe, joias e 500.000 moedas, e sobe o personagem ao nível exigido. `/teste 1` a `/teste 4` escolhem o set, do mais fraco ao mais forte. **Antes de abrir ao público, mude `testCommands` para `false` em `shared/data.ts`** e rode `npm run build`.

## Painel de administração

Fica em `/admin`. Para tornar uma conta administradora, execute no Console do D1:

```sql
UPDATE accounts SET is_admin=1 WHERE username='SEU_USUARIO';
```

O painel edita taxas de XP, moedas, drops e joias, cada monstro, as chances das joias, o comando `/teste`, jogadores e avisos.

## Onde mexer

- `shared/data.ts`: itens, monstros, drops, fórmulas de XP, atributos e dano
- `shared/world.ts`: mapas, NPCs, portais e áreas de monstros
- `server/worker.ts`: contas, sessões e personagens
- `server/room.ts`: simulação de cada mapa (movimento, combate, IA, loja, chat, salvamento)
- `client/art.ts`: pixel art gerada por código
- `client/main.ts`: telas, HUD, controles e renderização
- `migrations/`: esquema do banco

Depois de alterar `client/` ou `shared/`, rode `npm run build`.

## Novidades da 0.13

Asas por classe em 3 níveis, itens excelentes e 16 armas novas.

## Situação da 0.8

Novo na 0.8: resposta imediata aos comandos (20 atualizações/s e previsão local), 4 habilidades por classe, joias e melhorias de +1 a +15 com brilho nos equipamentos.

Novo na 0.7: troca entre jogadores com confirmação dupla, 20 sets exclusivos por classe e sequência de coleta (até +50% de XP e moedas).

Novo na 0.6: 6 sets (Axolote Encantado, Urso Ancião, Coruja Lunar, Tigre Escarlate, Kraken Abissal, Demônio Soberano) e renderização bem mais leve.

Novo na 0.5: mapa Infernal Dominion (nível 20+), lava, 4 monstros, o chefe Ignarok e armas flamejantes.

Novo na 0.4: 5 sets com visual próprio (Grifo Celeste, Leão Dourado, Serpente Esmeralda, Fênix Rubra, Dragão Dessecado), bônus por peças, aura de set completo e a Armeira em Valoria.

Novo na 0.3: visual refeito (transições de terreno, ciclo de dia e noite, iluminação dinâmica, roupas por classe, interface com orbes de vida e mana, ícones de habilidade) e venda de itens listada na loja.

Novo na 0.2: Arcane Wizard, Mystic Archer, Spell Knight e Shadow Summoner, invocações, maldição, cajados e arcos, grupos de até 5 com XP configurável e chat de grupo.

Da 0.1: cadastro e login, sessões com expiração, sair de todos os dispositivos, limite de tentativas, até 5 personagens, Dark Warrior, Valoria e Frostvale, portais, multiplayer em tempo real, colisão e movimento validados no servidor, combate, 2 habilidades, poções, morte e retorno, IA de monstros, chefe com 2 fases, XP e pontos, inventário e equipamento visível, loja, drops, chat local e global, minimapa, reconexão, controles de toque.

Diferenças em relação à especificação:

- Motor próprio em Canvas 2D no lugar de Phaser 3, e DOM simples no lugar de React.
- Senhas com PBKDF2-SHA256 (100 mil iterações, o máximo do Workers) no lugar de Argon2id.
- Sprites em 4 direções.

Ainda faltam: verificação de e-mail e recuperação de senha (exigem serviço de e-mail), captcha, reset e Master Level, guildas, amigos, mercado, baú, quests, eventos, ranking, painel administrativo, música e app Android (Capacitor).
