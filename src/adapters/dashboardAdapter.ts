import type { MetricAggregate, DashboardApiResponse, SourceCoverage } from '@/types/api';
import type {
  ChillerMetric,
  DashboardPayload,
  DataAvailability,
  EquipmentMetric,
  RppMetric,
  SourceStatusItem,
  OverviewKpi,
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
  disponibilidade_concessionaria: 'Concessionária',
  transformadores: 'Transformadores',
  fcc: 'FCC',
  quadros: 'Quadros',
  diesel: 'Diesel',
  plano_acao: 'Plano de Ação',
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

function equipment(name: string, metric?: MetricAggregate | null, status?: DataAvailability, note?: string): EquipmentMetric {
  return {
    name,
    avg: nullableNumber(metric?.avg),
    min: nullableNumber(metric?.min),
    max: nullableNumber(metric?.max),
    peakTimestamp: metric?.peak_timestamp ? formatDateTimeBr(metric.peak_timestamp) : metric?.peak_date ? formatDateBr(metric.peak_date) : null,
    status: status || metricStatus(metric),
    ...(note !== undefined ? { note } : {}),
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

function rppMetric(name: string, value?: Record<string, MetricAggregate> | null): RppMetric {
  return {
    name,
    avgKva: nullableNumber(value?.['load_kva']?.avg),
    maxKva: nullableNumber(value?.['load_kva']?.max),
    avgVoltage: nullableNumber(value?.['voltage_v']?.avg),
    avgCurrentR: nullableNumber(value?.['current_r_a']?.avg),
    avgCurrentS: nullableNumber(value?.['current_s_a']?.avg),
    avgCurrentT: nullableNumber(value?.['current_t_a']?.avg),
    status: metricStatus(value?.['load_kva']),
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
      status: rawStatus === 'AVAILABLE' ? 'AVAILABLE' as const : rawStatus === 'UNAVAILABLE' ? 'UNAVAILABLE' as const : 'UNAVAILABLE' as const,
      availabilityPct: nullableNumber(value.availability_pct),
      coveragePct: nullableNumber(value.coverage_pct) ?? 0,
      hasData: rawStatus !== 'NO_DATA',
    };
  });
}

export function adaptDashboardResponse(response: DashboardApiResponse): DashboardPayload {
  const sources = sourceItems(response);
  const coverage = response.completion.source_coverage || {};
  const expectedSources = Object.keys(SOURCE_LABELS).length;
  const receivedSources = sources.filter((s) => s.daysReceived > 0).length;
  const validSources = sources.filter((s) => s.daysValid > 0).length;
  const missingSources = sources.filter((s) => s.daysReceived === 0).map((s) => s.reportType);
  const sourceCompletenessPct = numeric(response.completion.source_completeness_pct);
  const validSourceCompletenessPct = numeric(response.completion.valid_source_completeness_pct);
  const measurementCompletenessPct = numeric(response.completion.measurement_completeness_pct);
  const unavailableModules = Object.keys(response.unavailable || {}).map((key) => UNAVAILABLE_LABELS[key] || key);

  const ups = response.operational.ups || {};
  const gmg = response.operational.gmg || {};
  const rpp = response.operational.rpp || {};
  const thermal = response.operational.climatization?.thermal || {};
  const vac = response.operational.climatization?.vac || null;
  const pue = response.operational.pue || null;

  const manualRacks = response.manual?.racks?.data || null;
  const manualMaintenance = response.manual?.maintenance?.data || null;
  const manualCompetence = response.header.competence;
  const maintenanceManagement = response.maintenance_management || null;
  const maintenanceManagementAvailable = maintenanceManagement?.status === 'AVAILABLE' && Boolean(maintenanceManagement.corrections);

  const pendingData = [
    ...unavailableModules,
    ...(manualRacks ? [] : ['Racks']),
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
  const vacAssetsWithoutData = numeric((vac?.availability as Record<string, unknown> | undefined)?.assets_no_data);
  if (vacAssetsWithoutData > 0) attention.push(`${vacAssetsWithoutData} ativos VAC sem leitura completa de RFF e ALM`);
  if (maintenanceManagementAvailable) {
    const pendingCorrections = numeric(maintenanceManagement?.corrections?.pending);
    const partsRequired = numeric(maintenanceManagement?.corrections?.depends_on_part);
    const offlineIntegrations = numeric(maintenanceManagement?.integrations?.offline);
    const manualEquipment = numeric(maintenanceManagement?.manual_equipment?.total);
    if (pendingCorrections > 0) attention.push(`${pendingCorrections} corretivas pendentes na gestão de manutenção`);
    if (partsRequired > 0) attention.push(`${partsRequired} corretivas dependem de peça`);
    if (offlineIntegrations > 0) attention.push(`${offlineIntegrations} integrações offline`);
    if (manualEquipment > 0) attention.push(`${manualEquipment} equipamentos mantidos em manual`);
    const panelIssues = numeric(maintenanceManagement?.panels?.issues);
    if (panelIssues > 0) attention.push(`${panelIssues} quadros com apontamentos na gestão de manutenção`);
  }
  if (!attention.length) attention.push('Nenhuma pendência de atualização identificada no período selecionado');

  const sourceWarnings = sources
    .filter((s) => (s.measurementCoveragePct ?? 0) < 100)
    .map((s) => `${s.label} — ${s.daysValid}/${s.daysInPeriod} dias com dados válidos`);
  const criticalAssets = sourceWarnings.length
    ? sourceWarnings.slice(0, 4)
    : ['Criticidade de ativos depende de regra operacional homologada'];

  const periodText = response.period.valid_days === 1
    ? '1 dia válido'
    : `${response.period.valid_days} dias válidos`;
  const maintenanceAvailability = maintenanceManagement?.availability?.current?.total_calculated;
  const maintenanceAvailabilityPct = maintenanceAvailability == null ? null : maintenanceAvailability * 100;
  const pueSummaryValue = nullableNumber(pue?.metric?.avg);
  const pueSummaryText = pueSummaryValue == null
    ? ''
    : ` O PUE ${response.period.type === 'd1' ? 'do último dia válido' : 'médio diário do período'} é ${pueSummaryValue.toFixed(2).replace('.', ',')}.`;
  const maintenanceSummaryText = maintenanceManagementAvailable
    ? ` A gestão de manutenção registra ${numeric(maintenanceManagement?.corrections?.pending)} corretivas pendentes, ${numeric(maintenanceManagement?.corrections?.solved)} solucionadas, ${numeric(maintenanceManagement?.manual_equipment?.total)} equipamentos mantidos em manual, ${numeric(maintenanceManagement?.integrations?.offline)} integrações offline e ${numeric(maintenanceManagement?.panels?.total)} quadros avaliados.${maintenanceAvailabilityPct == null ? '' : ` A disponibilidade consolidada do último ciclo é ${formatPct(maintenanceAvailabilityPct)}.`}`
    : '';

  const executiveSummary = `${response.period.label}: ${periodText}, encerrando em ${formatDateBr(response.period.reference_date)}. ` +
    `A cobertura média das fontes foi ${formatPct(sourceCompletenessPct)} e a completude média das medições foi ${formatPct(measurementCompletenessPct)}. ` +
    `${receivedSources}/${expectedSources} tipos de fonte possuem dados no período. ` +
    (response.header.stale
      ? `A referência exibida é o último dado válido disponível e está ${response.header.days_lag ?? 0} dias atrás do D-1 cronológico.`
      : 'A referência coincide com o D-1 cronológico.') +
    pueSummaryText +
    maintenanceSummaryText;

  const maintenanceKpi: OverviewKpi = maintenanceManagementAvailable
    ? {
        label: 'Manutenção',
        value: `${numeric(maintenanceManagement?.corrections?.pending)} pendentes`,
        badge: `${numeric(maintenanceManagement?.corrections?.solved)} solucionadas`,
        ...(maintenanceManagement?.cycle?.latest_cycle == null ? {} : { subtitle: `${maintenanceManagement.cycle.latest_cycle}º ciclo` }),
        status: numeric(maintenanceManagement?.corrections?.pending) > 0 ? 'warn' : 'ok',
        icon: 'clipboard' as const,
      }
    : manualMaintenance
      ? {
          label: 'Preventivas',
          value: `${manualMaintenance.completed} / ${manualMaintenance.planned}`,
          badge: `${formatPct(manualMaintenance.completion_pct)} realizadas`,
          status: manualMaintenance.completion_pct >= 100 ? 'ok' : 'warn',
          icon: 'clipboard' as const,
        }
      : {
          label: 'Manutenção',
          value: 'Aguardando base',
          badge: 'Importação pendente',
          status: 'pending' as const,
          icon: 'clipboard' as const,
        };

  const racksKpi: OverviewKpi = manualRacks
    ? {
        label: 'Racks',
        value: `${manualRacks.available_positions} livres`,
        badge: `${formatPct(manualRacks.occupancy_pct)} ocupados`,
        status: 'info' as const,
        icon: 'list' as const,
      }
    : {
        label: 'Racks',
        value: 'Aguardando entrada',
        badge: 'Manual',
        status: 'pending' as const,
        icon: 'list' as const,
      };

  const trendMonthly = response.daily.map((day) => ({
    month: formatDateBr(day.reference_date).slice(0, 5),
    disponibilidade: nullableNumber(day.data_quality?.source_completeness_pct),
    capacidade: nullableNumber(day.data_quality?.measurement_completeness_pct),
    preventivas: null,
  }));

  const familyCapacity = [
    { family: 'UPS', utilization: null },
    { family: 'RPP', utilization: null },
    { family: 'Clima', utilization: null },
    { family: 'GMG', utilization: null },
    { family: 'PUE', utilization: null },
  ];

  const vacTemporalCoverage = nullableNumber(coverage['DISP_INFRA_VAC']?.valid_coverage_pct) ?? 0;
  const vacAssetItems = vacAssets(vac);
  const vacAssetCoverage = nullableNumber((vac?.availability as Record<string, unknown> | undefined)?.asset_coverage_pct) ?? 0;
  const vacAvailable = vacAssetItems.some((item) => item.hasData);
  const pueMetric = pue?.metric || null;
  const pueAvailable = Boolean(pueMetric && numeric(pueMetric.count) > 0);
  const pueValue = nullableNumber(pueMetric?.avg);
  const panelsAvailable = maintenanceManagementAvailable && numeric(maintenanceManagement?.panels?.total) > 0;

  const gmgRule = response.operational.gmg?.kpi_capacity_rule || 'PENDING_VALIDATION';

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
    overview: {
      kpis: [
        {
          label: 'PUE',
          value: pueAvailable && pueValue !== null ? pueValue.toFixed(2).replace('.', ',') : 'Não disponível',
          badge: pueAvailable ? (response.period.type === 'd1' ? 'Último dia válido' : 'Média diária do período') : 'Sem dados',
          status: pueAvailable ? 'info' : 'pending',
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
          label: 'Disponibilidade CAG',
          value: 'Disponível',
          status: 'ok',
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
      pue: {
        status: pueAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        value: pueValue,
        avg: nullableNumber(pueMetric?.avg),
        min: nullableNumber(pueMetric?.min),
        max: nullableNumber(pueMetric?.max),
        peakTimestamp: pueMetric?.peak_timestamp ? formatDateTimeBr(pueMetric.peak_timestamp) : pueMetric?.peak_date ? formatDateBr(pueMetric.peak_date) : null,
        daily: (pue?.daily || []).map((item) => ({ date: formatDateBr(item.reference_date), value: numeric(item.pue) })),
      },
      ups: [
        equipment('UPS 801', ups['ups_801_kva']),
        equipment('UPS 802', ups['ups_802_kva']),
        equipment('UPS 1001', ups['ups_1001_kva']),
      ],
      gmg: [
        equipment('Gerador 1', gmg['gmg_1_kva'], 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
        equipment('Gerador 2', gmg['gmg_2_kva'], 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
        equipment('Gerador 3', gmg['gmg_3_kva'], 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
        equipment('Gerador 4', gmg['gmg_4_kva'], 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
      ],
      rpp: [
        rppMetric('RPP01', rpp['rpp01']),
        rppMetric('RPP02', rpp['rpp02']),
      ],
      climatization: {
        totalAvgTr: nullableNumber(thermal['total_tr']?.avg),
        totalMaxTr: nullableNumber(thermal['total_tr']?.max),
        peakTimestamp: thermal['total_tr']?.peak_timestamp ? formatDateTimeBr(thermal['total_tr'].peak_timestamp) : thermal['total_tr']?.peak_date ? formatDateBr(thermal['total_tr'].peak_date) : null,
        chillers: [
          chiller('York', thermal['tr_york'], (thermal['operation'] as Record<string, Record<string, unknown>> | undefined)?.york),
          chiller('Trane', thermal['tr_trane'], (thermal['operation'] as Record<string, Record<string, unknown>> | undefined)?.trane),
          chiller('Carrier', thermal['tr_carrier'], (thermal['operation'] as Record<string, Record<string, unknown>> | undefined)?.carrier),
        ],
      },
      vac: {
        status: vacAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        note: vacAvailable
          ? `${vacAssetItems.filter((item) => item.hasData).length}/4 ativos possuem leitura válida no período.`
          : 'Nenhum ativo VAC possui leitura completa de RFF e ALM no período selecionado.',
        temporalCoveragePct: vacTemporalCoverage,
        assetCoveragePct: vacAssetCoverage,
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
          : 'Os dados de manutenção são preenchidos manualmente e ainda não foram lançados para a competência da referência.',
        data: manualMaintenance,
      },
      racks: {
        status: manualRacks ? 'AVAILABLE' : 'MANUAL_PENDING',
        competence: manualCompetence,
        message: manualRacks
          ? `Atualizado em ${formatDateTimeBr(manualRacks.updated_at)}.`
          : 'Ocupação e disponibilidade de racks ainda não foram lançadas para a competência da referência.',
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
