import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { RelatorioResponse } from '../types/biblioteca.types';
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
}
