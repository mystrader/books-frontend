import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { RelatorioResponse } from '../types/biblioteca.types';
import { exportTablePdf } from '../utils/export-pdf';
import { formatBrl } from '../utils/format-brl';

@Component({
  selector: 'app-relatorio-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './relatorio.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatorioPage {
  private readonly api = inject(BibliotecaApiService);

  protected readonly data = signal<RelatorioResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly formatBrl = formatBrl;
  protected readonly visualizacao = signal<'tabela' | 'cards'>('cards');
  protected readonly termoBusca = signal('');

  protected readonly gruposFiltrados = computed(() => {
    const rep = this.data();
    if (!rep) return [];
    const termo = this.termoBusca().trim().toLowerCase();
    if (!termo) return rep.grupos;
    return rep.grupos
      .map((g) => ({
        ...g,
        livros: g.livros.filter((liv) => {
          const autor = g.autor_nome.toLowerCase();
          const titulo = liv.titulo.toLowerCase();
          const editora = (liv.editora ?? '').toLowerCase();
          const ano = String(liv.ano_publicacao ?? '').toLowerCase();
          return (
            autor.includes(termo) || titulo.includes(termo) || editora.includes(termo) || ano.includes(termo)
          );
        }),
      }))
      .filter((g) => g.livros.length > 0);
  });

  constructor() {
    this.api.relatorioLivrosPorAutor().pipe(take(1)).subscribe({
      next: (r) => {
        this.data.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o relatório (view no banco + API).');
        this.loading.set(false);
      },
    });
  }

  protected definirVisualizacao(modo: 'tabela' | 'cards'): void {
    this.visualizacao.set(modo);
  }

  protected exportarPdf(): void {
    const rep = this.data();
    if (!rep) return;
    const rows = this.gruposFiltrados().flatMap((g) =>
      g.livros.map((liv) => [
        g.autor_nome,
        liv.titulo,
        liv.editora ?? '—',
        liv.ano_publicacao ?? '—',
        this.formatBrl(liv.valor),
      ])
    );
    exportTablePdf({
      fileName: 'relatorio-livros-por-autor.pdf',
      title: 'TJ Books · Relatório de livros por autor',
      subtitle: `${rows.length} linha(s) da view ${rep.fonte}`,
      head: ['Autor', 'Título', 'Editora', 'Ano', 'Valor'],
      body: rows,
    });
  }

  protected onBuscaInput(ev: Event): void {
    this.termoBusca.set((ev.target as HTMLInputElement).value);
  }
}
