import { routes } from './app.routes';

describe('app routes', () => {
  it('deve configurar shell na rota raiz', () => {
    const root = routes.find((r) => r.path === '');

    expect(root).toBeTruthy();
    expect(typeof root?.loadComponent).toBe('function');
    expect(root?.children?.length).toBeGreaterThan(0);
  });

  it('deve expor as rotas principais do sistema', () => {
    const root = routes.find((r) => r.path === '');
    const childPaths = root?.children?.map((c) => c.path) ?? [];

    expect(childPaths).toContain('dashboard');
    expect(childPaths).toContain('livros');
    expect(childPaths).toContain('livros/:codl');
    expect(childPaths).toContain('autores');
    expect(childPaths).toContain('assuntos');
    expect(childPaths).toContain('relatorio');
  });

  it('deve manter redirects globais esperados', () => {
    const frontendRedirect = routes.find((r) => r.path === 'frontend');
    const wildcardRedirect = routes.find((r) => r.path === '**');

    expect(frontendRedirect?.redirectTo).toBe('');
    expect(frontendRedirect?.pathMatch).toBe('full');
    expect(wildcardRedirect?.redirectTo).toBe('');
  });

});
