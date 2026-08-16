import { createFileRoute } from '@tanstack/react-router';
import { Snowflake, ThermometerSun } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { availabilityTone, formatCompactNumber } from '@/lib/format-dashboard';

export const Route = createFileRoute('/climatizacao')({ component: ClimatizacaoPage });

function ClimatizacaoPage() {
  const dashboardQuery = useDashboard();
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

  return (
    <AppShell
      title="Climatização"
      description="Tela operacional para carga térmica e monitoramento VAC, utilizando os dados recebidos do WebCTRL via CSV."
      data={data}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Carga média total</p>
          <p className="mt-2 text-3xl font-semibold text-primary">{formatCompactNumber(data.operational.climatization.totalAvgTr, ' TR')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Carga máxima total</p>
          <p className="mt-2 text-3xl font-semibold text-success">{formatCompactNumber(data.operational.climatization.totalMaxTr, ' TR')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Pico registrado</p>
          <p className="mt-2 text-xl font-semibold">{data.operational.climatization.peakTimestamp}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="CAG por Chiller" icon={Snowflake}>
          <div className="space-y-3">
            {data.operational.climatization.chillers.map((item) => (
              <div key={item.name} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Carga térmica média e pico do período selecionado</p>
                  </div>
                  <StatusBadge label={item.status === 'AVAILABLE' ? 'Disponível' : 'Não disponível'} tone={availabilityTone(item.status)} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">TR médio</p><p className="font-semibold">{formatCompactNumber(item.avgTr, ' TR')}</p></div>
                  <div><p className="text-muted-foreground">TR máximo</p><p className="font-semibold">{formatCompactNumber(item.maxTr, ' TR')}</p></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="VAC" icon={ThermometerSun}>
          <div className="space-y-3">
            <div className="rounded-xl bg-surface px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Situação do monitoramento</p>
                  <p className="text-sm text-muted-foreground">{data.operational.vac.note}</p>
                </div>
                <StatusBadge label={data.operational.vac.status === 'AVAILABLE' ? `${data.operational.vac.coveragePct.toFixed(2).replace('.', ',')}% cobertura` : 'Não disponível'} tone={availabilityTone(data.operational.vac.status)} />
              </div>
            </div>
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">Ativos monitorados</p>
              <p className="mt-1 font-semibold">{data.operational.vac.monitoredAssets.join(', ') || 'Não identificado no payload atual'}</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
