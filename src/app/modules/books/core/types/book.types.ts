export type Author = {
  id: number;
  name: string;
};

export type Subject = {
  id: number;
  name: string;
};

export type Book = {
  id: number;
  title: string;
  publication_year: number | null;
  author_ids: number[];
  subject_ids: number[];
  thumbnail?: string;
};

export type BookInput = {
  title: string;
  publication_year: number | null;
  author_ids: number[];
  subject_ids: number[];
};
