import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { HardDrive, LayoutGrid } from 'lucide-react';
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
import { useRacks, useSaveRacks } from '@/hooks/useDataService';

export const Route = createFileRoute('/racks')({ component: RacksPage });

function RacksPage() {
  const dashboardQuery = useDashboard();
  const { user } = useAuth();
  const [competence, setCompetence] = useState('');
  const [occupied, setOccupied] = useState<Record<string, string>>({});
  const [locationNotes, setLocationNotes] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  const racksQuery = useRacks(competence);
  const saveMutation = useSaveRacks();

  const rackConfig = dashboardQuery.data?.configuration.racks || null;
  const parameterCompetence = dashboardQuery.data?.configuration.parameterCompetence || dashboardQuery.data?.manual.racks.competence || '';

  useEffect(() => {
    if (parameterCompetence && competence !== parameterCompetence) setCompetence(parameterCompetence);
  }, [competence, parameterCompetence]);

  useEffect(() => {
    if (!rackConfig) return;
    const record = racksQuery.data?.data;
    const nextOccupied: Record<string, string> = {};
    const nextNotes: Record<string, string> = {};
    for (const location of rackConfig.locations) {
      const saved = record?.locations.find((item) => item.location.trim().toLowerCase() === location.location.trim().toLowerCase());
      nextOccupied[location.location] = saved ? String(saved.occupied_positions) : '';
      nextNotes[location.location] = saved?.notes || '';
    }
    setOccupied(nextOccupied);
    setLocationNotes(nextNotes);
    setNotes(record?.notes || '');
  }, [rackConfig, racksQuery.data]);

  const preview = useMemo(() => {
    if (!rackConfig) return null;
    let occupiedTotal = 0;
    let allFilled = true;
    const locations = rackConfig.locations.map((location) => {
      const raw = occupied[location.location];
      const value = raw === '' || raw === undefined ? null : Number(raw);
      if (value == null || !Number.isFinite(value)) allFilled = false;
      const occupiedValue = value != null && Number.isFinite(value) ? value : 0;
      occupiedTotal += occupiedValue;
      return {
        ...location,
        occupied: value,
        available: value == null ? null : location.existing - value,
        occupancyPct: value == null || location.existing <= 0 ? null : (value / location.existing) * 100,
      };
    });
    return {
      locations,
      occupiedTotal,
      availableTotal: allFilled ? rackConfig.totalExisting - occupiedTotal : null,
      occupancyPct: allFilled && rackConfig.totalExisting > 0 ? (occupiedTotal / rackConfig.totalExisting) * 100 : null,
      allFilled,
    };
  }, [occupied, rackConfig]);

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
  const current = racksQuery.data?.data || (competence === data.manual.racks.competence ? data.manual.racks.data : null);

  const handleSave = async () => {
    setFeedback('');
    if (!rackConfig || !/^\d{4}-\d{2}$/.test(competence)) {
      setFeedback('Os parâmetros oficiais de racks não estão configurados para esta competência.');
      return;
    }

    const locations = rackConfig.locations.map((location) => {
      const raw = occupied[location.location];
      const occupiedPositions = raw === '' || raw === undefined ? Number.NaN : Number(raw);
      return {
        location: location.location,
        total_positions: location.existing,
        occupied_positions: occupiedPositions,
        notes: locationNotes[location.location] || '',
      };
    });

    const invalid = locations.some((item) =>
      !Number.isFinite(item.occupied_positions) ||
      item.occupied_positions < 0 ||
      item.occupied_positions > item.total_positions ||
      !Number.isInteger(item.occupied_positions),
    );
    if (invalid) {
      setFeedback('Preencha manualmente as posições ocupadas dos três ambientes com valores inteiros entre 0 e a capacidade existente.');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        competence,
        responsible: user?.display_name || user?.username || 'Administrador',
        locations,
        notes,
      });
      setFeedback('Ocupação de racks salva com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao salvar racks.');
    }
  };

  return (
    <AppShell
      title="Racks"
      description="A capacidade física de JUN/2026 vem do cadastro oficial do cliente. Somente as posições ocupadas são preenchidas manualmente; posições livres e percentual de ocupação são calculados automaticamente."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Ocupação manual — JUN/2026" icon={HardDrive}>
          {!rackConfig ? (
            <div className="rounded-xl bg-warning/8 px-4 py-3 text-sm text-warning">Não há parâmetros oficiais de racks configurados para a competência da referência.</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="competencia-racks">Competência</Label>
                  <Input id="competencia-racks" value={competence} disabled aria-label="Competência parametrizada" />
                  <p className="text-xs text-muted-foreground">Competência vinculada ao cadastro oficial de parâmetros.</p>
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input value={user?.display_name || user?.username || 'Administrador'} disabled aria-label="Responsável autenticado" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {rackConfig.locations.map((location) => {
                  const item = preview?.locations.find((row) => row.location === location.location);
                  return (
                    <div key={location.location} className="rounded-xl border border-border bg-surface/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div><p className="font-medium">{location.location}</p><p className="text-xs text-muted-foreground">Capacidade existente: {location.existing} posições</p></div>
                        <StatusBadge label="Capacidade oficial" tone="info" />
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Existentes</Label>
                          <Input value={String(location.existing)} disabled aria-label={`Posições existentes em ${location.location}`} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ocupados-${location.location}`}>Ocupados</Label>
                          <Input
                            id={`ocupados-${location.location}`}
                            type="number"
                            min="0"
                            max={location.existing}
                            step="1"
                            value={occupied[location.location] ?? ''}
                            onChange={(event) => setOccupied((currentValue) => ({ ...currentValue, [location.location]: event.target.value }))}
                            placeholder="Preencher"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Livres</Label>
                          <Input value={item?.available == null ? 'Calculado após preenchimento' : String(item.available)} disabled aria-label={`Posições livres em ${location.location}`} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Observação do ambiente</Label>
                          <Input value={locationNotes[location.location] ?? ''} onChange={(event) => setLocationNotes((currentValue) => ({ ...currentValue, [location.location]: event.target.value }))} placeholder="Opcional" />
                        </div>
                        <div className="space-y-2">
                          <Label>Ocupação</Label>
                          <Input value={item?.occupancyPct == null ? 'Calculada' : `${item.occupancyPct.toFixed(2).replace('.', ',')}%`} disabled aria-label={`Percentual de ocupação em ${location.location}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="obs-racks">Observações gerais</Label>
                <Textarea id="obs-racks" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas operacionais ou ressalvas da competência" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="button" onClick={() => void handleSave()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar ocupação'}
                </Button>
                {racksQuery.isFetching ? <p className="text-xs text-muted-foreground">Consultando competência...</p> : null}
                {feedback ? <p className="text-xs text-muted-foreground">{feedback}</p> : null}
              </div>
            </>
          )}
        </Panel>

        <Panel title="Situação atual" icon={LayoutGrid}>
          <div className="space-y-3">
            <StatusBadge label={current ? 'Ocupação disponível' : 'Ocupação pendente'} tone={current ? 'ok' : 'pending'} />
            {racksQuery.isError ? (
              <p className="text-sm text-warning">Falha ao consultar esta competência.</p>
            ) : current ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Existentes</p><p className="mt-1 text-xl font-semibold">{current.total_positions}</p></div>
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Ocupados</p><p className="mt-1 text-xl font-semibold text-warning">{current.occupied_positions}</p></div>
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Livres</p><p className="mt-1 text-xl font-semibold text-success">{current.available_positions}</p></div>
                  <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Ocupação</p><p className="mt-1 text-xl font-semibold text-primary">{current.occupancy_pct.toFixed(2).replace('.', ',')}%</p></div>
                </div>
                <div className="space-y-2">
                  {current.locations.map((item) => (
                    <div key={item.location} className="rounded-xl bg-surface px-4 py-3 text-sm">
                      <p className="font-medium">{item.location}</p>
                      <p className="mt-1 text-muted-foreground">{item.occupied_positions}/{item.total_positions} ocupados · {item.available_positions} livres · {item.occupancy_pct.toFixed(2).replace('.', ',')}%</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Última revisão: {new Date(current.updated_at).toLocaleString('pt-BR')}</p>
              </>
            ) : rackConfig ? (
              <>
                <div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Capacidade física configurada</p><p className="mt-1 text-2xl font-semibold">{rackConfig.totalExisting} posições</p></div>
                <p className="text-sm leading-relaxed text-muted-foreground">A capacidade já é conhecida. Preencha somente a ocupação dos três ambientes para calcular livres e percentual.</p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">Nenhum cadastro oficial de racks está disponível para esta competência.</p>
            )}

            {preview?.allFilled && !current ? (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <p className="font-medium">Prévia antes de salvar</p>
                <p className="mt-1 text-muted-foreground">{preview.occupiedTotal} ocupados · {preview.availableTotal} livres · {preview.occupancyPct?.toFixed(2).replace('.', ',')}% de ocupação</p>
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
