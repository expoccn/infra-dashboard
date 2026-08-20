import { createFileRoute } from '@tanstack/react-router';
import {
  AlertTriangle,
  Bot,
  BrainCircuit,
  ChevronDown,
  Clock3,
  Database,
  Eraser,
  History,
  Info,
  LoaderCircle,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { useDashboard } from '@/hooks/useDashboard';
import { useAiHistory, useAskAi, useClearAiHistory, useMaintenanceManagement } from '@/hooks/useDataService';
import { usePeriod, periodLabels } from '@/context/PeriodContext';
import { getOrCreateAiSessionId } from '@/lib/aiSession';
import type { AiChatResponse, AiEvidenceItem, AiHistoryEntry, PeriodType } from '@/types/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const Route = createFileRoute('/analises-ia')({ component: AnalisesIaPage });

const SUGGESTIONS = [
  'Como está o PUE no período?',
  'Qual foi o PUE em 06/06?',
  'Compare o PUE de 06/06 com 20/06',
  'Quais corretivas estão pendentes?',
  'Quais integrações estão offline?',
  'Faça um resumo executivo da operação',
];

const PERIOD_SHORT: Record<PeriodType, string> = {
  d1: 'Último dia',
  '7d': '7 dias',
  '30d': '30 dias',
};

function displayEvidenceValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Não disponível';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
  if (typeof value === 'string' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(displayEvidenceValue).join(' · ');
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const labels: Record<string, string> = { value: 'valor', status: 'status', target: 'meta', limit: 'limite', avg: 'média', min: 'mínimo', max: 'máximo' };
    const preferred = ['value', 'status', 'target', 'limit', 'avg', 'min', 'max']
      .filter((key) => record[key] !== undefined && record[key] !== null)
      .map((key) => `${labels[key]}: ${displayEvidenceValue(record[key])}`);
    if (preferred.length) return preferred.join(' · ');
    try {
      return JSON.stringify(value);
    } catch {
      return 'Dado consolidado';
    }
  }
  return String(value);
}

function safeSource(source?: string) {
  if (!source || /\b(n8n|redis|webhook|backend)\b/i.test(source)) return 'Dados consolidados';
  return source;
}

