import { createFileRoute } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/analises-ia')({ component: AnalisesIaPage });

function AnalisesIaPage() {
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
      title="Análises por IA"
      description="Área reservada para sumarização automática, anomalias, comparativos e recomendações operacionais quando o histórico diário estiver estável."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Status" icon={Sparkles}>
          <div className="space-y-3">
            <StatusBadge label="Em preparação" tone="info" />
            <p className="text-sm leading-relaxed text-muted-foreground">{data.ai.message}</p>
          </div>
        </Panel>

        <Panel title="Capacidades planejadas" icon={Sparkles}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {data.ai.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <EmptyState title="IA ainda não habilitada" description="A aplicação não simula conclusões analíticas. Assim que a base diária estiver operacional e as regras forem homologadas, este espaço poderá consumir o histórico real e gerar insights consistentes." />
    </AppShell>
  );
}
