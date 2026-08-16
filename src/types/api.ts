export type PeriodType = 'd1' | '7d' | '30d';

export interface MetricAggregate {
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
  days_with_data?: number;
  peak_date?: string | null;
  peak_timestamp?: string | null;
}

export interface SourceCoverage {
  days_received: number;
  days_valid: number;
  days_in_period: number;
  received_coverage_pct: number | null;
  valid_coverage_pct: number | null;
}

export interface N8nDashboardResponse {
  ok: boolean;
  schema_version: number;
  site: string;
  period: {
    type: PeriodType;
    label: string;
    requested_days: number;
    valid_days: number;
    partial_history: boolean;
    dates: string[];
    start_date: string;
    end_date: string;
    reference_date: string;
  };
  header: {
    site: string;
    competence: string;
    reference_date: string;
    reference_mode: 'D1' | 'LAST_AVAILABLE';
    expected_d1: string;
    stale: boolean;
    days_lag: number | null;
    generated_at: string;
    data_freshness: 'CURRENT' | 'STALE';
  };
  completion: {
    source_completeness_pct: number | null;
    valid_source_completeness_pct: number | null;
    measurement_completeness_pct: number | null;
    source_coverage: Record<string, SourceCoverage>;
  };
  operational: {
    ups: Record<string, MetricAggregate> | null;
    rpp: Record<string, Record<string, MetricAggregate>> | null;
    climatization: {
      thermal: (Record<string, MetricAggregate> & { availability_rule?: string }) | null;
      vac: Record<string, unknown> | null;
    };
    availability: {
      cag_events: Record<string, unknown> | null;
      cag_rule: string;
    };
    gmg: (Record<string, MetricAggregate> & { kpi_capacity_rule?: string }) | null;
  };
  manual: {
    racks: { status: string; source?: string; data?: RackRecord | null };
    maintenance: { status: string; source?: string; data?: MaintenanceRecord | null };
  };
  unavailable: Record<string, string>;
  daily: Array<{
    reference_date: string;
    valid_day: boolean;
    status: string;
    data_quality?: {
      expected_sources?: number;
      received_sources?: number;
      valid_sources?: number;
      source_completeness_pct?: number | null;
      valid_source_completeness_pct?: number | null;
      measurement_completeness_pct?: number | null;
    };
  }>;
}

export interface HistoryResponse {
  ok: boolean;
  site: string;
  last_valid_date: string | null;
  valid_days_total: number;
  valid_dates: string[];
  months: string[];
  days: Array<{
    reference_date: string;
    status: string;
    received_sources: number | null;
    valid_sources: number | null;
    measurement_completeness_pct: number | null;
  }>;
}

export interface RackLocation {
  location: string;
  total_positions: number;
  occupied_positions: number;
  available_positions: number;
  occupancy_pct: number;
  notes?: string | null;
}

export interface RackRecord {
  schema_version: number;
  site: string;
  module: 'racks';
  source: 'MANUAL';
  competence: string;
  responsible: string | null;
  locations: RackLocation[];
  total_positions: number;
  occupied_positions: number;
  available_positions: number;
  occupancy_pct: number;
  updated_at: string;
  revision_id: string;
  notes?: string | null;
}

export interface RacksGetResponse {
  ok: boolean;
  module: 'racks';
  competence: string;
  status: 'AVAILABLE' | 'MANUAL_PENDING';
  data: RackRecord | null;
}

export interface MaintenanceRecord {
  schema_version: number;
  site: string;
  module: 'maintenance';
  source: 'MANUAL';
  competence: string;
  responsible: string | null;
  planned: number;
  completed: number;
  pending: number;
  completion_pct: number;
  updated_at: string;
  revision_id: string;
  notes?: string | null;
}

export interface MaintenanceGetResponse {
  ok: boolean;
  module: 'maintenance';
  competence: string;
  status: 'AVAILABLE' | 'MANUAL_PENDING';
  data: MaintenanceRecord | null;
}

export interface SaveResponse<T> {
  ok: boolean;
  saved: boolean;
  data: T;
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  redis: boolean;
  last_valid_date: string | null;
  valid_day: boolean | null;
  checked_at: string;
}

export interface ReportResponse {
  ok: boolean;
  report: {
    title: string;
    site: string;
    period: N8nDashboardResponse['period'];
    reference: N8nDashboardResponse['header'];
    generated_at: string;
    executive_summary: string;
    sections: {
      data_quality: N8nDashboardResponse['completion'];
      ups: N8nDashboardResponse['operational']['ups'];
      rpp: N8nDashboardResponse['operational']['rpp'];
      climatization: N8nDashboardResponse['operational']['climatization'];
      availability: N8nDashboardResponse['operational']['availability'];
      gmg: N8nDashboardResponse['operational']['gmg'];
      racks: RackRecord | { status: string };
      maintenance: MaintenanceRecord | { status: string };
      unavailable: Record<string, string>;
    };
  };
}

export interface ApiErrorBody {
  ok?: false;
  error?: string;
  message?: string;
}
