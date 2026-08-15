import {
  Home,
  Zap,
  ShieldCheck,
  Wrench,
  Layers,
  Snowflake,
  Fuel,
  Server,
  ClipboardList,
  Database,
  FileText,
  Sparkles,
  ChevronRight,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

const navItems: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'Visão Executiva', to: '/', icon: Home },
  { label: 'Energia & PUE', to: '/energia-pue', icon: Zap },
  { label: 'Disponibilidade', to: '/disponibilidade', icon: ShieldCheck },
  { label: 'Manutenção', to: '/manutencao', icon: Wrench },
  { label: 'Capacidade', to: '/capacidade', icon: Layers },
  { label: 'Climatização', to: '/climatizacao', icon: Snowflake },
  { label: 'Diesel', to: '/diesel', icon: Fuel },
  { label: 'Racks', to: '/racks', icon: Server },
  { label: 'Plano de Ação', to: '/plano-acao', icon: ClipboardList },
  { label: 'Qualidade dos Dados', to: '/qualidade-dados', icon: Database },
  { label: 'Relatórios', to: '/relatorios', icon: FileText },
  { label: 'Análises por IA', to: '/analises-ia', icon: Sparkles },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <img src="/claro-logo.png" alt="Claro" className="h-14 w-14 rounded-full object-cover shadow-lg" />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 flex items-center gap-3 rounded-xl border border-sidebar-border bg-card px-3 py-3">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">DC RJO-AM</p>
          <p className="truncate text-xs text-muted-foreground">Operações &amp; Governança</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </aside>
  );
}
