export function formatNumber(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return 'Não disponível';
  return `${value.toFixed(2).replace('.', ',')}${suffix}`;
}

export function formatCompactNumber(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return 'Não disponível';
  return `${value.toFixed(1).replace('.', ',')}${suffix}`;
}

export function availabilityTone(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'ok';
    case 'MISSING_D1':
      return 'warn';
    case 'PENDING_RULE':
    case 'PENDING_VALIDATION':
      return 'info';
    case 'MANUAL_PENDING':
    case 'UNAVAILABLE':
    default:
      return 'pending';
  }
}
