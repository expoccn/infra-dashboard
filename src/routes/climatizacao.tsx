import { createFileRoute } from '@tanstack/react-router';
import { Snowflake, ThermometerSun } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCompactNumber } from '@/lib/format-dashboard';

export const Route = createFileRoute('/climatizacao')({ component: ClimatizacaoPage });

function operationalLabel(state: 'OPERATED' | 'DID_NOT_OPERATE' | 'NO_DATA') {
  if (state === 'OPERATED') return 'Operou no período';
  if (state === 'DID_NOT_OPERATE') return 'Não operou no período';
  return 'Sem dados no período';
}

function vacTone(status: string) {
  if (status === 'AVAILABLE') return 'ok' as const;
  if (status === 'UNAVAILABLE') return 'crit' as const;
  return 'info' as const;
}

function vacLabel(status: string, coverage: number) {
  if (coverage <= 0) return 'Sem leitura';
  if (status === 'AVAILABLE') return 'Disponível';
  if (status === 'UNAVAILABLE') return 'Indisponível';
  return 'Sem leitura';
}

function ClimatizacaoPage() {
  const dashboardQuery = useDashboard();
  if (dashboardQuery.isPending) return <PageState loading title="Carregando dados" description="Consultando os dados do dashboard..." />;
  if (dashboardQuery.isError || !dashboardQuery.data) return <PageState title="Dados indisponíveis" description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Não foi possível carregar os dados.'} onRetry={() => void dashboardQuery.refetch()} />;
  const data = dashboardQuery.data;

  return (
    <AppShell title="Climatização" description="Carga térmica e comportamento operacional do CAG, com disponibilidade dos equipamentos VAC calculada pelos sinais recebidos." data={data}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-4"><p className="text-sm text-muted-foreground">Carga térmica média total</p><p className="mt-2 text-3xl font-semibold text-primary">{formatCompactNumber(data.operational.climatization.totalAvgTr, ' TR')}</p></div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4"><p className="text-sm text-muted-foreground">Carga térmica máxima total</p><p className="mt-2 text-3xl font-semibold text-success">{formatCompactNumber(data.operational.climatization.totalMaxTr, ' TR')}</p></div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4"><p className="text-sm text-muted-foreground">Pico registrado</p><p className="mt-2 text-xl font-semibold">{data.operational.climatization.peakTimestamp || 'Não disponível'}</p></div>
      </div>

      <Panel title="CAG por Chiller" icon={Snowflake}>
        <div className="grid gap-3 xl:grid-cols-3">
          {data.operational.climatization.chillers.map((item) => (
            <div key={item.name} className="rounded-xl bg-surface px-4 py-4">
              <p className="text-base font-semibold">{item.name}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 text-sm">
                <div><p className="text-muted-foreground">Estado Operacional</p><p className="font-semibold">{operationalLabel(item.operationalState)}</p></div>
                <div><p className="text-muted-foreground">Horas em Operação</p><p className="font-semibold">{item.operatingHours == null ? 'Não disponível' : `${item.operatingHours.toFixed(2).replace('.', ',')} h`}</p></div>
                <div><p className="text-muted-foreground">Carga Térmica Média</p><p className="font-semibold">{formatCompactNumber(item.avgTr, ' TR')}</p></div>
                <div><p className="text-muted-foreground">Carga Térmica Máxima</p><p className="font-semibold">{formatCompactNumber(item.maxTr, ' TR')}</p></div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="VAC" icon={ThermometerSun}>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Cobertura temporal</p><p className="mt-1 text-xl font-semibold">{data.operational.vac.temporalCoveragePct.toFixed(2).replace('.', ',')}%</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Cobertura dos ativos</p><p className="mt-1 text-xl font-semibold">{data.operational.vac.assetCoveragePct.toFixed(2).replace('.', ',')}%</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Ativos com leitura</p><p className="mt-1 text-xl font-semibold">{data.operational.vac.monitoredAssets.length} / 4</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Ativos sem leitura</p><p className="mt-1 text-xl font-semibold">{4 - data.operational.vac.monitoredAssets.length}</p></div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.operational.vac.assets.map((item) => (
            <div key={item.name} className="rounded-xl border border-border bg-card px-4 py-4">
              <div className="flex items-center justify-between gap-2"><p className="font-semibold">{item.name}</p><StatusBadge label={vacLabel(item.status, item.coveragePct)} tone={item.coveragePct <= 0 ? 'info' : vacTone(item.status)} /></div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">RFF</span><span className="font-medium">{item.rff || 'Sem leitura'}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">ALM</span><span className="font-medium">{item.alm || 'Sem leitura'}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Cobertura</span><span className="font-medium">{item.coveragePct.toFixed(2).replace('.', ',')}%</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Disponibilidade</span><span className="font-medium">{item.availabilityPct == null ? 'Não calculável' : `${item.availabilityPct.toFixed(2).replace('.', ',')}%`}</span></div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
