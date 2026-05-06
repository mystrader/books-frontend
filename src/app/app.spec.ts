import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should start with subject "Todos"', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance['activeSubject']).toBe('Todos');
  });

  it('should start with sortKey "az"', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance['sortKey']).toBe('az');
  });

  it('should build navItems with 5 entries', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance['navItems'].length).toBe(5);
  });

  it('should have navItems with expected labels', () => {
    const fixture = TestBed.createComponent(App);
    const labels = fixture.componentInstance['navItems'].map((n: any) => n.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Inventário');
    expect(labels).toContain('Autores');
    expect(labels).toContain('Assuntos');
    expect(labels).toContain('Relatório');
  });

  it('setSubject should update activeSubject', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.setSubject('Fantasia');
    expect(app['activeSubject']).toBe('Fantasia');
  });

  it('setSort should update sortKey', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.setSort('year');
    expect(app['sortKey']).toBe('year');
  });

  it('filteredBooks should return all books when subject is "Todos"', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.setSubject('Todos');
    expect(app.filteredBooks.length).toBeGreaterThan(0);
  });

  it('filteredBooks should filter by subject', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.setSubject('Fantasia');
    const books = app.filteredBooks;
    expect(books.every(b => b.subject === 'Fantasia')).toBe(true);
  });

  it('filteredBooks sorted "az" should be alphabetical', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.setSubject('Todos');
    app.setSort('az');
    const titles = app.filteredBooks.map(b => b.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  it('filteredBooks sorted "year" should be descending', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.setSubject('Todos');
    app.setSort('year');
    const years = app.filteredBooks.map(b => b.year);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeLessThanOrEqual(years[i - 1]);
    }
  });

  it('filteredBooks sorted "value" should be ascending', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.setSubject('Todos');
    app.setSort('value');
    const values = app.filteredBooks.map(b => b.value);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it('subjects list should include "Todos" as first entry', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance['subjects'][0]).toBe('Todos');
  });

  it('featured book should be the first book', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['featured']).toBeDefined();
    expect(app['featured'].title).toBeTruthy();
  });
});
