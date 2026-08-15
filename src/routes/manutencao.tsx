import { createFileRoute } from '@tanstack/react-router';
import { CalendarCheck2, ClipboardPenLine } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/manutencao')({ component: ManutencaoPage });

function ManutencaoPage() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

  return (
    <AppShell
      title="Manutenção"
      description="Página preparada para o lançamento manual das preventivas realizadas por competência. Nesta etapa a tela já está pronta para substituir os mocks e receber persistência futura."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Lançamento manual" icon={ClipboardPenLine}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="competencia">Competência</Label>
              <Input id="competencia" placeholder="2026-06" defaultValue={data.manual.maintenance.competence} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" placeholder="Nome do responsável" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planejadas">Preventivas planejadas</Label>
              <Input id="planejadas" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="realizadas">Preventivas realizadas</Label>
              <Input id="realizadas" type="number" placeholder="0" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Contexto, pendências ou justificativas" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button type="button">Salvar lançamento</Button>
            <p className="text-xs text-muted-foreground">Estrutura pronta para futura gravação no Redis / API.</p>
          </div>
        </Panel>

        <Panel title="Situação atual" icon={CalendarCheck2}>
          <div className="space-y-3">
            <StatusBadge label="Manual pendente" tone="pending" />
            <p className="text-sm leading-relaxed text-muted-foreground">{data.manual.maintenance.message}</p>
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">Competência monitorada</p>
              <p className="mt-1 font-semibold">{data.manual.maintenance.competence}</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
