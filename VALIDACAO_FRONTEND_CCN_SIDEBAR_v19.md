# Validação — Frontend v19 — Logo CCN fixo na sidebar

## Objetivo
Adicionar o logo CCN no espaço inferior da sidebar sem deslocamento, sobreposição ou dependência da altura disponível para os itens de navegação.

## Verificações

- PASS — `public/ccn-logo-white.png` existe e é PNG RGBA.
- PASS — sidebar desktop continua `h-screen` + `flex-col`.
- PASS — área de navegação continua `min-h-0 flex-1 overflow-y-auto`.
- PASS — bloco CCN usa `h-16 shrink-0`, fora do `<nav>` rolável.
- PASS — bloco do usuário continua `shrink-0`.
- PASS — bloco da unidade DC RJO-AM continua `shrink-0`.
- PASS — logo tem `object-contain` e largura limitada, evitando corte/overflow lateral.
- PASS — tema claro/escuro tratado por `brightness-0 dark:brightness-100`.
- PASS — sintaxe TSX de `src/components/dashboard/Sidebar.tsx` validada pelo transpiler TypeScript.
- PASS — nenhuma lógica de API, IA, autenticação ou rotas foi alterada.

## Comportamento responsivo esperado

Em telas altas, o logo permanece centralizado imediatamente acima do cartão do usuário.
Em telas com menor altura, a área de navegação reduz e passa a rolar verticalmente; os blocos inferiores não sobrepõem os itens porque permanecem fora do `<nav>` e têm `shrink-0`.

