import { Component } from '@angular/core';

import { BooksHomeContainer } from '../containers/books-home.container';

@Component({
  selector: 'app-books-home-page',
  standalone: true,
  imports: [BooksHomeContainer],
  template: `<app-books-home-container></app-books-home-container>`,
})
export class BooksHomePage {}
