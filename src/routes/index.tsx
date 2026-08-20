import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Box,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Database,
  FileCheck2,
  Info,
  LineChart,
  PencilLine,
  Target,
  Unplug,
  Wrench,
} from 'lucide-react';

import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { PeakUtilizationTrendChart, TendenciaChart } from '@/components/dashboard/Charts';
import { useDashboard } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils';
import type { OverviewInsight, OverviewListItem, UiStatus } from '@/types/dashboard';

export const Route = createFileRoute('/')({
  component: VisaoExecutiva,
});

const insightIcons = [Activity, Box, Wrench, Unplug, Database];
const origemIcons = [FileCheck2, Wrench, PencilLine];

const statusTone: Record<UiStatus, { icon: string; box: string; accent: string }> = {
  ok: {
    icon: 'text-success',
    box: 'bg-success/8',
    accent: 'border-l-success',
  },
  warn: {
    icon: 'text-warning',
    box: 'bg-warning/8',
    accent: 'border-l-warning',
  },
  crit: {
    icon: 'text-critical',
    box: 'bg-critical/8',
    accent: 'border-l-critical',
  },
  pending: {
    icon: 'text-muted-foreground',
    box: 'bg-surface',
    accent: 'border-l-muted-foreground/50',
  },
  info: {
    icon: 'text-primary',
    box: 'bg-primary/8',
    accent: 'border-l-primary',
  },
};

function ExecutiveInsightRow({ item, index }: { item: OverviewInsight; index: number }) {
  const Icon = insightIcons[index] ?? Info;
  const tone = statusTone[item.status];
  return (
    <div className="flex gap-3">
      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', tone.box)}>
        <Icon className={cn('h-4 w-4', tone.icon)} />
      </span>
      <p className="text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">{item.label}:</span> {item.text}
      </p>
    </div>
  );
}

function ScrollList({ items, quality = false }: { items: OverviewListItem[]; quality?: boolean }) {
  return (
    <div className="dashboard-scrollbar max-h-[202px] space-y-2 overflow-y-auto pr-2">
      {items.map((item, index) => {
        const tone = statusTone[item.status];
        return (
          <div
            key={`${item.title}-${index}`}
            className={cn(
              'flex min-h-[60px] items-center gap-3 rounded-xl border-l-2 px-3 py-2.5',
              tone.box,
              tone.accent,
            )}
          >
            <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background/35', tone.icon)}>
              {quality ? <Database className="h-4 w-4" /> : item.status === 'crit' ? <AlertCircle className="h-4 w-4" /> : item.status === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-foreground/95">{item.title}</p>
              {item.detail ? <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.detail}</p> : null}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          </div>
        );
      })}
    </div>
  );
}

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
      title="Visão Geral"
      data={data}
      headerMode="overview"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {data.overview.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {data.header.stale ? (
        <div className="flex items-center gap-3 rounded-xl border border-critical/15 bg-critical/10 px-4 py-3 text-sm">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-critical" />
          <p className="text-foreground/90">
            <span className="font-semibold">Dados operacionais históricos</span>
            <span className="text-muted-foreground"> — última referência disponível: </span>
            <span className="font-semibold text-critical">{data.header.referenceDate}, {data.header.daysLag} dias atrás.</span>
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Resumo Executivo" icon={BarChart3} className="xl:col-span-5">
          <div className="space-y-3.5">
            {data.overview.executiveHighlights.map((item, index) => (
              <ExecutiveInsightRow key={item.label} item={item} index={index} />
            ))}
          </div>
        </Panel>

        <Panel
          title="Prioridades"
          icon={Target}
          className="xl:col-span-3"
          action={<span className="rounded-md bg-muted px-2 py-1 text-[0.7rem] font-semibold text-muted-foreground">{data.overview.priorities.length} itens</span>}
        >
          <ScrollList items={data.overview.priorities} />
          <p className="mt-3 border-t border-border pt-3 text-center text-xs text-primary">Role para ver todas as prioridades</p>
        </Panel>

        <Panel title="Qualidade e Cobertura" icon={Database} className="xl:col-span-4">
          <div className="mb-3 border-b border-border pb-3 text-center">
            <p className="text-3xl font-semibold tracking-tight text-primary">
              {data.completion.measurementCompletenessPct.toFixed(2).replace('.', ',')}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Completude consolidada das medições</p>
          </div>
          <ScrollList items={data.overview.qualityHighlights} quality />
          <Link
            to="/qualidade-dados"
            className="mt-3 flex items-center justify-center gap-1 border-t border-border pt-3 text-xs font-medium text-primary hover:underline"
          >
            Ver qualidade dos dados <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Panel
          title="Tendência do Período"
          icon={LineChart}
          className="xl:col-span-3"
          action={<span className="flex items-center gap-1.5 text-xs text-muted-foreground">{data.period.label}<Info className="h-4 w-4" /></span>}
        >
          <TendenciaChart data={data.overview.trendMonthly} />
        </Panel>

        <Panel
          title="Maior Utilização Monitorada"
          icon={BarChart3}
          className="xl:col-span-2"
          action={<span className="flex items-center gap-1.5 text-xs text-muted-foreground">{data.period.label}<Info className="h-4 w-4" /></span>}
        >
          <PeakUtilizationTrendChart data={data.overview.peakUtilizationTrend} />
        </Panel>
      </div>

      <Panel title="Origem dos Dados" icon={Database}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.overview.sourceOrigins.map((item, index) => {
            const Icon = origemIcons[index] ?? FileCheck2;
            const tone = statusTone[item.status];
            const label = item.title === 'Lançamento manual' ? 'Manual' : item.title;
            const rightLabel = index === 0 ? `${item.value} fontes` : index === 1 ? 'Sistema' : 'Operacional';
            return (
              <div key={item.title} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
                <span className={cn('rounded-lg p-2', tone.box)}><Icon className={cn('h-4 w-4', tone.icon)} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
                <span className={cn('text-xs font-semibold', tone.icon)}>{rightLabel}</span>
              </div>
            );
          })}

          <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
            <span className="rounded-lg bg-primary/8 p-2 text-primary"><CalendarDays className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Última referência operacional</p>
              <p className="text-xs text-muted-foreground">Base usada na visão atual</p>
            </div>
            <span className="text-xs font-semibold text-primary">
              {data.header.referenceDate}{data.header.stale ? ` (D-${data.header.daysLag})` : ' (D-1)'}
            </span>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
