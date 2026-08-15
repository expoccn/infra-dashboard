import { createFileRoute } from '@tanstack/react-router';
import { ClipboardList } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/plano-acao')({ component: PlanoAcaoPage });

function PlanoAcaoPage() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

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
