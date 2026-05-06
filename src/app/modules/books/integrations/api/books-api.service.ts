import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClientService } from '../../../shared/http';
import {
  AUTHORS_QUERY_KEY,
  BOOKS_QUERY_KEY,
  SUBJECTS_QUERY_KEY,
} from '../../../shared/http/constants/query-keys';
import { Author, Book, BookInput, Subject } from '../../core/types/book.types';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  constructor(private readonly http: HttpClientService) {}

  listBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('/api/books', undefined, {
      queryKeys: [BOOKS_QUERY_KEY],
    });
  }

  createBook(payload: BookInput): Observable<Book> {
    return this.http.post<Book>('/api/books', payload, {
      invalidateQueries: [BOOKS_QUERY_KEY],
    });
  }

  updateBook(id: number, payload: BookInput): Observable<Book> {
    return this.http.put<Book>(`/api/books/${id}`, payload, {
      invalidateQueries: [BOOKS_QUERY_KEY],
    });
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`/api/books/${id}`, {
      invalidateQueries: [BOOKS_QUERY_KEY],
    });
  }

  listAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>('/api/authors', undefined, {
      queryKeys: [AUTHORS_QUERY_KEY],
      ttl: 600_000,
    });
  }

  listSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>('/api/subjects', undefined, {
      queryKeys: [SUBJECTS_QUERY_KEY],
      ttl: 600_000,
    });
  }
}
