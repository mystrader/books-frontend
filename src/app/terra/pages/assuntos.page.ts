import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Assunto } from '../types/biblioteca.types';
import { exportTablePdf } from '../utils/export-pdf';
import { mensagemApiErro } from '../utils/http-api-error';

@Component({
  selector: 'app-assuntos-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assuntos.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssuntosPage {
  private readonly api = inject(BibliotecaApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly assuntos = signal<Assunto[]>([]);
  protected readonly termoBusca = signal('');
  protected readonly modalAberto = signal(false);
  protected readonly editando = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly pendenteExclusao = signal<Assunto | null>(null);
  protected readonly sucesso = signal<string | null>(null);
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly form = this.fb.group({
    descricao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  protected readonly assuntosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    if (!termo) return this.assuntos();
    return this.assuntos().filter((s) => s.descricao.toLowerCase().includes(termo));
  });

  constructor() {
    this.recarregar();
  }

  protected recarregar(): void {
    this.api.listAssuntos().pipe(take(1)).subscribe({
      next: (s) => this.assuntos.set(s),
      error: () => this.erro.set('Não foi possível carregar assuntos.'),
    });
  }

  protected abrirNovo(): void {
    this.editando.set(null);
    this.form.reset({ descricao: '' });
    this.modalAberto.set(true);
  }

  protected editar(s: Assunto): void {
    this.editando.set(s.cod_as);
    this.form.patchValue({ descricao: s.descricao });
    this.modalAberto.set(true);
  }

  protected fechar(): void {
    this.modalAberto.set(false);
  }

  protected salvar(): void {
    if (this.form.invalid) return;
    const descricao = this.form.value.descricao!.trim();
    const id = this.editando();
    const emEdicao = id != null;
    const req$ = id ? this.api.updateAssunto(id, descricao) : this.api.createAssunto(descricao);
    req$.pipe(take(1)).subscribe({
      next: () => {
        this.modalAberto.set(false);
        this.recarregar();
        this.mostrarSucesso(emEdicao ? 'Assunto atualizado com sucesso.' : 'Assunto cadastrado com sucesso.');
      },
      error: (err) => this.erro.set(mensagemApiErro(err, 'Não foi possível salvar.')),
    });
  }

  protected excluir(s: Assunto): void {
    this.pendenteExclusao.set(s);
  }

  protected cancelarExclusao(): void {
    this.pendenteExclusao.set(null);
  }

  protected confirmarExclusao(): void {
    const s = this.pendenteExclusao();
    if (!s) return;
    this.pendenteExclusao.set(null);
    this.api
      .deleteAssunto(s.cod_as)
      .pipe(take(1))
      .subscribe({
        next: () => this.recarregar(),
        error: (err) =>
          this.erro.set(mensagemApiErro(err, 'Não foi possível remover (pode haver livros vinculados).')),
      });
  }

  protected exportarPdf(): void {
    const rows = this.assuntosFiltrados().map((s) => [s.cod_as, s.descricao]);
    exportTablePdf({
      fileName: 'assuntos.pdf',
      title: 'TJbooks · Assuntos',
      subtitle: `${rows.length} registro(s)`,
      head: ['Código', 'Descrição'],
      body: rows,
    });
  }

  protected onBuscaInput(ev: Event): void {
    this.termoBusca.set((ev.target as HTMLInputElement).value);
  }

  private mostrarSucesso(mensagem: string): void {
    this.sucesso.set(mensagem);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => this.sucesso.set(null), 3500);
  }
}
