import { createFileRoute } from '@tanstack/react-router';
import { FileText, LayoutList } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/relatorios')({ component: RelatoriosPage });

function RelatoriosPage() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

  return (
    <AppShell
      title="Relatórios"
      description="Prévia dos relatórios executivos por competência. A base visual já está preparada para evoluir para exportação PDF e compartilhamento."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Resumo do relatório" icon={FileText}>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="font-medium">{data.report.title}</p>
              <p className="mt-1 text-muted-foreground">{data.report.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="text-muted-foreground">Site</p>
                <p className="mt-1 font-semibold">{data.report.generatedFor}</p>
              </div>
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="text-muted-foreground">Referência</p>
                <p className="mt-1 font-semibold">{data.header.referenceDate}</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="font-medium">Conteúdo previsto</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Resumo executivo e metadados da referência</li>
                <li>Qualidade dos dados e auditoria das fontes</li>
                <li>Capacidade, climatização e disponibilidade</li>
                <li>Racks e manutenção quando lançados manualmente</li>
                <li>Itens sem fonte explicitamente sinalizados</li>
              </ul>
            </div>
          </div>
        </Panel>

        <Panel title="Status do pacote" icon={LayoutList}>
          <div className="space-y-3">
            <StatusBadge label="Layout pronto" tone="ok" />
            <StatusBadge label="PDF futuro" tone="info" />
            <StatusBadge label="Dados manuais pendentes" tone="pending" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              O módulo já está adaptado ao payload final do dashboard. O próximo passo natural é adicionar uma rota de exportação server-side quando a integração com backend estiver fechada.
            </p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
