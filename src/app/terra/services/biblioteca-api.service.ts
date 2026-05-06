import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Assunto,
  Autor,
  Livro,
  LivroPaginatedResponse,
  RelatorioResponse,
} from '../types/biblioteca.types';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class BibliotecaApiService {
  private readonly http = inject(HttpClient);

  listLivrosAll(): Observable<Livro[]> {
    return this.http.get<Livro[]>(`${API}/livros`, { params: { all: '1' } });
  }

  listLivrosPage(page: number, perPage = 18): Observable<LivroPaginatedResponse> {
    return this.http.get<LivroPaginatedResponse>(`${API}/livros`, {
      params: { page: String(page), per_page: String(perPage) },
    });
  }

  getLivro(codl: number): Observable<Livro> {
    return this.http.get<Livro>(`${API}/livros/${codl}`);
  }

  createLivro(body: Record<string, unknown>): Observable<Livro> {
    return this.http.post<Livro>(`${API}/livros`, body);
  }

  updateLivro(codl: number, body: Record<string, unknown>): Observable<Livro> {
    return this.http.put<Livro>(`${API}/livros/${codl}`, body);
  }

  deleteLivro(codl: number): Observable<void> {
    return this.http.delete<void>(`${API}/livros/${codl}`);
  }

  listAutores(): Observable<Autor[]> {
    return this.http.get<Autor[]>(`${API}/autores`);
  }

  createAutor(nome: string): Observable<Autor> {
    return this.http.post<Autor>(`${API}/autores`, { nome });
  }

  updateAutor(codAu: number, nome: string): Observable<Autor> {
    return this.http.put<Autor>(`${API}/autores/${codAu}`, { nome });
  }

  deleteAutor(codAu: number): Observable<void> {
    return this.http.delete<void>(`${API}/autores/${codAu}`);
  }

  listAssuntos(): Observable<Assunto[]> {
    return this.http.get<Assunto[]>(`${API}/assuntos`);
  }

  createAssunto(descricao: string): Observable<Assunto> {
    return this.http.post<Assunto>(`${API}/assuntos`, { descricao });
  }

  updateAssunto(codAs: number, descricao: string): Observable<Assunto> {
    return this.http.put<Assunto>(`${API}/assuntos/${codAs}`, { descricao });
  }

  deleteAssunto(codAs: number): Observable<void> {
    return this.http.delete<void>(`${API}/assuntos/${codAs}`);
  }

  relatorioLivrosPorAutor(): Observable<RelatorioResponse> {
    return this.http.get<RelatorioResponse>(`${API}/relatorios/livros-por-autor`);
  }
}
