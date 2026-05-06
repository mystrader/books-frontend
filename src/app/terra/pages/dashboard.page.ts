import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { catchError, finalize, interval, of, tap } from 'rxjs';

import { TerraCapaFallbackDirective } from '../directives/terra-capa-fallback.directive';
import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Livro } from '../types/biblioteca.types';
import {
  amostrarCorPredominanteDaCapa,
  rgbPadraoSombraCapa,
  type Rgb,
} from '../utils/capa-dominant-color';
import { capaOuPlaceholder } from '../utils/capa-placeholder';
import { formatBrl } from '../utils/format-brl';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TerraCapaFallbackDirective],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly api = inject(BibliotecaApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly livros = signal<Livro[]>([]);
  protected readonly loading = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly formatBrl = formatBrl;

  protected readonly capaOuPlaceholder = capaOuPlaceholder;

  protected readonly vitrineCarousel = viewChild<ElementRef<HTMLElement>>('vitrineCarousel');

  protected readonly vitrineSlideAtual = signal(0);

  protected readonly destaqueIndice = signal(0);

  protected readonly destaqueCarouselLivros = signal<Livro[]>([]);

  protected readonly destaqueCapaRgb = signal<Rgb>(rgbPadraoSombraCapa());

  protected readonly filtroAssuntoCod = signal<number | null>(null);

  protected readonly ordemVitrine = signal<'titulo' | 'ano' | 'valor'>('titulo');

  protected readonly painelExplorarVitrineAberto = signal(false);

  protected readonly assuntosNoAcervo = computed(() => {
    const map = new Map<number, string>();
    for (const l of this.livros()) {
      for (const a of l.assuntos ?? []) {
        map.set(a.cod_as, a.descricao);
      }
    }
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
      .map(([cod_as, descricao]) => ({ cod_as, descricao }));
  });

  protected readonly vitrine = computed(() => {
    let list = [...this.livros()];
    const cod = this.filtroAssuntoCod();
    if (cod != null) {
      list = list.filter((l) => l.assuntos?.some((a) => a.cod_as === cod));
    }
    const ord = this.ordemVitrine();
    list.sort((a, b) => {
      if (ord === 'titulo') {
        return a.titulo.localeCompare(b.titulo, 'pt-BR');
      }
      if (ord === 'ano') {
        return (Number(b.ano_publicacao) || 0) - (Number(a.ano_publicacao) || 0);
      }
      return Number(b.valor) - Number(a.valor);
    });
    return list;
  });

  constructor() {
    effect(() => {
      this.destaqueIndice();
      this.destaqueCarouselLivros();
      this.destaqueCapaRgb.set(rgbPadraoSombraCapa());
    });

    this.api
      .listLivrosAll()
      .pipe(
        catchError(() => {
          this.erro.set('Não foi possível carregar o acervo. Verifique o backend em :8000.');
          return of([] as Livro[]);
        }),
        tap((lista) => {
          this.livros.set(lista);
          this.destaqueCarouselLivros.set(DashboardPage.sortearDestaqueSlides(lista, 3));
          const n = this.destaqueCarouselLivros().length;
          if (n === 0) this.destaqueIndice.set(0);
          else if (this.destaqueIndice() >= n) this.destaqueIndice.set(0);
          queueMicrotask(() => this.atualizarIndiceVitrine());
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    interval(10_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.avancarDestaqueAleatorio());
  }

  private static sortearDestaqueSlides(acervo: Livro[], max: number): Livro[] {
    if (acervo.length === 0) return [];
    const copia = [...acervo];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, Math.min(max, copia.length));
  }

  private avancarDestaqueAleatorio(): void {
    const s = this.destaqueCarouselLivros();
    if (s.length <= 1) return;
    const cur = this.destaqueIndice();
    let next: number;
    if (s.length === 2) {
      next = 1 - cur;
    } else {
      do {
        next = Math.floor(Math.random() * s.length);
      } while (next === cur);
    }
    this.destaqueIndice.set(next);
  }

  protected destaqueSlides(): Livro[] {
    return this.destaqueCarouselLivros();
  }

  protected livroDestaqueAtual(): Livro | null {
    const s = this.destaqueSlides();
    if (s.length === 0) return null;
    const i = Math.min(this.destaqueIndice(), s.length - 1);
    return s[i] ?? null;
  }

  protected destaqueAnimLista(): Livro[] {
    const h = this.livroDestaqueAtual();
    return h ? [h] : [];
  }

  protected irDestaqueSlide(i: number): void {
    const s = this.destaqueSlides();
    if (i < 0 || i >= s.length) return;
    this.destaqueIndice.set(i);
  }

  protected definirFiltroAssunto(cod: number | null): void {
    this.filtroAssuntoCod.set(cod);
    this.reiniciarCarrossel();
  }

  protected definirOrdemVitrine(ord: 'titulo' | 'ano' | 'valor'): void {
    this.ordemVitrine.set(ord);
    this.reiniciarCarrossel();
  }

  protected abrirExplorarVitrine(): void {
    this.painelExplorarVitrineAberto.set(true);
  }

  protected fecharExplorarVitrine(): void {
    this.painelExplorarVitrineAberto.set(false);
  }

  private reiniciarCarrossel(): void {
    queueMicrotask(() => {
      this.vitrineCarousel()?.nativeElement?.scrollTo({ left: 0 });
      this.vitrineSlideAtual.set(0);
      this.atualizarIndiceVitrine();
    });
  }

  protected scrollVitrine(dir: number): void {
    const n = this.vitrine().length;
    if (n === 0) return;
    const next = Math.min(n - 1, Math.max(0, this.vitrineSlideAtual() + dir));
    this.irVitrineIndice(next);
  }

  protected irVitrineIndice(i: number): void {
    const el = this.vitrineCarousel()?.nativeElement;
    const lista = this.vitrine();
    if (!el || i < 0 || i >= lista.length) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (!child) return;
    const alvo = child.offsetLeft - el.clientWidth / 2 + child.offsetWidth / 2;
    el.scrollTo({ left: Math.max(0, alvo), behavior: 'smooth' });
    this.vitrineSlideAtual.set(i);
  }

  protected onVitrineScroll(): void {
    this.atualizarIndiceVitrine();
  }

  private atualizarIndiceVitrine(): void {
    const el = this.vitrineCarousel()?.nativeElement;
    const n = this.vitrine().length;
    if (!el || n === 0 || el.children.length === 0) return;
    const meio = el.scrollLeft + el.clientWidth / 2;
    let melhor = 0;
    let menorDist = Infinity;
    const limite = Math.min(n, el.children.length);
    for (let i = 0; i < limite; i++) {
      const c = el.children[i] as HTMLElement;
      const centro = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(centro - meio);
      if (d < menorDist) {
        menorDist = d;
        melhor = i;
      }
    }
    this.vitrineSlideAtual.set(melhor);
  }

  protected capaHero(l: Livro): string {
    return capaOuPlaceholder(l.thumbnail);
  }

  protected onCapaHeroDestaqueLoad(ev: Event): void {
    const alvo = ev.target;
    if (!(alvo instanceof HTMLImageElement)) return;
    const rgb = amostrarCorPredominanteDaCapa(alvo);
    if (rgb) this.destaqueCapaRgb.set(rgb);
  }

  protected heroDestaqueBgImage(l: Livro): SafeStyle {
    const capa = this.resolverCapaAltaDefinicaoParaBanner(l.thumbnail);
    const url = `url(${JSON.stringify(capa)})`;
    return this.sanitizer.bypassSecurityTrustStyle(
      [
        'linear-gradient(to right, rgb(247 245 241) 0%, rgb(247 245 241 / 0.995) 24%, rgb(247 245 241 / 0.9) 45%, rgb(247 245 241 / 0.6) 66%, rgb(247 245 241 / 0.24) 82%, transparent 95%)',
        'linear-gradient(180deg, rgba(250, 246, 240, 0.62) 0%, rgba(250, 246, 240, 0.62) 100%)',
        url,
      ].join(', ')
    );
  }

  private resolverCapaAltaDefinicaoParaBanner(thumbnail: string | null | undefined): string {
    const capaBase = capaOuPlaceholder(thumbnail);
    try {
      const url = new URL(capaBase);
      const host = url.hostname.toLowerCase();
      if (host.includes('openlibrary.org')) {
        url.pathname = url.pathname.replace(/-(s|m)\.(jpe?g|png)$/i, '-L.$2');
      }
      if (host.includes('images.unsplash.com')) {
        const larguraAtual = Number(url.searchParams.get('w') ?? 0);
        if (!Number.isFinite(larguraAtual) || larguraAtual < 1200) {
          url.searchParams.set('w', '1200');
        }
        if (!url.searchParams.get('q')) {
          url.searchParams.set('q', '80');
        }
        if (!url.searchParams.get('auto')) {
          url.searchParams.set('auto', 'format');
        }
      }
      return url.toString();
    } catch {
      return capaBase;
    }
  }
}
