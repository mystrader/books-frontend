import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';

import { BooksFacade } from '../../core/services/application/books.facade';
import { BooksState } from '../../core/states/books.state';
import { Book, BookInput } from '../../core/types/book.types';
import { BookCardComponent } from '../components/book-card.component';

@Component({
  selector: 'app-books-home-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BookCardComponent],
  templateUrl: './books-home.container.html',
  styleUrl: './books-home.container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooksHomeContainer {
  protected readonly state = inject(BooksState);
  private readonly facade = inject(BooksFacade);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedBook = computed(() => this.state.selectedBook());
  protected readonly featuredBooks = computed(() => this.state.filteredBooks().slice(0, 5));
  protected readonly totalBooks = computed(() => this.state.books().length);
  protected readonly showForm = signal(false);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    publication_year: [null as number | null],
    author_ids: [[] as number[]],
    subject_ids: [[] as number[]],
  });

  constructor() {
    this.facade
      .loadInitialData()
      .pipe(
        tap(() => this.syncFormOptions()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected onSearch(value: string): void {
    this.facade.setFilter(value);
  }

  protected openCreateModal(): void {
    this.cancelEdit();
    this.showForm.set(true);
  }

  protected closeModal(): void {
    this.showForm.set(false);
    this.cancelEdit();
  }

  protected onEdit(book: Book): void {
    this.facade.selectBook(book.id);
    this.showForm.set(true);
    this.form.patchValue({
      title: book.title,
      publication_year: book.publication_year,
      author_ids: [...book.author_ids],
      subject_ids: [...book.subject_ids],
    });
  }

  protected onAuthorsChange(event: Event): void {
    this.form.patchValue({
      author_ids: this.getSelectedValues(event),
    });
  }

  protected onSubjectsChange(event: Event): void {
    this.form.patchValue({
      subject_ids: this.getSelectedValues(event),
    });
  }

  protected saveBook(): void {
    if (this.form.invalid) return;

    this.facade
      .saveBook(this.mapFormToPayload())
      .pipe(
        tap(() => this.closeModal()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected removeBook(id: number): void {
    this.facade
      .removeBook(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected trackById(_: number, book: Book): number {
    return book.id;
  }

  private cancelEdit(): void {
    this.facade.selectBook(null);
    this.form.reset({
      title: '',
      publication_year: null,
      author_ids: [],
      subject_ids: [],
    });
  }

  private mapFormToPayload(): BookInput {
    return {
      title: this.form.value.title!.trim(),
      publication_year: this.form.value.publication_year ?? null,
      author_ids: this.form.value.author_ids ?? [],
      subject_ids: this.form.value.subject_ids ?? [],
    };
  }

  private getSelectedValues(event: Event): number[] {
    const select = event.target as HTMLSelectElement;
    return Array.from(select.selectedOptions)
      .map((opt) => Number(opt.value))
      .filter((value) => Number.isFinite(value) && value > 0);
  }

  private syncFormOptions(): void {
    const hasAuthors = this.state.authors().length > 0;
    const hasSubjects = this.state.subjects().length > 0;

    if (!hasAuthors || !hasSubjects) {
      this.state.error.set('Backend sem autores/assuntos ainda. Cadastre no backend para CRUD completo.');
    }
  }
}
