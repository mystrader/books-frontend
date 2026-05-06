import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { BibliotecaApiService } from '../services/biblioteca-api.service';
import { Autor } from '../types/biblioteca.types';
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
  protected readonly modalAberto = signal(false);
  protected readonly editando = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
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
    const req$ = id ? this.api.updateAutor(id, nome) : this.api.createAutor(nome);
    req$.pipe(take(1)).subscribe({
      next: () => {
        this.modalAberto.set(false);
        this.recarregar();
      },
      error: (err) => this.erro.set(mensagemApiErro(err, 'Não foi possível salvar.')),
    });
  }

  protected excluir(a: Autor): void {
    if (!confirm(`Remover "${a.nome}"?`)) return;
    this.api
      .deleteAutor(a.cod_au)
      .pipe(take(1))
      .subscribe({
        next: () => this.recarregar(),
        error: (err) =>
          this.erro.set(mensagemApiErro(err, 'Não foi possível remover (pode haver livros vinculados).')),
      });
  }
}
