import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Assunto } from '../types/biblioteca.types';
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
  protected readonly modalAberto = signal(false);
  protected readonly editando = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.group({
    descricao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
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
    const req$ = id ? this.api.updateAssunto(id, descricao) : this.api.createAssunto(descricao);
    req$.pipe(take(1)).subscribe({
      next: () => {
        this.modalAberto.set(false);
        this.recarregar();
      },
      error: (err) => this.erro.set(mensagemApiErro(err, 'Não foi possível salvar.')),
    });
  }

  protected excluir(s: Assunto): void {
    if (!confirm(`Remover assunto "${s.descricao}"?`)) return;
    this.api
      .deleteAssunto(s.cod_as)
      .pipe(take(1))
      .subscribe({
        next: () => this.recarregar(),
        error: (err) =>
          this.erro.set(mensagemApiErro(err, 'Não foi possível remover (pode haver livros vinculados).')),
      });
  }
}
