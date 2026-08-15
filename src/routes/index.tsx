import { createFileRoute } from '@tanstack/react-router';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronRight,
  CircleSlash,
  Database,
  FileCheck2,
  HelpCircle,
  Info,
  LineChart,
  Timer,
  Wrench,
} from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { CapacidadeChart, TendenciaChart } from '@/components/dashboard/Charts';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/')({
  component: VisaoExecutiva,
});

const origemIcons = [FileCheck2, Wrench, Timer] as const;
const origemTone = ['text-success bg-success/12', 'text-primary bg-primary/12', 'text-warning bg-warning/12'];
const origemValueTone = ['text-success', 'text-primary', 'text-warning'];

function VisaoExecutiva() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

  return (
    <AppShell
      title="Visão Executiva"
      description="Resumo consolidado da referência atual, com destaque para a qualidade das fontes, capacidade instalada, climatização e pendências manuais."
      data={data}
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {data.overview.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel title="Resumo Executivo" icon={BarChart3} className="xl:col-span-2">
          <p className="text-sm leading-relaxed text-muted-foreground">{data.overview.executiveSummary}</p>
        </Panel>

        <Panel title="Ativos Críticos" icon={AlertTriangle} iconClassName="text-critical">
          <ul className="space-y-2">
            {data.overview.criticalAssets.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-lg bg-critical/8 px-3 py-2 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-critical" />
                <span className="truncate text-foreground/90">{item}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Atenção" icon={Bell} iconClassName="text-warning">
          <ul className="space-y-2">
            {data.overview.attention.map((item) => (
              <li key={item} className="rounded-lg bg-warning/8 px-3 py-2 text-sm text-foreground/90">
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel title="Dados Pendentes" icon={HelpCircle} iconClassName="text-warning">
          <ul className="space-y-2">
            {data.overview.pendingData.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
                <span className="text-foreground/90">{item}</span>
                <CircleSlash className="ml-auto h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
              <span className="text-muted-foreground">Fontes recebidas</span>
              <StatusBadge label={`${data.completion.receivedSources}/${data.completion.expectedSources}`} tone="ok" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
              <span className="text-muted-foreground">Medições válidas</span>
              <StatusBadge label={`${data.completion.measurementCompletenessPct.toFixed(2).replace('.', ',')}%`} tone="info" />
            </div>
          </div>
        </Panel>

        <Panel title="Origem dos Dados" icon={Database} className="xl:col-span-3">
          <div className="grid gap-3 md:grid-cols-3">
            {data.overview.sourceOrigins.map((item, i) => {
              const Icon = origemIcons[i] ?? FileCheck2;
              return (
                <div key={item.title} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-4">
                  <span className={`rounded-lg p-2 ${origemTone[i]}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className={`text-lg font-semibold ${origemValueTone[i]}`}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel title="Tendência Mensal" icon={LineChart} className="xl:col-span-2" action={<Info className="h-4 w-4 text-muted-foreground" />}>
          <TendenciaChart data={data.overview.trendMonthly} />
        </Panel>
        <Panel title="Capacidade por Família" icon={BarChart3} action={<Info className="h-4 w-4 text-muted-foreground" />}>
          <CapacidadeChart data={data.overview.familyCapacity} />
        </Panel>
        <Panel title="Escopo Atual" icon={Database}>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-surface px-3 py-3">
              <p className="font-medium">Total de fontes mapeadas</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{data.overview.totalSources}</p>
            </div>
            <div className="rounded-xl bg-surface px-3 py-3">
              <p className="font-medium">Sem fonte automática</p>
              <p className="mt-1 text-muted-foreground">{data.unavailableModules.join(', ')}</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
