import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { HardDrive, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { useRacks, useSaveRacks } from '@/hooks/useBackend';

type RackEntryForm = {
  location: string;
  total: string;
  occupied: string;
  notes: string;
};

const emptyLocation = (): RackEntryForm => ({ location: '', total: '', occupied: '', notes: '' });

export const Route = createFileRoute('/racks')({ component: RacksPage });

function RacksPage() {
  const dashboardQuery = useDashboard();
  const [competence, setCompetence] = useState('');
  const [responsible, setResponsible] = useState('');
  const [locations, setLocations] = useState<RackEntryForm[]>([emptyLocation()]);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  const racksQuery = useRacks(competence);
  const saveMutation = useSaveRacks();

  useEffect(() => {
    if (!competence && dashboardQuery.data?.manual.racks.competence) {
      setCompetence(dashboardQuery.data.manual.racks.competence);
    }
  }, [competence, dashboardQuery.data]);

  useEffect(() => {
    const record = racksQuery.data?.data;
    if (record) {
      setResponsible(record.responsible || '');
      setNotes(record.notes || '');
      setLocations(record.locations.length ? record.locations.map((item) => ({
        location: item.location,
        total: String(item.total_positions),
        occupied: String(item.occupied_positions),
        notes: item.notes || '',
      })) : [emptyLocation()]);
      return;
    }
    if (racksQuery.isSuccess) {
      setResponsible('');
      setNotes('');
      setLocations([emptyLocation()]);
    }
  }, [racksQuery.data, racksQuery.isSuccess]);

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

  const updateLocation = (index: number, field: keyof RackEntryForm, value: string) => {
    setLocations((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    setFeedback('');
    if (!/^\d{4}-\d{2}$/.test(competence)) {
      setFeedback('Informe a competência no formato YYYY-MM.');
      return;
    }

    const normalized = locations.map((item) => ({
      location: item.location.trim(),
      total_positions: Number(item.total),
      occupied_positions: Number(item.occupied),
      notes: item.notes,
    }));

    const invalid = normalized.some((item) =>
      !item.location ||
      !Number.isFinite(item.total_positions) || item.total_positions < 0 ||
      !Number.isFinite(item.occupied_positions) || item.occupied_positions < 0 ||
      item.occupied_positions > item.total_positions,
    );
    if (invalid) {
      setFeedback('Revise os locais: ocupadas deve estar entre 0 e o total de posições.');
      return;
    }

    try {
      await saveMutation.mutateAsync({ competence, responsible, locations: normalized, notes });
      setFeedback('Lançamento salvo com sucesso no backend n8n.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao salvar racks.');
    }
  };

  const current = racksQuery.data ? racksQuery.data.data : (competence === data.manual.racks.competence ? data.manual.racks.data : null);

  return (
    <AppShell
      title="Racks"
      description="Preenchimento manual de capacidade, ocupação e disponibilidade por competência, persistido pelo n8n no Redis."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Lançamento manual" icon={HardDrive}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="competencia-racks">Competência</Label>
              <Input id="competencia-racks" value={competence} onChange={(e) => setCompetence(e.target.value)} placeholder="2026-06" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel-racks">Responsável</Label>
              <Input id="responsavel-racks" value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Nome do responsável" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {locations.map((item, index) => (
              <div key={index} className="rounded-xl border border-border bg-surface/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">Local {index + 1}</p>
                  {locations.length > 1 ? (
                    <button type="button" onClick={() => setLocations((current) => current.filter((_, i) => i !== index))} className="text-muted-foreground hover:text-critical" aria-label={`Remover local ${index + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-1">
                    <Label>Local / pavimento</Label>
                    <Input value={item.location} onChange={(e) => updateLocation(index, 'location', e.target.value)} placeholder="Ex.: Sala principal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Total de posições</Label>
                    <Input type="number" min="0" value={item.total} onChange={(e) => updateLocation(index, 'total', e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Posições ocupadas</Label>
                    <Input type="number" min="0" value={item.occupied} onChange={(e) => updateLocation(index, 'occupied', e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Observação do local</Label>
                    <Input value={item.notes} onChange={(e) => updateLocation(index, 'notes', e.target.value)} placeholder="Opcional" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" className="mt-3" onClick={() => setLocations((current) => [...current, emptyLocation()])}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar local
          </Button>

          <div className="mt-4 space-y-2">
            <Label htmlFor="obs-racks">Observações gerais</Label>
            <Textarea id="obs-racks" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas operacionais ou ressalvas da competência" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void handleSave()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar lançamento'}
            </Button>
            {racksQuery.isFetching ? <p className="text-xs text-muted-foreground">Consultando competência...</p> : null}
            {feedback ? <p className="text-xs text-muted-foreground">{feedback}</p> : null}
          </div>
        </Panel>

        <Panel title="Situação atual" icon={LayoutGrid}>
          <div className="space-y-3">
            <StatusBadge label={current ? 'Disponível' : 'Manual pendente'} tone={current ? 'ok' : 'pending'} />
            {racksQuery.isError ? (
              <p className="text-sm text-warning">Falha ao consultar esta competência.</p>
            ) : current ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 text-xl font-semibold">{current.total_positions}</p></div>
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Ocupadas</p><p className="mt-1 text-xl font-semibold text-warning">{current.occupied_positions}</p></div>
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Livres</p><p className="mt-1 text-xl font-semibold text-success">{current.available_positions}</p></div>
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Ocupação</p><p className="mt-1 text-xl font-semibold text-primary">{current.occupancy_pct.toFixed(2).replace('.', ',')}%</p></div>
                </div>
                <div className="space-y-2">
                  {current.locations.map((item) => (
                    <div key={item.location} className="rounded-xl bg-surface px-4 py-3 text-sm">
                      <p className="font-medium">{item.location}</p>
                      <p className="mt-1 text-muted-foreground">{item.occupied_positions}/{item.total_positions} ocupadas · {item.available_positions} livres</p>
                    </div>
                  ))}
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
