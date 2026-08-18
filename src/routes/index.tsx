import { createFileRoute } from '@tanstack/react-router';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronRight,
  CircleSlash,
  ClipboardList,
  Database,
  FileCheck2,
  HelpCircle,
  Info,
  LineChart,
  PencilLine,
  Timer,
  Building,
} from 'lucide-react';

import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { TendenciaChart, CapacidadeChart } from '@/components/dashboard/Charts';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/')({
  component: VisaoExecutiva,
});

const origemIcons = [FileCheck2, PencilLine, Timer];
const origemTone = ['text-success bg-success/8', 'text-primary bg-primary/8', 'text-warning bg-warning/8'];
const origemValueTone = ['text-success', 'text-primary', 'text-warning'];

function VisaoExecutiva() {
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
      title="Dashboard de Governança de Infraestrutura"
      description="Resumo consolidado da referência atual, com metas oficiais, cobertura do inventário esperado, capacidade monitorada, climatização e pendências de dados."
      data={data}
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {data.overview.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel title="Resumo Executivo" icon={BarChart3} className="xl:col-span-2">
          <p className="text-sm leading-relaxed text-muted-foreground">{data.overview.executiveSummary}</p>
        </Panel>

        <Panel title="Riscos Operacionais" icon={AlertTriangle} iconClassName="text-critical">
          <ul className="space-y-2">
            {data.overview.criticalAssets.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-lg bg-critical/8 px-3 py-2 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-critical" />
                <span className="text-foreground/90">{item}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Atenção" icon={Bell} iconClassName="text-warning">
          <ul className="space-y-2">
            {data.overview.attention.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-lg bg-warning/8 px-3 py-2 text-sm">
                <Building className="h-4 w-4 shrink-0 text-warning" />
                <span className="text-foreground/90">{item}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Dados Pendentes" icon={HelpCircle} iconClassName="text-warning">
          <ul className="space-y-2">
            {data.overview.pendingData.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
                <span className="text-foreground/90">{item}</span>
                <CircleSlash className="ml-auto h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completude dos dados</span>
              <span className="font-semibold text-primary">{Math.round(data.completion.measurementCompletenessPct)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, data.completion.measurementCompletenessPct))}%` }} />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel title="Tendência do Período" icon={LineChart} className="xl:col-span-2" action={<Info className="h-4 w-4 text-muted-foreground" />}>
          <TendenciaChart data={data.overview.trendMonthly} />
        </Panel>

        <Panel title="Maior Utilização Monitorada" icon={BarChart3} action={<Info className="h-4 w-4 text-muted-foreground" />}>
          <CapacidadeChart data={data.overview.familyCapacity} />
        </Panel>

        <Panel title="Origem dos Dados" icon={Database}>
          <ul className="space-y-3">
            {data.overview.sourceOrigins.map((item, i) => {
              const Icon = origemIcons[i] ?? FileCheck2;
              return (
                <li key={item.title} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-3">
                  <span className={`rounded-lg p-2 ${origemTone[i]}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className={`text-lg font-semibold ${origemValueTone[i]}`}>{item.value}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Total de fontes</span>
            <span className="text-lg font-semibold text-primary">{data.overview.totalSources}</span>
          </div>
        </Panel>
      </div>

      <Panel title="Plano de Ação" icon={ClipboardList}>
        <EmptyState
          title="Sem fonte definida"
          description="A estrutura da página foi mantida, mas nenhum dado fictício é exibido. Quando houver uma origem oficial para plano de ação, este bloco poderá ser preenchido automaticamente."
        />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Valores sujeitos à revisão. Os indicadores seguem as definições do Catálogo de Métricas de Data Centers.
        </p>
      </Panel>
    </AppShell>
  );
}
