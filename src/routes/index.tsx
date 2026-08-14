import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronRight,
  CircleSlash,
  ClipboardList,
  Database,
  FileCheck2,
  HelpCircle,
  Info,
  LineChart,
  PencilLine,
  Timer,
  Building,
} from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Panel } from "@/components/dashboard/Panel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TendenciaChart, CapacidadeChart } from "@/components/dashboard/Charts";
import { PlanoDeAcao } from "@/components/dashboard/PlanoDeAcao";
import {
  kpis,
  resumoExecutivo,
  ativosCriticos,
  atencao,
  dadosPendentes,
  origemDados,
  totalFontes,
  headerInfo,
} from "@/data/dashboard";

const title = "Dashboard de Governança de Infraestrutura | DC RJO-AM";
const description =
  "Visão executiva de governança de data center: PUE, disponibilidade, preventivas, capacidade por família, ativos críticos e plano de ação.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisaoExecutiva,
});

const origemIcons = [FileCheck2, PencilLine, Timer];
const origemTone = ["text-success bg-success/12", "text-primary bg-primary/12", "text-warning bg-warning/12"];
const origemValueTone = ["text-success", "text-primary", "text-warning"];

function VisaoExecutiva() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="min-w-0 flex-1 space-y-4 p-5 xl:p-6">
        <Header />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Blocos principais */}
        <div className="grid gap-4 xl:grid-cols-4">
          <Panel title="Resumo Executivo" icon={BarChart3}>
            <p className="text-sm leading-relaxed text-muted-foreground">{resumoExecutivo}</p>
          </Panel>

          <Panel title="Ativos Críticos" icon={AlertTriangle} iconClassName="text-critical">
            <ul className="space-y-2">
              {ativosCriticos.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-critical/8 px-3 py-2 text-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-critical" />
                  <span className="truncate text-foreground/90">{item}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Atenção" icon={Bell} iconClassName="text-warning">
            <ul className="space-y-2">
              {atencao.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-warning/8 px-3 py-2 text-sm"
                >
                  <Building className="h-4 w-4 shrink-0 text-warning" />
                  <span className="truncate text-foreground/90">{item}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Dados Pendentes" icon={HelpCircle} iconClassName="text-warning">
            <ul className="space-y-2">
              {dadosPendentes.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm"
                >
                  <span className="text-foreground/90">{item}</span>
                  <CircleSlash className="ml-auto h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Completude dos dados</span>
                <span className="font-semibold text-primary">{headerInfo.completude}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${headerInfo.completude}%` }}
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* Gráficos + origem dos dados */}
        <div className="grid gap-4 xl:grid-cols-4">
          <Panel
            title="Tendência Mensal"
            icon={LineChart}
            className="xl:col-span-2"
            action={<Info className="h-4 w-4 text-muted-foreground" />}
          >
            <TendenciaChart />
          </Panel>

          <Panel
            title="Capacidade por Família"
            icon={BarChart3}
            action={<Info className="h-4 w-4 text-muted-foreground" />}
          >
            <CapacidadeChart />
          </Panel>

          <Panel title="Origem dos Dados" icon={Database}>
            <ul className="space-y-3">
              {origemDados.map((item, i) => {
                const Icon = origemIcons[i] ?? FileCheck2;
                return (
                  <li
                    key={item.titulo}
                    className="flex items-center gap-3 rounded-xl bg-surface px-3 py-3"
                  >
                    <span className={`rounded-lg p-2 ${origemTone[i]}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.titulo}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.descricao}</p>
                    </div>
                    <span className={`text-lg font-semibold ${origemValueTone[i]}`}>
                      {item.valor}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="text-muted-foreground">Total de fontes</span>
              <span className="text-lg font-semibold text-primary">{totalFontes}</span>
            </div>
          </Panel>
        </div>

        {/* Plano de ação */}
        <Panel title="Plano de Ação" icon={ClipboardList}>
          <PlanoDeAcao />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Valores sujeitos à revisão. Os indicadores seguem as definições do Catálogo de Métricas
            de Data Centers.
          </p>
        </Panel>
      </main>
    </div>
  );
}
