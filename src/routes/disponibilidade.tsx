import { createFileRoute } from '@tanstack/react-router';
import { ShieldCheck, Building2, Snowflake } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { availabilityTone } from '@/lib/format-dashboard';

export const Route = createFileRoute('/disponibilidade')({ component: DisponibilidadePage });

function DisponibilidadePage() {
  const dashboardQuery = useDashboard();
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
      title="Disponibilidade"
      description="Mostra o estado das fontes relacionadas a disponibilidade, sempre preservando a diferença entre telemetria recebida e regra de cálculo já homologada."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="CAG" icon={Snowflake}>
          <div className="space-y-3">
            <div className="rounded-xl bg-surface px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Disponibilidade CAG</p>
                  <p className="text-sm text-muted-foreground">Telemetria recebida. Cálculo percentual ainda em homologação.</p>
                </div>
                <StatusBadge label="Regra pendente" tone="info" />
              </div>
            </div>
            {data.sources.filter((s) => s.reportType === 'CAG_DISP' || s.reportType === 'CAG_TR').map((source) => (
              <div key={source.reportType} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{source.label}</p>
                    <p className="text-xs text-muted-foreground">{source.daysValid}/{source.daysInPeriod} dias válidos · gerado em {source.updatedAt}</p>
                  </div>
                  <StatusBadge label={source.qualityState} tone={source.qualityState === 'OK' ? 'ok' : 'warn'} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Infraestrutura VAC" icon={Building2}>
          <div className="space-y-3">
            <div className="rounded-xl bg-surface px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Disponibilidade VAC</p>
                  <p className="text-sm text-muted-foreground">{data.operational.vac.note}</p>
                </div>
                <StatusBadge label={data.operational.vac.status === 'AVAILABLE' ? 'Disponível' : 'Não disponível'} tone={availabilityTone(data.operational.vac.status)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="text-sm text-muted-foreground">Cobertura de dias válidos</p>
                <p className="mt-1 text-xl font-semibold">{data.operational.vac.coveragePct}%</p>
              </div>
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="text-sm text-muted-foreground">Ativos monitorados</p>
                <p className="mt-1 font-semibold">{data.operational.vac.monitoredAssets.length}</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">Escopo dos ativos</p>
              <p className="mt-1 font-medium">{data.operational.vac.monitoredAssets.join(', ') || 'Não identificado no payload atual'}</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Situação geral" icon={ShieldCheck}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Fontes esperadas</p>
            <p className="mt-1 text-2xl font-semibold">{data.completion.expectedSources}</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Fontes recebidas</p>
            <p className="mt-1 text-2xl font-semibold text-success">{data.completion.receivedSources}</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Medições válidas</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{data.completion.measurementCompletenessPct.toFixed(2).replace('.', ',')}%</p>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
