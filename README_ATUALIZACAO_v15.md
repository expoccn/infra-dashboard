# Claro DC RJO-AM — Frontend v15 — Download PowerPoint mensal

Base: `infra-dashboard-main-v14-relatorios-download`.

## Alteração principal

A rota `/relatorios` mantém os downloads PDF já homologados e passa a oferecer também **Baixar PowerPoint** no card do **Relatório Mensal**.

O botão PowerPoint chama, sob demanda:

`GET /webhook/claro-rjo-am/report-monthly-pptx`

usando a mesma `VITE_DATA_API_BASE_URL` do frontend e o mesmo token Bearer da sessão autenticada.

## Comportamento do download

- `GET` sob demanda;
- `cache: no-store`;
- `Accept: application/vnd.openxmlformats-officedocument.presentationml.presentation`;
- `Authorization: Bearer <sessão>`;
- validação de status HTTP;
- 401 dispara expiração da sessão local;
- validação do MIME PPTX antes de aceitar o arquivo;
- nome preferencial lido de `Content-Disposition`;
- fallback: `CLARO_DC-RJO-AM_Relatorio_Executivo_Mensal.pptx`;
- Blob apenas transitório no navegador;
- Object URL revogado após disparo do download;
- nenhum arquivo é salvo no React Query, localStorage, sessionStorage ou IndexedDB.

## Interface

- Diário: `Baixar PDF`.
- Semanal: `Baixar PDF`.
- Mensal: `Baixar PDF` + `Baixar PowerPoint`.
- Durante uma geração, os demais botões ficam temporariamente desabilitados para impedir downloads simultâneos.
- O botão em andamento mostra `Gerando PDF...` ou `Gerando PowerPoint...`.
- Erros são exibidos no card do relatório correspondente.

## Arquivos alterados

- `src/services/api.ts`
- `src/hooks/useDataService.ts`
- `src/routes/relatorios.tsx`

## Backend esperado

O frontend pressupõe que o workflow mensal PowerPoint esteja publicado no endpoint:

`/report-monthly-pptx`

com retorno HTTP 200, MIME oficial de PPTX e `Content-Disposition: attachment`.
