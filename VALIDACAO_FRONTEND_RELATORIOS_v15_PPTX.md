# Validação — Frontend Relatórios v15 — PowerPoint mensal

Data: 19/08/2026  
Base: frontend v14 de relatórios PDF.

## Resultado

**APROVADO para homologação integrada com o workflow mensal PPTX.**

### Estrutura e sintaxe

- 98 arquivos TS/TSX/config TS transpilados individualmente com TypeScript 5.8.3;
- 0 erros sintáticos de transpile;
- 210 imports internos `@/` verificados;
- 0 imports internos ausentes.

> O `npm install` externo não concluiu dentro do timeout do ambiente, portanto o build Vite completo não foi usado como critério. A validação foi feita por transpile TypeScript, integridade dos imports locais e harness funcional da rotina de download.

## Contrato de download validado

### PDF preservado

- diário → `/report-daily-pdf`;
- semanal → `/report-weekly-pdf`;
- mensal → `/report-monthly-pdf`.

### PowerPoint novo

- mensal → `/report-monthly-pptx`;
- método `GET`;
- `cache: no-store`;
- Bearer da sessão atual;
- `Accept: application/vnd.openxmlformats-officedocument.presentationml.presentation`;
- timeout de 180 s;
- MIME PPTX obrigatório;
- `Content-Disposition` usado para o nome do arquivo;
- fallback `.pptx` disponível;
- arquivo vazio é rejeitado;
- 401 notifica expiração da autenticação.

## Harness funcional da rotina de download

10/10 verificações aprovadas:

1. URL mensal PowerPoint correta;
2. header `Accept` PPTX correto;
3. header `Authorization: Bearer` enviado;
4. `cache: no-store` aplicado;
5. download do navegador disparado;
6. filename do `Content-Disposition` preservado;
7. PPTX diário bloqueado porque ainda não existe workflow homologado;
8. resposta com MIME incorreto rejeitada;
9. HTTP 401 propagado;
10. HTTP 401 dispara expiração da sessão.

## UX validada em código

- botão `Baixar PowerPoint` aparece somente no relatório mensal;
- PDF mensal continua disponível;
- diário e semanal continuam somente PDF;
- apenas um download por vez;
- indicador de carregamento distingue `Gerando PDF...` de `Gerando PowerPoint...`;
- erro é apresentado no card correspondente;
- textos da lateral foram atualizados para mencionar PDF e PowerPoint sem expor n8n, Redis, webhook ou backend.

## Persistência/cache

A implementação mantém a política da v14:

- sem React Query para o arquivo;
- sem localStorage para o arquivo;
- sem sessionStorage para o arquivo;
- sem IndexedDB para o arquivo;
- Blob transitório;
- Object URL revogado após o download.

## Smoke test recomendado após deploy

1. Login válido no portal.
2. Abrir `/relatorios`.
3. Confirmar os três botões PDF existentes.
4. Confirmar `Baixar PowerPoint` somente no card mensal.
5. Clicar `Baixar PowerPoint`.
6. Confirmar estado `Gerando PowerPoint...`.
7. Confirmar execução do workflow mensal PPTX.
8. Confirmar download de arquivo `.pptx`.
9. Abrir o arquivo e conferir os 10 slides do modelo homologado.
10. Repetir um download PDF mensal para confirmar ausência de regressão.
