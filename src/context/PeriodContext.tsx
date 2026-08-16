import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PeriodType } from '@/types/api';

const STORAGE_KEY = 'claro-rjo-am-dashboard-period';

type PeriodContextValue = {
  period: PeriodType;
  setPeriod: (period: PeriodType) => void;
};

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodState] = useState<PeriodType>('d1');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'd1' || saved === '7d' || saved === '30d') {
      setPeriodState(saved);
    }
  }, []);

  const setPeriod = (next: PeriodType) => {
    setPeriodState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ period, setPeriod }), [period]);
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod() {
  const value = useContext(PeriodContext);
  if (!value) throw new Error('usePeriod deve ser usado dentro de PeriodProvider');
  return value;
}

export const periodLabels: Record<PeriodType, string> = {
  d1: 'Último dia',
  '7d': '7 dias',
  '30d': '30 dias',
};
