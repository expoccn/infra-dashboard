Atualizações aplicadas nesta versão

- Sidebar convertida em navegação real com todas as seções do menu.
- Logo da Claro adicionada como asset transparente em public/claro-logo.png.
- Metadados globais ajustados para pt-BR e identidade do projeto.
- Nova base de dados central mockada em src/data/mockDashboardPayload.ts, estruturada para futura troca por API/Redis.
- Hook compartilhado useDashboard criado para alimentar todas as páginas.
- Novas rotas adicionadas:
  - /
  - /energia-pue
  - /disponibilidade
  - /manutencao
  - /capacidade
  - /climatizacao
  - /diesel
  - /racks
  - /plano-acao
  - /qualidade-dados
  - /relatorios
  - /analises-ia
- Páginas sem fonte permanecem explicitamente marcadas como “Não disponível”.
- Racks e Manutenção ficaram preparados visualmente para futura persistência.

Observação:
A estrutura foi preparada para futura substituição do mock por payload real do Redis/n8n.
