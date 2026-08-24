# Claro DC RJO-AM — Frontend v19 — Logo CCN fixo na sidebar

Base: frontend v18 — Análises por IA integrada.

## Alteração

- Adicionado o logo institucional `CCN Automação` na sidebar desktop, entre a navegação e o bloco do usuário.
- O logo usa o asset já existente `public/ccn-logo-white.png`.
- O bloco do logo possui altura fixa (`h-16`) e `shrink-0`, portanto não participa da rolagem da navegação.
- A navegação permanece `flex-1`, `min-h-0` e `overflow-y-auto`: em resoluções menores, somente os itens de menu rolam; logo CCN, usuário e unidade permanecem estáveis e não se sobrepõem.
- Em tema claro, o logo branco é convertido para escuro por CSS (`brightness-0`); no tema escuro retorna ao branco (`dark:brightness-100`).
- Nenhuma rota, API, autenticação, IA, período, dashboard ou regra de negócio foi alterada.

## Estrutura final da sidebar desktop

1. Cabeçalho Claro + tema — fixo.
2. Navegação — área flexível/rolável.
3. Logo CCN — fixo, 64 px de altura.
4. Usuário — fixo.
5. Unidade DC RJO-AM — fixo.

