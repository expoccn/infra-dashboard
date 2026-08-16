# Validação — Frontend Claro RJO-AM v7 (login aprovado)

Data da revisão: 2026-08-16.

## Escopo desta revisão

- Atualização da página `/login` para o layout esteticamente aprovado.
- Uso da marca Claro como identidade principal.
- Texto principal: `Governança de Infraestrutura` / `DC-RJO-AM`.
- Logo CCN Automação discreto no canto inferior esquerdo, sem textos adicionais e sem corte.
- Fundo visual inspirado no conceito aprovado, usando recorte da paisagem/data center como asset do frontend.
- Cartão de login branco, título em vermelho Claro e controles reais de autenticação.
- `/alterar-senha` ajustada para a mesma linguagem visual da tela de login.
- Preservação do seletor de tema e de toda a lógica de autenticação existente.
- Nova varredura de rotas, imports, sintaxe, estados de carregamento/erro e endpoints usados pelo frontend.

## Assets validados

- `public/login-datacenter-bg.jpg`: 540x690, sem textos do conceito incorporados.
- `public/claro-wordmark-red.png`: 404x145, transparência preservada.
- `public/ccn-logo-white.png`: 1854x735, logo completo; alpha bbox `(8, 8, 1846, 727)`, garantindo margem interna e ausência de corte.
- `public/claro-logo.png`: preservado para o dashboard/sidebar.

O logo CCN é renderizado com `object-contain` e margem inferior/esquerda fixa, sem `overflow: hidden` no elemento. Em telas pequenas o shell permite rolagem vertical (`overflow-x-hidden`), evitando corte do logo ou do formulário.

## Rotas

Foram encontrados e validados 14 caminhos:

1. `/`
2. `/energia-pue`
3. `/disponibilidade`
4. `/manutencao`
5. `/capacidade`
6. `/climatizacao`
7. `/diesel`
8. `/racks`
9. `/plano-acao`
10. `/qualidade-dados`
11. `/relatorios`
12. `/analises-ia`
13. `/login`
14. `/alterar-senha`

Resultado:

- 14/14 declaradas com `createFileRoute`.
- 14/14 presentes em `routeTree.gen.ts`.
- 12/12 rotas operacionais presentes na Sidebar.
- `/login` e `/alterar-senha` ficam fora da navegação operacional, conforme esperado.

## Gate de autenticação

`AuthGate` foi revisado para os fluxos abaixo:

- Sem token/sessão: rota protegida -> `/login`.
- Login válido + `must_change_password=true` -> `/alterar-senha`.
- Usuário autenticado com senha regular -> acesso às rotas operacionais.
- Usuário autenticado tentando abrir `/login` -> `/`.
- Sessão expirada / HTTP 401 -> evento de expiração -> limpeza da sessão -> `/login`.
- Logout -> revogação remota (quando possível) + encerramento local obrigatório.
- Troca de senha -> encerra sessão -> novo login obrigatório.

## Integrações por rota

- Visão Executiva -> `useDashboard`.
- Energia & PUE -> `useDashboard`.
- Disponibilidade -> `useDashboard`.
- Manutenção -> `useDashboard`, `useMaintenance`, `useSaveMaintenance`.
- Capacidade -> `useDashboard`.
- Climatização -> `useDashboard`.
- Diesel -> `useDashboard`.
- Racks -> `useDashboard`, `useRacks`, `useSaveRacks`.
- Plano de Ação -> `useDashboard`.
- Qualidade dos Dados -> `useDashboard`, `useHistory`.
- Relatórios -> `useDashboard`, `useReport`.
- Análises por IA -> `useDashboard`.
- Login -> `useAuth.login`.
- Alterar senha -> `useAuth.changePassword`.

Endpoints esperados no frontend continuam presentes:

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/change-password`
- `GET /dashboard?period=...`
- `GET /history`
- `GET /health`
- `GET/POST /racks`
- `GET/POST /maintenance`
- `GET /report?period=...`

## Estados visuais e componentes

As 12 rotas operacionais continuam usando `PageState` para loading/erro; não há `return null` silencioso em rotas ou componentes principais.

O dashboard continua baseado em tokens semânticos (`background`, `card`, `surface`, `foreground`, `muted`, `primary`, `success`, `warning`, `critical`), mantendo compatibilidade com tema claro/escuro. Não foram encontrados hexadecimais fixos nas rotas operacionais ou componentes de dashboard. Os hexadecimais do fluxo de autenticação são intencionais e exclusivos da identidade Claro aprovada (vermelho, branco e tons neutros do cartão).

O `ThemeProvider` permanece no root e o `ThemeToggle` está disponível tanto no dashboard quanto nas telas de autenticação. A tela de login mantém a composição de marca escura + cartão branco por decisão estética, enquanto a preferência escolhida continua sendo preservada para o restante da aplicação.

## Textos e apresentação ao cliente

Nenhuma ocorrência visível de `n8n`, `Redis`, `webhook`, `workflow`, `backend`, `OpenAI` ou `2See` foi encontrada em `src/routes`, `src/components`, `src/context` ou `src/hooks`.

Os textos removidos do conceito aprovado também não aparecem no frontend:

- `Visão completa da infraestrutura crítica do data center.`
- copyright no rodapé;
- `Política de Privacidade`;
- `Termos de Uso`;
- texto adicional abaixo do logo CCN.

## Validação TypeScript / imports

- 96 arquivos `.ts/.tsx` transpilados via TypeScript 5.8.3.
- Erros sintáticos: **0**.
- Imports internos ausentes: **0**.
- Rotas ausentes no route tree: **0**.
- Rotas operacionais ausentes na Sidebar: **0**.

## Limitação do ambiente de validação

Não foi possível executar `npm run build` porque o ZIP não contém `node_modules` e o ambiente atual não consegue acessar o registry para instalar as dependências. Por isso a validação foi feita por transpilação TypeScript de todos os arquivos, resolução estática de imports, validação do route tree, contratos de hooks/endpoints, assets, fluxo de autenticação e varredura de componentes.

O smoke test final deve ser feito após o deploy, verificando `/login`, primeiro acesso do admin, `/alterar-senha`, logout, expiração de sessão e as 12 rotas protegidas em tema claro e escuro.
