import { createFileRoute } from '@tanstack/react-router';
import { Database, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/qualidade-dados')({ component: QualidadeDadosPage });

function QualidadeDadosPage() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

  return (
    <AppShell
      title="Qualidade dos Dados"
      description="Painel específico de auditoria e completude das fontes. Esta tela ajuda a operação a entender se uma ausência é falta de fonte, falha do D-1 ou apenas cobertura parcial de medições."
      data={data}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Fontes recebidas</p>
          <p className="mt-2 text-3xl font-semibold text-success">{data.completion.receivedSources}/{data.completion.expectedSources}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Completude das fontes</p>
          <p className="mt-2 text-3xl font-semibold text-primary">{data.completion.sourceCompletenessPct.toFixed(0)}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Completude das medições</p>
          <p className="mt-2 text-3xl font-semibold text-warning">{data.completion.measurementCompletenessPct.toFixed(2).replace('.', ',')}%</p>
        </div>
      </div>

      <Panel title="Auditoria por Report" icon={Database}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Report</th>
                <th className="px-3 py-2.5 font-medium">Recebimento</th>
                <th className="px-3 py-2.5 font-medium">Qualidade</th>
                <th className="px-3 py-2.5 font-medium">Cobertura</th>
                <th className="px-3 py-2.5 font-medium">Referência</th>
                <th className="px-3 py-2.5 font-medium">Atualizado em</th>
              </tr>
            </thead>
            <tbody>
              {data.sources.map((source) => (
                <tr key={source.reportType} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 font-medium">{source.label}</td>
                  <td className="px-3 py-3">
                    <StatusBadge label={source.received ? 'Recebido' : 'Ausente'} tone={source.received ? 'ok' : 'warn'} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge label={source.qualityState} tone={source.qualityState === 'OK' ? 'ok' : 'warn'} />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{source.measurementCoveragePct == null ? 'N/D' : `${source.measurementCoveragePct.toFixed(2).replace('.', ',')}%`}</td>
                  <td className="px-3 py-3 text-muted-foreground">{source.referenceStatus}</td>
                  <td className="px-3 py-3 text-muted-foreground">{source.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Leitura Operacional" icon={ShieldAlert}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A auditoria D-1 e a auditoria da referência exibida coexistem. Assim, quando o sistema estiver rodando diariamente, o usuário verá simultaneamente se o D-1 cronológico chegou e qual é o último dado efetivamente disponível no dashboard.
        </p>
      </Panel>
    </AppShell>
  );
}
