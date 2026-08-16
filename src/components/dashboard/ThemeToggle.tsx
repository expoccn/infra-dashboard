import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;
  const nextLabel = isDark ? 'Tema claro' : 'Tema escuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Ativar ${nextLabel.toLowerCase()}`}
      title={`Ativar ${nextLabel.toLowerCase()}`}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        compact ? 'h-9 w-9' : 'h-9 px-3 text-xs font-medium',
      )}
    >
      <Icon className="h-4 w-4 text-primary" />
      {compact ? null : <span>{nextLabel}</span>}
    </button>
  );
}
