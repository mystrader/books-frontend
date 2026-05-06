import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { take } from 'rxjs/operators';

import { TerraCapaFallbackDirective } from '../directives/terra-capa-fallback.directive';
import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Livro } from '../types/biblioteca.types';
import { capaOuPlaceholder } from '../utils/capa-placeholder';
import { formatBrl } from '../utils/format-brl';

@Component({
  selector: 'app-terra-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TerraCapaFallbackDirective],
  templateUrl: './terra-shell.component.html',
})
export class TerraShellComponent {
  private readonly api = inject(BibliotecaApiService);

  protected readonly buscaWrap = viewChild<ElementRef<HTMLElement>>('buscaWrap');

  protected readonly acervo = signal<Livro[]>([]);
  protected readonly termoBusca = signal('');
  protected readonly buscaAberta = signal(false);
  protected readonly formatBrl = formatBrl;

  protected readonly sugestoes = computed(() => {
    const t = this.termoBusca().trim().toLowerCase();
    if (t.length < 1) return [];
    return this.acervo()
      .filter((l) => {
        if (l.titulo.toLowerCase().includes(t)) return true;
        if (l.editora?.toLowerCase().includes(t)) return true;
        return l.autores?.some((a) => a.nome.toLowerCase().includes(t)) ?? false;
      })
      .slice(0, 12);
  });

  constructor() {
    this.api
      .listLivrosAll()
      .pipe(take(1))
      .subscribe({
        next: (l) => this.acervo.set(l),
        error: () => this.acervo.set([]),
      });
  }

  protected onBuscaInput(ev: Event): void {
    this.termoBusca.set((ev.target as HTMLInputElement).value);
    this.buscaAberta.set(true);
  }

  protected onBuscaFocus(): void {
    this.buscaAberta.set(true);
  }

  protected fecharSugestoes(): void {
    this.buscaAberta.set(false);
  }

  protected capaLista(l: Livro): string {
    return capaOuPlaceholder(l.thumbnail);
  }

  protected linhaAutores(l: Livro): string {
    const n = l.autores?.map((a) => a.nome).filter(Boolean);
    return n?.length ? n.join(', ') : (l.editora ?? 'Acervo Terra');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    const wrap = this.buscaWrap()?.nativeElement;
    if (wrap && !wrap.contains(ev.target as Node)) {
      this.buscaAberta.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      this.buscaAberta.set(false);
    }
  }
}
