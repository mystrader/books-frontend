import { formatBrl } from './format-brl';

describe('formatBrl', () => {
  it('deve formatar número em moeda brasileira', () => {
    expect(formatBrl(1234.56)).toBe('R$\u00a01.234,56');
  });

  it('deve tratar nulo e indefinido como zero', () => {
    expect(formatBrl(null)).toBe('R$\u00a00,00');
    expect(formatBrl(undefined)).toBe('R$\u00a00,00');
  });

  it('deve retornar zero para valor inválido', () => {
    expect(formatBrl('abc')).toBe('R$\u00a00,00');
  });
});
