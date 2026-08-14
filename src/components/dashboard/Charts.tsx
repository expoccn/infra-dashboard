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
} from "recharts";
import { tendenciaMensal, capacidadeFamilia } from "@/data/dashboard";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--foreground)",
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

export function TendenciaChart() {
  return (
    <div>
      <Legend
        items={[
          { label: "Disponibilidade TI (%)", color: "var(--primary)" },
          { label: "Capacidade Crítica (%)", color: "var(--success)" },
          { label: "Preventivas (%)", color: "var(--purple)" },
        ]}
      />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={tendenciaMensal} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mes" {...axis} />
          <YAxis domain={[60, 110]} ticks={[60, 70, 80, 90, 100, 110]} {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />
          <Line
            type="monotone"
            dataKey="disponibilidade"
            name="Disponibilidade TI"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="capacidade"
            name="Capacidade Crítica"
            stroke="var(--success)"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="preventivas"
            name="Preventivas"
            stroke="var(--purple)"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CapacidadeChart() {
  return (
    <div>
      <Legend
        items={[
          { label: "Utilização (%)", color: "var(--primary)" },
          { label: "Limite recomendável", color: "var(--critical)", dashed: true },
        ]}
      />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={capacidadeFamilia} margin={{ top: 18, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="familia" {...axis} />
          <YAxis domain={[0, 150]} ticks={[0, 30, 60, 90, 120, 150]} {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
          <ReferenceLine y={100} stroke="var(--critical)" strokeDasharray="6 4" />
          <Bar dataKey="utilizacao" name="Utilização" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="utilizacao"
              position="top"
              fontSize={11}
              fill="var(--foreground)"
              formatter={(v: number) => `${v.toFixed(1).replace(".", ",")}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
