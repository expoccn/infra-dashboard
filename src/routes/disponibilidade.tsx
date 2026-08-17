import { createFileRoute } from '@tanstack/react-router';
import { Building2, ShieldCheck, Snowflake } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/disponibilidade')({ component: DisponibilidadePage });

function DisponibilidadePage() {
  const dashboardQuery = useDashboard();
  if (dashboardQuery.isPending) return <PageState loading title="Carregando dados" description="Consultando os dados do dashboard..." />;
  if (dashboardQuery.isError || !dashboardQuery.data) return <PageState title="Dados indisponíveis" description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Não foi possível carregar os dados.'} onRetry={() => void dashboardQuery.refetch()} />;
  const data = dashboardQuery.data;

  return (
    <AppShell title="Disponibilidade" description="Disponibilidade de climatização e cobertura das fontes no período selecionado." data={data}>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="CAG" icon={Snowflake}>
          <div className="space-y-3">
            <div className="rounded-xl bg-surface px-4 py-4">
              <div className="flex items-center justify-between"><div><p className="font-medium">Disponibilidade CAG</p><p className="text-sm text-muted-foreground">York, Trane e Carrier</p></div><StatusBadge label="Disponível" tone="ok" /></div>
            </div>
            {data.sources.filter((s) => s.reportType === 'CAG_DISP' || s.reportType === 'CAG_TR').map((source) => (
              <div key={source.reportType} className="rounded-xl border border-border bg-card px-4 py-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{source.label}</p><p className="text-xs text-muted-foreground">{source.daysValid}/{source.daysInPeriod} dias válidos · gerado em {source.updatedAt}</p></div><StatusBadge label={source.qualityState} tone={source.qualityState === 'OK' ? 'ok' : source.qualityState === 'DEGRADED' ? 'warn' : 'info'} /></div></div>
            ))}
          </div>
        </Panel>

        <Panel title="Infraestrutura VAC" icon={Building2}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Cobertura temporal</p><p className="mt-1 text-xl font-semibold">{data.operational.vac.temporalCoveragePct.toFixed(2).replace('.', ',')}%</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Cobertura dos ativos</p><p className="mt-1 text-xl font-semibold">{data.operational.vac.assetCoveragePct.toFixed(2).replace('.', ',')}%</p></div>
          </div>
          <div className="mt-3 space-y-2">
            {data.operational.vac.assets.map((item) => (
              <div key={item.name} className="rounded-xl border border-border bg-card px-4 py-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">RFF: {item.rff || 'Sem leitura'} · ALM: {item.alm || 'Sem leitura'} · cobertura {item.coveragePct.toFixed(2).replace('.', ',')}%</p></div><StatusBadge label={item.coveragePct <= 0 ? 'Sem leitura' : item.status === 'AVAILABLE' ? 'Disponível' : 'Indisponível'} tone={item.coveragePct <= 0 ? 'info' : item.status === 'AVAILABLE' ? 'ok' : 'crit'} /></div></div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Situação geral" icon={ShieldCheck}>
        <div className="grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Fontes esperadas</p><p className="mt-1 text-2xl font-semibold">{data.completion.expectedSources}</p></div><div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Fontes recebidas</p><p className="mt-1 text-2xl font-semibold text-success">{data.completion.receivedSources}</p></div><div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Medições válidas</p><p className="mt-1 text-2xl font-semibold text-primary">{data.completion.measurementCompletenessPct.toFixed(2).replace('.', ',')}%</p></div></div>
      </Panel>
    </AppShell>
  );
}
