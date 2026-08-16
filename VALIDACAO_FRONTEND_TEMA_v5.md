# Validação Frontend — Tema claro/escuro e apresentação ao cliente

Data: 2026-08-16

## Objetivo

- preservar o tema escuro já aprovado;
- adicionar tema claro com troca manual e persistência;
- remover da interface qualquer menção à infraestrutura técnica interna;
- apresentar a origem automática como **WebCTRL via CSV**;
- manter todos os caminhos de dados e formulários já implementados.

## Alterações aplicadas

### Apresentação ao usuário

- Cabeçalho: `Dados automáticos: WebCTRL via CSV`.
- Rodapé da sidebar: `Dados disponíveis`, `Verificando dados` ou `Dados indisponíveis`.
- Loading: `Consultando os dados do dashboard...`.
- Erros: mensagens orientadas ao usuário, sem expor detalhes internos.
- Racks/Manutenção: confirmação simplificada para `Lançamento salvo com sucesso.`.
- Relatórios: nomenclatura técnica substituída por termos de negócio.

Uma varredura em `src/routes` e `src/components` retornou **zero ocorrências** dos termos técnicos que não devem aparecer em tela.

### Tema

- `ThemeProvider` criado em `src/context/ThemeContext.tsx`.
- `ThemeToggle` criado em `src/components/dashboard/ThemeToggle.tsx`.
- Desktop: botão compacto no topo da sidebar.
- Mobile: botão textual no cabeçalho.
- Tema escuro continua sendo o padrão inicial.
- Preferência salva em `localStorage` na chave `claro-rjo-am-theme`.
- Script de inicialização aplica o tema antes da hidratação para reduzir flash visual.
- Página de erro estática também respeita a preferência persistida.

## Paleta do tema claro

O tema claro usa exclusivamente tokens semânticos (`background`, `card`, `surface`, `foreground`, `muted`, `primary`, `success`, `warning`, `critical`, sidebar etc.).

Validação de contraste WCAG para textos principais do tema claro:

| Par | Contraste |
|---|---:|
| foreground / background | 15,33:1 |
| foreground / card | 16,47:1 |
| muted-foreground / background | 5,82:1 |
| muted-foreground / card | 6,26:1 |
| primary / card | 6,47:1 |
| success / card | 6,74:1 |
| warning / card | 6,43:1 |
| critical / card | 6,66:1 |
| sidebar-foreground / sidebar | 12,41:1 |
| sidebar-accent-foreground / sidebar-accent | 8,53:1 |

Também foram validados badges com fundo tonal a 15%; todos permanecem acima de 5:1 no tema claro.

## Validação por rota

| Rota | Componentes principais | Tema claro |
|---|---|---|
| `/` | KPIs, Resumo, Riscos, Atenção, Pendências, gráficos, Origem dos Dados, Plano de Ação | APROVADO |
| `/energia-pue` | cards sem fonte, UPS, GMG, estado vazio | APROVADO |
| `/disponibilidade` | CAG, VAC, badges, cards de cobertura | APROVADO |
| `/manutencao` | formulário, inputs, textarea, botões, situação atual | APROVADO |
| `/capacidade` | UPS, RPP, GMG, cards métricos | APROVADO |
| `/climatizacao` | KPIs térmicos, Chillers, VAC | APROVADO |
| `/diesel` | painel e estado `Não disponível` | APROVADO |
| `/racks` | formulário multi-local, inputs, botões, cards de situação | APROVADO |
| `/plano-acao` | painel e estado sem fonte | APROVADO |
| `/qualidade-dados` | KPIs, tabela de cobertura, histórico, badges | APROVADO |
| `/relatorios` | resumo, cards, status do pacote | APROVADO |
| `/analises-ia` | status, capacidades planejadas, estado vazio | APROVADO |

## Componentes globais validados

- Sidebar: tema claro e escuro com fundo, borda, item ativo, hover e rodapé sem cores fixas.
- Header: período, badges, completude e seletor de tema usam tokens semânticos.
- KpiCard: todos os estados (`ok`, `warn`, `crit`, `pending`, `info`) validados.
- Panel: fundo, borda, título e ícone compatíveis com ambos os temas.
- StatusBadge: todos os tons validados inclusive sobre fundos tonais.
- EmptyState: superfície e borda tracejada adaptáveis.
- PageState: loading e erro adaptáveis.
- Charts: eixos, grid, tooltip, legenda, linhas e barras usam variáveis CSS semânticas.
- Input/Textarea/Button: componentes de formulário usam tokens do design system.
- 404 e ErrorComponent: usam tokens do tema.
- erro estático do servidor: possui paleta clara/escura própria e lê a preferência persistida.

## Verificações automáticas

- 89 arquivos TS/TSX transpilados sintaticamente: **0 erros**.
- Imports internos `@/` e relativos: **0 ausentes**.
- Núcleo `types + adapter + api + dashboard service` em TypeScript strict: **aprovado** após correções de `exactOptionalPropertyTypes` e acesso a index signatures.
- 12 arquivos de rota = 12 itens da Sidebar = 12 entradas no `routeTree`: **consistente**.
- 24 arquivos de rotas/componentes dashboard verificados contra cores fixas de tema: **0 ocorrências problemáticas**.
- Tokens obrigatórios presentes nos temas claro e escuro: **100%**.
- Contrastes principais do tema claro >= 4,5:1: **aprovado**.
- Caminhos de dados preservados: dashboard por período, health, history, racks GET/POST, maintenance GET/POST e report por período: **presentes**.

## Observação sobre build/runtime no ambiente de validação

O pacote não contém `node_modules`. A instalação das dependências não pôde ser concluída neste ambiente por indisponibilidade de acesso ao registry/cache completo, então não foi possível executar `npm run build` nem uma renderização browser local completa. Para compensar, foram executados transpilação de todos os TS/TSX, validação estrita do núcleo, resolução de imports, matriz de rotas, auditoria de tokens e contraste.

O teste HTTP externo do host de dados também não pôde ser executado neste ambiente por falha de resolução DNS. Nenhum caminho de API foi alterado nesta revisão de tema/apresentação.

## Smoke test recomendado após publicação

1. Abrir `/` no tema escuro e alternar para claro.
2. Recarregar a página e confirmar persistência do tema claro.
3. Percorrer as 12 rotas pelo menu.
4. Em cada rota, alternar entre `Último dia`, `7 dias` e `30 dias` quando aplicável.
5. Conferir gráficos e tooltips em tema claro.
6. Em Racks e Manutenção, validar inputs, foco, botões e mensagens em tema claro.
7. Conferir tabelas de Qualidade dos Dados e cards de Relatórios.
8. Alternar novamente para tema escuro e confirmar preservação do design original.
