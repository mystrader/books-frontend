import { BooksPolicyService } from './books-policy.service';

describe('BooksPolicyService', () => {
  let service: BooksPolicyService;

  beforeEach(() => {
    service = new BooksPolicyService();
  });

  it('deve permitir salvar quando título é válido e ano é nulo', () => {
    const canSave = service.canSave({
      title: 'Dom Casmurro',
      author_ids: [1],
      subject_ids: [1],
      publication_year: null,
    });

    expect(canSave).toBe(true);
  });

  it('deve bloquear título vazio ou curto', () => {
    const emptyTitle = service.canSave({
      title: ' ',
      author_ids: [1],
      subject_ids: [1],
      publication_year: 2020,
    });

    const shortTitle = service.canSave({
      title: 'A',
      author_ids: [1],
      subject_ids: [1],
      publication_year: 2020,
    });

    expect(emptyTitle).toBe(false);
    expect(shortTitle).toBe(false);
  });

  it('deve validar faixa de ano permitida', () => {
    const currentYear = new Date().getFullYear();

    const belowMin = service.canSave({
      title: 'Livro válido',
      author_ids: [1],
      subject_ids: [1],
      publication_year: 1299,
    });

    const validYear = service.canSave({
      title: 'Livro válido',
      author_ids: [1],
      subject_ids: [1],
      publication_year: currentYear,
    });

    const aboveMax = service.canSave({
      title: 'Livro válido',
      author_ids: [1],
      subject_ids: [1],
      publication_year: currentYear + 2,
    });

    expect(belowMin).toBe(false);
    expect(validYear).toBe(true);
    expect(aboveMax).toBe(false);
  });
});
