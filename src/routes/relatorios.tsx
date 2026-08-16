import { createFileRoute } from '@tanstack/react-router';
import { FileText, LayoutList } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { useReport } from '@/hooks/useBackend';

export const Route = createFileRoute('/relatorios')({ component: RelatoriosPage });

function RelatoriosPage() {
  const dashboardQuery = useDashboard();
  const reportQuery = useReport();

  if (dashboardQuery.isPending) {
    return <PageState loading title="Carregando dados" description="Consultando o backend n8n e o Redis..." />;
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageState
        title="Backend indisponível"
        description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Não foi possível carregar os dados.'}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }
  const data = dashboardQuery.data;

  return (
    <AppShell
      title="Relatórios"
      description="Prévia do relatório executivo consolidado diretamente pelo workflow de relatório do n8n para o período selecionado."
      data={data}
    >
      {reportQuery.isPending ? (
        <Panel title="Relatório Executivo" icon={FileText}><p className="text-sm text-muted-foreground">Gerando prévia pelo backend...</p></Panel>
      ) : reportQuery.isError || !reportQuery.data ? (
        <Panel title="Relatório Executivo" icon={FileText}>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-warning/8 px-4 py-3">
            <p className="text-sm text-warning">Não foi possível consultar o workflow de relatório.</p>
            <button type="button" className="text-xs font-medium text-primary" onClick={() => void reportQuery.refetch()}>Tentar novamente</button>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Resumo do relatório" icon={FileText}>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="font-medium">{reportQuery.data.report.title}</p>
                <p className="mt-2 leading-relaxed text-muted-foreground">{reportQuery.data.report.executive_summary}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-surface px-4 py-3"><p className="text-muted-foreground">Site</p><p className="mt-1 font-semibold">{reportQuery.data.report.site}</p></div>
                <div className="rounded-xl bg-surface px-4 py-3"><p className="text-muted-foreground">Referência</p><p className="mt-1 font-semibold">{reportQuery.data.report.period.reference_date}</p></div>
                <div className="rounded-xl bg-surface px-4 py-3"><p className="text-muted-foreground">Dias válidos</p><p className="mt-1 font-semibold">{reportQuery.data.report.period.valid_days}</p></div>
              </div>
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="font-medium">Seções consolidadas pelo n8n</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Qualidade dos dados</li><li>UPS e RPP</li><li>Climatização</li><li>Disponibilidade</li><li>GMG</li><li>Racks</li><li>Manutenção</li><li>Itens sem fonte</li>
                </ul>
              </div>
            </div>
          </Panel>

          <Panel title="Status do pacote" icon={LayoutList}>
            <div className="space-y-3">
              <StatusBadge label="n8n integrado" tone="ok" />
              <StatusBadge label={reportQuery.data.report.period.label} tone="info" />
              <StatusBadge
                label={'status' in reportQuery.data.report.sections.racks ? 'Racks pendente' : 'Racks disponível'}
                tone={'status' in reportQuery.data.report.sections.racks ? 'pending' : 'ok'}
              />
              <StatusBadge
                label={'status' in reportQuery.data.report.sections.maintenance ? 'Manutenção pendente' : 'Manutenção disponível'}
                tone={'status' in reportQuery.data.report.sections.maintenance ? 'pending' : 'ok'}
              />
              <p className="text-sm leading-relaxed text-muted-foreground">A exportação PDF permanece como etapa posterior; esta tela já consome a estrutura determinística gerada pelo workflow 20.</p>
            </div>
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
