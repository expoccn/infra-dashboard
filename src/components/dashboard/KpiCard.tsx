import {
  AlertTriangle,
  ClipboardList,
  Database,
  Gauge,
  ListChecks,
  ShieldCheck,
  TowerControl,
  Unplug,
  Wrench,
} from 'lucide-react';
import type { KpiIcon, UiStatus } from '@/types/dashboard';
import { cn } from '@/lib/utils';

const iconMap = {
  pue: Gauge,
  shield: ShieldCheck,
  grid: TowerControl,
  clipboard: ClipboardList,
  alert: AlertTriangle,
  list: ListChecks,
  maintenance: Wrench,
  integrations: Unplug,
  quality: Database,
} satisfies Record<KpiIcon, typeof Gauge>;

const valueTone: Record<UiStatus, string> = {
  ok: 'text-success',
  warn: 'text-warning',
  crit: 'text-critical',
  pending: 'text-foreground',
  info: 'text-primary',
};

const badgeTone: Record<UiStatus, string> = {
  ok: 'bg-success/8 text-success',
  warn: 'bg-warning/8 text-warning',
  crit: 'bg-critical/8 text-critical',
  pending: 'bg-muted text-muted-foreground',
  info: 'bg-primary/8 text-primary',
};

const iconTone: Record<UiStatus, string> = {
  ok: 'bg-success/8 text-success',
  warn: 'bg-warning/8 text-warning',
  crit: 'bg-critical/8 text-critical',
  pending: 'bg-muted text-muted-foreground',
  info: 'bg-primary/8 text-primary',
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
    <article className="flex min-h-[154px] flex-col rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className={cn('rounded-xl p-2.5', iconTone[status])}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0 text-sm font-semibold text-foreground/90">{label}</span>
      </div>

      <div className="mt-auto pt-4 text-center">
        <p
          className={cn(
            'text-[1.65rem] font-semibold leading-none tracking-tight',
            status === 'pending' ? 'text-foreground/85' : valueTone[status],
          )}
        >
          {value}
        </p>
        {badge ? (
          <span className={cn('mt-3 inline-flex rounded-md px-2.5 py-1 text-[0.72rem] font-semibold', badgeTone[status])}>
            {badge}
          </span>
        ) : null}
        {subtitle ? <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
    </article>
  );
}
