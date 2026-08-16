import type { MetricAggregate, N8nDashboardResponse, SourceCoverage } from '@/types/api';
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
  CAG_DISP: 'CAG Disponibilidade',
  CAG_TR: 'CAG TR',
  GMG_KVA: 'GMG kVA',
  RPP01: 'RPP 01',
  RPP02: 'RPP 02',
  UPS_KVA: 'UPS kVA',
};

const UNAVAILABLE_LABELS: Record<string, string> = {
  pue: 'PUE',
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
    note,
  };
}

function coverageQuality(coverage: SourceCoverage): SourceStatusItem['qualityState'] {
  const pct = nullableNumber(coverage.valid_coverage_pct);
  if (coverage.days_received === 0) return 'UNKNOWN';
  if (pct === 100) return 'OK';
  if (pct !== null && pct >= 95) return 'WARNING';
  return 'DEGRADED';
}

function sourceItems(response: N8nDashboardResponse): SourceStatusItem[] {
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
    avgKva: nullableNumber(value?.load_kva?.avg),
    maxKva: nullableNumber(value?.load_kva?.max),
    avgVoltage: nullableNumber(value?.voltage_v?.avg),
    avgCurrentR: nullableNumber(value?.current_r_a?.avg),
    avgCurrentS: nullableNumber(value?.current_s_a?.avg),
    avgCurrentT: nullableNumber(value?.current_t_a?.avg),
    status: metricStatus(value?.load_kva),
  };
}

function chiller(name: string, metric?: MetricAggregate | null): ChillerMetric {
  return {
    name,
    avgTr: nullableNumber(metric?.avg),
    maxTr: nullableNumber(metric?.max),
    status: metricStatus(metric),
  };
}

function findVacAssets(vac: Record<string, unknown> | null): string[] {
  if (!vac) return [];
  return Object.keys(vac)
    .filter((key) => /^ac\d+/i.test(key))
    .map((key) => key.toUpperCase());
}

export function adaptDashboardResponse(response: N8nDashboardResponse): DashboardPayload {
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

  const manualRacks = response.manual?.racks?.data || null;
  const manualMaintenance = response.manual?.maintenance?.data || null;
  const manualCompetence = response.header.competence;

  const pendingData = [
    ...unavailableModules,
    ...(manualRacks ? [] : ['Racks']),
    ...(manualMaintenance ? [] : ['Manutenção']),
    ...(response.operational.availability?.cag_rule === 'PENDING_VALIDATION' ? ['Disponibilidade CAG'] : []),
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
  const executiveSummary = `${response.period.label}: ${periodText}, encerrando em ${formatDateBr(response.period.reference_date)}. ` +
    `A cobertura média das fontes foi ${formatPct(sourceCompletenessPct)} e a completude média das medições foi ${formatPct(measurementCompletenessPct)}. ` +
    `${receivedSources}/${expectedSources} tipos de fonte possuem dados no período. ` +
    (response.header.stale
      ? `A referência exibida é o último dado válido disponível e está ${response.header.days_lag ?? 0} dias atrás do D-1 cronológico.`
      : 'A referência coincide com o D-1 cronológico.');

  const maintenanceKpi: OverviewKpi = manualMaintenance
    ? {
        label: 'Manutenção',
        value: `${manualMaintenance.completed} / ${manualMaintenance.planned}`,
        badge: `${formatPct(manualMaintenance.completion_pct)} realizadas`,
        status: manualMaintenance.completion_pct >= 100 ? 'ok' : 'warn',
        icon: 'clipboard' as const,
      }
    : {
        label: 'Manutenção',
        value: 'Aguardando entrada',
        badge: 'Manual',
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

  const vacCoverage = nullableNumber(coverage.DISP_INFRA_VAC?.valid_coverage_pct) ?? 0;
  const vacAssets = findVacAssets(vac);
  const vacAvailable = (coverage.DISP_INFRA_VAC?.days_valid || 0) > 0;

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
        { label: 'PUE', value: 'Não disponível', badge: 'Sem fonte', status: 'pending', icon: 'pue' },
        {
          label: 'Fontes válidas',
          value: formatPct(validSourceCompletenessPct),
          badge: `${validSources}/${expectedSources} fontes com dados`,
          status: validSourceCompletenessPct >= 99 ? 'ok' : 'warn',
          icon: 'shield',
        },
        {
          label: 'Disponibilidade CAG',
          value: response.operational.availability?.cag_rule === 'PENDING_VALIDATION' ? 'Regra pendente' : 'Disponível',
          subtitle: 'Telemetria recebida',
          status: response.operational.availability?.cag_rule === 'PENDING_VALIDATION' ? 'info' : 'ok',
          icon: 'grid',
        },
        maintenanceKpi,
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
        { title: 'CSV automático', description: 'WebCTRL / relatórios por e-mail', value: 7, status: 'ok' },
        { title: 'Lançamento manual', description: 'Racks e manutenção', value: 2, status: 'info' },
        { title: 'Sem fonte', description: 'Indicadores fora do escopo atual', value: unavailableModules.length, status: 'warn' },
      ],
      totalSources: 7 + 2 + unavailableModules.length,
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
      ups: [
        equipment('UPS 801', ups.ups_801_kva),
        equipment('UPS 802', ups.ups_802_kva),
        equipment('UPS 1001', ups.ups_1001_kva),
      ],
      gmg: [
        equipment('Gerador 1', gmg.gmg_1_kva, 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
        equipment('Gerador 2', gmg.gmg_2_kva, 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
        equipment('Gerador 3', gmg.gmg_3_kva, 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
        equipment('Gerador 4', gmg.gmg_4_kva, 'PENDING_VALIDATION', `Regra de capacidade: ${gmgRule}`),
      ],
      rpp: [
        rppMetric('RPP01', rpp.rpp01),
        rppMetric('RPP02', rpp.rpp02),
      ],
      climatization: {
        totalAvgTr: nullableNumber(thermal.total_tr?.avg),
        totalMaxTr: nullableNumber(thermal.total_tr?.max),
        peakTimestamp: thermal.total_tr?.peak_timestamp ? formatDateTimeBr(thermal.total_tr.peak_timestamp) : thermal.total_tr?.peak_date ? formatDateBr(thermal.total_tr.peak_date) : null,
        chillers: [
          chiller('York', thermal.tr_york),
          chiller('Trane', thermal.tr_trane),
          chiller('Carrier', thermal.tr_carrier),
        ],
      },
      vac: {
        status: vacAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        note: vacAvailable
          ? `Dados VAC presentes em ${coverage.DISP_INFRA_VAC?.days_valid || 0}/${response.period.valid_days} dias válidos do período.`
          : 'Nenhum dado VAC válido no período selecionado.',
        coveragePct: vacCoverage,
        monitoredAssets: vacAssets,
      },
      disponibilidade: {
        cag: response.operational.availability?.cag_rule === 'PENDING_VALIDATION' ? 'PENDING_RULE' : 'AVAILABLE',
        vac: vacAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        note: 'O recebimento de telemetria é separado da regra oficial de disponibilidade. O CAG permanece pendente de homologação da regra percentual.',
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
