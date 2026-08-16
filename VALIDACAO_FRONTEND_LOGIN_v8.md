# Validação Frontend Login v8 — Refinamento visual

## Objetivo

Refinar a tela institucional de autenticação aprovada, corrigindo:

- background excessivamente ampliado / com divisão visual entre imagem e fundo preto;
- seletor de tema indevido na tela de login;
- posicionamento e margens da marca CCN;
- consistência visual entre `/login` e `/alterar-senha`;
- transição visual durante a checagem de sessão.

## Alterações aplicadas

### Background

- Criado `public/login-datacenter-bg-wide.jpg` em 1920x1080, derivado do asset já usado pelo projeto, preservando proporção e evitando estiramento.
- O background agora cobre a viewport inteira (`absolute inset-0`, `bg-cover`, `bg-center`, `bg-no-repeat`).
- Removida a implementação anterior que limitava a imagem a aproximadamente 58–62% da largura.
- Aplicados overlays graduais para preservar legibilidade sem criar um painel preto separado à direita.

### Tema da autenticação

- `ThemeToggle` removido integralmente do `AuthShell`.
- `/login` e `/alterar-senha` usam aparência institucional fixa escura/vermelha.
- O seletor claro/escuro continua disponível normalmente dentro do dashboard após autenticação.
- Cards brancos de autenticação usam `colorScheme: light` para manter inputs e controles nativos consistentes mesmo quando a preferência salva do dashboard for escura.

### Composição

- Marca Claro e título mantidos à esquerda.
- Card de autenticação limitado a 535 px e posicionado à direita.
- CCN permanece discreto no canto inferior esquerdo, com margem de segurança e sem corte.
- Em telas pequenas, a CCN entra no fluxo da página para evitar sobreposição/corte.
- Tela de carregamento do `AuthGate` em rotas de autenticação passou a usar fundo escuro institucional para evitar flash do tema claro antes do login.

## Validação estrutural

- Arquivos TS/TSX verificados: **96**.
- Erros de transpilação sintática: **0**.
- Imports internos ausentes: **0**.
- Rotas declaradas: **14/14**.
- Rotas operacionais da Sidebar: **12/12 existentes**.
- Route tree: **14/14 rotas presentes**.
- Todas as 12 rotas operacionais continuam usando `AppShell` e possuem tratamento de loading/erro.

### Rotas verificadas

- `/`
- `/energia-pue`
- `/disponibilidade`
- `/manutencao`
- `/capacidade`
- `/climatizacao`
- `/diesel`
- `/racks`
- `/plano-acao`
- `/qualidade-dados`
- `/relatorios`
- `/analises-ia`
- `/login`
- `/alterar-senha`

## Validação de autenticação / tema

- `/login` usa `AuthShell`: OK.
- `/alterar-senha` usa `AuthShell`: OK.
- `ThemeToggle` ausente do AuthShell: OK.
- `ThemeToggle` preservado no dashboard: OK.
- Background full-screen 16:9 presente: OK.
- Marca Claro presente: OK.
- Marca CCN presente e com margem segura: OK.
- Implementação antiga de background dividido removida: OK.
- Loading de autenticação com fundo institucional escuro: OK.
- Cards de login/troca de senha com esquema de cor claro: OK.
- Menções técnicas (`Redis`, `n8n`, `webhook`, `workflow`) em rotas/componentes visíveis: **0**.

## Build

O `npm run build` não pôde ser executado neste ambiente porque o ZIP recebido não contém `node_modules` (`vite: not found`). A validação foi realizada por transpilação TypeScript dos 96 arquivos, resolução de imports, consistência de rotas, assets e inspeções específicas do fluxo de autenticação.

## Resultado

**Refinamento aprovado nos testes estruturais.**

Próximo teste recomendado após deploy: validar visualmente `/login` em 1920x1080, 1366x768 e mobile, depois executar o fluxo `login -> troca obrigatória de senha -> dashboard -> logout`.
