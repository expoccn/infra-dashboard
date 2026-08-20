# Frontend v16 — PDF + PowerPoint em todos os períodos

Atualização sobre o frontend v15.

## Alterações
- Diário: `Baixar PDF` + `Baixar PowerPoint`;
- Semanal: `Baixar PDF` + `Baixar PowerPoint`;
- Mensal: mantém `Baixar PDF` + `Baixar PowerPoint`;
- novos endpoints PPTX:
  - `/report-daily-pptx`
  - `/report-weekly-pptx`
  - `/report-monthly-pptx`
- mesmo comportamento já homologado de download: Bearer, `no-store`, Blob transitório, `Content-Disposition`, validação de MIME, timeout e tratamento de 401.

Nenhum relatório é persistido no navegador.
