import { Injectable } from '@angular/core';

import { BookInput } from '../../types/book.types';

@Injectable({ providedIn: 'root' })
export class BooksPolicyService {
  canSave(payload: BookInput): boolean {
    const title = payload.title.trim();
    if (!title || title.length < 2) return false;

    if (payload.publication_year === null) return true;

    const currentYear = new Date().getFullYear();
    return payload.publication_year >= 1300 && payload.publication_year <= currentYear + 1;
  }
}
