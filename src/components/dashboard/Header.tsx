import { CloudUpload, CalendarDays, ChevronDown } from "lucide-react";
import { headerInfo } from "@/data/dashboard";

export function Header() {
  return (
    <header className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border pb-5">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight xl:text-[1.75rem]">
          {headerInfo.title}
        </h1>
        <p className="mt-1 text-sm">
          <span className="font-medium text-primary">{headerInfo.site}</span>
          <span className="px-2 text-muted-foreground">|</span>
          <span className="text-muted-foreground">Competência: {headerInfo.competencia}</span>
        </p>
      </div>

      <span className="rounded-lg bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary">
        {headerInfo.base}
      </span>

      <div className="text-xs">
        <p className="text-muted-foreground">Dados de referência:</p>
        <p className="mt-0.5 font-medium">{headerInfo.referencia}</p>
      </div>

      <div className="flex items-center gap-2 border-l border-border pl-6 text-xs">
        <CloudUpload className="h-4.5 w-4.5 text-muted-foreground" />
        <div>
          <p className="font-medium">{headerInfo.ultimaCarga}</p>
          <p className="mt-0.5 text-muted-foreground">{headerInfo.ingestao}</p>
        </div>
      </div>

      <div className="border-l border-border pl-6 text-xs">
        <p className="text-muted-foreground">Completude dos dados</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">{headerInfo.completude}%</span>
          <span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${headerInfo.completude}%` }}
            />
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
      >
        <CalendarDays className="h-4 w-4 text-primary" />
        {headerInfo.competencia}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
    </header>
  );
}
