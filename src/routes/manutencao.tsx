import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CalendarCheck2, ClipboardPenLine } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/context/AuthContext';
import { useMaintenance, useSaveMaintenance } from '@/hooks/useDataService';

export const Route = createFileRoute('/manutencao')({ component: ManutencaoPage });

function ManutencaoPage() {
  const dashboardQuery = useDashboard();
  const { user } = useAuth();
  const [competence, setCompetence] = useState('');
  const [planned, setPlanned] = useState('');
  const [completed, setCompleted] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  const maintenanceQuery = useMaintenance(competence);
  const saveMutation = useSaveMaintenance();

  useEffect(() => {
    if (!competence && dashboardQuery.data?.manual.maintenance.competence) {
      setCompetence(dashboardQuery.data.manual.maintenance.competence);
    }
  }, [competence, dashboardQuery.data]);

  useEffect(() => {
    const record = maintenanceQuery.data?.data;
    if (record) {
      setPlanned(String(record.planned));
      setCompleted(String(record.completed));
      setNotes(record.notes || '');
      return;
    }
    if (maintenanceQuery.isSuccess) {
      setPlanned('');
      setCompleted('');
      setNotes('');
    }
  }, [maintenanceQuery.data, maintenanceQuery.isSuccess]);

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

  const handleSave = async () => {
    setFeedback('');
    const plannedNumber = Number(planned);
    const completedNumber = Number(completed);
    if (!/^\d{4}-\d{2}$/.test(competence)) {
      setFeedback('Informe a competência no formato YYYY-MM.');
      return;
    }
    if (!Number.isFinite(plannedNumber) || plannedNumber < 0 || !Number.isFinite(completedNumber) || completedNumber < 0) {
      setFeedback('Planejadas e realizadas devem ser números maiores ou iguais a zero.');
      return;
    }
    if (completedNumber > plannedNumber) {
      setFeedback('Realizadas não pode ser maior que planejadas.');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        competence,
        responsible: user?.display_name || user?.username || 'Administrador',
        planned: plannedNumber,
        completed: completedNumber,
        notes,
      });
      setFeedback('Lançamento salvo com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao salvar manutenção.');
    }
  };

  const current = maintenanceQuery.data ? maintenanceQuery.data.data : (competence === data.manual.maintenance.competence ? data.manual.maintenance.data : null);

  return (
    <AppShell
      title="Manutenção"
      description="Lançamento manual das preventivas por competência, com histórico de atualização e revisão."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Lançamento manual" icon={ClipboardPenLine}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="competencia">Competência</Label>
              <Input id="competencia" placeholder="2026-06" value={competence} onChange={(e) => setCompetence(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input value={user?.display_name || user?.username || 'Administrador'} disabled aria-label="Responsável autenticado" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planejadas">Preventivas planejadas</Label>
              <Input id="planejadas" type="number" min="0" placeholder="0" value={planned} onChange={(e) => setPlanned(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="realizadas">Preventivas realizadas</Label>
              <Input id="realizadas" type="number" min="0" placeholder="0" value={completed} onChange={(e) => setCompleted(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Contexto, pendências ou justificativas" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void handleSave()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar lançamento'}
            </Button>
            {maintenanceQuery.isFetching ? <p className="text-xs text-muted-foreground">Consultando competência...</p> : null}
            {feedback ? <p className="text-xs text-muted-foreground">{feedback}</p> : null}
          </div>
        </Panel>

        <Panel title="Situação atual" icon={CalendarCheck2}>
          <div className="space-y-3">
            <StatusBadge label={current ? 'Disponível' : 'Manual pendente'} tone={current ? 'ok' : 'pending'} />
            {maintenanceQuery.isError ? (
              <p className="text-sm text-warning">Falha ao consultar esta competência.</p>
            ) : current ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface px-4 py-3">
                    <p className="text-xs text-muted-foreground">Planejadas</p>
                    <p className="mt-1 text-xl font-semibold">{current.planned}</p>
                  </div>
                  <div className="rounded-xl bg-surface px-4 py-3">
                    <p className="text-xs text-muted-foreground">Realizadas</p>
                    <p className="mt-1 text-xl font-semibold text-success">{current.completed}</p>
                  </div>
                  <div className="rounded-xl bg-surface px-4 py-3">
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                    <p className="mt-1 text-xl font-semibold text-warning">{current.pending}</p>
                  </div>
                  <div className="rounded-xl bg-surface px-4 py-3">
                    <p className="text-xs text-muted-foreground">Realização</p>
                    <p className="mt-1 text-xl font-semibold text-primary">{current.completion_pct.toFixed(2).replace('.', ',')}%</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Última revisão: {new Date(current.updated_at).toLocaleString('pt-BR')}</p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">Nenhum lançamento encontrado para {competence || 'a competência selecionada'}.</p>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
