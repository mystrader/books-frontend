import { Injectable } from '@angular/core';
import { catchError, concatMap, forkJoin, of, tap, throwError } from 'rxjs';

import { BooksApiService } from '../../../integrations/api/books-api.service';
import { BooksState } from '../../states/books.state';
import { BooksPolicyService } from '../domain/books-policy.service';
import { Book, BookInput } from '../../types/book.types';

@Injectable({ providedIn: 'root' })
export class BooksFacade {
  constructor(
    private readonly api: BooksApiService,
    private readonly state: BooksState,
    private readonly policy: BooksPolicyService
  ) {}

  loadInitialData() {
    this.state.loading.set(true);
    this.state.error.set(null);

    return forkJoin({
      books: this.api.listBooks().pipe(catchError(() => of([] as Book[]))),
      authors: this.api.listAuthors().pipe(catchError(() => of([]))),
      subjects: this.api.listSubjects().pipe(catchError(() => of([]))),
    }).pipe(
      tap(({ books, authors, subjects }) => {
        this.state.books.set(books);
        this.state.authors.set(authors);
        this.state.subjects.set(subjects);
      }),
      tap(() => this.state.loading.set(false)),
      catchError(() => {
        this.state.loading.set(false);
        this.state.error.set('Nao foi possivel carregar backend. Verifique API em localhost:8000.');
        return of(null);
      })
    );
  }

  saveBook(payload: BookInput) {
    if (!this.policy.canSave(payload)) {
      this.state.error.set('Dados invalidos. Titulo e ano precisam estar corretos.');
      return throwError(() => new Error('Invalid payload'));
    }

    this.state.saving.set(true);
    this.state.error.set(null);

    const selectedId = this.state.selectedBookId();
    const request$ = selectedId
      ? this.api.updateBook(selectedId, payload)
      : this.api.createBook(payload);

    return request$.pipe(
      concatMap(() => this.api.listBooks()),
      tap((books) => this.state.books.set(books)),
      tap(() => {
        this.state.selectedBookId.set(null);
        this.state.saving.set(false);
      }),
      catchError(() => {
        this.state.saving.set(false);
        this.state.error.set('Falha ao salvar livro.');
        return throwError(() => new Error('Save failed'));
      })
    );
  }

  removeBook(id: number) {
    this.state.saving.set(true);
    this.state.error.set(null);

    return this.api.deleteBook(id).pipe(
      concatMap(() => this.api.listBooks()),
      tap((books) => this.state.books.set(books)),
      tap(() => this.state.saving.set(false)),
      catchError(() => {
        this.state.saving.set(false);
        this.state.error.set('Falha ao remover livro.');
        return throwError(() => new Error('Delete failed'));
      })
    );
  }

  setFilter(value: string): void {
    this.state.filter.set(value);
  }

  selectBook(id: number | null): void {
    this.state.selectedBookId.set(id);
  }
}
