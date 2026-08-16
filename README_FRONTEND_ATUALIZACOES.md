# Claro RJO-AM — Frontend integrado ao n8n

Versão de integração preparada sobre a v3 visualmente aprovada.

## Backend

Base padrão:

`https://ancar-n8n.gpfgqx.easypanel.host/webhook/claro-rjo-am`

Pode ser sobrescrita no build por:

`VITE_N8N_WEBHOOK_BASE_URL`

## Períodos globais

- `d1` = último dia válido disponível.
- `7d` = 7 últimos dias válidos disponíveis.
- `30d` = 30 últimos dias válidos disponíveis.

A seleção é compartilhada por todas as páginas e mantida em `localStorage`.

## Endpoints consumidos

- GET `/dashboard?period=d1|7d|30d`
- GET `/history`
- GET `/health`
- GET `/racks?competence=YYYY-MM`
- POST `/racks`
- GET `/maintenance?competence=YYYY-MM`
- POST `/maintenance`
- GET `/report?period=d1|7d|30d`

## Mudanças principais

- mocks removidos do fluxo de produção;
- adapter entre contrato n8n e componentes visuais;
- período global Último dia / 7 dias / 30 dias;
- Racks com leitura, gravação e múltiplos locais;
- Manutenção com leitura e gravação;
- Qualidade dos Dados ligada ao histórico real;
- Relatórios ligados ao workflow 20;
- Health exibido discretamente no rodapé da sidebar;
- tratamento de loading, erro HTTP, timeout e cache ainda não pronto;
- `0` permanece valor real e `null` permanece indisponível;
- indicadores sem fonte não recebem valores artificiais;
- route tree atualizado para as 12 páginas.

## Observação de CORS

Os workflows 12–20 permitem a origem de produção `https://claro-rj-am.2see.io`.
Pré-visualizações em outro domínio precisarão de origem adicional ou proxy.
