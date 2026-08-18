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


export interface MaintenanceManagementDashboardSummary {
  schema_version?: number;
  site?: string;
  module?: string;
  status: 'AVAILABLE' | 'NOT_IMPORTED' | string;
  source?: string;
  import?: MaintenanceImportMeta;
  cycle?: {
    available_cycles?: number[];
    latest_cycle?: number | null;
  };
  corrections?: MaintenanceCorrectionSummary | null;
  corrections_latest_cycle?: MaintenanceCorrectionSummary | null;
  manual_equipment?: {
    total: number;
    by_reason?: Record<string, number>;
    by_type?: Record<string, number>;
  } | null;
  integrations?: {
    total: number;
    online: number;
    offline: number;
    online_pct: number;
    by_protocol?: Record<string, number>;
  } | null;
  panels?: {
    total: number;
    issues: number;
    unknown: number;
    project_absent: number;
    source_deenergized: number;
    ac_input_deenergized: number;
  } | null;
  availability?: {
    initial: MaintenanceAvailabilityItem | null;
    previous: MaintenanceAvailabilityItem | null;
    current: MaintenanceAvailabilityItem | null;
  } | null;
  data_quality?: {
    formula_total_recalculated: boolean;
    panel_dash_is_neutral: boolean;
    status_note_inconsistencies: number;
  } | null;
  message?: string;
}



export interface CagThermalResponse {
  tr_york?: MetricAggregate;
  tr_trane?: MetricAggregate;
  tr_carrier?: MetricAggregate;
  total_tr?: MetricAggregate;
  operation?: Record<string, Record<string, unknown>>;
  availability_rule?: string;
  [key: string]: unknown;
}

export interface GmgOperationalResponse {
  gmg_1_kva?: MetricAggregate;
  gmg_2_kva?: MetricAggregate;
  gmg_3_kva?: MetricAggregate;
  gmg_4_kva?: MetricAggregate;
  kpi_capacity_rule?: string;
  kpi_capacity_publishable?: boolean;
  validation_note?: string | null;
  [key: string]: unknown;
}

export interface CapacityParameterAsset {
  id: string;
  nominal?: number | null;
  limit?: number | null;
  existing?: number | null;
  local?: string | null;
  source_label?: string | null;
}

export interface CapacityAssetResult {
  id: string;
  nominal_kva?: number | null;
  limit_kva?: number | null;
  nominal_tr?: number | null;
  limit_tr?: number | null;
  source_status: 'AVAILABLE' | 'RECEIVED' | 'NO_DATA' | string;
  avg_load: number | null;
  max_load: number | null;
  utilization_avg_pct: number | null;
  utilization_peak_pct: number | null;
  utilization_band_avg: string | null;
  utilization_band_peak: string | null;
  reserve_at_peak: number | null;
  data_status: 'AVAILABLE' | 'VALIDATION_REQUIRED' | 'NO_DATA' | string;
}

export interface CapacityFamilyResult {
  expected_count: number;
  received_count: number;
  missing_count: number;
  coverage_pct: number | null;
  missing_assets: string[];
  assets: CapacityAssetResult[];
  aggregate_status?: string;
}

export interface CapacityResult {
  parameter_status: 'AVAILABLE' | 'NOT_CONFIGURED' | string;
  parameter_competence?: string | null;
  parameter_catalog_version?: string | null;
  pue?: {
    target: number | null;
    limit: number | null;
    status: 'TARGET_MET' | 'ABOVE_TARGET_WITHIN_LIMIT' | 'ABOVE_LIMIT' | 'NO_DATA' | string;
    value: number | null;
    days_with_data?: number;
    days_target_met?: number;
    days_above_limit?: number;
  } | null;
  ups?: CapacityFamilyResult | null;
  rpp?: CapacityFamilyResult | null;
  gmg?: CapacityFamilyResult & {
    validation_status?: string;
    publish_capacity_kpi?: boolean;
    note?: string | null;
  };
  cag?: {
    group_id?: string;
    nominal_tr?: number | null;
    limit_tr?: number | null;
    avg_load?: number | null;
    max_load?: number | null;
    utilization_avg_pct?: number | null;
    utilization_peak_pct?: number | null;
    utilization_band_avg?: string | null;
    utilization_band_peak?: string | null;
    reserve_at_peak?: number | null;
    data_status?: string;
  } | null;
  configured_without_valid_measurement?: Record<string, unknown> | null;
}

