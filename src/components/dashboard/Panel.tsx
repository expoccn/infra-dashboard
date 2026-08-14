import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  icon: Icon,
  iconClassName,
  action,
  className,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <header className="mb-4 flex items-center gap-2">
        {Icon ? <Icon className={cn("h-4.5 w-4.5 text-primary", iconClassName)} /> : null}
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <div className="ml-auto">{action}</div>
      </header>
      {children}
    </section>
  );
}
