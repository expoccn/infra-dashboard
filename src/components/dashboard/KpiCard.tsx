import {
  Info,
  ShieldCheck,
  TowerControl,
  ClipboardList,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';
import type { KpiIcon, UiStatus } from '@/types/dashboard';
import { cn } from '@/lib/utils';

const iconMap = {
  pue: Info,
  shield: ShieldCheck,
  grid: TowerControl,
  clipboard: ClipboardList,
  alert: AlertTriangle,
  list: ListChecks,
} as const;

const valueTone: Record<UiStatus, string> = {
  ok: 'text-success',
  warn: 'text-warning',
  crit: 'text-critical',
  pending: 'text-foreground',
  info: 'text-primary',
};

const badgeTone: Record<UiStatus, string> = {
  ok: 'bg-success/12 text-success',
  warn: 'bg-warning/12 text-warning',
  crit: 'bg-critical/12 text-critical',
  pending: 'bg-muted text-muted-foreground',
  info: 'bg-primary/12 text-primary',
};

const iconTone: Record<UiStatus, string> = {
  ok: 'bg-success/12 text-success',
  warn: 'bg-warning/12 text-warning',
  crit: 'bg-critical/12 text-critical',
  pending: 'bg-muted text-muted-foreground',
  info: 'bg-primary/12 text-primary',
};

export function KpiCard({
  label,
  value,
  badge,
  subtitle,
  status,
  icon,
}: {
  label: string;
  value: string;
  badge?: string;
  subtitle?: string;
  status: UiStatus;
  icon: KpiIcon;
}) {
  const Icon = iconMap[icon];
  return (
    <article className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-4 py-5 text-center shadow-sm">
      <div className="flex items-center gap-2.5 self-stretch">
        <span className={cn('rounded-lg p-2', iconTone[status])}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="text-left text-sm font-medium text-foreground/90">{label}</span>
      </div>
      <p
        className={cn(
          'text-2xl font-semibold tracking-tight',
          status === 'pending' ? 'text-foreground/85' : valueTone[status],
        )}
      >
        {value}
      </p>
      {badge ? (
        <span className={cn('rounded-md px-2.5 py-1 text-xs font-medium', badgeTone[status])}>
          {badge}
        </span>
      ) : null}
      {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
    </article>
  );
}
