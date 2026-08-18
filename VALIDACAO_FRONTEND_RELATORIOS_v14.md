# Validação Frontend v14 — Relatórios sob demanda

Data: 2026-08-18
Base: frontend v13 parametrizado.

## Contrato frontend × workflows

Validado contra os JSONs dos workflows 36, 37 e 38:

| Tipo | Endpoint frontend | Webhook do workflow | Resultado |
|---|---|---|---|
| Diário | `/report-daily-pdf` | `claro-rjo-am/report-daily-pdf` | OK |
| Semanal | `/report-weekly-pdf` | `claro-rjo-am/report-weekly-pdf` | OK |
| Mensal | `/report-monthly-pdf` | `claro-rjo-am/report-monthly-pdf` | OK |

Nos três workflows foi confirmado:
- resposta `application/pdf`;
- `Content-Disposition: attachment`;
- `Access-Control-Expose-Headers: Content-Disposition, Content-Length`;
- `Cache-Control: private, no-store`;
- autenticação por Bearer Token;
- nenhum node Redis com operação `set` para armazenar o PDF.

## Download no frontend

Testes de runtime com `fetch` simulado:
- os 3 endpoints corretos são chamados;
- `Accept: application/pdf` presente;
- `Authorization: Bearer <sessão>` presente;
- `cache: no-store` presente;
- nome de arquivo lido do `Content-Disposition` quando fornecido;
- nomes fallback corretos para Diário, Semanal e Mensal;
- Object URL revogado após o download;
- HTTP 401 dispara expiração de sessão;
- HTTP 200 com conteúdo não-PDF é rejeitado;
- resposta PDF vazia é rejeitada pela implementação.

O PDF não é armazenado em state, React Query, localStorage, sessionStorage ou IndexedDB. Há somente o buffer transitório necessário ao navegador para iniciar o download autenticado, descartado logo após o clique nativo.

## Página `/relatorios`

Validado:
- 3 cards: Diário, Semanal e Mensal;
- botão `Baixar PDF` em cada card;
- estado `Gerando relatório...`;
- bloqueio contra downloads simultâneos;
- mensagem de erro associada ao tipo solicitado;
- textos de geração sob demanda e ausência de armazenamento;
- referência e competência vindas do dashboard;
- remoção do antigo `useReport()` e da consulta automática `/report?period=...`.

## TypeScript e imports

- arquivos TS/TSX verificados: **97**;
- erros sintáticos: **0**;
- imports locais ausentes: **0**;
- rota `/relatorios` permanece no `routeTree.gen.ts`.

## Tema claro e escuro

A página usa somente tokens semânticos (`background`, `card`, `surface`, `foreground`, `muted-foreground`, `primary`, `critical`, `border`). Não foram adicionados hexadecimais ou cores fixas.

Contrastes dos pares usados diretamente na página foram calculados para os dois temas. Menor contraste de texto encontrado após o ajuste dos badges: **4,93:1**, atendendo 4,5:1 para texto normal.

Pares conferidos nos dois temas:
- foreground/background;
- foreground/card;
- foreground/surface;
- muted-foreground/surface;
- muted-foreground sobre bloco `background/60`;
- primary/surface;
- primary/background nos badges informativos da página;
- primary-foreground/primary nos botões;
- critical/surface nas mensagens de erro;
- muted-foreground/muted no badge de competência.

Também foi feita renderização estática de inspeção dos componentes nos temas claro e escuro. A renderização completa do app React não pôde ser executada porque o pacote fonte não inclui `node_modules`; portanto o smoke final deve ser feito no ambiente de deploy.

## Responsividade

Estrutura conferida:
- desktop: painel principal + painel de orientação em `xl`;
- cards de relatórios em 3 colunas a partir de `lg`;
- telas menores: cards empilhados;
- botões ocupam toda a largura do card;
- nenhum conteúdo usa largura fixa incompatível com mobile.

## Textos ao cliente

Na rota `/relatorios` não há menções visíveis a tecnologias internas, armazenamento técnico ou nomes da arquitetura. A mensagem ao cliente é somente que o relatório é gerado sob demanda e não fica armazenado pelo portal.
