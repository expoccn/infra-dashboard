import { cn } from '@/lib/utils';

const toneMap = {
  ok: 'bg-success/8 text-success',
  warn: 'bg-warning/8 text-warning',
  crit: 'bg-critical/8 text-critical',
  pending: 'bg-muted text-muted-foreground',
  info: 'bg-primary/8 text-primary',
} as const;

export function StatusBadge({
  label,
  tone = 'info',
  className,
}: {
  label: string;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium', toneMap[tone], className)}>
      {label}
    </span>
  );
}
