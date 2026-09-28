import { useEffect, useState } from "react";
import "./App.css";

type Review = {
  sk_movie_review_id: string;
  nome: string;
  nota: number;
  comentario: string;
  created_at: string;
};

type Movie = {
  sk_movie_id: string;
  id_filme: string;
  titulo: string;
  data_lancamento: string | null;
  ano_lancamento: number | null;
  url_poster: string | null;
  diretor: string | null;
  genero: string | null;
  media_avaliacoes: number | null;
};

type MovieDetail = Movie & {
  duracao_minutos: number | null;
  status_filme: string | null;
  sinopse: string | null;
  url_backdrop: string | null;
  reviews: Review[];
};

const API_URL = "http://127.0.0.1:8000/api/v1/movies/";
const LIMIT = 6;

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] =
    useState<MovieDetail | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // avaliação
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // cadastro
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");
  const [movieDirector, setMovieDirector] = useState("");
  const [movieYear, setMovieYear] = useState("");
  const [movieGenre, setMovieGenre] = useState("");
  const [movieSynopsis, setMovieSynopsis] = useState("");
  const [moviePoster, setMoviePoster] = useState("");

  // edição
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editSynopsis, setEditSynopsis] = useState("");
  const [editPoster, setEditPoster] = useState("");

  async function loadMovies() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(
        `${API_URL}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar filmes.");
      }

      const data: Movie[] = await response.json();
      setMovies(data);
    } catch (error) {
      console.error(error);
      setError("Não foi possível carregar o catálogo.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMovieDetail(movieId: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}${movieId}`);

      if (!response.ok) {
        throw new Error("Erro ao carregar detalhes.");
      }

      const data: MovieDetail = await response.json();
      setSelectedMovie(data);
    } catch (error) {
      console.error(error);
      setError("Não foi possível carregar os detalhes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedMovie) {
      loadMovies();
    }
  }, [page, search]);

  function handleSearch() {
    setPage(1);
    setSearch(searchInput);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function hasValidPoster(url: string | null) {
    return Boolean(
      url &&
        (url.startsWith("http://") ||
          url.startsWith("https://"))
    );
  }

  function starsFromTen(rating: number) {
    const value = rating / 2;
    const rounded = Math.round(value);

    return (
      "★".repeat(rounded) +
      "☆".repeat(5 - rounded)
    );
  }

  async function handleCreateReview() {
    if (!selectedMovie) return;

    try {
      const response = await fetch(
        `${API_URL}${selectedMovie.sk_movie_id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: reviewName.trim(),
            nota: reviewStars * 2,
            comentario: reviewComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao cadastrar avaliação.");
      }

      setReviewName("");
      setReviewStars(5);
      setReviewComment("");
      setShowReviewForm(false);

      await loadMovieDetail(selectedMovie.sk_movie_id);
    } catch (error) {
      console.error(error);
      setError("Não foi possível adicionar a avaliação.");
    }
  }

  async function handleCreateMovie() {
    if (!movieTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: movieTitle.trim(),
          diretor: movieDirector.trim() || null,
          ano_lancamento: movieYear
            ? Number(movieYear)
            : null,
          genero: movieGenre.trim() || null,
          sinopse: movieSynopsis.trim() || null,
          url_poster: moviePoster.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar filme.");
      }

      setMovieTitle("");
      setMovieDirector("");
      setMovieYear("");
      setMovieGenre("");
      setMovieSynopsis("");
      setMoviePoster("");
      setShowMovieForm(false);

      await loadMovies();
    } catch (error) {
      console.error(error);
      setError("Não foi possível cadastrar o filme.");
    }
  }

  function openEditForm() {
    if (!selectedMovie) return;

    setEditTitle(selectedMovie.titulo);
    setEditDirector(selectedMovie.diretor || "");
    setEditYear(
      selectedMovie.ano_lancamento
        ? String(selectedMovie.ano_lancamento)
        : ""
    );
    setEditGenre(selectedMovie.genero || "");
    setEditSynopsis(selectedMovie.sinopse || "");
    setEditPoster(selectedMovie.url_poster || "");

    setShowEditForm(true);
  }

  async function handleUpdateMovie() {
    if (!selectedMovie || !editTitle.trim()) return;

    try {
      const response = await fetch(
        `${API_URL}${selectedMovie.sk_movie_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: editTitle.trim(),
            diretor: editDirector.trim() || null,
            ano_lancamento: editYear
              ? Number(editYear)
              : null,
            genero: editGenre.trim() || null,
            sinopse: editSynopsis.trim() || null,
            url_poster: editPoster.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao editar filme.");
      }

      setShowEditForm(false);

      await loadMovieDetail(
        selectedMovie.sk_movie_id
      );
    } catch (error) {
      console.error(error);
      setError("Não foi possível editar o filme.");
    }
  }

  async function handleDeleteMovie() {
    if (!selectedMovie) return;

    const confirmed = window.confirm(
      `Deseja realmente excluir "${selectedMovie.titulo}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}${selectedMovie.sk_movie_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir filme.");
      }

      setSelectedMovie(null);
      setShowEditForm(false);
      setShowReviewForm(false);

      await loadMovies();
    } catch (error) {
      console.error(error);
      setError("Não foi possível excluir o filme.");
    }
  }

  if (selectedMovie) {
    return (
      <div className="app">
        <button
          className="back-button"
          onClick={() => {
            setSelectedMovie(null);
            setShowEditForm(false);
            setShowReviewForm(false);
          }}
        >
          ← Voltar ao catálogo
        </button>

        {error && (
          <p className="status">{error}</p>
        )}

        <main className="detail-page">
          <section className="detail-header">
            <div className="detail-poster">
              {hasValidPoster(
                selectedMovie.url_poster
              ) ? (
                <img
                  src={selectedMovie.url_poster!}
                  alt={`Pôster de ${selectedMovie.titulo}`}
                />
              ) : (
                <span>Sem pôster disponível</span>
              )}
            </div>

            <div className="detail-info">
              <span className="year">
                {selectedMovie.ano_lancamento ??
                  "Ano não informado"}
              </span>

              <h1>{selectedMovie.titulo}</h1>

              <p className="movie-metadata">
                {selectedMovie.genero ||
                  "Gênero não informado"}
              </p>

              <p className="movie-metadata">
                Diretor:{" "}
                {selectedMovie.diretor ||
                  "Não informado"}
              </p>

              <div className="rating">
                {selectedMovie.media_avaliacoes !== null ? (
                  <>
                    <span className="stars">
                      {starsFromTen(
                        selectedMovie.media_avaliacoes
                      )}
                    </span>

                    <span>
                      {(
                        selectedMovie.media_avaliacoes / 2
                      ).toFixed(1)}{" "}
                      / 5
                    </span>
                  </>
                ) : (
                  <span>Sem avaliações</span>
                )}
              </div>

              <p className="synopsis">
                {selectedMovie.sinopse ||
                  "Sinopse não informada."}
              </p>

              <div className="detail-actions">
                <button
                  className="secondary-button"
                  onClick={openEditForm}
                >
                  Editar
                </button>

                <button
                  className="danger-button"
                  onClick={handleDeleteMovie}
                >
                  Excluir
                </button>
              </div>
            </div>
          </section>

          {showEditForm && (
            <section className="movie-form">
              <h2>Editar filme</h2>

              <input
                type="text"
                placeholder="Título"
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(event.target.value)
                }
              />

              <input
                type="text"
                placeholder="Diretor"
                value={editDirector}
                onChange={(event) =>
                  setEditDirector(event.target.value)
                }
              />

              <input
                type="number"
                placeholder="Ano de lançamento"
                value={editYear}
                onChange={(event) =>
                  setEditYear(event.target.value)
                }
              />

              <input
                type="text"
                placeholder="Gênero"
                value={editGenre}
                onChange={(event) =>
                  setEditGenre(event.target.value)
                }
              />

              <textarea
                placeholder="Sinopse"
                value={editSynopsis}
                onChange={(event) =>
                  setEditSynopsis(event.target.value)
                }
              />

              <input
                type="text"
                placeholder="URL do pôster (opcional)"
                value={editPoster}
                onChange={(event) =>
                  setEditPoster(event.target.value)
                }
              />

              <div className="form-actions">
                <button
                  className="secondary-button"
                  onClick={() =>
                    setShowEditForm(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  className="primary-button"
                  onClick={handleUpdateMovie}
                >
                  Salvar alterações
                </button>
              </div>
            </section>
          )}

          <section className="reviews-section">
            <div className="section-title">
              <div>
                <h2>Avaliações</h2>

                <span className="review-count">
                  {selectedMovie.reviews.length}{" "}
                  {selectedMovie.reviews.length === 1
                    ? "avaliação"
                    : "avaliações"}
                </span>
              </div>

              <button
                className="primary-button"
                onClick={() =>
                  setShowReviewForm(
                    (current) => !current
                  )
                }
              >
                + Adicionar avaliação
              </button>
            </div>

            {showReviewForm && (
              <div className="review-form">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={reviewName}
                  onChange={(event) =>
                    setReviewName(event.target.value)
                  }
                />

                <label>
                  Nota
                  <select
                    value={reviewStars}
                    onChange={(event) =>
                      setReviewStars(
                        Number(event.target.value)
                      )
                    }
                  >
                    <option value={5}>
                      ★★★★★ — 5 estrelas
                    </option>
                    <option value={4}>
                      ★★★★☆ — 4 estrelas
                    </option>
                    <option value={3}>
                      ★★★☆☆ — 3 estrelas
                    </option>
                    <option value={2}>
                      ★★☆☆☆ — 2 estrelas
                    </option>
                    <option value={1}>
                      ★☆☆☆☆ — 1 estrela
                    </option>
                  </select>
                </label>

                <textarea
                  placeholder="Escreva sua resenha..."
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value
                    )
                  }
                />

                <div className="form-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      setShowReviewForm(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    className="primary-button"
                    onClick={handleCreateReview}
                    disabled={
                      !reviewName.trim() ||
                      !reviewComment.trim()
                    }
                  >
                    Publicar avaliação
                  </button>
                </div>
              </div>
            )}

            {selectedMovie.reviews.length === 0 ? (
              <p className="status">
                Este filme ainda não possui
                avaliações.
              </p>
            ) : (
              <div className="reviews-list">
                {selectedMovie.reviews.map(
                  (review) => (
                    <article
                      className="review-card"
                      key={
                        review.sk_movie_review_id
                      }
                    >
                      <div className="review-header">
                        <strong>{review.nome}</strong>

                        <div className="review-rating">
                          <span className="stars">
                            {starsFromTen(
                              review.nota
                            )}
                          </span>

                          <span>
                            {(review.nota / 2).toFixed(
                              1
                            )}{" "}
                            / 5
                          </span>
                        </div>
                      </div>

                      <p>{review.comentario}</p>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Catálogo de Filmes</h1>
          <p>
            Gerencie o catálogo e acompanhe as
            avaliações dos filmes.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowMovieForm(
              (current) => !current
            )
          }
        >
          + Adicionar filme
        </button>
      </header>

      <main>
        {showMovieForm && (
          <section className="movie-form">
            <h2>Adicionar filme</h2>

            <input
              type="text"
              placeholder="Título"
              value={movieTitle}
              onChange={(event) =>
                setMovieTitle(event.target.value)
              }
            />

            <input
              type="text"
              placeholder="Diretor"
              value={movieDirector}
              onChange={(event) =>
                setMovieDirector(event.target.value)
              }
            />

            <input
              type="number"
              placeholder="Ano de lançamento"
              value={movieYear}
              onChange={(event) =>
                setMovieYear(event.target.value)
              }
            />

            <input
              type="text"
              placeholder="Gênero"
              value={movieGenre}
              onChange={(event) =>
                setMovieGenre(event.target.value)
              }
            />

            <textarea
              placeholder="Sinopse"
              value={movieSynopsis}
              onChange={(event) =>
                setMovieSynopsis(
                  event.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="URL do pôster (opcional)"
              value={moviePoster}
              onChange={(event) =>
                setMoviePoster(event.target.value)
              }
            />

            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowMovieForm(false)
                }
              >
                Cancelar
              </button>

              <button
                className="primary-button"
                onClick={handleCreateMovie}
                disabled={!movieTitle.trim()}
              >
                Cadastrar filme
              </button>
            </div>
          </section>
        )}

        <section className="toolbar">
          <input
            type="text"
            placeholder="Buscar filme por título..."
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button onClick={handleSearch}>
            Buscar
          </button>

          {search && (
            <button onClick={handleClearSearch}>
              Limpar
            </button>
          )}
        </section>

        {loading && (
          <p className="status">Carregando...</p>
        )}

        {error && (
          <p className="status">{error}</p>
        )}

        {!loading &&
          !error &&
          movies.length > 0 && (
            <section className="movie-grid">
              {movies.map((movie) => (
                <article
                  className="movie-card"
                  key={movie.sk_movie_id}
                >
                  <div className="poster">
                    {hasValidPoster(
                      movie.url_poster
                    ) ? (
                      <img
                        src={movie.url_poster!}
                        alt={`Pôster de ${movie.titulo}`}
                      />
                    ) : (
                      <span>
                        Sem pôster disponível
                      </span>
                    )}
                  </div>

                  <div className="movie-info">
                    <span className="year">
                      {movie.ano_lancamento ||
                        "Ano não informado"}
                    </span>

                    <h2>{movie.titulo}</h2>

                    {(movie.diretor ||
                      movie.genero) && (
                      <p className="card-metadata">
                        {movie.diretor || ""}
                        {movie.diretor &&
                        movie.genero
                          ? " • "
                          : ""}
                        {movie.genero || ""}
                      </p>
                    )}

                    {movie.media_avaliacoes !==
                    null ? (
                      <div className="card-rating">
                        <span className="stars">
                          {starsFromTen(
                            movie.media_avaliacoes
                          )}
                        </span>

                        <span>
                          {(
                            movie.media_avaliacoes /
                            2
                          ).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <p className="no-rating">
                        Sem avaliações
                      </p>
                    )}

                    <button
                      className="details-button"
                      onClick={() =>
                        loadMovieDetail(
                          movie.sk_movie_id
                        )
                      }
                    >
                      Detalhes
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

        {!loading &&
          !error &&
          movies.length === 0 && (
            <p className="status">
              Nenhum filme encontrado.
            </p>
          )}

        {!loading &&
          !error &&
          movies.length > 0 && (
            <section className="pagination">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage(
                    (currentPage) =>
                      currentPage - 1
                  )
                }
              >
                ← Anterior
              </button>

              <span>Página {page}</span>

              <button
                disabled={
                  movies.length < LIMIT
                }
                onClick={() =>
                  setPage(
                    (currentPage) =>
                      currentPage + 1
                  )
                }
              >
                Próxima →
              </button>
            </section>
          )}
      </main>
    </div>
  );
}

export default App;