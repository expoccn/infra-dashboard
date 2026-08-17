import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import type { FamilyCapacityPoint, MonthlyTrendPoint } from '@/types/dashboard';

const axis = {
  stroke: 'var(--muted-foreground)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--foreground)',
};

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{
              background: i.dashed
                ? `repeating-linear-gradient(90deg, ${i.color} 0 4px, transparent 4px 7px)`
                : i.color,
            }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function TendenciaChart({ data }: { data: MonthlyTrendPoint[] }) {
  if (!data.length) {
    return <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">Sem histórico para o período selecionado.</div>;
  }

  return (
    <div>
      <Legend
        items={[
          { label: 'Cobertura das fontes (%)', color: 'var(--primary)' },
          { label: 'Completude de medições (%)', color: 'var(--success)' },
        ]}
      />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis domain={[0, 110]} ticks={[0, 25, 50, 75, 100]} {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border)' }} />
          <Line type="monotone" dataKey="disponibilidade" name="Cobertura das fontes" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="capacidade" name="Completude das medições" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CapacidadeChart({ data }: { data: FamilyCapacityPoint[] }) {
  const hasRealUtilization = data.some((item) => item.utilization !== null && item.utilization !== undefined);
  if (!hasRealUtilization) {
    return (
      <div className="flex h-[245px] flex-col items-center justify-center rounded-xl bg-surface/50 px-5 text-center">
        <p className="text-sm font-medium">Percentual de utilização não homologado</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          A telemetria de UPS, RPP, CAG e GMG está disponível, mas os limites nominais necessários para comparar famílias em percentual ainda não fazem parte da regra aprovada.
        </p>
      </div>
    );
  }

  const sanitized = data.map((item) => ({ ...item, plotValue: item.utilization ?? 0 }));
  return (
    <div>
      <Legend items={[{ label: 'Utilização (%)', color: 'var(--primary)' }, { label: 'Limite de referência', color: 'var(--critical)', dashed: true }]} />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={sanitized} margin={{ top: 18, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="family" {...axis} />
          <YAxis domain={[0, 150]} ticks={[0, 30, 60, 90, 120, 150]} {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent)' }} />
          <ReferenceLine y={100} stroke="var(--critical)" strokeDasharray="6 4" />
          <Bar dataKey="plotValue" name="Utilização" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            <LabelList dataKey="utilization" position="top" fontSize={11} fill="var(--foreground)" formatter={(v: number | null) => (v == null ? 'N/D' : `${v.toFixed(1).replace('.', ',')}%`)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


export function PueChart({ data }: { data: Array<{ date: string; value: number }> }) {
  if (!data.length) return <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">Sem histórico de PUE para o período selecionado.</div>;
  const values = data.map((item) => item.value).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(0.02, (max - min) * 0.35);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...axis} />
        <YAxis domain={[Math.max(0, min - pad), max + pad]} {...axis} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border)' }} formatter={(value: number) => value.toFixed(2).replace('.', ',')} />
        <Line type="monotone" dataKey="value" name="PUE" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