export interface SourceRegistryEntry {
  mode?: string;
  status?: string;
  expected_count?: number;
  received_count?: number;
  coverage_pct?: number;
  expected_assets?: string[] | number;
  received_assets?: string[];
  expected_records?: number;
  expected_positions?: number;
  valid_signal_assets_count?: number;
  capacity_l?: number;
  target_pct?: number;
  publish_capacity_kpi?: boolean;
  note?: string | null;
}

export interface ParameterInventoryFamily {
  expected_count?: number;
  total_nominal?: number;
  total_limit?: number;
  total_existing?: number;
  assets?: CapacityParameterAsset[];
  note?: string | null;
  by_category_item?: Record<string, number>;
}

export interface DashboardConfiguration {
  status: 'AVAILABLE' | 'NOT_CONFIGURED' | string;
  parameter_context?: {
    competences?: string[];
    mixed_competences?: boolean;
    basis?: string;
  } | null;
  targets?: {
    pue?: { target?: number; limit?: number; direction?: string };
    concession_availability?: { target_pct?: number; direction?: string };
    diesel_capacity?: { capacity_l?: number };
    capacity_utilization_bands?: Array<Record<string, unknown>>;
    preventive_compliance_bands?: Array<Record<string, unknown>>;
  } | null;
  inventory?: {
    gmg?: ParameterInventoryFamily;
    transformers?: ParameterInventoryFamily;
    ups?: ParameterInventoryFamily;
    rpp?: ParameterInventoryFamily;
    capacity_panels?: ParameterInventoryFamily;
    climate?: ParameterInventoryFamily;
    racks?: ParameterInventoryFamily;
    fcc?: ParameterInventoryFamily;
    infra_ti_availability?: ParameterInventoryFamily & { expected_count?: number };
  } | null;
  source_registry?: Record<string, SourceRegistryEntry>;
  source_gaps?: Record<string, SourceRegistryEntry>;
}

export interface DashboardApiResponse {
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
    inventory_coverage?: {
      ups?: { expected?: number; received?: number; coverage_pct?: number | null };
      rpp?: { expected?: number; received?: number; coverage_pct?: number | null };
      gmg?: { expected?: number; received?: number; coverage_pct?: number | null; validation_status?: string };
      vac?: Record<string, unknown> | null;
    };
  };
  configuration?: DashboardConfiguration;
  operational: {
    capacity?: CapacityResult | null;
    ups: Record<string, MetricAggregate> | null;
    rpp: Record<string, Record<string, MetricAggregate>> | null;
    climatization: {
      thermal: CagThermalResponse | null;
      vac: Record<string, unknown> | null;
    };
    pue: {
      metric: MetricAggregate;
      daily: Array<{ reference_date: string; pue: number }>;
    } | null;
    availability: {
      cag_events: Record<string, unknown> | null;
      cag_rule: string;
      cag_status?: string;
      vac_rule?: string;
    };
    gmg: GmgOperationalResponse | null;
  };
  maintenance_management?: MaintenanceManagementDashboardSummary | null;
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
    capacity?: CapacityResult | null;
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
  last_valid_date: string | null;
  valid_day: boolean | null;
  checked_at: string;
}

