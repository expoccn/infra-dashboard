// Dados mockados locais. Substituir por chamadas de API no futuro.

export type Status = "ok" | "warn" | "crit" | "pending" | "info";

export const headerInfo = {
  title: "Dashboard de Governança de Infraestrutura",
  site: "DC RJO-AM",
  competencia: "MAI/2026",
  base: "Base D-1",
  referencia: "22/05/2026 (ontem)",
  ultimaCarga: "Última carga 06:00",
  ingestao: "Ingestão via CSV diária",
  completude: 82,
};

export const kpis: {
  label: string;
  value: string;
  badge?: string;
  subtitle?: string;
  status: Status;
  icon: "pue" | "shield" | "grid" | "clipboard" | "alert" | "list";
}[] = [
  { label: "PUE", value: "Sem dado", badge: "Pendente", status: "pending", icon: "pue" },
  {
    label: "Disponibilidade TI",
    value: "99,95%",
    badge: "Dentro da meta",
    status: "ok",
    icon: "shield",
  },
  {
    label: "Disponibilidade Concessionária",
    value: "100,00%",
    subtitle: "Meta: 99,98%",
    status: "info",
    icon: "grid",
  },
  {
    label: "Preventivas",
    value: "367 / 367",
    badge: "100% realizadas",
    status: "ok",
    icon: "clipboard",
  },
  { label: "Ativos Críticos", value: "4", badge: "Acima do limite", status: "crit", icon: "alert" },
  { label: "Ações Abertas", value: "7", badge: "Em andamento", status: "warn", icon: "list" },
];

export const resumoExecutivo =
  "No mês de MAI/2026, a disponibilidade da concessionária e as preventivas ficaram dentro da meta. Entretanto, GMGs e um UPS ultrapassaram os limites de redundância. Alguns dados permanecem pendentes e impactam a completude das informações.";

export const ativosCriticos = [
  "GMG 2 — 132,2% do limite",
  "GMG 1 — 128,3% do limite",
  "GMG 3 — 127,3% do limite",
  "UPS 902 — 112,2% do limite",
];

export const atencao = ["Clima 3º andar — 93,2%", "Clima 10º andar — 90,0%"];

export const dadosPendentes = ["PUE", "FCC", "Ocupação de racks"];

export const tendenciaMensal = [
  { mes: "Jan/26", disponibilidade: 99.7, capacidade: 82.5, preventivas: 97.2 },
  { mes: "Fev/26", disponibilidade: 99.71, capacidade: 84.1, preventivas: 97.2 },
  { mes: "Mar/26", disponibilidade: 99.81, capacidade: 86.2, preventivas: 98.1 },
  { mes: "Abr/26", disponibilidade: 99.93, capacidade: 88.7, preventivas: 99.2 },
  { mes: "Mai/26", disponibilidade: 99.95, capacidade: 89.6, preventivas: 100.0 },
];

export const capacidadeFamilia = [
  { familia: "GMG", utilizacao: 132.2 },
  { familia: "Trafo", utilizacao: 78.4 },
  { familia: "UPS", utilizacao: 112.2 },
  { familia: "RPP", utilizacao: 64.7 },
  { familia: "Clima", utilizacao: 91.3 },
];

export const origemDados = [
  {
    titulo: "CSV automático",
    descricao: "Importação via integração",
    valor: 18,
    status: "ok" as Status,
  },
  {
    titulo: "Lançamento manual",
    descricao: "Inserção via formulário",
    valor: 12,
    status: "info" as Status,
  },
  {
    titulo: "Validação pendente",
    descricao: "Aguardando conferência",
    valor: 6,
    status: "warn" as Status,
  },
];

export const totalFontes = 36;

export const planoDeAcao = [
  {
    prioridade: "Alta",
    acao: "Adequar carga da GMG 2",
    responsavel: "Carlos Almeida",
    status: "Em andamento",
    prazo: "30/05/2026",
  },
  {
    prioridade: "Alta",
    acao: "Adequar carga da GMG 1",
    responsavel: "Carlos Almeida",
    status: "Em andamento",
    prazo: "30/05/2026",
  },
  {
    prioridade: "Média",
    acao: "Investigar alarme do Clima 3º andar",
    responsavel: "Juliana Ribeiro",
    status: "Em andamento",
    prazo: "28/05/2026",
  },
  {
    prioridade: "Baixa",
    acao: "Enviar ocupação de racks de MAI/2026",
    responsavel: "Marcos Silva",
    status: "Pendente",
    prazo: "05/06/2026",
  },
];

export const navItems = [
  "Visão Executiva",
  "Energia & PUE",
  "Disponibilidade",
  "Capacidade",
  "Climatização",
  "Diesel",
  "Racks",
  "Plano de Ação",
  "Qualidade dos Dados",
  "Relatórios",
  "Análises por IA",
];
