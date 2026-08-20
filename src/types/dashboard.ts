import type { MaintenanceRecord, PeriodType, RackRecord } from '@/types/api';

export type DataAvailability =
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'MISSING_D1'
  | 'MANUAL_PENDING'
  | 'PENDING_RULE'
  | 'PENDING_VALIDATION';

export type UiStatus = 'ok' | 'warn' | 'crit' | 'pending' | 'info';
export type KpiIcon = 'pue' | 'shield' | 'grid' | 'clipboard' | 'alert' | 'list' | 'maintenance' | 'integrations' | 'quality';

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


export interface OverviewInsight {
  label: string;
  text: string;
  status: UiStatus;
}

export interface OverviewListItem {
  title: string;
  detail?: string;
  status: UiStatus;
}

export interface UtilizationTrendPoint {
  date: string;
  utilization: number | null;
  limit: number;
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
  coverageLabel?: string;
  note?: string;
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
  daysReceived: number;
  daysValid: number;
  daysInPeriod: number;
}

export interface CapacityAssetMetric {
  id: string;
  nominal: number | null;
  limit: number | null;
  avgLoad: number | null;
  maxLoad: number | null;
  utilizationAvgPct: number | null;
  utilizationPeakPct: number | null;
  utilizationBandAvg: string | null;
  utilizationBandPeak: string | null;
  reserveAtPeak: number | null;
  sourceStatus: string;
  dataStatus: string;
  status: DataAvailability;
}

export interface CapacityFamilyMetric {
  expectedCount: number;
  receivedCount: number;
  missingCount: number;
  coveragePct: number | null;
  missingAssets: string[];
  aggregateStatus: string;
  assets: CapacityAssetMetric[];
}

export interface EquipmentMetric {
  name: string;
  avg: number | null;
  min: number | null;
  max: number | null;
  peakTimestamp?: string | null;
  status: DataAvailability;
  note?: string;
  nominal?: number | null;
  limit?: number | null;
  utilizationAvgPct?: number | null;
  utilizationPeakPct?: number | null;
  reserveAtPeak?: number | null;
  utilizationBandPeak?: string | null;
  sourceStatus?: string;
  dataStatus?: string;
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
  nominal?: number | null;
  limit?: number | null;
  utilizationAvgPct?: number | null;
  utilizationPeakPct?: number | null;
  reserveAtPeak?: number | null;
  utilizationBandPeak?: string | null;
  sourceStatus?: string;
}

export interface ChillerMetric {
  name: string;
  avgTr: number | null;
  maxTr: number | null;
  operationalState: 'OPERATED' | 'DID_NOT_OPERATE' | 'NO_DATA';
  operatingHours: number | null;
}

export interface SourceGapUi {
  key: string;
  label: string;
  status: string;
  mode: string;
  expected: string | null;
  received: string | null;
  note: string | null;
}

export interface RackParameterLocation {
  location: string;
  existing: number;
}

export interface ManualModule<T = unknown> {
  status: DataAvailability;
  message: string;
  competence: string;
  data: T | null;
}

export interface DashboardPayload {
  period: {
    type: PeriodType;
    label: string;
    requestedDays: number;
    validDays: number;
    partialHistory: boolean;
    dates: string[];
    startDate: string;
    endDate: string;
    referenceDate: string;
  };
  header: HeaderMeta;
  completion: {
    expectedSources: number;
    receivedSources: number;
    validSources: number;
    missingSources: string[];
    sourceCompletenessPct: number;
    validSourceCompletenessPct: number;
    measurementCompletenessPct: number;
    status: string;
  };
  configuration: {
    status: string;
    parameterCompetence: string | null;
    pueTarget: number | null;
    pueLimit: number | null;
    concessionTargetPct: number | null;
    dieselCapacityL: number | null;
    racks: {
      expectedCount: number;
      totalExisting: number;
      locations: RackParameterLocation[];
    } | null;
    sourceGaps: SourceGapUi[];
    configuredInventory: {
      transformers: { expectedCount: number; totalNominal: number | null; totalLimit: number | null } | null;
      fcc: { expectedCount: number; totalNominal: number | null; totalLimit: number | null } | null;
      capacityPanels: { expectedCount: number; totalNominal: number | null; totalLimit: number | null } | null;
      climate: { expectedCount: number; totalNominal: number | null; totalLimit: number | null; assets: Array<{ id: string; nominal: number | null; limit: number | null }> } | null;
      infraTiAvailability: { expectedCount: number } | null;
    };
  };
  overview: {
    kpis: OverviewKpi[];
    executiveSummary: string;
    executiveHighlights: OverviewInsight[];
    criticalAssets: string[];
    attention: string[];
    priorities: OverviewListItem[];
    pendingData: string[];
    qualityHighlights: OverviewListItem[];
    trendMonthly: MonthlyTrendPoint[];
    peakUtilizationTrend: UtilizationTrendPoint[];
    familyCapacity: FamilyCapacityPoint[];
    sourceOrigins: SourceOriginItem[];
    totalSources: number;
  };
  sources: SourceStatusItem[];
  daily: Array<{
    referenceDate: string;
    status: string;
    receivedSources: number | null;
    validSources: number | null;
    sourceCompletenessPct: number | null;
    measurementCompletenessPct: number | null;
  }>;
  operational: {
    capacity: {
      status: string;
      ups: CapacityFamilyMetric | null;
      rpp: CapacityFamilyMetric | null;
      gmg: (CapacityFamilyMetric & { validationStatus: string; publishCapacityKpi: boolean; note: string | null }) | null;
      cag: {
        groupId: string;
        nominalTr: number | null;
        limitTr: number | null;
        avgLoadTr: number | null;
        maxLoadTr: number | null;
        utilizationAvgPct: number | null;
        utilizationPeakPct: number | null;
        reserveAtPeakTr: number | null;
        utilizationBandPeak: string | null;
        dataStatus: string;
      } | null;
    };
    ups: EquipmentMetric[];
    gmg: EquipmentMetric[];
    rpp: RppMetric[];
    climatization: {
      totalAvgTr: number | null;
      totalMaxTr: number | null;
      peakTimestamp: string | null;
      chillers: ChillerMetric[];
    };
    pue: {
      status: DataAvailability;
      value: number | null;
      avg: number | null;
      min: number | null;
      max: number | null;
      peakTimestamp: string | null;
      daily: Array<{ date: string; value: number }>;
      target: number | null;
      limit: number | null;
      targetStatus: string;
      daysWithData: number;
      daysTargetMet: number;
      daysAboveLimit: number;
    };
    vac: {
      status: DataAvailability;
      note: string;
      temporalCoveragePct: number;
      assetCoveragePct: number;
      expectedAssets: number;
      monitoredAssets: string[];
      assets: Array<{
        name: string;
        rff: string | null;
        alm: string | null;
        status: DataAvailability;
        availabilityPct: number | null;
        coveragePct: number;
      }>;
    };
    disponibilidade: {
      cag: DataAvailability;
      vac: DataAvailability;
      note: string;
    };
  };
  manual: {
    maintenance: ManualModule<MaintenanceRecord>;
    racks: ManualModule<RackRecord>;
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
