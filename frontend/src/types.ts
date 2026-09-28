// Tipos que espelham os schemas do backend (app/movies/schemas.py)

export type Review = {
  sk_movie_review_id: string;
  nome: string;
  nota: number; // escala do banco: 0 a 10
  comentario: string;
  created_at: string;
};

export type Movie = {
  sk_movie_id: string;
  id_filme: string;
  titulo: string;
  data_lancamento: string | null;
  ano_lancamento: number | null;
  url_poster: string | null;
  diretor: string | null;
  genero: string | null;
  media_avaliacoes: number | null; // escala 0 a 10
};

export type MovieDetail = Movie & {
  duracao_minutos: number | null;
  status_filme: string | null;
  sinopse: string | null;
  url_backdrop: string | null;
  reviews: Review[];
};

// Campos que o formulário de filme edita (tudo string, porque vem de input)
export type MovieFormValues = {
  titulo: string;
  diretor: string;
  ano_lancamento: string;
  genero: string;
  sinopse: string;
  url_poster: string;
};

export type MoviePayload = {
  titulo?: string;
  diretor?: string | null;
  ano_lancamento?: number | null;
  genero?: string | null;
  sinopse?: string | null;
  url_poster?: string | null;
};

export type ReviewPayload = {
  nome: string;
  nota: number;
  comentario: string;
};
