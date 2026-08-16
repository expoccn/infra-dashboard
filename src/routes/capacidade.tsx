import { createFileRoute } from '@tanstack/react-router';
import { BatteryCharging, CircuitBoard, Layers3, TowerControl } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { availabilityTone, formatCompactNumber } from '@/lib/format-dashboard';

export const Route = createFileRoute('/capacidade')({ component: CapacidadePage });

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

  return (
    <AppShell
      title="Capacidade"
      description="Painel consolidado para UPS, RPP e GMG. Equipamentos sem regra formal de capacidade permanecem sinalizados como pendentes de validação."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="UPS" icon={BatteryCharging} className="xl:col-span-1">
          <div className="space-y-3">
            {data.operational.ups.map((item) => (
              <div key={item.name} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.name}</p>
                  <StatusBadge label={item.status === 'AVAILABLE' ? 'Disponível' : 'Não disponível'} tone={availabilityTone(item.status)} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Média</p><p className="font-semibold">{formatCompactNumber(item.avg, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Mín.</p><p className="font-semibold">{formatCompactNumber(item.min, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Máx.</p><p className="font-semibold">{formatCompactNumber(item.max, ' kVA')}</p></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="RPP" icon={CircuitBoard} className="xl:col-span-1">
          <div className="space-y-3">
            {data.operational.rpp.map((item) => (
              <div key={item.name} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.name}</p>
                  <StatusBadge label={item.status === 'AVAILABLE' ? 'Disponível' : 'Não disponível'} tone={availabilityTone(item.status)} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  <div><p className="text-muted-foreground">kVA médio</p><p className="font-semibold">{formatCompactNumber(item.avgKva, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">kVA máximo</p><p className="font-semibold">{formatCompactNumber(item.maxKva, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Tensão média</p><p className="font-semibold">{formatCompactNumber(item.avgVoltage, ' V')}</p></div>
                  <div><p className="text-muted-foreground">Corrente R</p><p className="font-semibold">{formatCompactNumber(item.avgCurrentR, ' A')}</p></div>
                  <div><p className="text-muted-foreground">Corrente S</p><p className="font-semibold">{formatCompactNumber(item.avgCurrentS, ' A')}</p></div>
                  <div><p className="text-muted-foreground">Corrente T</p><p className="font-semibold">{formatCompactNumber(item.avgCurrentT, ' A')}</p></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="GMG" icon={TowerControl} className="xl:col-span-1">
          <div className="space-y-3">
            {data.operational.gmg.map((item) => (
              <div key={item.name} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.name}</p>
                  <StatusBadge label="Validação pendente" tone="info" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Leitura por família" icon={Layers3}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A página de capacidade já usa a mesma estrutura visual que o payload final do dashboard. Quando os limites nominais forem homologados para GMG, transformadores e outros ativos, estes cartões poderão migrar automaticamente de “validação pendente” para indicadores percentuais reais.
        </p>
      </Panel>
    </AppShell>
  );
}
