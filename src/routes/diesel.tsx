import { createFileRoute } from '@tanstack/react-router';
import { Fuel } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/diesel')({ component: DieselPage });

function DieselPage() {
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
  const capacity = data.configuration.dieselCapacityL;

  return (
    <AppShell
      title="Diesel"
      description="A capacidade do tanque está parametrizada conforme o documento do cliente; nível atual e autonomia permanecem indisponíveis até existir uma fonte válida."
      data={data}
    >
      <Panel title="Diesel / Combustível" icon={Fuel}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Capacidade do tanque</p><p className="mt-1 text-3xl font-semibold">{capacity == null ? 'Não disponível' : `${capacity.toLocaleString('pt-BR')} L`}</p><div className="mt-2"><StatusBadge label="Parâmetro oficial" tone="info" /></div></div>
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Nível atual</p><p className="mt-1 text-3xl font-semibold">Não disponível</p><div className="mt-2"><StatusBadge label="Sem fonte válida" tone="pending" /></div></div>
          <div className="rounded-xl bg-surface px-4 py-3"><p className="text-sm text-muted-foreground">Autonomia</p><p className="mt-1 text-3xl font-semibold">Não disponível</p><div className="mt-2"><StatusBadge label="Sem cálculo possível" tone="pending" /></div></div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Sem leitura de nível não é possível calcular percentual do tanque, consumo ou autonomia. A ausência de fonte não é tratada como zero.</p>
      </Panel>
    </AppShell>
  );
}
