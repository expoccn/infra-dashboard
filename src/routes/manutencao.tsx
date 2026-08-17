import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Cable,
  CalendarCheck2,
  ClipboardPenLine,
  FileSpreadsheet,
  Gauge,
  HardHat,
  Layers3,
  Upload,
  Wrench,
} from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageState } from '@/components/dashboard/PageState';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/context/AuthContext';
import {
  useImportMaintenanceWorkbook,
  useMaintenance,
  useMaintenanceManagement,
  useSaveMaintenance,
} from '@/hooks/useDataService';
import { ApiError } from '@/services/api';
import type {
  MaintenanceAvailabilityItem,
  MaintenanceCorrectionItem,
  MaintenancePanelItem,
} from '@/types/api';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/manutencao')({ component: ManutencaoPage });

type CycleChoice = 'latest' | 'all' | number;

function pct(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/D';
  return `${value.toFixed(digits).replace('.', ',')}%`;
}

function ratioPct(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/D';
  return pct(value * 100, digits);
}

function MetricCard({
  label,
  value,
  note,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  note?: string;
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
}) {
  const toneClass = {
    default: 'text-foreground',
    ok: 'text-success',
    warn: 'text-warning',
    crit: 'text-critical',
    info: 'text-primary',
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className={cn('mt-2 text-2xl font-semibold tracking-tight', toneClass)}>{value}</p>
      {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function BarList({ items }: { items: Record<string, number> }) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  return (
    <div className="space-y-3">
      {entries.length ? entries.map(([label, value]) => (
        <div key={label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-foreground/90">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
          </div>
        </div>
      )) : <p className="text-sm text-muted-foreground">Sem registros para o ciclo selecionado.</p>}
    </div>
  );
}

function AvailabilityCard({ title, item }: { title: string; item: MaintenanceAvailabilityItem | null }) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{title}</p>
        <StatusBadge label={item?.cycle_label || 'N/D'} tone={item ? 'info' : 'pending'} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-primary">{ratioPct(item?.total_calculated, 2)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span>COMM {ratioPct(item?.comm)}</span>
        <span>LOC {ratioPct(item?.local)}</span>
        <span>INTEGR {ratioPct(item?.integration)}</span>
        <span>INSTR {ratioPct(item?.instrumentation)}</span>
      </div>
    </div>
  );
}

function ManutencaoPage() {
  const dashboardQuery = useDashboard();
  const { user } = useAuth();
  const [cycle, setCycle] = useState<CycleChoice>('latest');
  const managementQuery = useMaintenanceManagement(cycle);
  const importMutation = useImportMaintenanceWorkbook();
  const [workbookFile, setWorkbookFile] = useState<File | null>(null);
  const [importFeedback, setImportFeedback] = useState('');

  const [competence, setCompetence] = useState('');
  const [planned, setPlanned] = useState('');
  const [completed, setCompleted] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const preventiveQuery = useMaintenance(competence);
  const saveMutation = useSaveMaintenance();

  useEffect(() => {
    if (!competence && dashboardQuery.data?.manual.maintenance.competence) {
      setCompetence(dashboardQuery.data.manual.maintenance.competence);
    }
  }, [competence, dashboardQuery.data]);

  useEffect(() => {
    const record = preventiveQuery.data?.data;
    if (record) {
      setPlanned(String(record.planned));
      setCompleted(String(record.completed));
      setNotes(record.notes || '');
      return;
    }
    if (preventiveQuery.isSuccess) {
      setPlanned('');
      setCompleted('');
      setNotes('');
    }
  }, [preventiveQuery.data, preventiveQuery.isSuccess]);

  const management = managementQuery.data;
  const noImportedData = managementQuery.error instanceof ApiError && managementQuery.error.status === 404;
  const correctionSummary = management?.summary.corrections;
  const offlineIntegrations = useMemo(
    () => (management?.datasets.integrations || []).filter((item) => item.status === 'Offline'),
    [management],
  );
  const sortedPanels = useMemo(() => {
    const order: Record<MaintenancePanelItem['status'], number> = { ISSUE: 0, UNKNOWN: 1, OK: 2 };
    return [...(management?.datasets.panels || [])].sort((a, b) => order[a.status] - order[b.status]);
  }, [management]);

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

  const handleImport = async () => {
    setImportFeedback('');
    if (!workbookFile) {
      setImportFeedback('Selecione a planilha Gestão de Manutenção em formato XLSX.');
      return;
    }
    if (!/\.xlsx$/i.test(workbookFile.name)) {
      setImportFeedback('O arquivo selecionado deve estar no formato XLSX.');
      return;
    }
    try {
      const result = await importMutation.mutateAsync(workbookFile);
      setCycle('latest');
      setWorkbookFile(null);
      setImportFeedback(`Base importada com sucesso. Último ciclo disponível: ${result.cycle.latest_cycle ?? 'N/D'}.`);
    } catch (error) {
      setImportFeedback(error instanceof Error ? error.message : 'Não foi possível importar a planilha.');
    }
  };

  const handleSavePreventive = async () => {
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

  const currentPreventive = preventiveQuery.data
    ? preventiveQuery.data.data
    : (competence === data.manual.maintenance.competence ? data.manual.maintenance.data : null);

  return (
    <AppShell
      title="Manutenção"
      description="Gestão de corretivas, equipamentos em manual, quadros, integrações e disponibilidade por ciclo. O indicador de preventivas permanece com lançamento por competência."
      data={data}
      headerMode="maintenance"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="maintenance-cycle">Ciclo</Label>
            <select
              id="maintenance-cycle"
              value={String(cycle)}
              onChange={(event) => {
                const value = event.target.value;
                setCycle(value === 'latest' || value === 'all' ? value : Number(value));
              }}
              className="h-10 min-w-44 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="latest">Último ciclo</option>
              {(management?.cycle.available_cycles || []).map((item) => <option key={item} value={item}>{item}º ciclo</option>)}
              <option value="all">Todos os ciclos</option>
            </select>
          </div>
          {management ? (
            <div className="pb-1 text-xs text-muted-foreground">
              <p>Base: {management.import.file_name || 'Gestão de Manutenção.xlsx'}</p>
              <p>Importada em {new Date(management.import.imported_at).toLocaleString('pt-BR')} por {management.import.imported_by || 'Administrador'}</p>
            </div>
          ) : null}
        </div>

        {user?.role === 'ADMIN' ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="maintenance-workbook">Atualizar base</Label>
              <Input
                id="maintenance-workbook"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => setWorkbookFile(event.target.files?.[0] || null)}
                className="max-w-sm"
              />
            </div>
            <Button type="button" onClick={() => void handleImport()} disabled={importMutation.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              {importMutation.isPending ? 'Importando...' : 'Importar planilha'}
            </Button>
          </div>
        ) : null}
      </div>
      {importFeedback ? <p className="text-xs text-muted-foreground">{importFeedback}</p> : null}

      {managementQuery.isPending ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Carregando base de manutenção...</div>
      ) : managementQuery.isError && !noImportedData ? (
        <div className="rounded-2xl border border-warning/40 bg-warning/8 p-5">
          <p className="font-medium text-warning">Não foi possível consultar a base de manutenção.</p>
          <p className="mt-1 text-sm text-muted-foreground">{managementQuery.error instanceof Error ? managementQuery.error.message : 'Tente novamente.'}</p>
        </div>
      ) : noImportedData || !management ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <FileSpreadsheet className="mx-auto h-9 w-9 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold">Base de manutenção ainda não importada</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            {user?.role === 'ADMIN'
              ? 'Selecione a planilha Gestão de Manutenção.xlsx acima. A importação considera somente os dados do site RJO-AM.'
              : 'Aguarde a importação da base de Gestão de Manutenção por um administrador.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Corretivas pendentes" value={correctionSummary?.pending ?? 0} tone={(correctionSummary?.pending ?? 0) > 0 ? 'warn' : 'ok'} note={management.cycle.selected_label} />
            <MetricCard label="Corretivas solucionadas" value={correctionSummary?.solved ?? 0} tone="ok" note={management.cycle.selected_label} />
            <MetricCard label="Taxa de solução" value={pct(correctionSummary?.solution_pct ?? 0, 1)} tone="info" />
            <MetricCard label="Dependem de peça" value={correctionSummary?.depends_on_part ?? 0} tone={(correctionSummary?.depends_on_part ?? 0) > 0 ? 'warn' : 'ok'} />
            <MetricCard label="Equip. em manual" value={management.summary.manual_equipment.total} tone={management.summary.manual_equipment.total ? 'warn' : 'ok'} />
            <MetricCard label="Integrações online" value={pct(management.summary.integrations.online_pct, 1)} tone={management.summary.integrations.offline ? 'warn' : 'ok'} note={`${management.summary.integrations.online}/${management.summary.integrations.total} online`} />
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max flex-wrap justify-start">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="corrections">Corretivas</TabsTrigger>
                <TabsTrigger value="manual">Equip. em Manual</TabsTrigger>
                <TabsTrigger value="panels">Quadros</TabsTrigger>
                <TabsTrigger value="integrations">Integrações</TabsTrigger>
                <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
                <TabsTrigger value="preventive">Preventivas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Corretivas por disciplina" icon={Wrench}>
                  <BarList items={management.summary.corrections.by_discipline} />
                </Panel>
                <Panel title="Ocorrências predominantes" icon={AlertTriangle} iconClassName="text-warning">
                  <BarList items={management.summary.corrections.by_occurrence} />
                </Panel>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Disponibilidade da manutenção" icon={Gauge}>
                  <div className="grid gap-3 md:grid-cols-3">
                    <AvailabilityCard title="Inicial" item={management.summary.availability.initial} />
                    <AvailabilityCard title="Anterior" item={management.summary.availability.previous} />
                    <AvailabilityCard title="Atual" item={management.summary.availability.current} />
                  </div>
                </Panel>
                <Panel title="Pontos de atenção" icon={Layers3}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-surface px-4 py-3">
                      <p className="text-xs text-muted-foreground">Quadros com apontamentos</p>
                      <p className="mt-1 text-xl font-semibold text-warning">{management.summary.panels.issues}</p>
                    </div>
                    <div className="rounded-xl bg-surface px-4 py-3">
                      <p className="text-xs text-muted-foreground">Projeto ausente</p>
                      <p className="mt-1 text-xl font-semibold text-warning">{management.summary.panels.project_absent}</p>
                    </div>
                    <div className="rounded-xl bg-surface px-4 py-3">
                      <p className="text-xs text-muted-foreground">Integrações offline</p>
                      <p className="mt-1 text-xl font-semibold text-critical">{management.summary.integrations.offline}</p>
                    </div>
                    <div className="rounded-xl bg-surface px-4 py-3">
                      <p className="text-xs text-muted-foreground">Inconsistências para revisão</p>
                      <p className="mt-1 text-xl font-semibold">{management.data_quality.status_note_inconsistencies}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    O total de disponibilidade é recalculado a partir de COMM, LOC, INTEGR e INSTR. O valor “-” em relé é tratado como neutro e não como falha.
                  </p>
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="corrections">
              <Panel title={`Corretivas · ${management.cycle.selected_label}`} icon={ClipboardPenLine}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] text-sm">
                    <thead><tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2.5">Ciclo</th><th className="px-3 py-2.5">Condição</th><th className="px-3 py-2.5">Disciplina</th><th className="px-3 py-2.5">Equipamento</th><th className="px-3 py-2.5">Ocorrência</th><th className="px-3 py-2.5">Ação</th><th className="px-3 py-2.5">Peça</th><th className="px-3 py-2.5">Técnico</th><th className="px-3 py-2.5">Quadro</th><th className="px-3 py-2.5">Tag</th>
                    </tr></thead>
                    <tbody>{management.datasets.corrections.map((item: MaintenanceCorrectionItem, index) => (
                      <tr key={`${item.cycle_no}-${item.equipment}-${item.tag}-${index}`} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-3">{item.cycle_label || '—'}</td>
                        <td className="px-3 py-3"><StatusBadge label={item.condition || 'N/D'} tone={item.condition === 'Solucionado' ? 'ok' : 'warn'} /></td>
                        <td className="px-3 py-3">{item.discipline || '—'}</td><td className="px-3 py-3 font-medium">{item.equipment || '—'}</td><td className="px-3 py-3">{item.occurrence || '—'}</td><td className="max-w-72 px-3 py-3 text-muted-foreground">{item.action || '—'}</td>
                        <td className="px-3 py-3"><StatusBadge label={item.depends_on_part ? 'SIM' : 'NÃO'} tone={item.depends_on_part ? 'warn' : 'pending'} /></td><td className="px-3 py-3">{item.technician || '—'}</td><td className="px-3 py-3">{item.panel || '—'}</td><td className="px-3 py-3">{item.tag || '—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                  {!management.datasets.corrections.length ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma corretiva no ciclo selecionado.</p> : null}
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="manual">
              <Panel title="Equipamentos mantidos em manual" icon={HardHat}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead><tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground"><th className="px-3 py-2.5">Máquina</th><th className="px-3 py-2.5">Tipo</th><th className="px-3 py-2.5">Quadro</th><th className="px-3 py-2.5">CLP</th><th className="px-3 py-2.5">End.</th><th className="px-3 py-2.5">Motivo</th><th className="px-3 py-2.5">Condição</th></tr></thead>
                    <tbody>{management.datasets.manual_equipment.map((item, index) => <tr key={`${item.machine}-${index}`} className="border-b border-border/60 last:border-0"><td className="px-3 py-3 font-medium">{item.machine || '—'}</td><td className="px-3 py-3">{item.equipment_type || '—'}</td><td className="px-3 py-3">{item.panel || '—'}</td><td className="px-3 py-3">{item.controller || '—'}</td><td className="px-3 py-3">{item.address || '—'}</td><td className="px-3 py-3">{item.reason || '—'}</td><td className="px-3 py-3"><StatusBadge label={item.final_condition || 'N/D'} tone="warn" /></td></tr>)}</tbody>
                  </table>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="panels" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Quadros avaliados" value={management.summary.panels.total} />
                <MetricCard label="Com apontamentos" value={management.summary.panels.issues} tone="warn" />
                <MetricCard label="Projeto ausente" value={management.summary.panels.project_absent} tone="warn" />
                <MetricCard label="Alimentação desenergizada" value={management.summary.panels.source_deenergized + management.summary.panels.ac_input_deenergized} tone="crit" />
              </div>
              <Panel title="Situação dos quadros" icon={Layers3}>
                <div className="max-h-[560px] overflow-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="sticky top-0 z-10"><tr className="border-b border-border bg-card text-left text-xs text-muted-foreground"><th className="px-3 py-2.5">Quadro</th><th className="px-3 py-2.5">Local</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Relé</th><th className="px-3 py-2.5">Fonte</th><th className="px-3 py-2.5">DPS</th><th className="px-3 py-2.5">Terra</th><th className="px-3 py-2.5">Projeto</th><th className="px-3 py-2.5">Entrada AC</th></tr></thead>
                    <tbody>{sortedPanels.map((item, index) => <tr key={`${item.panel}-${index}`} className="border-b border-border/60 last:border-0"><td className="px-3 py-3 font-medium">{item.panel || '—'}</td><td className="px-3 py-3">{item.location || '—'}</td><td className="px-3 py-3"><StatusBadge label={item.status === 'ISSUE' ? 'Atenção' : item.status === 'OK' ? 'OK' : 'Não informado'} tone={item.status === 'ISSUE' ? 'warn' : item.status === 'OK' ? 'ok' : 'pending'} /></td><td className="px-3 py-3">{item.relay || '—'}</td><td className="px-3 py-3">{item.source || '—'}</td><td className="px-3 py-3">{item.dps || '—'}</td><td className="px-3 py-3">{item.earth || '—'}</td><td className="px-3 py-3">{item.project || '—'}</td><td className="px-3 py-3">{item.ac_input || '—'}</td></tr>)}</tbody>
                  </table>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Integrações" value={management.summary.integrations.total} />
                <MetricCard label="Online" value={management.summary.integrations.online} tone="ok" />
                <MetricCard label="Offline" value={management.summary.integrations.offline} tone="crit" />
                <MetricCard label="Disponibilidade" value={pct(management.summary.integrations.online_pct, 2)} tone="info" />
              </div>
              <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <Panel title="Protocolos" icon={Cable}><BarList items={management.summary.integrations.by_protocol} /></Panel>
                <Panel title="Integrações offline" icon={AlertTriangle} iconClassName="text-critical">
                  <div className="max-h-[480px] overflow-auto">
                    <table className="w-full min-w-[720px] text-sm"><thead className="sticky top-0"><tr className="border-b border-border bg-card text-left text-xs text-muted-foreground"><th className="px-3 py-2.5">Gerenciador / Porta</th><th className="px-3 py-2.5">Equipamento</th><th className="px-3 py-2.5">Protocolo</th><th className="px-3 py-2.5">Status</th></tr></thead><tbody>{offlineIntegrations.map((item, index) => <tr key={`${item.manager_port}-${item.equipment}-${index}`} className="border-b border-border/60 last:border-0"><td className="px-3 py-3">{item.manager_port || '—'}</td><td className="px-3 py-3 font-medium">{item.equipment || '—'}</td><td className="px-3 py-3">{item.protocol || '—'}</td><td className="px-3 py-3"><StatusBadge label="Offline" tone="crit" /></td></tr>)}</tbody></table>
                  </div>
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <AvailabilityCard title="Inicial" item={management.summary.availability.initial} />
                <AvailabilityCard title="Anterior" item={management.summary.availability.previous} />
                <AvailabilityCard title="Atual" item={management.summary.availability.current} />
              </div>
              <Panel title="Evolução por ciclo" icon={Gauge}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-sm"><thead><tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground"><th className="px-3 py-2.5">Ciclo</th><th className="px-3 py-2.5">COMM</th><th className="px-3 py-2.5">LOC</th><th className="px-3 py-2.5">INTEGR</th><th className="px-3 py-2.5">INSTR</th><th className="px-3 py-2.5">Total calculado</th><th className="px-3 py-2.5">CAG</th><th className="px-3 py-2.5">CAC</th></tr></thead><tbody>{management.datasets.availability.map((item, index) => <tr key={`${item.cycle_no}-${index}`} className="border-b border-border/60 last:border-0"><td className="px-3 py-3 font-medium">{item.cycle_label || '—'}</td><td className="px-3 py-3">{ratioPct(item.comm, 2)}</td><td className="px-3 py-3">{ratioPct(item.local, 2)}</td><td className="px-3 py-3">{ratioPct(item.integration, 2)}</td><td className="px-3 py-3">{ratioPct(item.instrumentation, 2)}</td><td className="px-3 py-3 font-semibold text-primary">{ratioPct(item.total_calculated, 2)}</td><td className="px-3 py-3">{item.cag || '—'}</td><td className="px-3 py-3">{item.cac || '—'}</td></tr>)}</tbody></table>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="preventive">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <Panel title="Lançamento de preventivas" icon={ClipboardPenLine}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="competencia">Competência</Label><Input id="competencia" placeholder="2026-06" value={competence} onChange={(e) => setCompetence(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Responsável</Label><Input value={user?.display_name || user?.username || 'Administrador'} disabled aria-label="Responsável autenticado" /></div>
                    <div className="space-y-2"><Label htmlFor="planejadas">Preventivas planejadas</Label><Input id="planejadas" type="number" min="0" placeholder="0" value={planned} onChange={(e) => setPlanned(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="realizadas">Preventivas realizadas</Label><Input id="realizadas" type="number" min="0" placeholder="0" value={completed} onChange={(e) => setCompleted(e.target.value)} /></div>
                    <div className="space-y-2 md:col-span-2"><Label htmlFor="observacoes">Observações</Label><Textarea id="observacoes" placeholder="Contexto, pendências ou justificativas" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button type="button" onClick={() => void handleSavePreventive()} disabled={saveMutation.isPending || user?.role !== 'ADMIN'}>{saveMutation.isPending ? 'Salvando...' : 'Salvar lançamento'}</Button>
                    {user?.role !== 'ADMIN' ? <p className="text-xs text-muted-foreground">Somente administradores podem alterar este lançamento.</p> : null}
                    {preventiveQuery.isFetching ? <p className="text-xs text-muted-foreground">Consultando competência...</p> : null}
                    {feedback ? <p className="text-xs text-muted-foreground">{feedback}</p> : null}
                  </div>
                </Panel>

                <Panel title="Situação das preventivas" icon={CalendarCheck2}>
                  <div className="space-y-3">
                    <StatusBadge label={currentPreventive ? 'Disponível' : 'Manual pendente'} tone={currentPreventive ? 'ok' : 'pending'} />
                    {preventiveQuery.isError ? <p className="text-sm text-warning">Falha ao consultar esta competência.</p> : currentPreventive ? <><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Planejadas</p><p className="mt-1 text-xl font-semibold">{currentPreventive.planned}</p></div><div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Realizadas</p><p className="mt-1 text-xl font-semibold text-success">{currentPreventive.completed}</p></div><div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Pendentes</p><p className="mt-1 text-xl font-semibold text-warning">{currentPreventive.pending}</p></div><div className="rounded-xl bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Realização</p><p className="mt-1 text-xl font-semibold text-primary">{currentPreventive.completion_pct.toFixed(2).replace('.', ',')}%</p></div></div><p className="text-xs text-muted-foreground">Última revisão: {new Date(currentPreventive.updated_at).toLocaleString('pt-BR')}</p></> : <p className="text-sm leading-relaxed text-muted-foreground">Nenhum lançamento encontrado para {competence || 'a competência selecionada'}.</p>}
                  </div>
                </Panel>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </AppShell>
  );
}
