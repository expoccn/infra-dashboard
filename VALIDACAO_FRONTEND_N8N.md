# Validação Frontend × n8n — Claro DC RJO-AM

Data da validação: 2026-08-16

## Alvos

- Frontend: TanStack Start / React 19 recebido na versão v3-sidebar.
- Backend: n8n 1.123.21.
- Base configurada: `https://ancar-n8n.gpfgqx.easypanel.host/webhook/claro-rjo-am`
- Origem CORS de produção: `https://claro-rj-am.2see.io`

## Períodos

O seletor global usa somente:

- `d1`: último dia válido;
- `7d`: 7 últimos dias válidos;
- `30d`: 30 últimos dias válidos.

Os 30 dias não são tratados como mês calendário. A competência mostrada no cabeçalho é apenas a competência da data de referência.

## Rotas frontend validadas

1. `/` — Dashboard via workflow 12.
2. `/energia-pue` — Dashboard via workflow 12.
3. `/disponibilidade` — Dashboard / source coverage via workflow 12.
4. `/manutencao` — Dashboard + GET workflow 16 + POST workflow 17.
5. `/capacidade` — UPS/RPP/GMG via workflow 12.
6. `/climatizacao` — CAG TR/VAC via workflow 12.
7. `/diesel` — estado sem fonte proveniente do contrato do dashboard.
8. `/racks` — Dashboard + GET workflow 14 + POST workflow 15.
9. `/plano-acao` — estado sem fonte, sem dados simulados.
10. `/qualidade-dados` — Dashboard workflow 12 + histórico workflow 13.
11. `/relatorios` — Dashboard workflow 12 + relatório workflow 20.
12. `/analises-ia` — permanece desabilitada antes da etapa de IA.

A sidebar, os arquivos de rota e `routeTree.gen.ts` possuem as mesmas 12 rotas.

## APIs validadas no frontend

- GET `/health`
- GET `/dashboard?period=d1`
- GET `/dashboard?period=7d`
- GET `/dashboard?period=30d`
- GET `/history`
- GET `/racks?competence=YYYY-MM`
- POST `/racks`
- GET `/maintenance?competence=YYYY-MM`
- POST `/maintenance`
- GET `/report?period=d1|7d|30d`

O serviço central possui timeout, tratamento de erro HTTP, erro JSON, erro de rede e cache 503.

## Testes realizados

### Frontend

- 87 arquivos TS/TSX transpilados sintaticamente: aprovado.
- Imports locais `@/`: 0 ausentes.
- Typecheck estrito do núcleo de integração (`types`, `adapter`, `api`, `dashboard service`): aprovado.
- Adapter n8n → UI testado para d1, 7d e 30d: aprovado.
- Zero real de GMG preservado como `0`: aprovado.
- Ausência de PUE preservada como `Não disponível`: aprovado.
- Racks manual disponível/pendente: aprovado.
- Manutenção manual disponível/pendente: aprovado.
- Serialização dos endpoints GET/POST no serviço frontend: aprovada.
- Propagação de erro 503 do n8n: aprovada.
- Mocks antigos removidos do fluxo de produção.

### n8n 08–20

Os validadores do pacote foram executados novamente:

- 13 workflows;
- 59 verificações estruturais/estáticas;
- todos os Code nodes compilados;
- CSVs reais completos usados na validação;
- último dia válido 30/06/2026;
- 7d = 24/06 a 30/06;
- 30d = 01/06 a 30/06;
- zero real conta como dado válido;
- Racks e Manutenção rejeitam payloads inválidos;
- runtime dos workflows aprovado.

### CORS

Todos os Respond to Webhook de 12–20 foram conferidos:

- `Access-Control-Allow-Origin: https://claro-rj-am.2see.io`
- `Access-Control-Allow-Methods: GET,POST,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

Workflow 18 atende OPTIONS em `claro-rjo-am/:resource`.

## Limitação do teste externo nesta sessão

O ambiente de execução usado para esta validação não possui resolução/acesso de rede externo para o host informado. A tentativa real de HTTP retornou:

`curl: (6) Could not resolve host: ancar-n8n.gpfgqx.easypanel.host`

O fetch web também não conseguiu resolver/cachear o domínio. Por isso não foi possível afirmar que os webhooks de produção responderam ao vivo nesta sessão.

Também não foi possível instalar `node_modules` para executar `npm run build`, porque este ambiente não resolve `registry.npmjs.org`. Para compensar, foi feita transpilação dos 87 arquivos TS/TSX, typecheck estrito do núcleo de integração e testes runtime dos adapters/contratos.

## Smoke test recomendado após publicar

No navegador do frontend publicado, conferir Network para:

1. `/health` → 200.
2. `/dashboard?period=d1` → 200.
3. alternar para 7 dias → `/dashboard?period=7d` → 200.
4. alternar para 30 dias → `/dashboard?period=30d` → 200.
5. abrir Qualidade → `/history` → 200.
6. abrir Racks → GET `/racks?...` → 200; salvar somente quando houver dado manual real.
7. abrir Manutenção → GET `/maintenance?...` → 200; salvar somente quando houver dado manual real.
8. abrir Relatórios → `/report?period=...` → 200.

Não foi criado fallback silencioso para mocks. Se a API estiver fora do ar ou CORS falhar, a interface mostra erro de backend.
