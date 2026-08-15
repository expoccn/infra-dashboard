export type DataAvailability =
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'MISSING_D1'
  | 'MANUAL_PENDING'
  | 'PENDING_RULE'
  | 'PENDING_VALIDATION';

export type UiStatus = 'ok' | 'warn' | 'crit' | 'pending' | 'info';

export type KpiIcon = 'pue' | 'shield' | 'grid' | 'clipboard' | 'alert' | 'list';

export interface HeaderMeta {
  site: string;
  title: string;
  competence: string;
  referenceDate: string;
  referenceMode: 'D1' | 'LAST_AVAILABLE';
  expectedD1: string;
  stale: boolean;
  daysLag: number;
  generatedAt: string;
  dataFreshness: 'CURRENT' | 'STALE';
}

export interface OverviewKpi {
  label: string;
  value: string;
  badge?: string;
  subtitle?: string;
  status: UiStatus;
  icon: KpiIcon;
}

export interface MonthlyTrendPoint {
  month: string;
  disponibilidade: number | null;
  capacidade: number | null;
  preventivas: number | null;
}

export interface FamilyCapacityPoint {
  family: string;
  utilization: number | null;
  limit?: number;
}

export interface SourceOriginItem {
  title: string;
  description: string;
  value: number;
  status: UiStatus;
}

export interface SourceStatusItem {
  reportType: string;
  label: string;
  received: boolean;
  status: 'RECEIVED' | 'MISSING_D1' | 'UNAVAILABLE';
  qualityState: 'OK' | 'DEGRADED' | 'WARNING' | 'UNKNOWN';
  referenceStatus: string;
  updatedAt: string;
  measurementCoveragePct?: number | null;
}

export interface EquipmentMetric {
  name: string;
  avg: number | null;
  min: number | null;
  max: number | null;
  peakTimestamp?: string | null;
  status: DataAvailability;
  note?: string;
}

export interface RppMetric {
  name: string;
  avgKva: number | null;
  maxKva: number | null;
  avgVoltage: number | null;
  avgCurrentR: number | null;
  avgCurrentS: number | null;
  avgCurrentT: number | null;
  status: DataAvailability;
}

export interface ChillerMetric {
  name: string;
  avgTr: number | null;
  maxTr: number | null;
  status: DataAvailability;
}

export interface ManualModule {
  status: DataAvailability;
  message: string;
  competence: string;
}

export interface DashboardPayload {
  header: HeaderMeta;
  completion: {
    expectedSources: number;
    receivedSources: number;
    missingSources: string[];
    sourceCompletenessPct: number;
    measurementCompletenessPct: number;
    status: string;
  };
  overview: {
    kpis: OverviewKpi[];
    executiveSummary: string;
    criticalAssets: string[];
    attention: string[];
    pendingData: string[];
    trendMonthly: MonthlyTrendPoint[];
    familyCapacity: FamilyCapacityPoint[];
    sourceOrigins: SourceOriginItem[];
    totalSources: number;
  };
  sources: SourceStatusItem[];
  operational: {
    ups: EquipmentMetric[];
    gmg: EquipmentMetric[];
    rpp: RppMetric[];
    climatization: {
      totalAvgTr: number | null;
      totalMaxTr: number | null;
      peakTimestamp: string | null;
      chillers: ChillerMetric[];
    };
    vac: {
      status: DataAvailability;
      note: string;
      coveragePct: number;
      monitoredAssets: string[];
    };
    disponibilidade: {
      cag: DataAvailability;
      vac: DataAvailability;
      note: string;
    };
  };
  manual: {
    maintenance: ManualModule;
    racks: ManualModule;
  };
  unavailableModules: string[];
  report: {
    title: string;
    description: string;
    generatedFor: string;
  };
  ai: {
    ready: boolean;
    message: string;
    highlights: string[];
  };
}
