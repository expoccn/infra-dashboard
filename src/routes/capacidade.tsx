import { createFileRoute } from '@tanstack/react-router';
import { BatteryCharging, CircuitBoard, Layers3, Snowflake, TowerControl, TriangleAlert } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCompactNumber } from '@/lib/format-dashboard';
import type { CapacityAssetMetric, UiStatus } from '@/types/dashboard';

export const Route = createFileRoute('/capacidade')({ component: CapacidadePage });

function pct(value: number | null | undefined) {
  return value == null ? 'Não disponível' : `${value.toFixed(2).replace('.', ',')}%`;
}

function bandLabel(code?: string | null) {
  switch (code) {
    case 'BAND_LT_70': return '< 70%';
    case 'BAND_70_79': return '70–79%';
    case 'BAND_80_89': return '80–89%';
    case 'BAND_90_99': return '90–99%';
    case 'BAND_GE_100': return '≥ 100%';
    case 'ZERO': return '0%';
    default: return 'Sem faixa';
  }
}

function bandTone(code?: string | null): UiStatus {
  switch (code) {
    case 'BAND_LT_70':
    case 'ZERO':
      return 'ok';
    case 'BAND_70_79':
      return 'info';
    case 'BAND_80_89':
      return 'warn';
    case 'BAND_90_99':
    case 'BAND_GE_100':
      return 'crit';
    default:
      return 'pending';
  }
}

function dataBadge(asset: CapacityAssetMetric) {
  if (asset.dataStatus === 'VALIDATION_REQUIRED') return <StatusBadge label="Validar dados" tone="warn" />;
  if (asset.sourceStatus === 'AVAILABLE' || asset.sourceStatus === 'RECEIVED') return <StatusBadge label="Com dados" tone="ok" />;
  return <StatusBadge label="Sem dados recebidos" tone="pending" />;
}

