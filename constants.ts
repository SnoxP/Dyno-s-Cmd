import { Tag, User } from './types';

export const INITIAL_TAGS: Tag[] = [
  {
    name: "rockstar-fix",
    content: `**O jogo está pedindo para entrar no _Launcher da RockStart_, o que eu faço⁉️**

1. Coloque a pasta do jogo nas exclusões do antivírus
2. Acesse o site: https://generator.ryuu.lol/fixes
3. Busque o *nome do jogo* e baixe o fix.
4. Extraia os arquivos para a pasta do jogo.
5. Inicie o jogo pelo \`fix dentro da pasta do jogo\`.

**Não consigo baixar, o navegador disse é perigoso...**
* É normal, o fix contém arquivos para enganar o jogo.
* Apenas use outro navegador para baixar.

**O fix acima não serviu, tem outra opção?**
* Sim, baixe o fix dessa página:
* https://github.com/onajlikezz/Nightlight-Game-Launcher
* Inicie o jogo pelo \`Nightlight Game Launcher\``,
    author: "Admin",
    createdAt: Date.now()
  },
  {
    name: "hello",
    content: "Welcome to the server! 👋\nUse `/tags` to see available commands.",
    author: "System",
    createdAt: Date.now()
  }
];

export const DYNO_USER: User = {
  username: "Dyno",
  avatar: "https://cdn.discordapp.com/avatars/155149108183695360/b545f949437a346513364f7b6005b76b.png", // Dyno avatar url or placeholder
  isBot: true,
  botTag: true
};

export const CURRENT_USER: User = {
  username: "User",
  avatar: "https://picsum.photos/200",
  isBot: false
};
