import { createFileRoute } from '@tanstack/react-router';
import { BatteryCharging, Gauge, Target, TowerControl, TriangleAlert } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { PueChart } from '@/components/dashboard/Charts';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCompactNumber } from '@/lib/format-dashboard';

export const Route = createFileRoute('/energia-pue')({ component: EnergiaPuePage });

function formatPue(value: number | null | undefined) {
  return value == null ? 'Não disponível' : value.toFixed(2).replace('.', ',');
}

function pueBadge(status: string) {
  if (status === 'TARGET_MET') return <StatusBadge label="Meta atingida" tone="ok" />;
  if (status === 'ABOVE_TARGET_WITHIN_LIMIT') return <StatusBadge label="Acima da meta, dentro do limite" tone="warn" />;
  if (status === 'ABOVE_LIMIT') return <StatusBadge label="Acima do limite" tone="crit" />;
  return <StatusBadge label="Sem avaliação" tone="pending" />;
}

function EnergiaPuePage() {
  const dashboardQuery = useDashboard();
  if (dashboardQuery.isPending) return <PageState loading title="Carregando dados" description="Consultando os dados do dashboard..." />;
  if (dashboardQuery.isError || !dashboardQuery.data) return <PageState title="Dados indisponíveis" description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Não foi possível carregar os dados.'} onRetry={() => void dashboardQuery.refetch()} />;

  const data = dashboardQuery.data;
  const pue = data.operational.pue;
  const label = data.period.type === 'd1' ? 'PUE do último dia válido' : 'PUE médio diário do período';
  const upsWithData = data.operational.ups.filter((ups) => ups.status === 'AVAILABLE');
  const upsCapacity = data.operational.capacity.ups;
  const gmg = data.operational.capacity.gmg;

  return (
    <AppShell
      title="Energia & PUE"
      description="Indicadores elétricos e evolução diária do PUE, comparados às metas e aos limites oficiais cadastrados para a competência de referência."
      data={data}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="PUE" icon={Gauge}>
          {pue.status === 'AVAILABLE' ? (
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-4xl font-semibold text-primary">{formatPue(pue.value)}</p>
              <div className="mt-3">{pueBadge(pue.targetStatus)}</div>
            </div>
          ) : <EmptyState title="Não disponível" description="Nenhum valor de PUE foi encontrado no período selecionado." />}
        </Panel>
        <Panel title="Meta de PUE" icon={Target}>
          <p className="text-4xl font-semibold text-success">{formatPue(pue.target)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Quanto menor o PUE, melhor.</p>
        </Panel>
        <Panel title="Limite de PUE" icon={TriangleAlert}>
          <p className="text-4xl font-semibold text-critical">{formatPue(pue.limit)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Referência máxima oficial da competência.</p>
        </Panel>
        <Panel title="Dias acima do limite" icon={Gauge}>
          <p className="text-4xl font-semibold">{pue.daysWithData > 0 ? `${pue.daysAboveLimit}/${pue.daysWithData}` : 'N/D'}</p>
          <p className="mt-2 text-sm text-muted-foreground">Dias com PUE válido no período analisado.</p>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Menor PUE" icon={Gauge}>{pue.status === 'AVAILABLE' ? <p className="text-3xl font-semibold">{formatPue(pue.min)}</p> : <EmptyState title="Não disponível" description="Sem dados no período." />}</Panel>
        <Panel title="Maior PUE" icon={Gauge}>{pue.status === 'AVAILABLE' ? <p className="text-3xl font-semibold">{formatPue(pue.max)}</p> : <EmptyState title="Não disponível" description="Sem dados no período." />}</Panel>
        <Panel title="Referência do maior PUE" icon={Gauge}>{pue.status === 'AVAILABLE' ? <p className="text-lg font-semibold">{pue.peakTimestamp || 'Não disponível'}</p> : <EmptyState title="Não disponível" description="Sem dados no período." />}</Panel>
      </div>

      <Panel title="Evolução do PUE" icon={Gauge}>
        <PueChart data={pue.daily} target={pue.target} limit={pue.limit} />
        <p className="mt-2 text-xs text-muted-foreground">Para períodos com mais de um dia, o valor consolidado exibido é a média dos PUEs diários recebidos. A meta e o limite são referências oficiais da competência.</p>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="UPS com medição recebida" icon={BatteryCharging}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge label={upsCapacity?.aggregateStatus === 'COMPLETE' ? 'Cobertura completa' : 'Cobertura parcial'} tone={upsCapacity?.aggregateStatus === 'COMPLETE' ? 'ok' : 'warn'} />
            <span className="text-sm text-muted-foreground">{upsCapacity ? `${upsCapacity.receivedCount}/${upsCapacity.expectedCount} UPS com dados (${upsCapacity.coveragePct?.toFixed(2).replace('.', ',')}%)` : 'Inventário não configurado'}</span>
          </div>
          <div className="space-y-3">
            {upsWithData.map((ups) => (
              <div key={ups.name} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-medium">{ups.name}</p><StatusBadge label="Com dados" tone="ok" /></div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                  <div><p className="text-muted-foreground">Média</p><p className="font-semibold">{formatCompactNumber(ups.avg, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Máximo</p><p className="font-semibold">{formatCompactNumber(ups.max, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Limite</p><p className="font-semibold">{formatCompactNumber(ups.limit, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Uso no pico</p><p className="font-semibold text-primary">{ups.utilizationPeakPct == null ? 'Não disponível' : `${ups.utilizationPeakPct.toFixed(2).replace('.', ',')}%`}</p></div>
                </div>
              </div>
            ))}
          </div>
          {upsCapacity?.missingCount ? <p className="mt-4 text-xs text-muted-foreground">{upsCapacity.missingCount} UPS esperadas ainda não possuem dados automáticos recebidos. Elas não são consideradas como carga zero.</p> : null}
        </Panel>

        <Panel title="GMG" icon={TowerControl}>
          <div className="rounded-xl bg-warning/8 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge label="Validação necessária" tone="warn" /><span className="text-sm font-medium">{gmg ? `${gmg.receivedCount}/${gmg.expectedCount} campos recebidos` : 'Sem cadastro'}</span></div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gmg?.note || 'Os dados de carga dos geradores precisam ser validados antes de publicar utilização e reserva.'}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.operational.gmg.map((item) => (
              <div key={item.name} className="rounded-xl bg-surface px-4 py-3">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">Carga média recebida: {formatCompactNumber(item.avg, ' kVA')}</p>
                <p className="text-sm text-muted-foreground">Pico recebido: {formatCompactNumber(item.max, ' kVA')}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
