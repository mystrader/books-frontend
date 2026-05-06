import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Autor } from '../types/biblioteca.types';
import { exportTablePdf } from '../utils/export-pdf';
import { mensagemApiErro } from '../utils/http-api-error';

@Component({
  selector: 'app-autores-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './autores.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoresPage {
  private readonly api = inject(BibliotecaApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly autores = signal<Autor[]>([]);
  protected readonly termoBusca = signal('');
  protected readonly modalAberto = signal(false);
  protected readonly editando = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly sucesso = signal<string | null>(null);
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  protected readonly pendenteExclusao = signal<Autor | null>(null);

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  protected readonly autoresFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    if (!termo) return this.autores();
    return this.autores().filter((a) => a.nome.toLowerCase().includes(termo));
  });

  constructor() {
    this.recarregar();
  }

  protected recarregar(): void {
    this.api.listAutores().pipe(take(1)).subscribe({
      next: (a) => this.autores.set(a),
      error: () => this.erro.set('Não foi possível carregar autores.'),
    });
  }

  protected abrirNovo(): void {
    this.editando.set(null);
    this.form.reset({ nome: '' });
    this.modalAberto.set(true);
  }

  protected editar(a: Autor): void {
    this.editando.set(a.cod_au);
    this.form.patchValue({ nome: a.nome });
    this.modalAberto.set(true);
  }

  protected fechar(): void {
    this.modalAberto.set(false);
  }

  protected salvar(): void {
    if (this.form.invalid) return;
    const nome = this.form.value.nome!.trim();
    const id = this.editando();
    const emEdicao = id != null;
    const req$ = id ? this.api.updateAutor(id, nome) : this.api.createAutor(nome);
    req$.pipe(take(1)).subscribe({
      next: () => {
        this.modalAberto.set(false);
        this.recarregar();
        this.mostrarSucesso(emEdicao ? 'Autor atualizado com sucesso.' : 'Autor cadastrado com sucesso.');
      },
      error: (err) => this.erro.set(mensagemApiErro(err, 'Não foi possível salvar.')),
    });
  }

  protected excluir(a: Autor): void {
    this.pendenteExclusao.set(a);
  }

  protected cancelarExclusao(): void {
    this.pendenteExclusao.set(null);
  }

  protected confirmarExclusao(): void {
    const a = this.pendenteExclusao();
    if (!a) return;
    this.pendenteExclusao.set(null);
    this.api
      .deleteAutor(a.cod_au)
      .pipe(take(1))
      .subscribe({
        next: () => this.recarregar(),
        error: (err) =>
          this.erro.set(mensagemApiErro(err, 'Não foi possível remover (pode haver livros vinculados).')),
      });
  }

  protected exportarPdf(): void {
    const rows = this.autoresFiltrados().map((a) => [a.cod_au, a.nome]);
    exportTablePdf({
      fileName: 'autores.pdf',
      title: 'TJ Books · Autores',
      subtitle: `${rows.length} registro(s)`,
      head: ['Código', 'Nome'],
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
