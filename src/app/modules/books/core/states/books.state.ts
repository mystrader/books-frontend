import { Injectable, computed, signal } from '@angular/core';

import { Author, Book, Subject } from '../types/book.types';

@Injectable({ providedIn: 'root' })
export class BooksState {
  readonly books = signal<Book[]>([]);
  readonly authors = signal<Author[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedBookId = signal<number | null>(null);
  readonly filter = signal('');

  readonly filteredBooks = computed(() => {
    const search = this.filter().trim().toLowerCase();
    if (!search) return this.books();
    return this.books().filter((book) => book.title.toLowerCase().includes(search));
  });

  readonly selectedBook = computed(() => {
    const id = this.selectedBookId();
    if (!id) return null;
    return this.books().find((book) => book.id === id) ?? null;
  });
}
