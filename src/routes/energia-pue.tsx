import { createFileRoute } from '@tanstack/react-router';
import { BatteryCharging, Gauge, TowerControl } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { PueChart } from '@/components/dashboard/Charts';
import { useDashboard } from '@/hooks/useDashboard';
import { availabilityTone, formatCompactNumber } from '@/lib/format-dashboard';

export const Route = createFileRoute('/energia-pue')({ component: EnergiaPuePage });

function EnergiaPuePage() {
  const dashboardQuery = useDashboard();
  if (dashboardQuery.isPending) return <PageState loading title="Carregando dados" description="Consultando os dados do dashboard..." />;
  if (dashboardQuery.isError || !dashboardQuery.data) return <PageState title="Dados indisponíveis" description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Não foi possível carregar os dados.'} onRetry={() => void dashboardQuery.refetch()} />;
  const data = dashboardQuery.data;
  const pue = data.operational.pue;
  const label = data.period.type === 'd1' ? 'PUE do último dia válido' : 'PUE médio diário do período';

  return (
    <AppShell title="Energia & PUE" description="Indicadores elétricos e evolução diária do PUE a partir dos dados disponíveis no WebCTRL via CSV." data={data}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="PUE" icon={Gauge}>{pue.status === 'AVAILABLE' ? <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-4xl font-semibold text-primary">{pue.value?.toFixed(2).replace('.', ',')}</p></div> : <EmptyState title="Não disponível" description="Nenhum valor de PUE foi encontrado no período selecionado." />}</Panel>
        <Panel title="Menor PUE" icon={Gauge}>{pue.status === 'AVAILABLE' ? <p className="text-4xl font-semibold">{pue.min?.toFixed(2).replace('.', ',')}</p> : <EmptyState title="Não disponível" description="Sem dados no período." />}</Panel>
        <Panel title="Maior PUE" icon={Gauge}>{pue.status === 'AVAILABLE' ? <p className="text-4xl font-semibold">{pue.max?.toFixed(2).replace('.', ',')}</p> : <EmptyState title="Não disponível" description="Sem dados no período." />}</Panel>
        <Panel title="Referência do pico" icon={Gauge}>{pue.status === 'AVAILABLE' ? <p className="text-lg font-semibold">{pue.peakTimestamp || 'Não disponível'}</p> : <EmptyState title="Não disponível" description="Sem dados no período." />}</Panel>
      </div>

      <Panel title="Evolução do PUE" icon={Gauge}><PueChart data={pue.daily} /><p className="mt-2 text-xs text-muted-foreground">Para períodos com mais de um dia, o valor consolidado exibido é a média dos PUEs diários recebidos.</p></Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="UPS" icon={BatteryCharging}><div className="space-y-3">{data.operational.ups.map((ups) => (<div key={ups.name} className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{ups.name}</p><p className="text-xs text-muted-foreground">Pico em {ups.peakTimestamp}</p></div><StatusBadge label={ups.status === 'AVAILABLE' ? 'Disponível' : 'Não disponível'} tone={availabilityTone(ups.status)} /></div><div className="mt-3 grid grid-cols-3 gap-3 text-sm"><div><p className="text-muted-foreground">Média</p><p className="font-semibold">{formatCompactNumber(ups.avg, ' kVA')}</p></div><div><p className="text-muted-foreground">Mínimo</p><p className="font-semibold">{formatCompactNumber(ups.min, ' kVA')}</p></div><div><p className="text-muted-foreground">Máximo</p><p className="font-semibold">{formatCompactNumber(ups.max, ' kVA')}</p></div></div></div>))}</div></Panel>
        <Panel title="Geradores / GMG" icon={TowerControl}><div className="space-y-3">{data.operational.gmg.map((gmg) => (<div key={gmg.name} className="rounded-xl bg-surface px-4 py-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{gmg.name}</p><p className="text-xs text-muted-foreground">{gmg.note}</p></div><StatusBadge label="Validação pendente" tone="info" /></div><div className="mt-3 grid grid-cols-3 gap-3 text-sm"><div><p className="text-muted-foreground">Média</p><p className="font-semibold">{formatCompactNumber(gmg.avg, ' kVA')}</p></div><div><p className="text-muted-foreground">Mínimo</p><p className="font-semibold">{formatCompactNumber(gmg.min, ' kVA')}</p></div><div><p className="text-muted-foreground">Máximo</p><p className="font-semibold">{formatCompactNumber(gmg.max, ' kVA')}</p></div></div></div>))}</div></Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-3">{['Concessionária','Transformadores','FCC'].map((item)=><Panel key={item} title={item} icon={Gauge}><EmptyState title="Não disponível" description="Este indicador ainda não possui fonte automática homologada no sistema." /></Panel>)}</div>
    </AppShell>
  );
}
