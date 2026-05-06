import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./terra/shell/terra-shell.component').then((m) => m.TerraShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./terra/pages/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'livros/:codl',
        loadComponent: () =>
          import('./terra/pages/livro-detalhe.page').then((m) => m.LivroDetalhePage),
      },
      {
        path: 'livros',
        loadComponent: () => import('./terra/pages/livros.page').then((m) => m.LivrosPage),
      },
      {
        path: 'autores',
        loadComponent: () => import('./terra/pages/autores.page').then((m) => m.AutoresPage),
      },
      {
        path: 'assuntos',
        loadComponent: () => import('./terra/pages/assuntos.page').then((m) => m.AssuntosPage),
      },
      {
        path: 'relatorio',
        loadComponent: () => import('./terra/pages/relatorio.page').then((m) => m.RelatorioPage),
      },
    ],
  },
  { path: 'frontend', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
