import { createFileRoute } from '@tanstack/react-router';
import { Bolt, BatteryCharging, Gauge, TowerControl } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCompactNumber } from '@/lib/format-dashboard';

export const Route = createFileRoute('/energia-pue')({ component: EnergiaPuePage });

function EnergiaPuePage() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

  return (
    <AppShell
      title="Energia & PUE"
      description="Concentra indicadores elétricos. Os itens sem telemetria formal são exibidos como não disponíveis, enquanto UPS e GMG aproveitam a base já coletada."
      data={data}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {['PUE', 'Concessionária', 'Transformadores', 'FCC'].map((item) => (
          <Panel key={item} title={item} icon={Gauge}>
            <EmptyState title="Não disponível" description="Este indicador ainda não possui fonte automática homologada no sistema." />
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="UPS" icon={BatteryCharging}>
          <div className="space-y-3">
            {data.operational.ups.map((ups) => (
              <div key={ups.name} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{ups.name}</p>
                    <p className="text-xs text-muted-foreground">Pico em {ups.peakTimestamp}</p>
                  </div>
                  <StatusBadge label="Disponível" tone="ok" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Média</p><p className="font-semibold">{formatCompactNumber(ups.avg, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Mínimo</p><p className="font-semibold">{formatCompactNumber(ups.min, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Máximo</p><p className="font-semibold">{formatCompactNumber(ups.max, ' kVA')}</p></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Geradores / GMG" icon={TowerControl}>
          <div className="space-y-3">
            {data.operational.gmg.map((gmg) => (
              <div key={gmg.name} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{gmg.name}</p>
                    <p className="text-xs text-muted-foreground">{gmg.note}</p>
                  </div>
                  <StatusBadge label="Validação pendente" tone="info" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Média</p><p className="font-semibold">{formatCompactNumber(gmg.avg, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Mínimo</p><p className="font-semibold">{formatCompactNumber(gmg.min, ' kVA')}</p></div>
                  <div><p className="text-muted-foreground">Máximo</p><p className="font-semibold">{formatCompactNumber(gmg.max, ' kVA')}</p></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Leitura Operacional" icon={Bolt}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Esta seção mantém a estrutura pronta para o consumo do payload real do Redis. Enquanto PUE, concessionária, transformadores e FCC não possuírem telemetria consolidada, o frontend os exibirá explicitamente como não disponíveis, sem assumir valores zero.
        </p>
      </Panel>
    </AppShell>
  );
}
