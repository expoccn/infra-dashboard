import type {
  CapacityAssetResult,
  CapacityFamilyResult,
  DashboardApiResponse,
  MetricAggregate,
  ParameterInventoryFamily,
  SourceCoverage,
  SourceRegistryEntry,
} from '@/types/api';
import type {
  CapacityAssetMetric,
  CapacityFamilyMetric,
  ChillerMetric,
  DashboardPayload,
  DataAvailability,
  EquipmentMetric,
  OverviewKpi,
  RppMetric,
  SourceGapUi,
  SourceStatusItem,
  UiStatus,
} from '@/types/dashboard';

const SOURCE_LABELS: Record<string, string> = {
  DISP_INFRA_VAC: 'Disponibilidade Infra VAC',
  CAG_DISP: 'CAG Estado Operacional',
  CAG_TR: 'CAG TR',
  GMG_KVA: 'GMG kVA',
  RPP01: 'RPP 01',
  RPP02: 'RPP 02',
  UPS_KVA: 'UPS kVA',
  PUE: 'PUE',
};

const UNAVAILABLE_LABELS: Record<string, string> = {
  disponibilidade_concessionaria: 'Disponibilidade da concessionária',
  transformadores: 'Carga dos transformadores',
  fcc: 'Carga dos FCCs',
  quadros: 'Quadros da gestão de manutenção',
  quadros_capacidade: 'Carga dos quadros gerais',
  diesel: 'Nível de diesel',
  plano_acao: 'Plano de Ação',
};

const SOURCE_GAP_LABELS: Record<string, string> = {
  UPS: 'UPS',
  RPP: 'RPP',
  GMG: 'GMG',
  VAC_CURRENT_CSV_SCOPE: 'VAC',
  INFRA_TI_AVAILABILITY: 'Disponibilidade INFRA × TI',
  TRANSFORMERS: 'Transformadores',
  FCC: 'FCC',
  CAPACITY_PANELS: 'Quadros gerais de capacidade',
  DIESEL_LEVEL: 'Nível de diesel',
  CONCESSION_AVAILABILITY: 'Disponibilidade da concessionária',
  CLIMATE_OTHER_GROUPS: 'Demais grupos de climatização',
};

