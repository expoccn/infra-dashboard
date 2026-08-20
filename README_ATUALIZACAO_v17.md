# Atualização Frontend v17 — Visão Geral Executiva

Base: `infra-dashboard-main-v16-relatorios-pdf-pptx-todos.zip`

## Objetivo

Aplicar na rota `/` o conceito visual homologado da **Visão Geral**, preservando autenticação, temas, integração n8n, relatórios PDF/PPTX e demais rotas.

## Principais mudanças

- cabeçalho específico da Visão Geral com referência dos dados e seletor de período compacto;
- 6 KPIs executivos: PUE, CAG/pico, Manutenção, Integrações, Quadros e Qualidade dos dados;
- remoção de `Fontes válidas` e `Racks` da primeira linha executiva;
- faixa própria para referência operacional histórica quando `stale=true`;
- Resumo Executivo estruturado em Operação, Capacidade, Manutenção, Infraestrutura/Integrações e Dados;
- card `Prioridades` com viewport de aproximadamente 3 itens e rolagem interna;
- card `Qualidade e Cobertura` com viewport de aproximadamente 3 itens e rolagem interna;
- lacunas detalhadas continuam disponíveis em `/qualidade-dados`;
- gráfico `Tendência do Período` preservado;
- novo gráfico temporal `Maior Utilização Monitorada`, calculado a partir de `daily.capacity`;
- `Origem dos Dados` compactada em faixa horizontal;
- `Plano de Ação` removido da home; a rota dedicada permanece intacta.

## Regra de manutenção

A Visão Geral passa a priorizar `maintenance_management.corrections_latest_cycle` quando disponível, usando `corrections` apenas como fallback. Assim os KPIs e prioridades permanecem coerentes com a decisão de trabalhar, por enquanto, com o **último ciclo**.

## Compatibilidade

Não houve mudança de endpoint ou contrato público do frontend. O v17 mantém os downloads PDF/PPTX diário, semanal e mensal entregues no v16.
