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
  return (
    <div>
      <Legend
        items={[
          { label: 'Disponibilidade / Fontes (%)', color: 'var(--primary)' },
          { label: 'Completude de medições (%)', color: 'var(--success)' },
          { label: 'Preventivas (%)', color: 'var(--purple)' },
        ]}
      />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis domain={[0, 110]} ticks={[0, 25, 50, 75, 100]} {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border)' }} />
          <Line type="monotone" dataKey="disponibilidade" name="Disponibilidade" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="capacidade" name="Completude" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="preventivas" name="Preventivas" stroke="var(--purple)" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CapacidadeChart({ data }: { data: FamilyCapacityPoint[] }) {
  const sanitized = data.map((item) => ({ ...item, plotValue: item.utilization ?? 0 }));

  return (
    <div>
      <Legend
        items={[
          { label: 'Indicador disponível', color: 'var(--primary)' },
          { label: 'Limite de referência', color: 'var(--critical)', dashed: true },
        ]}
      />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={sanitized} margin={{ top: 18, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="family" {...axis} />
          <YAxis domain={[0, 500]} ticks={[0, 100, 200, 300, 400, 500]} {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent)' }} />
          <ReferenceLine y={100} stroke="var(--critical)" strokeDasharray="6 4" />
          <Bar dataKey="plotValue" name="Indicador" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="utilization"
              position="top"
              fontSize={11}
              fill="var(--foreground)"
              formatter={(v: number | null) => (v == null ? 'N/D' : `${v.toFixed(1).replace('.', ',')}`)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
