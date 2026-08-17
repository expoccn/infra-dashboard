# Frontend v10 — Gestão de Manutenção

A rota `/manutencao` foi reconstruída para usar a planilha Gestão de Manutenção como base de gestão por ciclos.

## Estrutura da tela
- Seletor: Último ciclo / ciclos disponíveis / Todos os ciclos.
- Importação XLSX exibida somente a administradores.
- KPIs: corretivas pendentes, solucionadas, taxa de solução, dependência de peça, equipamentos em manual e integrações online.
- Abas:
  - Visão Geral
  - Corretivas
  - Equip. em Manual
  - Quadros
  - Integrações
  - Disponibilidade
  - Preventivas

A aba Preventivas preserva o fluxo antigo por competência (workflows 16/17).

## Novas APIs utilizadas
- GET `/maintenance-data?cycle=...`
- POST `/maintenance-import` com `multipart/form-data`, campo `file`.

O cabeçalho da página de Manutenção é específico por ciclo e não exibe os filtros D-1 / 7 dias / 30 dias, pois essa base não possui essa temporalidade.

## Tema
Foram usados apenas tokens semânticos do design system (`bg-card`, `bg-surface`, `text-foreground`, `text-warning`, `text-critical`, etc.), mantendo compatibilidade com tema claro e escuro.
