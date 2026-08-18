# Frontend v14 — Download de relatórios sob demanda

## Alteração principal
A rota `/relatorios` deixa de consultar a antiga prévia em `/report?period=...` e passa a gerar os PDFs somente quando o usuário clica em **Baixar PDF**.

Endpoints utilizados:
- Diário: `GET /report-daily-pdf`
- Semanal: `GET /report-weekly-pdf`
- Mensal: `GET /report-monthly-pdf`

Todos usam a base configurada em `VITE_DATA_API_BASE_URL` e enviam a sessão atual em `Authorization: Bearer ...`.

## Persistência
- nenhum PDF entra no React Query;
- nenhum PDF é salvo em localStorage/sessionStorage/IndexedDB;
- `fetch` usa `cache: no-store`;
- após a resposta autenticada, o navegador usa um Blob transitório apenas para disparar o download e o Object URL é revogado em seguida;
- os workflows 36/37/38 também respondem `Cache-Control: private, no-store` e não possuem Redis SET de PDF.

## Tela Relatórios
Três cards independentes:
- Relatório Diário — último dia válido;
- Relatório Semanal — última semana fechada;
- Relatório Mensal — último mês calendário disponível.

Durante a geração, os botões ficam bloqueados e o card em execução mostra `Gerando relatório...`. Erros são mostrados somente no card solicitado.
