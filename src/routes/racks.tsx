import { createFileRoute } from '@tanstack/react-router';
import { HardDrive, LayoutGrid } from 'lucide-react';
import { AppShell } from '@/components/dashboard/AppShell';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';

export const Route = createFileRoute('/racks')({ component: RacksPage });

function RacksPage() {
  const { data, isPending } = useDashboard();
  if (isPending || !data) return null;

  return (
    <AppShell
      title="Racks"
      description="Tela preparada para receber preenchimento manual de capacidade, ocupação e disponibilidade por competência, sem assumir valores inexistentes."
      data={data}
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Lançamento manual" icon={HardDrive}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="competencia-racks">Competência</Label>
              <Input id="competencia-racks" defaultValue={data.manual.racks.competence} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pavimento">Local / pavimento</Label>
              <Input id="pavimento" placeholder="Ex.: Sala principal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-posicoes">Total de posições</Label>
              <Input id="total-posicoes" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocupadas">Posições ocupadas</Label>
              <Input id="ocupadas" type="number" placeholder="0" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="obs-racks">Observações</Label>
              <Textarea id="obs-racks" placeholder="Notas operacionais ou ressalvas da competência" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button type="button">Salvar lançamento</Button>
            <p className="text-xs text-muted-foreground">Estrutura visual pronta para futura integração com Redis / API.</p>
          </div>
        </Panel>

        <Panel title="Situação atual" icon={LayoutGrid}>
          <div className="space-y-3">
            <StatusBadge label="Manual pendente" tone="pending" />
            <p className="text-sm leading-relaxed text-muted-foreground">{data.manual.racks.message}</p>
            <div className="rounded-xl bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">Competência monitorada</p>
              <p className="mt-1 font-semibold">{data.manual.racks.competence}</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
