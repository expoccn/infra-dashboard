import { createFileRoute } from '@tanstack/react-router';
import { CalendarDays, CalendarRange, Download, FileText, LoaderCircle, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { useDownloadReport } from '@/hooks/useDataService';
import type { ReportDownloadRequest, ReportType } from '@/services/api';

export const Route = createFileRoute('/relatorios')({ component: RelatoriosPage });

type ReportOption = {
  type: ReportType;
  title: string;
  period: string;
  description: string;
  contents: string;
  icon: typeof FileText;
  powerPoint?: boolean;
};

const REPORT_OPTIONS: ReportOption[] = [
  {
    type: 'daily',
    title: 'Relatório Diário',
    period: 'Último dia válido disponível',
    description: 'Consolida a operação do último dia válido, com parâmetros oficiais, qualidade dos dados e situação das fontes.',
    contents: 'Energia e PUE, capacidade, CAG/VAC, disponibilidade, manutenção, racks e pendências de dados.',
    icon: CalendarDays,
    powerPoint: true,
  },
  {
    type: 'weekly',
    title: 'Relatório Semanal',
    period: 'Última semana fechada',
    description: 'Consolida a última semana encerrada, de segunda a domingo, preservando a cobertura real de cada família de ativos.',
    contents: 'Evolução do período, indicadores consolidados, capacidade, climatização, manutenção e qualidade das fontes.',
    icon: CalendarRange,
    powerPoint: true,
  },
  {
    type: 'monthly',
    title: 'Relatório Mensal',
    period: 'Último mês calendário disponível',
    description: 'Versão mais completa do relatório, com detalhamento operacional e gerencial da competência disponível.',
    contents: 'Indicadores, tendências, inventário esperado × recebido, manutenção detalhada, quadros, integrações e lacunas de dados.',
    icon: FileText,
    powerPoint: true,
  },
];

function sameDownload(a: ReportDownloadRequest | undefined, b: ReportDownloadRequest) {
  return a?.type === b.type && a.format === b.format;
}

function RelatoriosPage() {
  const dashboardQuery = useDashboard();
  const downloadMutation = useDownloadReport();

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
  const activeDownload = downloadMutation.isPending ? downloadMutation.variables : undefined;
  const failedDownload = downloadMutation.isError ? downloadMutation.variables : undefined;

  async function handleDownload(request: ReportDownloadRequest) {
    try {
      await downloadMutation.mutateAsync(request);
    } catch {
      // O erro fica disponível no mutation e é exibido no respectivo card.
    }
  }

  return (
    <AppShell
      title="Relatórios"
      description="Gere e baixe os relatórios oficiais do DC RJO-AM sob demanda. O arquivo é produzido no momento do clique e não é armazenado pelo portal."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <Panel title="Relatórios disponíveis" icon={FileText}>
          <div className="grid gap-4 lg:grid-cols-3">
            {REPORT_OPTIONS.map((report) => {
              const Icon = report.icon;
              const pdfRequest: ReportDownloadRequest = { type: report.type, format: 'pdf' };
              const pptxRequest: ReportDownloadRequest = { type: report.type, format: 'pptx' };
              const pdfLoading = downloadMutation.isPending && sameDownload(activeDownload, pdfRequest);
              const pptxLoading = downloadMutation.isPending && sameDownload(activeDownload, pptxRequest);
              const failed = failedDownload?.type === report.type;

              return (
                <article key={report.type} className="flex min-h-[350px] flex-col rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <StatusBadge label="Sob demanda" tone="info" className="bg-background text-primary" />
                  </div>

                  <div className="mt-5">
                    <h2 className="text-base font-semibold text-foreground">{report.title}</h2>
                    <p className="mt-1 text-xs font-medium text-primary">{report.period}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{report.description}</p>
                  </div>

                  <div className="mt-4 rounded-xl bg-background/60 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                    {report.contents}
                  </div>

                  <div className="mt-auto space-y-2 pt-5">
                    <Button
                      type="button"
                      className="w-full"
                      disabled={downloadMutation.isPending}
                      onClick={() => void handleDownload(pdfRequest)}
                    >
                      {pdfLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="h-4 w-4" aria-hidden="true" />
                      )}
                      {pdfLoading ? 'Gerando PDF...' : 'Baixar PDF'}
                    </Button>

                    {report.powerPoint && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                        disabled={downloadMutation.isPending}
                        onClick={() => void handleDownload(pptxRequest)}
                      >
                        {pptxLoading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <FileText className="h-4 w-4" aria-hidden="true" />
                        )}
                        {pptxLoading ? 'Gerando PowerPoint...' : 'Baixar PowerPoint'}
                      </Button>
                    )}

                    {failed && (
                      <p role="alert" className="mt-3 text-xs leading-relaxed text-critical">
                        {downloadMutation.error instanceof Error
                          ? downloadMutation.error.message
                          : 'Não foi possível gerar o relatório. Tente novamente.'}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel title="Como funciona" icon={ShieldCheck}>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="font-medium text-foreground">Geração imediata</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                Ao clicar em baixar, o relatório é montado com os dados mais recentes disponíveis e o download começa assim que o arquivo estiver pronto.
              </p>
            </div>

            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="font-medium text-foreground">PDF e PowerPoint</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                Os relatórios diário, semanal e mensal estão disponíveis em PDF e PowerPoint, sempre gerados sob demanda com os dados mais recentes disponíveis.
              </p>
            </div>

            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="font-medium text-foreground">Sem arquivo armazenado</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                O portal não mantém histórico nem cópia dos arquivos gerados. Para obter uma versão atualizada, basta gerar novamente.
              </p>
            </div>

            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="font-medium text-foreground">Pendências preservadas</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                Fontes ausentes, cobertura parcial e dados aguardando validação aparecem no próprio relatório e não são convertidos em zero.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <StatusBadge label={`Referência: ${data.header.referenceDate}`} tone="info" className="bg-background text-primary" />
              <StatusBadge label={`Competência: ${data.header.competence}`} tone="pending" />
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
