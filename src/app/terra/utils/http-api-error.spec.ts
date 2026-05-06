import { HttpErrorResponse } from '@angular/common/http';

import { mensagemApiErro } from './http-api-error';

describe('mensagemApiErro', () => {
  it('deve juntar mensagens do objeto errors', () => {
    const err = new HttpErrorResponse({
      error: {
        errors: {
          title: ['Titulo obrigatório'],
          price: ['Preço inválido'],
        },
      },
    });

    expect(mensagemApiErro(err, 'Falha inesperada')).toBe('Titulo obrigatório Preço inválido');
  });

  it('deve usar message quando existir', () => {
    const err = new HttpErrorResponse({
      error: {
        message: 'Não foi possível salvar',
      },
    });

    expect(mensagemApiErro(err, 'Falha inesperada')).toBe('Não foi possível salvar');
  });

  it('deve cair no fallback para erro não mapeado', () => {
    const err = new Error('qualquer');

    expect(mensagemApiErro(err, 'Falha inesperada')).toBe('Falha inesperada');
  });
});
