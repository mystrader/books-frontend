import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

type Book   = { title: string; author: string; subject: string; cover: string; year: number; value: number; };
type NavItem = { label: string; svg: SafeHtml; };
type SortKey = 'az' | 'year' | 'value';

const NAV_ICONS: Record<string, string> = {
  dash:  `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  inv:   `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  users: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  tag:   `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  chart: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
};

const ALL_BOOKS: Book[] = [
  { title: 'A Biblioteca da Meia-Noite', author: 'Matt Haig',          subject: 'Ficção',      cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80', year: 2020, value: 59 },
  { title: 'O Nome do Vento',            author: 'Patrick Rothfuss',   subject: 'Fantasia',    cover: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=400&q=80', year: 2007, value: 74 },
  { title: 'Pequenos Incêndios',         author: 'Celeste Ng',         subject: 'Ficção',      cover: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80', year: 2017, value: 52 },
  { title: 'Project Hail Mary',          author: 'Andy Weir',          subject: 'Ciência',     cover: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=400&q=80', year: 2021, value: 68 },
  { title: 'Dune',                       author: 'Frank Herbert',      subject: 'Ciência',     cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80', year: 1965, value: 65 },
  { title: 'O Hobbit',                   author: 'J.R.R. Tolkien',     subject: 'Fantasia',    cover: 'https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?auto=format&fit=crop&w=400&q=80', year: 1937, value: 48 },
  { title: 'Sapiens',                    author: 'Yuval Noah Harari',  subject: 'História',    cover: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80', year: 2011, value: 55 },
  { title: 'Clean Code',                 author: 'Robert C. Martin',   subject: 'Tecnologia',  cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=400&q=80', year: 2008, value: 88 },
];

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild('carouselEl') carouselEl!: ElementRef<HTMLElement>;

  protected activeNav   = 0;
  protected activeSubject = 'Todos';
  protected sortKey: SortKey = 'az';
  protected readonly featured   = ALL_BOOKS[0];
  protected readonly subjects   = ['Todos', ...Array.from(new Set(ALL_BOOKS.map(b => b.subject)))];
  protected readonly navItems: NavItem[];

  constructor(private sanitizer: DomSanitizer) {
    const raw = [
      { label: 'Dashboard',  key: 'dash'  },
      { label: 'Inventário', key: 'inv'   },
      { label: 'Autores',    key: 'users' },
      { label: 'Assuntos',   key: 'tag'   },
      { label: 'Relatório',  key: 'chart' },
    ];
    this.navItems = raw.map(n => ({
      label: n.label,
      svg: this.sanitizer.bypassSecurityTrustHtml(NAV_ICONS[n.key])
    }));
  }

  setSubject(s: string) { this.activeSubject = s; }
  setSort(k: SortKey)   { this.sortKey = k; }

  scrollCarousel(dir: -1 | 1) {
    this.carouselEl?.nativeElement.scrollBy({ left: dir * 220, behavior: 'smooth' });
  }

  get filteredBooks(): Book[] {
    let list = this.activeSubject === 'Todos'
      ? ALL_BOOKS
      : ALL_BOOKS.filter(b => b.subject === this.activeSubject);
    if (this.sortKey === 'az')    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (this.sortKey === 'year')  list = [...list].sort((a, b) => b.year - a.year);
    if (this.sortKey === 'value') list = [...list].sort((a, b) => a.value - b.value);
    return list;
  }
}
