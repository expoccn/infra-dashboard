# Claro DC RJO-AM — Frontend v18 — Assistente IA governado

Base: frontend v17 (Visão Geral executiva) + workflows IA 42 v2 temporal, 43 v1 histórico e 44 v1 limpeza.

## Alterações

- `/analises-ia` deixa de ser placeholder e passa a integrar os endpoints reais de IA.
- `POST /ai-chat` com `period`, `question` e `session_id`.
- `GET /ai-history?session_id=...` para reconstrução do histórico da sessão.
- `POST /ai-clear` para limpeza explícita do histórico.
- `session_id` é persistido apenas em `sessionStorage`; mensagens não são persistidas pelo frontend.
- Período global `d1|7d|30d` continua sendo o contexto padrão; datas escritas na pergunta são resolvidas pelo workflow 42.
- Respostas exibem modo determinístico ou texto revisado pela IA, evidências e limitações retornadas pelo backend.
- Nenhum cálculo de IA é executado no frontend.
- A página preserva os temas claro/escuro e o design system homologado.

## Workflows esperados

- 42 — `POST /claro-rjo-am/ai-chat`
- 43 — `GET /claro-rjo-am/ai-history`
- 44 — `POST /claro-rjo-am/ai-clear`

A URL base continua sendo `VITE_DATA_API_BASE_URL`, sem nova variável pública.
