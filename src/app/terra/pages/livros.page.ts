import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { TerraCapaFallbackDirective } from '../directives/terra-capa-fallback.directive';
import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Assunto, Autor, Livro, LivroListMeta } from '../types/biblioteca.types';
import { applyBrlMaskFromInput, formatBrlMasked } from '../utils/brl-input-mask';
import { capaOuPlaceholder } from '../utils/capa-placeholder';
import { formatBrl } from '../utils/format-brl';
import { mensagemApiErro } from '../utils/http-api-error';

const PER_PAGE = 18;

@Component({
  selector: 'app-livros-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TerraCapaFallbackDirective],
  templateUrl: './livros.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivrosPage {
  private readonly valorBrlInput = viewChild<ElementRef<HTMLInputElement>>('valorBrl');

  private readonly api = inject(BibliotecaApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly livros = signal<Livro[]>([]);
  protected readonly meta = signal<LivroListMeta | null>(null);
  protected readonly pagina = signal(1);
  protected readonly autores = signal<Autor[]>([]);
  protected readonly assuntos = signal<Assunto[]>([]);
  protected readonly modalAberto = signal(false);
  protected readonly editandoCodl = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly carregando = signal(false);

  protected readonly formatBrl = formatBrl;
  protected readonly perPage = PER_PAGE;

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    editora: [''],
    edicao: [null as number | null],
    ano_publicacao: [''],
    valor: [0, [Validators.min(0)]],
    thumbnail: [''],
    observacoes: [''],
    autor_ids: [[] as number[]],
    assunto_ids: [[] as number[]],
  });

  constructor() {
    this.recarregar();
  }

  protected recarregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    forkJoin({
      page: this.api.listLivrosPage(this.pagina(), PER_PAGE),
      autores: this.api.listAutores(),
      assuntos: this.api.listAssuntos(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ page, autores, assuntos }) => {
          this.livros.set(page.data);
          this.meta.set(page.meta);
          this.autores.set(autores);
          this.assuntos.set(assuntos);
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set('Não foi possível carregar o inventário.');
          this.carregando.set(false);
        },
      });
  }

  protected irParaPagina(p: number): void {
    const m = this.meta();
    if (!m) return;
    const n = Math.min(Math.max(1, p), m.last_page);
    if (n === this.pagina()) return;
    this.pagina.set(n);
    this.recarregar();
  }

  protected paginasVisiveis(): number[] {
    const m = this.meta();
    if (!m) return [];
    const cur = m.current_page;
    const last = m.last_page;
    const win = 2;
    const from = Math.max(1, cur - win);
    const to = Math.min(last, cur + win);
    const out: number[] = [];
    for (let i = from; i <= to; i++) out.push(i);
    return out;
  }

  protected abrirNovo(): void {
    this.editandoCodl.set(null);
    this.form.reset({
      titulo: '',
      editora: '',
      edicao: null,
      ano_publicacao: '',
      valor: 0,
      thumbnail: '',
      observacoes: '',
      autor_ids: [],
      assunto_ids: [],
    });
    this.modalAberto.set(true);
    queueMicrotask(() => this.syncValorBrlCampo());
  }

  protected editar(l: Livro): void {
    this.editandoCodl.set(l.codl);
    this.form.patchValue({
      titulo: l.titulo,
      editora: l.editora ?? '',
      edicao: l.edicao,
      ano_publicacao: l.ano_publicacao ?? '',
      valor: Number(l.valor),
      thumbnail: l.thumbnail ?? '',
      observacoes: l.observacoes ?? '',
      autor_ids: l.autores?.map((a) => a.cod_au) ?? [],
      assunto_ids: l.assuntos?.map((s) => s.cod_as) ?? [],
    });
    this.modalAberto.set(true);
    queueMicrotask(() => this.syncValorBrlCampo());
  }

  protected onValorBrlInput(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const { display, amount } = applyBrlMaskFromInput(el.value);
    this.form.controls.valor.setValue(amount, { emitEvent: false });
    el.value = display;
  }

  private syncValorBrlCampo(): void {
    const el = this.valorBrlInput()?.nativeElement;
    if (!el) return;
    const v = this.form.controls.valor.value;
    if (v == null || Number.isNaN(Number(v))) {
      el.value = '';
      return;
    }
    const n = Number(v);
    if (n === 0 && this.editandoCodl() == null) {
      el.value = '';
      return;
    }
    el.value = formatBrlMasked(n);
  }

  protected fecharModal(): void {
    this.modalAberto.set(false);
  }

  protected salvar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const ano =
      v.ano_publicacao != null && String(v.ano_publicacao).trim() !== ''
        ? String(v.ano_publicacao).trim()
        : null;
    const edicao =
      v.edicao != null && !Number.isNaN(Number(v.edicao)) ? Number(v.edicao) : null;

    const payload = {
      titulo: v.titulo!.trim(),
      editora: v.editora || null,
      edicao,
      ano_publicacao: ano,
      valor: v.valor ?? 0,
      thumbnail: v.thumbnail || null,
      observacoes: v.observacoes || null,
      autor_ids: v.autor_ids ?? [],
      assunto_ids: v.assunto_ids ?? [],
    };

    const codl = this.editandoCodl();
    const req$ = codl ? this.api.updateLivro(codl, payload) : this.api.createLivro(payload);

    req$.pipe(take(1)).subscribe({
      next: () => {
        this.modalAberto.set(false);
        this.recarregar();
      },
      error: (err) => this.erro.set(mensagemApiErro(err, 'Não foi possível salvar o livro.')),
    });
  }

  protected excluir(l: Livro): void {
    if (!confirm(`Remover "${l.titulo}"?`)) return;
    this.api
      .deleteLivro(l.codl)
      .pipe(take(1))
      .subscribe({
        next: () => {
          const m = this.meta();
          if (m && this.livros().length <= 1 && m.current_page > 1) {
            this.pagina.set(m.current_page - 1);
          }
          this.recarregar();
        },
        error: (err) => this.erro.set(mensagemApiErro(err, 'Não foi possível remover.')),
      });
  }

  protected toggleAutor(id: number): void {
    const cur = [...(this.form.value.autor_ids ?? [])];
    const i = cur.indexOf(id);
    if (i >= 0) cur.splice(i, 1);
    else cur.push(id);
    this.form.patchValue({ autor_ids: cur });
  }

  protected toggleAssunto(id: number): void {
    const cur = [...(this.form.value.assunto_ids ?? [])];
    const i = cur.indexOf(id);
    if (i >= 0) cur.splice(i, 1);
    else cur.push(id);
    this.form.patchValue({ assunto_ids: cur });
  }

  protected autorMarcado(id: number): boolean {
    return (this.form.value.autor_ids ?? []).includes(id);
  }

  protected assuntoMarcado(id: number): boolean {
    return (this.form.value.assunto_ids ?? []).includes(id);
  }

  protected nomesAutores(l: Livro): string {
    const n = l.autores?.map((a) => a.nome).filter(Boolean);
    return n?.length ? n.join(', ') : '—';
  }

  protected capaUrl(l: Livro): string {
    return capaOuPlaceholder(l.thumbnail);
  }
}
