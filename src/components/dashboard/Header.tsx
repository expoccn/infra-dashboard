import { CloudUpload } from 'lucide-react';
import { periodLabels, usePeriod } from '@/context/PeriodContext';
import type { DashboardPayload } from '@/types/dashboard';
import type { PeriodType } from '@/types/api';
import { cn } from '@/lib/utils';

const periods: PeriodType[] = ['d1', '7d', '30d'];

export function Header({
  data,
  title,
  description,
}: {
  data: DashboardPayload;
  title: string;
  description?: string;
}) {
  const { period, setPeriod } = usePeriod();
  const baseLabel = data.header.referenceMode === 'D1' ? 'D-1 cronológico' : 'Último dado disponível';
  const rangeLabel = data.period.validDays > 1
    ? `${data.period.startDate} → ${data.period.endDate}`
    : data.header.referenceDate;

  return (
    <header className="border-b border-border pb-5">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight xl:text-[1.75rem]">{title}</h1>
          <p className="mt-1 text-sm">
            <span className="font-medium text-primary">{data.header.site}</span>
            <span className="px-2 text-muted-foreground">|</span>
            <span className="text-muted-foreground">Competência da referência: {data.header.competence}</span>
          </p>
          {description ? <p className="mt-3 max-w-4xl text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <span className={cn(
          'rounded-lg px-3 py-1.5 text-sm font-medium',
          data.header.stale ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success',
        )}>
          {baseLabel}
        </span>

        <div className="text-xs">
          <p className="text-muted-foreground">Período analisado:</p>
          <p className="mt-0.5 font-medium">{rangeLabel}</p>
          <p className="mt-0.5 text-muted-foreground">
            {data.period.validDays}/{data.period.requestedDays} dias válidos
          </p>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-6 text-xs">
          <CloudUpload className="h-4.5 w-4.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Atualizado {data.header.generatedAt}</p>
            <p className="mt-0.5 text-muted-foreground">Backend n8n · Redis</p>
          </div>
        </div>

        <div className="border-l border-border pl-6 text-xs">
          <p className="text-muted-foreground">Completude das medições</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">{Math.round(data.completion.measurementCompletenessPct)}%</span>
            <span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, data.completion.measurementCompletenessPct))}%` }}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Período:</span>
        {periods.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPeriod(item)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              period === item
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {periodLabels[item]}
          </button>
        ))}
        {data.period.partialHistory ? (
          <span className="ml-2 rounded-md bg-warning/12 px-2.5 py-1 text-xs font-medium text-warning">
            Histórico parcial
          </span>
        ) : null}
        <span className="ml-auto text-xs text-muted-foreground">
          D-1 cronológico: {data.header.expectedD1}
          {data.header.stale ? ` · defasagem ${data.header.daysLag} dias` : ''}
        </span>
      </div>
    </header>
  );
}
