import { applyBrlMaskFromInput, formatBrlMasked } from './brl-input-mask';

describe('brl input mask', () => {
  it('deve formatar número já convertido', () => {
    expect(formatBrlMasked(1234.5)).toBe('1.234,50');
  });

  it('deve retornar vazio para NaN', () => {
    expect(formatBrlMasked(Number.NaN)).toBe('');
  });

  it('deve converter input cru para valor monetário', () => {
    const result = applyBrlMaskFromInput('123456');

    expect(result).toEqual({
      display: '1.234,56',
      amount: 1234.56,
    });
  });

  it('deve ignorar caracteres não numéricos', () => {
    const result = applyBrlMaskFromInput('R$ 99,90');

    expect(result).toEqual({
      display: '99,90',
      amount: 99.9,
    });
  });

  it('deve respeitar limite de dígitos', () => {
    const result = applyBrlMaskFromInput('123456789', 4);

    expect(result).toEqual({
      display: '12,34',
      amount: 12.34,
    });
  });
});
