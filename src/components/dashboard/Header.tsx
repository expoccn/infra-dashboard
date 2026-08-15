import { CalendarDays, ChevronDown, CloudUpload } from 'lucide-react';
import type { DashboardPayload } from '@/types/dashboard';

function formatPct(value: number) {
  return `${value.toFixed(2).replace('.', ',')}%`;
}

export function Header({
  data,
  title,
  description,
}: {
  data: DashboardPayload;
  title: string;
  description?: string;
}) {
  const baseLabel = data.header.referenceMode === 'D1' ? 'Base D-1' : 'Último dado disponível';
  const referencia =
    data.header.referenceMode === 'D1'
      ? `${data.header.referenceDate} (ontem)`
      : `${data.header.referenceDate} · último Redis válido`;

  return (
    <header className="border-b border-border pb-5">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight xl:text-[1.75rem]">{title}</h1>
          <p className="mt-1 text-sm">
            <span className="font-medium text-primary">{data.header.site}</span>
            <span className="px-2 text-muted-foreground">|</span>
            <span className="text-muted-foreground">Competência: {data.header.competence}</span>
          </p>
          {description ? <p className="mt-3 max-w-4xl text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <span className="rounded-lg bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary">{baseLabel}</span>

        <div className="text-xs">
          <p className="text-muted-foreground">Dados de referência:</p>
          <p className="mt-0.5 font-medium">{referencia}</p>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-6 text-xs">
          <CloudUpload className="h-4.5 w-4.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Última carga {data.header.generatedAt.split(' ').slice(-1)[0] ?? data.header.generatedAt}</p>
            <p className="mt-0.5 text-muted-foreground">Ingestão via workflows n8n</p>
          </div>
        </div>

        <div className="border-l border-border pl-6 text-xs">
          <p className="text-muted-foreground">Completude dos dados</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">{Math.round(data.completion.measurementCompletenessPct)}%</span>
            <span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, data.completion.measurementCompletenessPct))}%` }} />
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
        >
          <CalendarDays className="h-4 w-4 text-primary" />
          {data.header.competence}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
