import { createFileRoute } from '@tanstack/react-router';
import { Fuel } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { EmptyState } from '@/components/dashboard/EmptyState';
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

  return (
    <AppShell
      title="Diesel"
      description="Página preparada para receber telemetria e regras futuras. Neste momento o dashboard explicita a ausência de fonte para evitar qualquer inferência indevida."
      data={data}
    >
      <Panel title="Diesel / Combustível" icon={Fuel}>
        <EmptyState title="Não disponível" description="Ainda não existe fonte homologada para consumo, autonomia ou nível de diesel no escopo atual do sistema." />
      </Panel>
    </AppShell>
  );
}
