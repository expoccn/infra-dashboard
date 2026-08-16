import { createFileRoute } from '@tanstack/react-router';
import { ClipboardList } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/plano-acao')({ component: PlanoAcaoPage });

function PlanoAcaoPage() {
  const dashboardQuery = useDashboard();
  if (dashboardQuery.isPending) {
    return <PageState loading title="Carregando dados" description="Consultando o backend n8n e o Redis..." />;
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageState
        title="Backend indisponível"
        description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Não foi possível carregar os dados.'}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }
  const data = dashboardQuery.data;

  return (
    <AppShell
      title="Plano de Ação"
      description="A página foi mantida no menu, mas o sistema não cria itens fictícios. Quando houver uma fonte oficial para plano de ação, esta estrutura poderá ser ligada ao backend."
      data={data}
    >
      <Panel title="Plano de Ação" icon={ClipboardList}>
        <EmptyState title="Sem fonte definida" description="O projeto não recebeu uma origem oficial para itens de plano de ação. Por isso o frontend deixa de exibir listas simuladas e assume explicitamente o estado de indisponibilidade." />
      </Panel>
    </AppShell>
  );
}
