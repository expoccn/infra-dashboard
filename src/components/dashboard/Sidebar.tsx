import {
  Home,
  Zap,
  ShieldCheck,
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
import { cn } from "@/lib/utils";
import { navItems } from "@/data/dashboard";

const icons: LucideIcon[] = [
  Home,
  Zap,
  ShieldCheck,
  Layers,
  Snowflake,
  Fuel,
  Server,
  ClipboardList,
  Database,
  FileText,
  Sparkles,
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-sm font-bold tracking-tight text-primary-foreground shadow-lg">
          Claro
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item, i) => {
          const Icon = icons[i] ?? Home;
          const active = i === 0;
          return (
            <button
              key={item}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item}</span>
            </button>
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
