export type Autor = {
  cod_au: number;
  nome: string;
};

export type Assunto = {
  cod_as: number;
  descricao: string;
};

export type Livro = {
  codl: number;
  titulo: string;
  editora: string | null;
  edicao: number | null;
  ano_publicacao: string | null;
  valor: string | number;
  thumbnail: string | null;
  observacoes: string | null;
  autores?: Autor[];
  assuntos?: Assunto[];
};

export type LivroListMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type LivroPaginatedResponse = {
  data: Livro[];
  meta: LivroListMeta;
};

export type RelatorioGrupo = {
  autor_id: number;
  autor_nome: string;
  livros: {
    livro_id: number;
    titulo: string;
    editora: string | null;
    edicao: number | null;
    ano_publicacao: string | null;
    valor: string | number;
  }[];
};

export type RelatorioResponse = {
  fonte: string;
  grupos: RelatorioGrupo[];
  total_linhas: number;
};
