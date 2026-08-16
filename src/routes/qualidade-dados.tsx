import { createFileRoute } from '@tanstack/react-router';
import { Database, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { useHistory } from '@/hooks/useBackend';

export const Route = createFileRoute('/qualidade-dados')({ component: QualidadeDadosPage });

function QualidadeDadosPage() {
  const dashboardQuery = useDashboard();
  const historyQuery = useHistory();

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
      title="Qualidade dos Dados"
      description="Auditoria de recebimento e validade das sete fontes automáticas nos dias válidos que compõem o período selecionado."
      data={data}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Tipos de fonte recebidos</p>
          <p className="mt-2 text-3xl font-semibold text-success">{data.completion.receivedSources}/{data.completion.expectedSources}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Cobertura das fontes</p>
          <p className="mt-2 text-3xl font-semibold text-primary">{data.completion.sourceCompletenessPct.toFixed(2).replace('.', ',')}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Cobertura válida</p>
          <p className="mt-2 text-3xl font-semibold text-primary">{data.completion.validSourceCompletenessPct.toFixed(2).replace('.', ',')}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Completude das medições</p>
          <p className="mt-2 text-3xl font-semibold text-warning">{data.completion.measurementCompletenessPct.toFixed(2).replace('.', ',')}%</p>
        </div>
      </div>

      <Panel title="Cobertura por Report" icon={Database}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Report</th>
                <th className="px-3 py-2.5 font-medium">Recebidos</th>
                <th className="px-3 py-2.5 font-medium">Válidos</th>
                <th className="px-3 py-2.5 font-medium">Cobertura válida</th>
                <th className="px-3 py-2.5 font-medium">Qualidade</th>
                <th className="px-3 py-2.5 font-medium">Período</th>
              </tr>
            </thead>
            <tbody>
              {data.sources.map((source) => (
                <tr key={source.reportType} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 font-medium">{source.label}</td>
                  <td className="px-3 py-3 text-muted-foreground">{source.daysReceived}/{source.daysInPeriod} dias</td>
                  <td className="px-3 py-3 text-muted-foreground">{source.daysValid}/{source.daysInPeriod} dias</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {source.measurementCoveragePct == null ? 'N/D' : `${source.measurementCoveragePct.toFixed(2).replace('.', ',')}%`}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge label={source.qualityState} tone={source.qualityState === 'OK' ? 'ok' : source.qualityState === 'WARNING' ? 'warn' : 'warn'} />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{source.referenceStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Histórico de dias válidos" icon={ShieldAlert}>
        {historyQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando histórico...</p>
        ) : historyQuery.isError || !historyQuery.data ? (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-warning/8 px-4 py-3">
            <p className="text-sm text-warning">Não foi possível consultar o endpoint de histórico.</p>
            <button type="button" className="text-xs font-medium text-primary" onClick={() => void historyQuery.refetch()}>Tentar novamente</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Último dia válido</p><p className="mt-1 font-semibold">{historyQuery.data.last_valid_date || 'N/D'}</p></div>
              <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Dias válidos armazenados</p><p className="mt-1 font-semibold">{historyQuery.data.valid_days_total}</p></div>
              <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Competências disponíveis</p><p className="mt-1 font-semibold">{historyQuery.data.months.join(', ') || 'N/D'}</p></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-3 py-2">Data</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Fontes recebidas</th><th className="px-3 py-2">Fontes válidas</th><th className="px-3 py-2">Medições</th></tr></thead>
                <tbody>
                  {historyQuery.data.days.slice(0, 30).map((day) => (
                    <tr key={day.reference_date} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2.5">{day.reference_date}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{day.status}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{day.received_sources ?? 'N/D'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{day.valid_sources ?? 'N/D'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{day.measurement_completeness_pct == null ? 'N/D' : `${day.measurement_completeness_pct.toFixed(2).replace('.', ',')}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
