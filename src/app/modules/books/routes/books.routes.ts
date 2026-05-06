import { Routes } from '@angular/router';

import { BooksHomePage } from '../presentation/pages/books-home.page';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    component: BooksHomePage,
  },
];