const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function numeric(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatDateBr(value?: string | null) {
  if (!value) return 'Não disponível';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function formatDateTimeBr(value?: string | null) {
  if (!value) return 'Não disponível';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatCompetence(value?: string | null) {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value || 'Não disponível';
  return `${monthNames[Number(match[2]) - 1]}/${match[1]}`;
}

function formatPct(value: number | null | undefined) {
  return value == null ? 'Não disponível' : `${value.toFixed(2).replace('.', ',')}%`;
}

function metricStatus(metric?: MetricAggregate | null): DataAvailability {
  return metric && numeric(metric.count) > 0 ? 'AVAILABLE' : 'UNAVAILABLE';
}

function capacityStatus(asset?: CapacityAssetResult | null): DataAvailability {
  if (!asset) return 'UNAVAILABLE';
  if (asset.data_status === 'VALIDATION_REQUIRED') return 'PENDING_VALIDATION';
  if (asset.source_status === 'AVAILABLE' || asset.source_status === 'RECEIVED') return 'AVAILABLE';
  return 'UNAVAILABLE';
}

function capacityAsset(asset: CapacityAssetResult): CapacityAssetMetric {
  return {
    id: asset.id,
    nominal: nullableNumber(asset.nominal_kva ?? asset.nominal_tr),
    limit: nullableNumber(asset.limit_kva ?? asset.limit_tr),
    avgLoad: nullableNumber(asset.avg_load),
    maxLoad: nullableNumber(asset.max_load),
    utilizationAvgPct: nullableNumber(asset.utilization_avg_pct),
    utilizationPeakPct: nullableNumber(asset.utilization_peak_pct),
    utilizationBandAvg: asset.utilization_band_avg || null,
    utilizationBandPeak: asset.utilization_band_peak || null,
    reserveAtPeak: nullableNumber(asset.reserve_at_peak),
    sourceStatus: asset.source_status || 'NO_DATA',
    dataStatus: asset.data_status || 'NO_DATA',
    status: capacityStatus(asset),
  };
}

function capacityFamily(family?: CapacityFamilyResult | null): CapacityFamilyMetric | null {
  if (!family) return null;
  return {
    expectedCount: numeric(family.expected_count),
    receivedCount: numeric(family.received_count),
    missingCount: numeric(family.missing_count),
    coveragePct: nullableNumber(family.coverage_pct),
    missingAssets: Array.isArray(family.missing_assets) ? family.missing_assets : [],
    aggregateStatus: family.aggregate_status || 'PARTIAL_COVERAGE',
    assets: Array.isArray(family.assets) ? family.assets.map(capacityAsset) : [],
  };
}

function coverageQuality(coverage: SourceCoverage): SourceStatusItem['qualityState'] {
  const pct = nullableNumber(coverage.valid_coverage_pct);
  if (coverage.days_received === 0) return 'UNKNOWN';
  if (pct === 100) return 'OK';
  if (pct !== null && pct >= 95) return 'WARNING';
  return 'DEGRADED';
}

function sourceItems(response: DashboardApiResponse): SourceStatusItem[] {
  const coverage = response.completion.source_coverage || {};
  return Object.entries(SOURCE_LABELS).map(([reportType, label]) => {
    const c = coverage[reportType] || {
      days_received: 0,
      days_valid: 0,
      days_in_period: response.period.valid_days,
      received_coverage_pct: 0,
      valid_coverage_pct: 0,
    };
    return {
      reportType,
      label,
      received: c.days_received > 0,
      status: c.days_received > 0 ? 'RECEIVED' : 'MISSING_D1',
      qualityState: coverageQuality(c),
      referenceStatus: `${c.days_valid}/${c.days_in_period} dias válidos`,
      updatedAt: formatDateTimeBr(response.header.generated_at),
      measurementCoveragePct: nullableNumber(c.valid_coverage_pct),
      daysReceived: c.days_received,
      daysValid: c.days_valid,
      daysInPeriod: c.days_in_period,
    };
  });
}

function rppMetric(name: string, value?: Record<string, MetricAggregate> | null, asset?: CapacityAssetResult | null): RppMetric {
  return {
    name,
    avgKva: nullableNumber(value?.load_kva?.avg ?? asset?.avg_load),
    maxKva: nullableNumber(value?.load_kva?.max ?? asset?.max_load),
    avgVoltage: nullableNumber(value?.voltage_v?.avg),
    avgCurrentR: nullableNumber(value?.current_r_a?.avg),
    avgCurrentS: nullableNumber(value?.current_s_a?.avg),
    avgCurrentT: nullableNumber(value?.current_t_a?.avg),
    status: capacityStatus(asset),
    nominal: nullableNumber(asset?.nominal_kva),
    limit: nullableNumber(asset?.limit_kva),
    utilizationAvgPct: nullableNumber(asset?.utilization_avg_pct),
    utilizationPeakPct: nullableNumber(asset?.utilization_peak_pct),
    reserveAtPeak: nullableNumber(asset?.reserve_at_peak),
    utilizationBandPeak: asset?.utilization_band_peak || null,
    sourceStatus: asset?.source_status || 'NO_DATA',
  };
}

function chiller(name: string, metric?: MetricAggregate | null, operation?: Record<string, unknown> | null): ChillerMetric {
  const rawState = String(operation?.operational_state || 'NO_DATA');
  const operationalState: ChillerMetric['operationalState'] = rawState === 'OPERATED'
    ? 'OPERATED'
    : rawState === 'DID_NOT_OPERATE'
      ? 'DID_NOT_OPERATE'
      : 'NO_DATA';
  return {
    name,
    avgTr: nullableNumber(metric?.avg),
    maxTr: nullableNumber(metric?.max),
    operationalState,
    operatingHours: nullableNumber(operation?.operating_hours),
  };
}

function vacAssets(vac: Record<string, unknown> | null) {
  const names = ['ac1201', 'ac1002a', 'ac1202b', 'ac1301'];
  return names.map((key) => {
    const value = (vac?.[key] || {}) as Record<string, unknown>;
    const rawStatus = String(value.status || 'NO_DATA');
    return {
      name: key.toUpperCase(),
      rff: value.last_rff == null ? null : String(value.last_rff),
      alm: value.last_alm == null ? null : String(value.last_alm),
      status: rawStatus === 'AVAILABLE'
        ? 'AVAILABLE' as const
        : rawStatus === 'UNAVAILABLE'
          ? 'UNAVAILABLE' as const
          : 'UNAVAILABLE' as const,
      availabilityPct: nullableNumber(value.availability_pct),
      coveragePct: nullableNumber(value.coverage_pct) ?? 0,
      hasData: rawStatus !== 'NO_DATA',
    };
  });
}

function gapExpected(entry: SourceRegistryEntry): string | null {
  if (entry.expected_records != null) return `${entry.expected_records} registros`;
  if (entry.expected_positions != null) return `${entry.expected_positions} posições`;
  if (entry.expected_count != null) return `${entry.expected_count} itens`;
  if (Array.isArray(entry.expected_assets)) return `${entry.expected_assets.length} itens`;
  if (typeof entry.expected_assets === 'number') return `${entry.expected_assets} itens`;
  return null;
}

function gapReceived(entry: SourceRegistryEntry): string | null {
  if (entry.received_count != null) return `${entry.received_count} recebidos`;
  if (Array.isArray(entry.received_assets)) return `${entry.received_assets.length} recebidos`;
  if (entry.valid_signal_assets_count != null) return `${entry.valid_signal_assets_count} com sinais válidos`;
  return null;
}

function sourceGaps(response: DashboardApiResponse): SourceGapUi[] {
  return Object.entries(response.configuration?.source_gaps || {}).map(([key, entry]) => ({
    key,
    label: SOURCE_GAP_LABELS[key] || key,
    status: entry.status || 'SOURCE_NOT_AVAILABLE',
    mode: entry.mode || '',
    expected: gapExpected(entry),
    received: gapReceived(entry),
    note: entry.note || null,
  }));
}

function compactInventory(family?: ParameterInventoryFamily | null) {
  if (!family) return null;
  return {
    expectedCount: numeric(family.expected_count),
    totalNominal: nullableNumber(family.total_nominal),
    totalLimit: nullableNumber(family.total_limit),
  };
}

function maxPeak(family: CapacityFamilyMetric | null) {
  const values = family?.assets.map((asset) => asset.utilizationPeakPct).filter((value): value is number => value != null) || [];
  return values.length ? Math.max(...values) : null;
}

function pueTone(status: string): UiStatus {
  if (status === 'TARGET_MET') return 'ok';
  if (status === 'ABOVE_TARGET_WITHIN_LIMIT') return 'warn';
  if (status === 'ABOVE_LIMIT') return 'crit';
  return 'pending';
}

export function adaptDashboardResponse(response: DashboardApiResponse): DashboardPayload {
  const sources = sourceItems(response);
  const coverage = response.completion.source_coverage || {};
  const expectedSources = Object.keys(SOURCE_LABELS).length;
  const receivedSources = sources.filter((source) => source.daysReceived > 0).length;
  const validSources = sources.filter((source) => source.daysValid > 0).length;
  const missingSources = sources.filter((source) => source.daysReceived === 0).map((source) => source.reportType);
  const sourceCompletenessPct = numeric(response.completion.source_completeness_pct);
  const validSourceCompletenessPct = numeric(response.completion.valid_source_completeness_pct);
  const measurementCompletenessPct = numeric(response.completion.measurement_completeness_pct);
  const unavailableModules = Object.keys(response.unavailable || {}).map((key) => UNAVAILABLE_LABELS[key] || key);

  const capacity = response.operational.capacity || null;
  const upsCapacity = capacityFamily(capacity?.ups);
  const rppCapacity = capacityFamily(capacity?.rpp);
  const gmgBase = capacityFamily(capacity?.gmg);
  const gmgCapacity = gmgBase && capacity?.gmg
    ? {
        ...gmgBase,
        validationStatus: capacity.gmg.validation_status || 'VALIDATION_REQUIRED',
        publishCapacityKpi: capacity.gmg.publish_capacity_kpi === true,
        note: capacity.gmg.note || null,
      }
    : null;

  const rawUps = response.operational.ups || {};
  const rawGmg = response.operational.gmg || {};
  const rawRpp = response.operational.rpp || {};
  const thermal = response.operational.climatization?.thermal || {};
  const vac = response.operational.climatization?.vac || null;
  const pue = response.operational.pue || null;

  const manualRacks = response.manual?.racks?.data || null;
  const manualMaintenance = response.manual?.maintenance?.data || null;
  const manualCompetence = response.header.competence;
  const maintenanceManagement = response.maintenance_management || null;
  const maintenanceManagementAvailable = maintenanceManagement?.status === 'AVAILABLE' && Boolean(maintenanceManagement.corrections);

  const gaps = sourceGaps(response);
  const gapLabels = gaps
    .filter((gap) => ['SOURCE_NOT_AVAILABLE', 'PARTIAL_INVENTORY', 'PARTIAL_VALID_SIGNALS', 'VALIDATION_REQUIRED'].includes(gap.status))
    .map((gap) => {
      const detail = [gap.received, gap.expected].filter(Boolean).join(' / ');
      return detail ? `${gap.label} — ${detail}` : gap.label;
    });

  const unavailableOutsideCatalog = unavailableModules.filter((label) =>
    label === 'Plano de Ação' || label === 'Quadros da gestão de manutenção',
  );
  const pendingData = [
    ...gapLabels,
    ...unavailableOutsideCatalog,
    ...(manualRacks ? [] : ['Ocupação de racks']),
    ...(maintenanceManagementAvailable ? [] : ['Gestão de Manutenção']),
    ...(manualMaintenance ? [] : ['Preventivas']),
  ];

  const attention: string[] = [];
  if (response.header.stale) {
    attention.push(`Referência defasada em ${response.header.days_lag ?? 0} dias em relação ao D-1 cronológico`);
  }
  if (response.period.partial_history) {
    attention.push(`Histórico parcial: ${response.period.valid_days}/${response.period.requested_days} dias válidos disponíveis`);
  }
  if (measurementCompletenessPct < 99) {
    attention.push(`Completude das medições: ${formatPct(measurementCompletenessPct)}`);
  }
  if (upsCapacity && upsCapacity.receivedCount < upsCapacity.expectedCount) {
    attention.push(`UPS com cobertura parcial: ${upsCapacity.receivedCount}/${upsCapacity.expectedCount} equipamentos`);
  }
  if (rppCapacity && rppCapacity.receivedCount < rppCapacity.expectedCount) {
    attention.push(`RPP com cobertura parcial: ${rppCapacity.receivedCount}/${rppCapacity.expectedCount} equipamentos`);
  }
  if (gmgCapacity?.validationStatus === 'VALIDATION_REQUIRED') {
    attention.push('GMG: telemetria recebida, mas os valores de carga precisam ser validados');
  }
  const vacAssetsWithoutData = numeric((vac?.availability as Record<string, unknown> | undefined)?.assets_no_data);
  if (vacAssetsWithoutData > 0) attention.push(`${vacAssetsWithoutData} ativos VAC sem leitura completa de RFF e ALM`);
  if (maintenanceManagementAvailable) {
    const pendingCorrections = numeric(maintenanceManagement?.corrections?.pending);
    const partsRequired = numeric(maintenanceManagement?.corrections?.depends_on_part);
    const offlineIntegrations = numeric(maintenanceManagement?.integrations?.offline);
    const manualEquipment = numeric(maintenanceManagement?.manual_equipment?.total);
    const panelIssues = numeric(maintenanceManagement?.panels?.issues);
    if (pendingCorrections > 0) attention.push(`${pendingCorrections} corretivas pendentes na gestão de manutenção`);
    if (partsRequired > 0) attention.push(`${partsRequired} corretivas dependem de peça`);
    if (offlineIntegrations > 0) attention.push(`${offlineIntegrations} integrações offline`);
    if (manualEquipment > 0) attention.push(`${manualEquipment} equipamentos mantidos em manual`);
    if (panelIssues > 0) attention.push(`${panelIssues} quadros com apontamentos na gestão de manutenção`);
  }
  if (!attention.length) attention.push('Nenhuma pendência de atualização identificada no período selecionado');

  const pueCapacity = capacity?.pue || null;
  const pueMetric = pue?.metric || null;
  const pueAvailable = Boolean(pueMetric && numeric(pueMetric.count) > 0);
  const pueValue = nullableNumber(pueMetric?.avg);
  const pueTargetStatus = pueCapacity?.status || 'NO_DATA';

  const criticalAssets: string[] = [];
  if (pueTargetStatus === 'ABOVE_LIMIT' && pueValue != null && pueCapacity?.limit != null) {
    criticalAssets.push(`PUE ${pueValue.toFixed(2).replace('.', ',')} acima do limite ${Number(pueCapacity.limit).toFixed(2).replace('.', ',')}`);
  }
  sources
    .filter((source) => (source.measurementCoveragePct ?? 0) < 100)
    .slice(0, Math.max(0, 4 - criticalAssets.length))
    .forEach((source) => criticalAssets.push(`${source.label} — ${source.daysValid}/${source.daysInPeriod} dias com dados válidos`));
  if (!criticalAssets.length) criticalAssets.push('Nenhum desvio crítico calculável com as regras homologadas no período');

  const periodText = response.period.valid_days === 1 ? '1 dia válido' : `${response.period.valid_days} dias válidos`;
  const maintenanceAvailability = maintenanceManagement?.availability?.current?.total_calculated;
  const maintenanceAvailabilityPct = maintenanceAvailability == null ? null : maintenanceAvailability * 100;
  const pueSummaryText = pueValue == null
    ? ''
    : ` O PUE ${response.period.type === 'd1' ? 'do último dia válido' : 'médio diário do período'} é ${pueValue.toFixed(2).replace('.', ',')}${pueCapacity?.limit != null ? `, frente ao limite de ${Number(pueCapacity.limit).toFixed(2).replace('.', ',')}` : ''}.`;
  const maintenanceSummaryText = maintenanceManagementAvailable
    ? ` A gestão de manutenção registra ${numeric(maintenanceManagement?.corrections?.pending)} corretivas pendentes, ${numeric(maintenanceManagement?.corrections?.solved)} solucionadas, ${numeric(maintenanceManagement?.manual_equipment?.total)} equipamentos mantidos em manual, ${numeric(maintenanceManagement?.integrations?.offline)} integrações offline e ${numeric(maintenanceManagement?.panels?.total)} quadros avaliados.${maintenanceAvailabilityPct == null ? '' : ` A disponibilidade consolidada do último ciclo é ${formatPct(maintenanceAvailabilityPct)}.`}`
    : '';
  const coverageSummary = upsCapacity && rppCapacity
    ? ` A cobertura do inventário de capacidade está em ${upsCapacity.receivedCount}/${upsCapacity.expectedCount} UPS e ${rppCapacity.receivedCount}/${rppCapacity.expectedCount} RPP.`
    : '';
  const executiveSummary = `${response.period.label}: ${periodText}, encerrando em ${formatDateBr(response.period.reference_date)}. ` +
    `A cobertura média das fontes foi ${formatPct(sourceCompletenessPct)} e a completude média das medições foi ${formatPct(measurementCompletenessPct)}. ` +
    `${receivedSources}/${expectedSources} tipos de fonte possuem dados no período. ` +
    (response.header.stale
      ? `A referência exibida é o último dado válido disponível e está ${response.header.days_lag ?? 0} dias atrás do D-1 cronológico.`
      : 'A referência coincide com o D-1 cronológico.') +
    pueSummaryText + coverageSummary + maintenanceSummaryText;

  const maintenanceKpi: OverviewKpi = maintenanceManagementAvailable
    ? {
        label: 'Manutenção',
        value: `${numeric(maintenanceManagement?.corrections?.pending)} pendentes`,
        badge: `${numeric(maintenanceManagement?.corrections?.solved)} solucionadas`,
        ...(maintenanceManagement?.cycle?.latest_cycle == null ? {} : { subtitle: `${maintenanceManagement.cycle.latest_cycle}º ciclo` }),
        status: numeric(maintenanceManagement?.corrections?.pending) > 0 ? 'warn' : 'ok',
        icon: 'clipboard',
      }
    : manualMaintenance
      ? {
          label: 'Preventivas',
          value: `${manualMaintenance.completed} / ${manualMaintenance.planned}`,
          badge: `${formatPct(manualMaintenance.completion_pct)} realizadas`,
          status: manualMaintenance.completion_pct >= 100 ? 'ok' : 'warn',
          icon: 'clipboard',
        }
      : {
          label: 'Manutenção',
          value: 'Aguardando base',
          badge: 'Importação pendente',
          status: 'pending',
          icon: 'clipboard',
        };

  const rackInventory = response.configuration?.inventory?.racks || null;
  const rackTotal = nullableNumber(rackInventory?.total_existing) ?? 0;
  const racksKpi: OverviewKpi = manualRacks
    ? {
        label: 'Racks',
        value: `${manualRacks.available_positions} livres`,
        badge: `${formatPct(manualRacks.occupancy_pct)} ocupados`,
        subtitle: `${manualRacks.total_positions} posições`,
        status: 'info',
        icon: 'list',
      }
    : rackTotal > 0
      ? {
          label: 'Racks',
          value: `${rackTotal.toFixed(0)} posições`,
          badge: 'Ocupação pendente',
          status: 'pending',
          icon: 'list',
        }
      : {
          label: 'Racks',
          value: 'Não configurado',
          badge: 'Sem parâmetro',
          status: 'pending',
          icon: 'list',
        };

  const trendMonthly = response.daily.map((day) => ({
    month: formatDateBr(day.reference_date).slice(0, 5),
    disponibilidade: nullableNumber(day.data_quality?.source_completeness_pct),
    capacidade: nullableNumber(day.data_quality?.measurement_completeness_pct),
    preventivas: null,
  }));

  const cagCapacity = capacity?.cag || null;
  const familyCapacity = [
    {
      family: 'UPS',
      utilization: maxPeak(upsCapacity),
      limit: 100,
      coverageLabel: upsCapacity ? `${upsCapacity.receivedCount}/${upsCapacity.expectedCount}` : 'N/D',
      note: 'Maior utilização no pico entre as UPS com medição recebida.',
    },
    {
      family: 'RPP',
      utilization: maxPeak(rppCapacity),
      limit: 100,
      coverageLabel: rppCapacity ? `${rppCapacity.receivedCount}/${rppCapacity.expectedCount}` : 'N/D',
      note: 'Maior utilização no pico entre as RPP com medição recebida.',
    },
    {
      family: 'CAG',
      utilization: nullableNumber(cagCapacity?.utilization_peak_pct),
      limit: 100,
      coverageLabel: cagCapacity ? 'CHILER' : 'N/D',
      note: 'Utilização do pico da CAG contra o limite oficial do grupo CHILER.',
    },
    {
      family: 'GMG',
      utilization: null,
      limit: 100,
      coverageLabel: gmgCapacity ? `${gmgCapacity.receivedCount}/${gmgCapacity.expectedCount}` : 'N/D',
      note: 'KPI não publicado até validação da telemetria de carga.',
    },
  ];

  const vacTemporalCoverage = nullableNumber(coverage.DISP_INFRA_VAC?.valid_coverage_pct) ?? 0;
  const vacAssetItems = vacAssets(vac);
  const vacAssetCoverage = nullableNumber((vac?.availability as Record<string, unknown> | undefined)?.asset_coverage_pct) ?? 0;
  const vacExpectedAssets = nullableNumber((vac?.availability as Record<string, unknown> | undefined)?.assets_expected) ?? vacAssetItems.length;
  const vacAvailable = vacAssetItems.some((item) => item.hasData);
  const panelsAvailable = maintenanceManagementAvailable && numeric(maintenanceManagement?.panels?.total) > 0;

  const upsTelemetryKey: Record<string, string> = {
    'UPS 801': 'ups_801_kva',
    'UPS 802': 'ups_802_kva',
    'UPS 1001': 'ups_1001_kva',
  };
  const upsItems: EquipmentMetric[] = (capacity?.ups?.assets || []).map((asset) => {
    const metric = rawUps[upsTelemetryKey[asset.id] || ''];
    return {
      name: asset.id,
      avg: nullableNumber(asset.avg_load ?? metric?.avg),
      min: nullableNumber(metric?.min),
      max: nullableNumber(asset.max_load ?? metric?.max),
      peakTimestamp: metric?.peak_timestamp ? formatDateTimeBr(metric.peak_timestamp) : metric?.peak_date ? formatDateBr(metric.peak_date) : null,
      status: capacityStatus(asset),
      nominal: nullableNumber(asset.nominal_kva),
      limit: nullableNumber(asset.limit_kva),
      utilizationAvgPct: nullableNumber(asset.utilization_avg_pct),
      utilizationPeakPct: nullableNumber(asset.utilization_peak_pct),
      reserveAtPeak: nullableNumber(asset.reserve_at_peak),
      utilizationBandPeak: asset.utilization_band_peak || null,
      sourceStatus: asset.source_status,
      dataStatus: asset.data_status,
    };
  });

  const rppTelemetryKey: Record<string, string> = { 'RPP-1': 'rpp01', 'RPP-2': 'rpp02' };
  const rppItems: RppMetric[] = (capacity?.rpp?.assets || []).map((asset) => rppMetric(
    asset.id,
    rawRpp[rppTelemetryKey[asset.id] || ''],
    asset,
  ));

  const gmgTelemetryKey: Record<string, string> = {
    'GMG 1': 'gmg_1_kva',
    'GMG 2': 'gmg_2_kva',
    'GMG 3': 'gmg_3_kva',
    'GMG 4': 'gmg_4_kva',
  };
  const gmgItems: EquipmentMetric[] = (capacity?.gmg?.assets || []).map((asset) => {
    const metric = rawGmg[gmgTelemetryKey[asset.id] || ''] as MetricAggregate | undefined;
    return {
      name: asset.id,
      avg: nullableNumber(asset.avg_load ?? metric?.avg),
      min: nullableNumber(metric?.min),
      max: nullableNumber(asset.max_load ?? metric?.max),
      status: 'PENDING_VALIDATION',
      note: capacity?.gmg?.note || 'Os dados de carga precisam ser validados antes da publicação do KPI oficial.',
      nominal: nullableNumber(asset.nominal_kva),
      limit: nullableNumber(asset.limit_kva),
      utilizationAvgPct: null,
      utilizationPeakPct: null,
      reserveAtPeak: null,
      utilizationBandPeak: null,
      sourceStatus: asset.source_status,
      dataStatus: asset.data_status,
    };
  });

  const climateInventory = response.configuration?.inventory?.climate || null;
  const climateAssets = (climateInventory?.assets || []).map((asset) => ({
    id: asset.id,
    nominal: nullableNumber(asset.nominal),
    limit: nullableNumber(asset.limit),
  }));
  const infraInventory = response.configuration?.inventory?.infra_ti_availability || null;

  return {
    period: {
      type: response.period.type,
      label: response.period.label,
      requestedDays: response.period.requested_days,
      validDays: response.period.valid_days,
      partialHistory: response.period.partial_history,
      dates: response.period.dates,
      startDate: formatDateBr(response.period.start_date),
      endDate: formatDateBr(response.period.end_date),
      referenceDate: formatDateBr(response.period.reference_date),
    },
    header: {
      site: response.header.site || response.site,
      title: 'Dashboard de Governança de Infraestrutura',
      competence: formatCompetence(response.header.competence),
      referenceDate: formatDateBr(response.header.reference_date),
      referenceMode: response.header.reference_mode,
      expectedD1: formatDateBr(response.header.expected_d1),
      stale: Boolean(response.header.stale),
      daysLag: numeric(response.header.days_lag),
      generatedAt: formatDateTimeBr(response.header.generated_at),
      dataFreshness: response.header.data_freshness,
    },
    completion: {
      expectedSources,
      receivedSources,
      validSources,
      missingSources,
      sourceCompletenessPct,
      validSourceCompletenessPct,
      measurementCompletenessPct,
      status: validSourceCompletenessPct >= 99 && measurementCompletenessPct >= 99 ? 'COMPLETE' : 'PARTIAL',
    },
    configuration: {
      status: response.configuration?.status || 'NOT_CONFIGURED',
      parameterCompetence: capacity?.parameter_competence || response.configuration?.parameter_context?.competences?.at(-1) || null,
      pueTarget: nullableNumber(response.configuration?.targets?.pue?.target ?? pueCapacity?.target),
      pueLimit: nullableNumber(response.configuration?.targets?.pue?.limit ?? pueCapacity?.limit),
      concessionTargetPct: nullableNumber(response.configuration?.targets?.concession_availability?.target_pct),
      dieselCapacityL: nullableNumber(response.configuration?.targets?.diesel_capacity?.capacity_l),
      racks: rackInventory
        ? {
            expectedCount: numeric(rackInventory.expected_count),
            totalExisting: numeric(rackInventory.total_existing),
            locations: (rackInventory.assets || []).map((asset) => ({
              location: asset.id,
              existing: numeric(asset.existing),
            })),
          }
        : null,
      sourceGaps: gaps,
      configuredInventory: {
        transformers: compactInventory(response.configuration?.inventory?.transformers),
        fcc: compactInventory(response.configuration?.inventory?.fcc),
        capacityPanels: compactInventory(response.configuration?.inventory?.capacity_panels),
        climate: climateInventory
          ? {
              expectedCount: numeric(climateInventory.expected_count),
              totalNominal: nullableNumber(climateInventory.total_nominal),
              totalLimit: nullableNumber(climateInventory.total_limit),
              assets: climateAssets,
            }
          : null,
        infraTiAvailability: infraInventory ? { expectedCount: numeric(infraInventory.expected_count) } : null,
      },
    },
    overview: {
      kpis: [
        {
          label: 'PUE',
          value: pueAvailable && pueValue !== null ? pueValue.toFixed(2).replace('.', ',') : 'Não disponível',
          badge: pueAvailable
            ? pueTargetStatus === 'TARGET_MET'
              ? 'Meta atingida'
              : pueTargetStatus === 'ABOVE_TARGET_WITHIN_LIMIT'
                ? 'Acima da meta'
                : pueTargetStatus === 'ABOVE_LIMIT'
                  ? 'Acima do limite'
                  : response.period.type === 'd1' ? 'Último dia válido' : 'Média diária do período'
            : 'Sem dados',
          status: pueAvailable ? pueTone(pueTargetStatus) : 'pending',
          icon: 'pue',
        },
        {
          label: 'Fontes válidas',
          value: formatPct(validSourceCompletenessPct),
          badge: `${validSources}/${expectedSources} fontes com dados`,
          status: validSourceCompletenessPct >= 99 ? 'ok' : 'warn',
          icon: 'shield',
        },
        {
          label: 'CAG / pico',
          value: cagCapacity?.utilization_peak_pct == null ? 'Não disponível' : formatPct(cagCapacity.utilization_peak_pct),
          badge: cagCapacity?.limit_tr == null ? 'Sem limite configurado' : `Limite ${Number(cagCapacity.limit_tr).toFixed(0)} TR`,
          status: cagCapacity?.utilization_peak_pct == null ? 'pending' : cagCapacity.utilization_peak_pct >= 90 ? 'crit' : cagCapacity.utilization_peak_pct >= 80 ? 'warn' : 'ok',
          icon: 'grid',
        },
        maintenanceKpi,
        {
          label: 'Quadros',
          value: panelsAvailable ? `${numeric(maintenanceManagement?.panels?.total)} avaliados` : 'Não disponível',
          badge: panelsAvailable ? `${numeric(maintenanceManagement?.panels?.issues)} com apontamentos` : 'Aguardando base',
          status: panelsAvailable ? (numeric(maintenanceManagement?.panels?.issues) > 0 ? 'warn' : 'ok') : 'pending',
          icon: 'grid',
        },
        {
          label: 'Completude',
          value: formatPct(measurementCompletenessPct),
          badge: response.period.label,
          status: measurementCompletenessPct >= 99 ? 'ok' : measurementCompletenessPct >= 90 ? 'warn' : 'crit',
          icon: 'alert',
        },
        racksKpi,
      ],
      executiveSummary,
      criticalAssets,
      attention,
      pendingData: [...new Set(pendingData)],
      trendMonthly,
      familyCapacity,
      sourceOrigins: [
        { title: 'CSV automático', description: 'WebCTRL via CSV', value: 8, status: 'ok' },
        { title: 'Gestão de manutenção', description: maintenanceManagementAvailable ? 'Planilha atualizada' : 'Aguardando importação', value: maintenanceManagementAvailable ? 1 : 0, status: maintenanceManagementAvailable ? 'ok' : 'warn' },
        { title: 'Lançamento manual', description: 'Racks e preventivas', value: 2, status: 'info' },
      ],
      totalSources: 8 + 2 + (maintenanceManagementAvailable ? 1 : 0),
    },
    sources,
    daily: response.daily.map((day) => ({
      referenceDate: formatDateBr(day.reference_date),
      status: day.status,
      receivedSources: nullableNumber(day.data_quality?.received_sources),
      validSources: nullableNumber(day.data_quality?.valid_sources),
      sourceCompletenessPct: nullableNumber(day.data_quality?.source_completeness_pct),
      measurementCompletenessPct: nullableNumber(day.data_quality?.measurement_completeness_pct),
    })),
    operational: {
      capacity: {
        status: capacity?.parameter_status || 'NOT_CONFIGURED',
        ups: upsCapacity,
        rpp: rppCapacity,
        gmg: gmgCapacity,
        cag: cagCapacity
          ? {
              groupId: cagCapacity.group_id || 'CHILER',
              nominalTr: nullableNumber(cagCapacity.nominal_tr),
              limitTr: nullableNumber(cagCapacity.limit_tr),
              avgLoadTr: nullableNumber(cagCapacity.avg_load),
              maxLoadTr: nullableNumber(cagCapacity.max_load),
              utilizationAvgPct: nullableNumber(cagCapacity.utilization_avg_pct),
              utilizationPeakPct: nullableNumber(cagCapacity.utilization_peak_pct),
              reserveAtPeakTr: nullableNumber(cagCapacity.reserve_at_peak),
              utilizationBandPeak: cagCapacity.utilization_band_peak || null,
              dataStatus: cagCapacity.data_status || 'NO_DATA',
            }
          : null,
      },
      pue: {
        status: pueAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        value: pueValue,
        avg: nullableNumber(pueMetric?.avg),
        min: nullableNumber(pueMetric?.min),
        max: nullableNumber(pueMetric?.max),
        peakTimestamp: pueMetric?.peak_timestamp ? formatDateTimeBr(pueMetric.peak_timestamp) : pueMetric?.peak_date ? formatDateBr(pueMetric.peak_date) : null,
        daily: (pue?.daily || []).map((item) => ({ date: formatDateBr(item.reference_date), value: numeric(item.pue) })),
        target: nullableNumber(pueCapacity?.target),
        limit: nullableNumber(pueCapacity?.limit),
        targetStatus: pueTargetStatus,
        daysWithData: numeric(pueCapacity?.days_with_data),
        daysTargetMet: numeric(pueCapacity?.days_target_met),
        daysAboveLimit: numeric(pueCapacity?.days_above_limit),
      },
      ups: upsItems,
      gmg: gmgItems,
      rpp: rppItems,
      climatization: {
        totalAvgTr: nullableNumber(thermal.total_tr?.avg),
        totalMaxTr: nullableNumber(thermal.total_tr?.max),
        peakTimestamp: thermal.total_tr?.peak_timestamp ? formatDateTimeBr(thermal.total_tr.peak_timestamp) : thermal.total_tr?.peak_date ? formatDateBr(thermal.total_tr.peak_date) : null,
        chillers: [
          chiller('York', thermal.tr_york, thermal.operation?.york),
          chiller('Trane', thermal.tr_trane, thermal.operation?.trane),
          chiller('Carrier', thermal.tr_carrier, thermal.operation?.carrier),
        ],
      },
      vac: {
        status: vacAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        note: vacAvailable
          ? `${vacAssetItems.filter((item) => item.hasData).length}/${vacExpectedAssets} ativos possuem leitura válida no período. Este CSV representa somente o escopo VAC atual.`
          : 'Nenhum ativo VAC possui leitura completa de RFF e ALM no período selecionado.',
        temporalCoveragePct: vacTemporalCoverage,
        assetCoveragePct: vacAssetCoverage,
        expectedAssets: vacExpectedAssets,
        monitoredAssets: vacAssetItems.filter((item) => item.hasData).map((item) => item.name),
        assets: vacAssetItems.map(({ hasData: _hasData, ...item }) => item),
      },
      disponibilidade: {
        cag: 'AVAILABLE',
        vac: vacAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        note: 'A disponibilidade VAC usa os sinais RFF e ALM; o estado operacional do CAG é apresentado separadamente por período.',
      },
    },
    manual: {
      maintenance: {
        status: manualMaintenance ? 'AVAILABLE' : 'MANUAL_PENDING',
        competence: manualCompetence,
        message: manualMaintenance
          ? `Atualizado em ${formatDateTimeBr(manualMaintenance.updated_at)}.`
          : 'Os dados de preventivas são preenchidos manualmente e ainda não foram lançados para a competência da referência.',
        data: manualMaintenance,
      },
      racks: {
        status: manualRacks ? 'AVAILABLE' : 'MANUAL_PENDING',
        competence: manualCompetence,
        message: manualRacks
          ? `Atualizado em ${formatDateTimeBr(manualRacks.updated_at)}.`
          : 'A capacidade física está parametrizada; a ocupação dos racks ainda não foi preenchida para a competência da referência.',
        data: manualRacks,
      },
    },
    unavailableModules,
    report: {
      title: 'Relatório Executivo de Governança de Infraestrutura',
      description: `Relatório consolidado para ${response.period.label.toLowerCase()}, com ${response.period.valid_days} dias válidos.`,
      generatedFor: response.site,
    },
    ai: {
      ready: false,
      message: 'As análises por IA permanecem desabilitadas até que o histórico diário e as regras de negócio estejam homologados.',
      highlights: [
        'Resumo executivo automático',
        'Detecção de anomalias de telemetria',
        'Comparativos de capacidade e climatização',
      ],
    },
  };
}
