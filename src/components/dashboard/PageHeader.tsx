import { CalendarDays, CloudUpload, DatabaseZap, TimerReset } from 'lucide-react';
import type { DashboardPayload } from '@/types/dashboard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

function fmtPct(value: number) {
  return `${value.toFixed(2).replace('.', ',')}%`;
}

export function PageHeader({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: DashboardPayload;
}) {
  const freshnessTone = data.header.stale ? 'warn' : 'ok';
  const freshnessLabel = data.header.referenceMode === 'D1' ? 'Base D-1' : 'Último dado disponível';

  return (
    <header className="space-y-4 border-b border-border pb-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight xl:text-[1.75rem]">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-primary">{data.header.site}</span>
            <span className="px-2">|</span>
            <span>Competência: {data.header.competence}</span>
          </p>
          {description ? <p className="mt-2 max-w-4xl text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={freshnessLabel} tone={freshnessTone} />
          <StatusBadge
            label={`${data.completion.receivedSources}/${data.completion.expectedSources} fontes recebidas`}
            tone="ok"
          />
          <StatusBadge
            label={`${fmtPct(data.completion.measurementCompletenessPct)} de medições`}
            tone="info"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> Dados de referência
          </div>
          <p className="mt-2 text-base font-semibold">{data.header.referenceDate}</p>
          <p className="text-xs text-muted-foreground">{data.header.referenceMode === 'D1' ? 'Base diária validada' : 'Último Redis válido'}</p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <TimerReset className="h-4 w-4" /> D-1 esperado
          </div>
          <p className="mt-2 text-base font-semibold">{data.header.expectedD1}</p>
          <p className="text-xs text-muted-foreground">
            {data.header.stale ? `${data.header.daysLag} dias de defasagem` : 'Dados atualizados'}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <CloudUpload className="h-4 w-4" /> Última geração
          </div>
          <p className="mt-2 text-base font-semibold">{data.header.generatedAt}</p>
          <p className="text-xs text-muted-foreground">Ingestão via workflows n8n</p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <DatabaseZap className="h-4 w-4" /> Completude
          </div>
          <p className="mt-2 text-base font-semibold">{fmtPct(data.completion.sourceCompletenessPct)}</p>
          <p className="text-xs text-muted-foreground">
            Fontes: {data.completion.receivedSources}/{data.completion.expectedSources} · Medições: {fmtPct(data.completion.measurementCompletenessPct)}
          </p>
        </div>
      </div>
    </header>
  );
}
