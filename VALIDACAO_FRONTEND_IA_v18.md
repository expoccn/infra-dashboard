# Validação — Frontend v18 — Análises por IA governada

Data: 20/08/2026  
Base: frontend v17 homologado + workflows IA 42 v2 temporal / 43 v1 / 44 v1.

## Escopo

A rota `/analises-ia` foi integrada aos workflows reais sem adicionar cálculo de KPIs no frontend.

### Contrato integrado

- `POST /ai-chat` — envia `question`, `period` (`d1|7d|30d`) e `session_id`.
- `GET /ai-history?session_id=...` — recupera até 30 consultas da sessão.
- `POST /ai-clear` — limpa o histórico da sessão.
- Autenticação continua centralizada em `apiRequest`, com Bearer da sessão existente.
- Consultas de IA usam `cache: no-store`; o chat admite até 120 s para permitir a etapa opcional de redação pelo Gemini.
- `session_id` da IA fica apenas no `sessionStorage`. Perguntas e respostas não são persistidas pelo frontend.

## UX implementada

- Cabeçalho específico da IA, mantendo seletor global Último dia / 7 dias / 30 dias.
- Aviso de que datas explícitas na pergunta têm prioridade sobre o período padrão.
- Alerta de referência histórica quando o dashboard está defasado.
- Conversa com scroll interno e campo fixo de pergunta.
- Enter envia; Shift+Enter cria nova linha.
- Seis perguntas sugeridas para smoke test.
- Badge `Resposta determinística` quando `used_llm=false`.
- Badge `Texto revisado pela IA` quando `used_llm=true`.
- Evidências retornadas pelo workflow são expansíveis na resposta.
- Limitações retornadas pelo workflow aparecem em bloco próprio.
- Histórico da sessão é reconstruído via workflow 43.
- Limpeza do histórico usa confirmação visual e workflow 44.
- Painel lateral expõe período padrão, referência, último ciclo de manutenção e regras de governança.
- Nenhuma área de “recomendação da IA” ou “anomalia inventada” foi adicionada.

## Validações executadas


Resultado automatizado: **30/30 verificações aprovadas, 0 falhas.**

- OK — Workflow 42 é POST claro-rjo-am/ai-chat
- OK — Workflow 43 é GET claro-rjo-am/ai-history
- OK — Workflow 44 é POST claro-rjo-am/ai-clear
- OK — Frontend POST /ai-chat
- OK — Frontend GET /ai-history
- OK — Frontend POST /ai-clear
- OK — Chat envia question/period/session_id
- OK — Períodos limitados ao tipo existente
- OK — Timeout IA 120 s
- OK — IA usa no-store
- OK — Bearer continua centralizado
- OK — Sessão IA usa sessionStorage
- OK — Sessão IA não usa localStorage
- OK — Regex da sessão compatível com workflow
- OK — Pergunta limitada a 800 caracteres
- OK — Histórico integrado
- OK — Limpeza integrada
- OK — Modo determinístico visível
- OK — Modo Gemini visível
- OK — Evidências visíveis
- OK — Limitações visíveis
- OK — Regra temporal explícita
- OK — Alerta de dados históricos
- OK — Sem placeholder antigo
- OK — Sem recomendação inventada
- OK — Header suporta modo IA
- OK — Nenhuma nova variável pública
- OK — Transpilação sintática TS/TSX (98 arquivos)
- OK — Imports internos resolvidos (214 imports)
- OK — Escopo de alteração limitado à IA e integração compartilhada

## Limite da validação

A validação desta entrega é estrutural/offline. O ambiente não executou o build completo com `node_modules` do projeto nem chamou os webhooks de produção. Após publicar os workflows 42/43/44 e o frontend, executar o smoke test autenticado no navegador.

## Smoke test recomendado

1. Abrir `/analises-ia` autenticado.
2. Confirmar carregamento do histórico da sessão.
3. Perguntar `Qual foi o PUE em 06/06?`.
4. Perguntar `Compare o PUE de 06/06 com 20/06`.
5. Perguntar `Quais corretivas estão pendentes?`.
6. Perguntar `Faça um resumo executivo da operação` e confirmar o badge de texto revisado pela IA quando o Gemini for utilizado.
7. Expandir evidências e conferir valores com o backend.
8. Confirmar bloco de limitações em pergunta sem suporte ou com ano inferido.
9. Recarregar a página e confirmar reconstrução do histórico.
10. Limpar conversa e confirmar histórico vazio.
11. Alternar `Último dia`, `7 dias`, `30 dias` e repetir uma pergunta sem data explícita.
12. Com uma data explícita na pergunta, confirmar que o workflow temporal prevalece sobre o período padrão.
