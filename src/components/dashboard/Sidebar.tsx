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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useHealth } from "@/hooks/useBackend";

const navItems: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Visão Executiva", to: "/", icon: Home },
  { label: "Energia & PUE", to: "/energia-pue", icon: Zap },
  { label: "Disponibilidade", to: "/disponibilidade", icon: ShieldCheck },
  { label: "Manutenção", to: "/manutencao", icon: Wrench },
  { label: "Capacidade", to: "/capacidade", icon: Layers },
  { label: "Climatização", to: "/climatizacao", icon: Snowflake },
  { label: "Diesel", to: "/diesel", icon: Fuel },
  { label: "Racks", to: "/racks", icon: Server },
  { label: "Plano de Ação", to: "/plano-acao", icon: ClipboardList },
  { label: "Qualidade dos Dados", to: "/qualidade-dados", icon: Database },
  { label: "Relatórios", to: "/relatorios", icon: FileText },
  { label: "Análises por IA", to: "/analises-ia", icon: Sparkles },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const healthQuery = useHealth();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-[108px] shrink-0 items-center px-6">
        <img
          src="/claro-logo.png"
          alt="Claro"
          className="h-[74px] w-[74px] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
        />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                active
                  ? "border-l-2 border-primary bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm"
                  : "border-l-2 border-transparent font-normal text-sidebar-foreground/75 hover:bg-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 mt-auto flex shrink-0 items-center gap-3 rounded-xl border border-sidebar-border bg-card px-3 py-3">
        <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">DC RJO-AM</p>
          <p className="truncate text-xs text-muted-foreground">Operações &amp; Governança</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", healthQuery.data?.ok ? "bg-success" : healthQuery.isPending ? "bg-warning" : "bg-critical")} />
            {healthQuery.data?.ok ? "Backend online" : healthQuery.isPending ? "Verificando backend" : "Backend indisponível"}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </aside>
  );
}
