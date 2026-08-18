import { createFileRoute } from '@tanstack/react-router';
import { Building2, Factory, ShieldCheck, Snowflake } from 'lucide-react';
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
  const infraExpected = data.configuration.configuredInventory.infraTiAvailability?.expectedCount ?? null;
  const concessionTarget = data.configuration.concessionTargetPct;

  return (
    <AppShell title="Disponibilidade" description="Disponibilidade e cobertura de dados, separando claramente o escopo atualmente medido do inventário esperado pelo cliente." data={data}>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="CAG" icon={Snowflake}>
          <div className="space-y-3">
            <div className="rounded-xl bg-surface px-4 py-4">
              <div className="flex items-center justify-between gap-3"><div><p className="font-medium">Disponibilidade CAG</p><p className="text-sm text-muted-foreground">York, Trane e Carrier</p></div><StatusBadge label="Disponível" tone="ok" /></div>
            </div>
            {data.sources.filter((source) => source.reportType === 'CAG_DISP' || source.reportType === 'CAG_TR').map((source) => (
              <div key={source.reportType} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3"><div><p className="font-medium">{source.label}</p><p className="text-xs text-muted-foreground">{source.daysValid}/{source.daysInPeriod} dias válidos · atualizado {source.updatedAt}</p></div><StatusBadge label={source.qualityState} tone={source.qualityState === 'OK' ? 'ok' : source.qualityState === 'DEGRADED' ? 'warn' : 'info'} /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Infraestrutura VAC — escopo atual" icon={Building2}>
          <div className="mb-4 rounded-xl bg-primary/8 px-4 py-3 text-sm text-muted-foreground">
            O CSV VAC atual cobre um escopo específico de ativos. Este bloco não representa o inventário completo de disponibilidade INFRA × TI.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Cobertura temporal</p><p className="mt-1 text-xl font-semibold">{data.operational.vac.temporalCoveragePct.toFixed(2).replace('.', ',')}%</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Cobertura dos ativos</p><p className="mt-1 text-xl font-semibold">{data.operational.vac.assetCoveragePct.toFixed(2).replace('.', ',')}%</p></div>
          </div>
          <div className="mt-3 space-y-2">
            {data.operational.vac.assets.map((item) => (
              <div key={item.name} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">RFF: {item.rff || 'Sem leitura'} · ALM: {item.alm || 'Sem leitura'} · cobertura {item.coveragePct.toFixed(2).replace('.', ',')}%</p></div><StatusBadge label={item.coveragePct <= 0 ? 'Sem leitura' : item.status === 'AVAILABLE' ? 'Disponível' : 'Indisponível'} tone={item.coveragePct <= 0 ? 'info' : item.status === 'AVAILABLE' ? 'ok' : 'crit'} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Disponibilidade INFRA × TI" icon={ShieldCheck}>
          <div className="rounded-xl bg-surface px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Inventário esperado</p><p className="mt-1 text-3xl font-semibold">{infraExpected ?? 'N/D'}{infraExpected != null ? ' registros' : ''}</p></div><StatusBadge label="Sem fonte consolidada" tone="pending" /></div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">A planilha do cliente define o universo esperado, mas ainda não existe uma fonte automática válida para calcular a disponibilidade INFRA × TI de todos os registros.</p>
          </div>
        </Panel>

        <Panel title="Concessionária" icon={Factory}>
          <div className="rounded-xl bg-surface px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Meta oficial</p><p className="mt-1 text-3xl font-semibold text-primary">{concessionTarget == null ? 'N/D' : `${concessionTarget.toFixed(2).replace('.', ',')}%`}</p></div><StatusBadge label="Sem fonte válida" tone="pending" /></div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">A meta está parametrizada, porém ainda não existe leitura válida para calcular a disponibilidade da concessionária.</p>
          </div>
        </Panel>
      </div>

      <Panel title="Situação geral das fontes automáticas" icon={ShieldCheck}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Fontes automáticas esperadas</p><p className="mt-1 text-2xl font-semibold">{data.completion.expectedSources}</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Fontes recebidas</p><p className="mt-1 text-2xl font-semibold text-success">{data.completion.receivedSources}</p></div>
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Completude das medições</p><p className="mt-1 text-2xl font-semibold text-primary">{data.completion.measurementCompletenessPct.toFixed(2).replace('.', ',')}%</p></div>
        </div>
      </Panel>
    </AppShell>
  );
}
