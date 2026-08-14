import { MoreHorizontal, CalendarDays } from "lucide-react";
import { planoDeAcao } from "@/data/dashboard";
import { cn } from "@/lib/utils";

const prioridadeTone: Record<string, string> = {
  Alta: "bg-critical",
  Média: "bg-warning",
  Baixa: "bg-primary",
};

const statusTone: Record<string, string> = {
  "Em andamento": "bg-warning/15 text-warning",
  Pendente: "bg-primary/15 text-primary",
};

export function PlanoDeAcao() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/60 text-xs text-muted-foreground">
            <th className="px-3 py-2.5 text-left font-medium">Prioridade</th>
            <th className="px-3 py-2.5 text-left font-medium">Ação</th>
            <th className="px-3 py-2.5 text-left font-medium">Responsável</th>
            <th className="px-3 py-2.5 text-center font-medium">Status</th>
            <th className="px-3 py-2.5 text-left font-medium">Prazo</th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {planoDeAcao.map((row) => (
            <tr key={row.acao} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-3">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      prioridadeTone[row.prioridade] ?? "bg-muted",
                    )}
                  />
                  {row.prioridade}
                </span>
              </td>
              <td className="px-3 py-3 text-foreground/90">{row.acao}</td>
              <td className="px-3 py-3 text-muted-foreground">{row.responsavel}</td>
              <td className="px-3 py-3 text-center">
                <span
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium",
                    statusTone[row.status] ?? "bg-muted text-muted-foreground",
                  )}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {row.prazo}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