export interface ReportResponse {
  ok: boolean;
  report: {
    title: string;
    site: string;
    period: DashboardApiResponse['period'];
    reference: DashboardApiResponse['header'];
    generated_at: string;
    executive_summary: string;
    sections: {
      data_quality: DashboardApiResponse['completion'];
      ups: DashboardApiResponse['operational']['ups'];
      rpp: DashboardApiResponse['operational']['rpp'];
      climatization: DashboardApiResponse['operational']['climatization'];
      availability: DashboardApiResponse['operational']['availability'];
      gmg: DashboardApiResponse['operational']['gmg'];
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

export type MaintenanceCycleRequest = 'latest' | 'all' | number;

export interface MaintenanceImportMeta {
  import_id: string;
  file_name: string | null;
  imported_at: string;
  imported_by: string | null;
  imported_by_username: string | null;
}

export interface MaintenanceCorrectionItem {
  cluster: string | null;
  state: string | null;
  site: 'RJO-AM';
  cycle_no: number | null;
  cycle_label: string | null;
  condition: string | null;
  discipline: string | null;
  equipment: string | null;
  occurrence: string | null;
  action: string | null;
  depends_on_part: boolean;
  depends_on_part_raw: string | null;
  solution_cycle_no: number | null;
  technician: string | null;
  panel: string | null;
  tag: string | null;
  responsible: string | null;
  notes: string | null;
  status_note_inconsistency: boolean;
}

export interface MaintenanceManualEquipmentItem {
  cluster: string | null;
  site: 'RJO-AM';
  machine: string | null;
  equipment_type: string | null;
  panel: string | null;
  controller: string | null;
  address: string | null;
  reason: string | null;
  final_condition: string | null;
}

export interface MaintenancePanelItem {
  cluster: string | null;
  site: 'RJO-AM';
  panel: string | null;
  location: string | null;
  relay: string | null;
  source: string | null;
  dps: string | null;
  earth: string | null;
  project: string | null;
  ac_input: string | null;
  status: 'OK' | 'ISSUE' | 'UNKNOWN';
  issue_fields: string[];
}

export interface MaintenanceIntegrationItem {
  cluster: string | null;
  site: 'RJO-AM';
  manager_port: string | null;
  equipment: string | null;
  status: 'Online' | 'Offline' | string | null;
  protocol: string | null;
}

export interface MaintenanceAvailabilityItem {
  cycle_no: number | null;
  cycle_label: string | null;
  cluster: string | null;
  site: 'RJO-AM';
  comm: number | null;
  local: number | null;
  integration: number | null;
  instrumentation: number | null;
  total_calculated: number | null;
  cag: string | null;
  cac: string | null;
}

export interface MaintenanceCorrectionSummary {
  total: number;
  pending: number;
  solved: number;
  solution_pct: number;
  depends_on_part: number;
  by_discipline: Record<string, number>;
  by_occurrence: Record<string, number>;
}

export interface MaintenanceManagementResponse {
  ok: boolean;
  schema_version: number;
  site: string;
  source: 'PLANILHA_MANUTENCAO';
  import: MaintenanceImportMeta;
  cycle: {
    requested: string;
    selected_cycle: number | 'all' | null;
    selected_label: string;
    available_cycles: number[];
    latest_cycle: number | null;
  };
  summary: {
    corrections: MaintenanceCorrectionSummary;
    corrections_by_cycle: Record<string, MaintenanceCorrectionSummary>;
    manual_equipment: {
      total: number;
      by_reason: Record<string, number>;
      by_type: Record<string, number>;
    };
    integrations: {
      total: number;
      online: number;
      offline: number;
      online_pct: number;
      by_protocol: Record<string, number>;
    };
    panels: {
      total: number;
      issues: number;
      unknown: number;
      project_absent: number;
      source_deenergized: number;
      ac_input_deenergized: number;
    };
    availability: {
      initial: MaintenanceAvailabilityItem | null;
      previous: MaintenanceAvailabilityItem | null;
      current: MaintenanceAvailabilityItem | null;
      selected: MaintenanceAvailabilityItem | null;
    };
  };
  data_quality: {
    formula_total_recalculated: boolean;
    panel_dash_is_neutral: boolean;
    status_note_inconsistencies: number;
  };
  datasets: {
    corrections: MaintenanceCorrectionItem[];
    manual_equipment: MaintenanceManualEquipmentItem[];
    panels: MaintenancePanelItem[];
    integrations: MaintenanceIntegrationItem[];
    availability: MaintenanceAvailabilityItem[];
  };
}

export interface MaintenanceImportResponse {
  ok: boolean;
  imported: boolean;
  import: MaintenanceImportMeta;
  cycle: {
    available_cycles: number[];
    latest_cycle: number | null;
  };
  summary: MaintenanceManagementResponse['summary'];
  data_quality: MaintenanceManagementResponse['data_quality'];
}
