import type { MovieDetail, MovieFormValues, MoviePayload } from "../types";

export const EMPTY_MOVIE_FORM: MovieFormValues = {
  titulo: "",
  diretor: "",
  ano_lancamento: "",
  genero: "",
  sinopse: "",
  url_poster: "",
};

export function movieToFormValues(movie: MovieDetail): MovieFormValues {
  return {
    titulo: movie.titulo,
    diretor: movie.diretor ?? "",
    ano_lancamento: movie.ano_lancamento ? String(movie.ano_lancamento) : "",
    genero: movie.genero ?? "",
    sinopse: movie.sinopse ?? "",
    url_poster: movie.url_poster ?? "",
  };
}

// Converte os campos do formulário (strings) no formato que a API espera
export function buildMoviePayload(values: MovieFormValues): MoviePayload {
  return {
    titulo: values.titulo.trim(),
    diretor: values.diretor.trim() || null,
    ano_lancamento: values.ano_lancamento ? Number(values.ano_lancamento) : null,
    genero: values.genero.trim() || null,
    sinopse: values.sinopse.trim() || null,
    url_poster: values.url_poster.trim() || null,
  };
}

// Na edição, manda só o que mudou.
// Motivo: o backend trata "genero" como UM gênero só. Se o filme tem
// "Drama, Crime" e a gente reenviar isso sem mexer, ele cria um gênero
// novo chamado "Drama, Crime". Mandando só os campos alterados, o backend
// (que usa exclude_unset) preserva o que não foi tocado.
export function buildMovieUpdatePayload(
  values: MovieFormValues,
  initial: MovieFormValues
): MoviePayload {
  const full = buildMoviePayload(values);
  const payload: MoviePayload = {};

  if (values.titulo.trim() !== initial.titulo.trim()) payload.titulo = full.titulo;
  if (values.ano_lancamento !== initial.ano_lancamento) {
    payload.ano_lancamento = full.ano_lancamento;
  }
  if (values.sinopse.trim() !== initial.sinopse.trim()) payload.sinopse = full.sinopse;
  if (values.url_poster.trim() !== initial.url_poster.trim()) {
    payload.url_poster = full.url_poster;
  }

  // Para diretor e gênero o backend entende "" como "remover"
  // e null como "não mexer", então aqui mandamos string vazia.
  if (values.diretor.trim() !== initial.diretor.trim()) {
    payload.diretor = values.diretor.trim();
  }
  if (values.genero.trim() !== initial.genero.trim()) {
    payload.genero = values.genero.trim();
  }

  return payload;
}

export type MovieFormErrors = Partial<Record<keyof MovieFormValues, string>>;

export function validateMovieForm(
  values: MovieFormValues,
  initial: MovieFormValues = EMPTY_MOVIE_FORM
): MovieFormErrors {
  const errors: MovieFormErrors = {};
  const currentYear = new Date().getFullYear();
  const genreChanged = values.genero.trim() !== initial.genero.trim();

  if (!values.titulo.trim()) {
    errors.titulo = "Informe o título.";
  }

  if (values.ano_lancamento) {
    const year = Number(values.ano_lancamento);
    if (!Number.isInteger(year) || year < 1888 || year > currentYear + 5) {
      errors.ano_lancamento = `Use um ano entre 1888 e ${currentYear + 5}.`;
    }
  }

  // O backend salva um gênero por vez; só valida se o campo foi alterado
  if (genreChanged && values.genero.includes(",")) {
    errors.genero = "Informe apenas um gênero.";
  }

  const poster = values.url_poster.trim();
  if (poster && !poster.startsWith("http://") && !poster.startsWith("https://")) {
    errors.url_poster = "A URL precisa começar com http:// ou https://";
  }

  return errors;
}
