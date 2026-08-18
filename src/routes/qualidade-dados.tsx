import { createFileRoute } from '@tanstack/react-router';
import { Database, PackageSearch, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { useHistory } from '@/hooks/useDataService';

export const Route = createFileRoute('/qualidade-dados')({ component: QualidadeDadosPage });

function gapTone(status: string) {
  if (status === 'VALIDATION_REQUIRED') return 'warn' as const;
  if (status === 'PARTIAL_INVENTORY' || status === 'PARTIAL_VALID_SIGNALS') return 'warn' as const;
  return 'pending' as const;
}

function gapLabel(status: string) {
  if (status === 'VALIDATION_REQUIRED') return 'Validação necessária';
  if (status === 'PARTIAL_INVENTORY') return 'Cobertura parcial';
  if (status === 'PARTIAL_VALID_SIGNALS') return 'Sinais parciais';
  if (status === 'SOURCE_NOT_AVAILABLE') return 'Sem fonte válida';
  return status;
}

function QualidadeDadosPage() {
  const dashboardQuery = useDashboard();
  const historyQuery = useHistory();

  if (dashboardQuery.isPending) {
    return <PageState loading title="Carregando dados" description="Consultando os dados do dashboard..." />;
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageState
        title="Dados indisponíveis"
        description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Não foi possível carregar os dados.'}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }
  const data = dashboardQuery.data;
  const ups = data.operational.capacity.ups;
  const rpp = data.operational.capacity.rpp;
  const gmg = data.operational.capacity.gmg;

  return (
    <AppShell
      title="Qualidade dos Dados"
      description="Auditoria das oito fontes automáticas, da cobertura do inventário esperado e das fontes que ainda não possuem dados válidos."
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

      <Panel title="Cobertura do inventário esperado" icon={PackageSearch}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">UPS</p><StatusBadge label={ups?.aggregateStatus === 'COMPLETE' ? 'Completa' : 'Parcial'} tone={ups?.aggregateStatus === 'COMPLETE' ? 'ok' : 'warn'} /></div><p className="mt-2 text-2xl font-semibold">{ups ? `${ups.receivedCount}/${ups.expectedCount}` : 'N/D'}</p><p className="mt-1 text-xs text-muted-foreground">{ups?.coveragePct == null ? 'Sem parâmetro' : `${ups.coveragePct.toFixed(2).replace('.', ',')}% do inventário`}</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">RPP</p><StatusBadge label={rpp?.aggregateStatus === 'COMPLETE' ? 'Completa' : 'Parcial'} tone={rpp?.aggregateStatus === 'COMPLETE' ? 'ok' : 'warn'} /></div><p className="mt-2 text-2xl font-semibold">{rpp ? `${rpp.receivedCount}/${rpp.expectedCount}` : 'N/D'}</p><p className="mt-1 text-xs text-muted-foreground">{rpp?.coveragePct == null ? 'Sem parâmetro' : `${rpp.coveragePct.toFixed(2).replace('.', ',')}% do inventário`}</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">GMG</p><StatusBadge label="Validar" tone="warn" /></div><p className="mt-2 text-2xl font-semibold">{gmg ? `${gmg.receivedCount}/${gmg.expectedCount}` : 'N/D'}</p><p className="mt-1 text-xs text-muted-foreground">Campos recebidos; valores de carga aguardam validação.</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">VAC atual</p><StatusBadge label="Parcial" tone="warn" /></div><p className="mt-2 text-2xl font-semibold">{data.operational.vac.monitoredAssets.length}/{data.operational.vac.expectedAssets}</p><p className="mt-1 text-xs text-muted-foreground">Ativos com RFF + ALM válidos.</p></div>
        </div>
      </Panel>

      <Panel title="Fontes ainda não válidas ou incompletas" icon={ShieldAlert}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.configuration.sourceGaps.map((gap) => (
            <div key={gap.key} className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{gap.label}</p><p className="mt-1 text-xs text-muted-foreground">{[gap.received, gap.expected].filter(Boolean).join(' · ') || 'Escopo parametrizado'}</p></div><StatusBadge label={gapLabel(gap.status)} tone={gapTone(gap.status)} /></div>
              {gap.note ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gap.note}</p> : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Cobertura por fonte automática" icon={Database}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Fonte</th>
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
                  <td className="px-3 py-3 text-muted-foreground">{source.measurementCoveragePct == null ? 'N/D' : `${source.measurementCoveragePct.toFixed(2).replace('.', ',')}%`}</td>
                  <td className="px-3 py-3"><StatusBadge label={source.qualityState} tone={source.qualityState === 'OK' ? 'ok' : source.qualityState === 'WARNING' ? 'warn' : 'warn'} /></td>
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
            <p className="text-sm text-warning">Não foi possível consultar o histórico.</p>
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