function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatReferenceDate(value?: string | null) {
  if (!value) return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function periodText(period: string) {
  if (period === 'd1' || period === '7d' || period === '30d') return PERIOD_SHORT[period];
  return period;
}

function AnswerModeBadge({ usedLlm }: { usedLlm: boolean }) {
  return usedLlm ? (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-purple/10 px-2.5 py-1 text-[0.68rem] font-semibold text-purple">
      <Sparkles className="h-3.5 w-3.5" /> Texto revisado pela IA
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/8 px-2.5 py-1 text-[0.68rem] font-semibold text-primary">
      <ShieldCheck className="h-3.5 w-3.5" /> Resposta determinística
    </span>
  );
}

function EvidenceBlock({ evidence }: { evidence: AiEvidenceItem[] }) {
  if (!evidence.length) return null;
  return (
    <details className="group rounded-xl border border-border bg-background/45">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-foreground marker:content-none">
        <Database className="h-3.5 w-3.5 text-primary" />
        Evidências utilizadas · {evidence.length}
        <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-2 border-t border-border px-3.5 py-3">
        {evidence.map((item, index) => (
          <div key={`${item.id || item.label}-${index}`} className="grid gap-1 rounded-lg bg-surface px-3 py-2.5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="text-xs font-medium text-foreground">{item.label}</p>
              <p className="mt-0.5 text-[0.68rem] text-muted-foreground">{safeSource(item.source)}</p>
            </div>
            <p className="break-words text-xs leading-relaxed text-foreground/85 sm:text-right">{displayEvidenceValue(item.value)}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function LimitationsBlock({ limitations }: { limitations: string[] }) {
  if (!limitations.length) return null;
  return (
    <div className="rounded-xl border border-warning/20 bg-warning/8 px-3.5 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-warning">
        <Info className="h-3.5 w-3.5" /> Observações da consulta
      </div>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground/80">
        {limitations.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}
      </ul>
    </div>
  );
}

function ConversationEntry({ entry }: { entry: AiHistoryEntry }) {
  return (
    <div className="space-y-3">
      <div className="ml-auto flex max-w-[88%] gap-2.5 sm:max-w-[78%]">
        <div className="min-w-0 flex-1 rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.question}</p>
          <p className="mt-2 text-right text-[0.65rem] opacity-70">{formatMessageTime(entry.timestamp)}</p>
        </div>
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground">
          <UserRound className="h-4 w-4" />
        </span>
      </div>

      <div className="flex max-w-[96%] gap-2.5 sm:max-w-[90%]">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-surface/60 px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <AnswerModeBadge usedLlm={entry.used_llm} />
            <span className="text-[0.68rem] text-muted-foreground">{periodText(entry.period)}</span>
            {entry.reference_date ? <span className="text-[0.68rem] text-muted-foreground">· ref. {formatReferenceDate(entry.reference_date)}</span> : null}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">{entry.answer}</p>
          <div className="mt-3 space-y-2.5">
            <EvidenceBlock evidence={entry.evidence || []} />
            <LimitationsBlock limitations={entry.limitations || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InstantAnswer({ question, response }: { question: string; response: AiChatResponse }) {
  const entry: AiHistoryEntry = {
    id: `instant-${response.generated_at}`,
    timestamp: response.generated_at,
    period: response.period,
    reference_date: response.reference?.reference_date || null,
    question,
    answer: response.answer,
    intent: response.intent,
    temporal_query: response.temporal_query,
    used_llm: response.used_llm,
    evidence: response.evidence || [],
    limitations: response.limitations || [],
    governance: response.governance,
  };
  return <ConversationEntry entry={entry} />;
}

function AnalisesIaPage() {
  const dashboardQuery = useDashboard();
  const { period } = usePeriod();
  const maintenanceQuery = useMaintenanceManagement('latest');
  const [sessionId, setSessionId] = useState('');
  const [question, setQuestion] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [instantAnswer, setInstantAnswer] = useState<{ question: string; response: AiChatResponse } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getOrCreateAiSessionId());
  }, []);

  const historyQuery = useAiHistory(sessionId);
  const askMutation = useAskAi();
  const clearMutation = useClearAiHistory();
  const history = historyQuery.data?.history || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history.length, pendingQuestion, instantAnswer?.response.generated_at]);

  useEffect(() => {
    if (!instantAnswer) return;
    const persisted = history.some((entry) => entry.timestamp === instantAnswer.response.generated_at);
    if (persisted) setInstantAnswer(null);
  }, [history, instantAnswer]);

  if (dashboardQuery.isPending) {
    return <PageState loading title="Carregando dados" description="Consultando o contexto governado do dashboard..." />;
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

  async function sendQuestion(text = question) {
    const trimmed = text.trim();
    if (!sessionId || trimmed.length < 2 || trimmed.length > 800 || askMutation.isPending) return;

    setQuestion('');
    setInstantAnswer(null);
    setPendingQuestion(trimmed);
    try {
      const response = await askMutation.mutateAsync({ question: trimmed, period, session_id: sessionId });
      setInstantAnswer({ question: trimmed, response });
      await historyQuery.refetch();
    } catch {
      setQuestion(trimmed);
    } finally {
      setPendingQuestion(null);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendQuestion();
    }
  }

  async function clearConversation() {
    if (!sessionId || clearMutation.isPending) return;
    try {
      await clearMutation.mutateAsync(sessionId);
      setInstantAnswer(null);
      setPendingQuestion(null);
      setQuestion('');
      await historyQuery.refetch();
    } catch {
      // O próprio mutation expõe o erro; o histórico visível é preservado.
    }
  }

  const latestCycle = maintenanceQuery.data?.cycle?.latest_cycle;
  const hasConversation = history.length > 0 || pendingQuestion || instantAnswer;
  const isSending = askMutation.isPending;

  return (
    <AppShell
      title="Análises por IA"
      description="Consulta e interpretação somente sobre dados consolidados. O assistente não cria KPIs, não estima valores ausentes e usa o modelo generativo apenas quando a redação precisa ser aprimorada."
      data={data}
      headerMode="ai"
    >
      {data.header.stale ? (
        <div className="flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/8 px-4 py-3 text-sm">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-warning" />
          <p className="text-foreground/90">
            <span className="font-semibold">Dados operacionais históricos</span>
            <span className="text-muted-foreground"> — referência disponível: </span>
            <span className="font-semibold text-warning">{data.header.referenceDate}, defasagem de {data.header.daysLag} dias.</span>
          </p>
        </div>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(290px,3fr)]">
        <section className="flex min-h-[660px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:h-[calc(100vh-210px)] xl:min-h-[660px]">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquareText className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Assistente de análise</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Pergunte sobre operação, períodos, equipamentos, manutenção e qualidade dos dados.</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-1.5 text-[0.7rem] text-muted-foreground sm:flex">
                  <History className="h-3.5 w-3.5" /> {history.length} consultas
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={!sessionId || clearMutation.isPending || history.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Eraser className="h-3.5 w-3.5" /> Limpar conversa
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar histórico desta sessão?</AlertDialogTitle>
                      <AlertDialogDescription>
                        As perguntas e respostas visíveis nesta sessão serão removidas. Esta ação não altera os dados operacionais, de manutenção ou do dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void clearConversation()}>Limpar conversa</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 dashboard-scrollbar">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void sendQuestion(item)}
                  disabled={!sessionId || isSending}
                  className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/6 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            {!sessionId || historyQuery.isPending ? (
              <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-primary" /> Preparando a sessão de consulta...
              </div>
            ) : historyQuery.isError && !hasConversation ? (
              <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-warning/20 bg-warning/6 px-5 py-8 text-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <p className="mt-3 text-sm font-medium">Não foi possível carregar o histórico da sessão.</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Você ainda pode fazer uma nova consulta. O histórico será atualizado após a resposta quando o serviço estiver disponível.</p>
              </div>
            ) : !hasConversation ? (
              <div className="mx-auto flex min-h-[360px] max-w-xl flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BrainCircuit className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold">Consulte a base governada</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Pergunte por um indicador do período selecionado ou cite uma data diretamente, como “PUE em 06/06”. Datas explícitas na pergunta têm prioridade sobre o período padrão.
                </p>
                <div className="mt-4 rounded-xl border border-primary/15 bg-primary/6 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  O assistente responde somente com fatos disponíveis nos dados consolidados. Quando não houver suporte suficiente, ele informa a limitação em vez de estimar uma resposta.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {history.map((entry) => <ConversationEntry key={entry.id} entry={entry} />)}
                {instantAnswer ? <InstantAnswer question={instantAnswer.question} response={instantAnswer.response} /> : null}
                {pendingQuestion ? (
                  <div className="space-y-3">
                    <div className="ml-auto flex max-w-[88%] gap-2.5 sm:max-w-[78%]">
                      <div className="min-w-0 flex-1 rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground shadow-sm">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{pendingQuestion}</p>
                      </div>
                      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground"><UserRound className="h-4 w-4" /></span>
                    </div>
                    <div className="flex max-w-[90%] gap-2.5">
                      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-4 w-4" /></span>
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-surface/60 px-4 py-3 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin text-primary" /> Consultando os dados governados...
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-border bg-card px-4 py-3.5 sm:px-5">
            {askMutation.isError ? (
              <div className="mb-2.5 flex items-start gap-2 rounded-lg border border-critical/15 bg-critical/8 px-3 py-2 text-xs text-critical">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{askMutation.error instanceof Error ? askMutation.error.message : 'Não foi possível concluir a consulta.'}</span>
              </div>
            ) : null}
            <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value.slice(0, 800))}
                onKeyDown={handleKeyDown}
                disabled={!sessionId || isSending}
                rows={2}
                maxLength={800}
                placeholder="Pergunte sobre os dados consolidados..."
                className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void sendQuestion()}
                disabled={!sessionId || isSending || question.trim().length < 2}
                aria-label="Enviar pergunta"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-muted-foreground">
              <span>Enter envia · Shift + Enter quebra linha</span>
              <span className="ml-auto">{question.length}/800</span>
            </div>
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-5">
          <Panel title="Contexto da consulta" icon={Clock3}>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-surface px-3.5 py-3">
                <p className="text-xs text-muted-foreground">Período padrão</p>
                <p className="mt-1 font-semibold">{periodLabels[period]}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data.period.startDate} → {data.period.endDate}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-surface px-3.5 py-3">
                  <p className="text-xs text-muted-foreground">Referência</p>
                  <p className="mt-1 text-sm font-semibold">{data.header.referenceDate}</p>
                </div>
                <div className="rounded-xl bg-surface px-3.5 py-3">
                  <p className="text-xs text-muted-foreground">Manutenção</p>
                  <p className="mt-1 text-sm font-semibold">{typeof latestCycle === 'number' ? `${latestCycle}º ciclo` : 'Não disponível'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary/6 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-primary">Regra temporal:</span> se a pergunta citar uma data ou comparação explícita, essa seleção é resolvida deterministicamente e substitui o período padrão apenas naquela consulta.
              </div>
            </div>
          </Panel>

          <Panel title="Consulta governada" icon={ShieldCheck}>
            <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/85">
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /><span>Não calcula novos KPIs ou médias arbitrárias.</span></li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /><span>Não estima valores ausentes e não transforma ausência em zero.</span></li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /><span>Não determina causa raiz sem evidência consolidada.</span></li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /><span>Não usa conhecimento externo para completar a resposta.</span></li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /><span>O histórico é visual e não vira memória enviada ao modelo generativo.</span></li>
            </ul>
            <div className="mt-4 rounded-xl bg-purple/8 px-3.5 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple"><Sparkles className="h-3.5 w-3.5" /> Quando o modelo é usado</div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Somente para melhorar a redação de análises textuais. Os fatos e números enviados já foram selecionados pelo fluxo determinístico.</p>
            </div>
          </Panel>

          <Panel title="Leitura das respostas" icon={Info}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 rounded-md bg-primary/8 p-1.5 text-primary"><ShieldCheck className="h-3.5 w-3.5" /></span>
                <div><p className="font-medium text-foreground">Resposta determinística</p><p className="mt-0.5 leading-relaxed">Valor ou seleção devolvida diretamente a partir dos dados governados.</p></div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 rounded-md bg-purple/10 p-1.5 text-purple"><Sparkles className="h-3.5 w-3.5" /></span>
                <div><p className="font-medium text-foreground">Texto revisado pela IA</p><p className="mt-0.5 leading-relaxed">Redação aprimorada sem autorização para criar novos fatos ou números.</p></div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 rounded-md bg-warning/8 p-1.5 text-warning"><AlertTriangle className="h-3.5 w-3.5" /></span>
                <div><p className="font-medium text-foreground">Observações</p><p className="mt-0.5 leading-relaxed">Limitações, data inferida ou ausência de suporte suficiente ficam explícitas na resposta.</p></div>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
