const fmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBrlMasked(n: number): string {
  if (Number.isNaN(n)) return '';
  return fmt.format(n);
}

export function applyBrlMaskFromInput(rawValue: string, maxDigits = 13): { display: string; amount: number } {
  const digits = rawValue.replace(/\D/g, '').slice(0, maxDigits);
  if (!digits) {
    return { display: '', amount: 0 };
  }
  const amount = parseInt(digits, 10) / 100;
  return { display: fmt.format(amount), amount };
}
