import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Book } from '../../core/types/book.types';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="book-card">
      <div class="cover-wrap">
        <img
          [src]="book.thumbnail || fallbackCover"
          [alt]="book.title"
          width="240"
          height="360"
          loading="lazy"
        />
      </div>
      <h3>{{ book.title }}</h3>
      <p *ngIf="book.publication_year as year">{{ year }}</p>
    </article>
  `,
  styles: `
    .book-card {
      background: #fffef9;
      border: 1px solid rgba(69, 80, 74, 0.1);
      border-radius: 16px;
      padding: 14px;
      transition: transform 220ms ease, box-shadow 220ms ease;
      box-shadow: 0 8px 28px rgba(31, 45, 38, 0.08);
    }

    .book-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 32px rgba(31, 45, 38, 0.14);
    }

    .cover-wrap {
      aspect-ratio: 2/3;
      overflow: hidden;
      border-radius: 12px;
      background: #edf4ef;
      margin-bottom: 12px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #293630;
      line-height: 1.3;
    }

    p {
      margin: 6px 0 0;
      font-size: 0.85rem;
      color: #5f6e67;
    }
  `,
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;
  protected readonly fallbackCover =
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400';
}
