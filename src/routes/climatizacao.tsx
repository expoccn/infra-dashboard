import { createFileRoute } from '@tanstack/react-router';
import { Snowflake, ThermometerSun } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCompactNumber } from '@/lib/format-dashboard';

export const Route = createFileRoute('/climatizacao')({ component: ClimatizacaoPage });

function ClimatizacaoPage() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

  return (
    <AppShell
      title="Climatização"
      description="Tela operacional para carga térmica e monitoramento VAC, utilizando a telemetria já consolidada em Redis."
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
                    <p className="text-sm text-muted-foreground">Carga térmica média e pico mensal</p>
                  </div>
                  <StatusBadge label="Disponível" tone="ok" />
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
                <StatusBadge label="Cobertura parcial" tone="warn" />
              </div>
            </div>
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">Ativos monitorados</p>
              <p className="mt-1 font-semibold">{data.operational.vac.monitoredAssets.join(', ')}</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