function CapacityTable({ assets, unit = 'kVA' }: { assets: CapacityAssetMetric[]; unit?: 'kVA' | 'TR' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-3 py-2.5">Equipamento</th>
            <th className="px-3 py-2.5">Nominal</th>
            <th className="px-3 py-2.5">Limite</th>
            <th className="px-3 py-2.5">Carga média</th>
            <th className="px-3 py-2.5">Pico</th>
            <th className="px-3 py-2.5">Uso no pico</th>
            <th className="px-3 py-2.5">Reserva no pico</th>
            <th className="px-3 py-2.5">Faixa</th>
            <th className="px-3 py-2.5">Dados</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-3 font-medium">{asset.id}</td>
              <td className="px-3 py-3 text-muted-foreground">{formatCompactNumber(asset.nominal, ` ${unit}`)}</td>
              <td className="px-3 py-3 text-muted-foreground">{formatCompactNumber(asset.limit, ` ${unit}`)}</td>
              <td className="px-3 py-3">{formatCompactNumber(asset.avgLoad, ` ${unit}`)}</td>
              <td className="px-3 py-3">{formatCompactNumber(asset.maxLoad, ` ${unit}`)}</td>
              <td className="px-3 py-3 font-medium">{pct(asset.utilizationPeakPct)}</td>
              <td className="px-3 py-3">{formatCompactNumber(asset.reserveAtPeak, ` ${unit}`)}</td>
              <td className="px-3 py-3"><StatusBadge label={bandLabel(asset.utilizationBandPeak)} tone={bandTone(asset.utilizationBandPeak)} /></td>
              <td className="px-3 py-3">{dataBadge(asset)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CapacidadePage() {
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
  const capacity = data.operational.capacity;
  const ups = capacity.ups;
  const rpp = capacity.rpp;
  const gmg = capacity.gmg;
  const cag = capacity.cag;
  const configured = data.configuration.configuredInventory;

  return (
    <AppShell
      title="Capacidade"
      description="Capacidade e limites oficiais da competência de referência, comparados somente com os equipamentos que possuem medição válida. Itens sem fonte não são tratados como zero."
      data={data}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Cobertura UPS" icon={BatteryCharging}>
          <p className="text-3xl font-semibold">{ups ? `${ups.receivedCount}/${ups.expectedCount}` : 'N/D'}</p>
          <p className="mt-2 text-sm text-muted-foreground">{ups ? `${pct(ups.coveragePct)} do inventário esperado` : 'Parâmetros não configurados'}</p>
        </Panel>
        <Panel title="Cobertura RPP" icon={CircuitBoard}>
          <p className="text-3xl font-semibold">{rpp ? `${rpp.receivedCount}/${rpp.expectedCount}` : 'N/D'}</p>
          <p className="mt-2 text-sm text-muted-foreground">{rpp ? `${pct(rpp.coveragePct)} do inventário esperado` : 'Parâmetros não configurados'}</p>
        </Panel>
        <Panel title="CAG / CHILER" icon={Snowflake}>
          <p className="text-3xl font-semibold text-primary">{pct(cag?.utilizationPeakPct)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Utilização no pico · limite {formatCompactNumber(cag?.limitTr, ' TR')}</p>
        </Panel>
        <Panel title="GMG" icon={TowerControl}>
          <div className="flex items-center gap-2"><p className="text-3xl font-semibold">{gmg ? `${gmg.receivedCount}/${gmg.expectedCount}` : 'N/D'}</p><StatusBadge label="Validar" tone="warn" /></div>
          <p className="mt-2 text-sm text-muted-foreground">Campos recebidos, mas o KPI de utilização permanece bloqueado.</p>
        </Panel>
      </div>

      <Panel title="UPS — inventário esperado e medições" icon={BatteryCharging}>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge label={ups?.aggregateStatus === 'COMPLETE' ? 'Cobertura completa' : 'Cobertura parcial'} tone={ups?.aggregateStatus === 'COMPLETE' ? 'ok' : 'warn'} />
          <span className="text-muted-foreground">{ups ? `${ups.receivedCount} com dados · ${ups.missingCount} sem dados recebidos · ${ups.expectedCount} esperadas` : 'Sem cadastro de parâmetros.'}</span>
        </div>
        {ups?.assets.length ? <CapacityTable assets={ups.assets} /> : <p className="text-sm text-muted-foreground">Sem parâmetros de UPS para a competência.</p>}
      </Panel>

      <Panel title="RPP — inventário esperado e medições" icon={CircuitBoard}>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge label={rpp?.aggregateStatus === 'COMPLETE' ? 'Cobertura completa' : 'Cobertura parcial'} tone={rpp?.aggregateStatus === 'COMPLETE' ? 'ok' : 'warn'} />
          <span className="text-muted-foreground">{rpp ? `${rpp.receivedCount} com dados · ${rpp.missingCount} sem dados recebidos · ${rpp.expectedCount} esperadas` : 'Sem cadastro de parâmetros.'}</span>
        </div>
        {rpp?.assets.length ? <CapacityTable assets={rpp.assets} /> : <p className="text-sm text-muted-foreground">Sem parâmetros de RPP para a competência.</p>}
      </Panel>

      <Panel title="GMG — parâmetros cadastrados, telemetria em validação" icon={TriangleAlert} iconClassName="text-warning">
        <div className="mb-4 rounded-xl bg-warning/8 px-4 py-3 text-sm leading-relaxed text-warning">
          {gmg?.note || 'Os dados de carga dos GMGs precisam ser validados antes da publicação de utilização e reserva como indicadores oficiais.'}
        </div>
        {gmg?.assets.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-3 py-2.5">GMG</th><th className="px-3 py-2.5">Nominal</th><th className="px-3 py-2.5">Limite</th><th className="px-3 py-2.5">Carga média recebida</th><th className="px-3 py-2.5">Pico recebido</th><th className="px-3 py-2.5">Utilização oficial</th><th className="px-3 py-2.5">Situação</th></tr></thead>
              <tbody>
                {gmg.assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3 font-medium">{asset.id}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatCompactNumber(asset.nominal, ' kVA')}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatCompactNumber(asset.limit, ' kVA')}</td>
                    <td className="px-3 py-3">{formatCompactNumber(asset.avgLoad, ' kVA')}</td>
                    <td className="px-3 py-3">{formatCompactNumber(asset.maxLoad, ' kVA')}</td>
                    <td className="px-3 py-3 text-muted-foreground">Não publicado</td>
                    <td className="px-3 py-3"><StatusBadge label="Validação necessária" tone="warn" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-muted-foreground">Sem cadastro de GMG para a competência.</p>}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="CAG / grupo CHILER" icon={Snowflake}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Capacidade nominal</p><p className="mt-1 text-xl font-semibold">{formatCompactNumber(cag?.nominalTr, ' TR')}</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Limite oficial</p><p className="mt-1 text-xl font-semibold">{formatCompactNumber(cag?.limitTr, ' TR')}</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Utilização média</p><p className="mt-1 text-xl font-semibold text-primary">{pct(cag?.utilizationAvgPct)}</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Utilização no pico</p><p className="mt-1 text-xl font-semibold text-primary">{pct(cag?.utilizationPeakPct)}</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Carga máxima</p><p className="mt-1 text-xl font-semibold">{formatCompactNumber(cag?.maxLoadTr, ' TR')}</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Reserva no pico</p><p className="mt-1 text-xl font-semibold text-success">{formatCompactNumber(cag?.reserveAtPeakTr, ' TR')}</p></div>
          </div>
        </Panel>

        <Panel title="Parâmetros cadastrados sem fonte de carga válida" icon={Layers3}>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-3"><p className="font-medium">Transformadores</p><StatusBadge label="Sem fonte" tone="pending" /></div><p className="mt-1 text-muted-foreground">{configured.transformers ? `${configured.transformers.expectedCount} equipamentos · ${formatCompactNumber(configured.transformers.totalNominal, ' kVA')} nominais · ${formatCompactNumber(configured.transformers.totalLimit, ' kVA')} de limite total` : 'Não configurado'}</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-3"><p className="font-medium">FCC</p><StatusBadge label="Sem fonte automática" tone="pending" /></div><p className="mt-1 text-muted-foreground">{configured.fcc ? `${configured.fcc.expectedCount} equipamentos · ${formatCompactNumber(configured.fcc.totalNominal, ' A')} nominais cadastrados` : 'Não configurado'}</p></div>
            <div className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-3"><p className="font-medium">Quadros gerais de capacidade</p><StatusBadge label="Sem fonte" tone="pending" /></div><p className="mt-1 text-muted-foreground">{configured.capacityPanels ? `${configured.capacityPanels.expectedCount} quadros · ${formatCompactNumber(configured.capacityPanels.totalNominal, ' kVA')} nominais · ${formatCompactNumber(configured.capacityPanels.totalLimit, ' kVA')} de limite total` : 'Não configurado'}</p></div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
