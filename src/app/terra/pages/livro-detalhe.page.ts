import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { TerraCapaFallbackDirective } from '../directives/terra-capa-fallback.directive';
import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Livro } from '../types/biblioteca.types';
import { capaOuPlaceholder } from '../utils/capa-placeholder';
import { formatBrl } from '../utils/format-brl';

@Component({
  selector: 'app-livro-detalhe-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TerraCapaFallbackDirective],
  templateUrl: './livro-detalhe.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivroDetalhePage {
  private readonly api = inject(BibliotecaApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly livro = signal<Livro | null>(null);
  protected readonly loading = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly formatBrl = formatBrl;

  protected capaSrc(l: Livro): string {
    return capaOuPlaceholder(l.thumbnail);
  }

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((pm) => {
          const id = Number(pm.get('codl'));
          if (!Number.isFinite(id) || id < 1) {
            this.erro.set('Identificador de livro inválido.');
            return of(null).pipe(finalize(() => this.loading.set(false)));
          }
          this.loading.set(true);
          this.erro.set(null);
          return this.api.getLivro(id).pipe(
            catchError(() => {
              this.erro.set('Não foi possível carregar este título.');
              return of(null);
            }),
            finalize(() => this.loading.set(false))
          );
        }),
        tap((l) => this.livro.set(l)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected nomesAutores(l: Livro): string {
    const n = l.autores?.map((a) => a.nome).filter(Boolean);
    return n?.length ? n.join(', ') : '—';
  }

  protected nomesAssuntos(l: Livro): string {
    const n = l.assuntos?.map((s) => s.descricao).filter(Boolean);
    return n?.length ? n.join(', ') : '—';
  }

}
