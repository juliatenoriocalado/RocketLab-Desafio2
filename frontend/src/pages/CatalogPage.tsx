import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { createMovie, listMovies } from "../api";
import type { Movie, MovieFormValues } from "../types";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { MovieForm } from "../components/MovieForm";
import { Modal } from "../components/Modal";
import { useToast } from "../components/Toast";
import { buildMoviePayload } from "../utils/movieForm";

const LIMIT = 12;

export function CatalogPage() {
  const navigate = useNavigate();
  const { notify } = useToast();

  // Busca e página ficam na URL (?q=...&page=2).
  // Assim, ao voltar do detalhe, o catálogo reabre no mesmo lugar.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  // Debounce: espera a pessoa parar de digitar 400ms antes de buscar
  useEffect(() => {
    if (searchInput.trim() === search) return;

    const timer = setTimeout(() => {
      const params: Record<string, string> = {};
      if (searchInput.trim()) params.q = searchInput.trim();
      setSearchParams(params, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, search, setSearchParams]);

  useEffect(() => {
    // "ignore" evita que uma resposta antiga sobrescreva uma mais nova
    // (ex.: digitou "ba" e depois "bac"; a resposta de "ba" chega depois)
    let ignore = false;

    setLoading(true);
    setError("");

    listMovies(page, LIMIT, search)
      .then((data) => {
        if (!ignore) setMovies(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, search, reloadKey]);

  function goToPage(newPage: number) {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (newPage > 1) params.page = String(newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearSearch() {
    setSearchInput("");
    setSearchParams({});
  }

  async function handleCreate(values: MovieFormValues) {
    try {
      const created = await createMovie(buildMoviePayload(values));
      setShowCreate(false);
      notify(`"${created.titulo}" foi adicionado ao catálogo.`);
      navigate(`/filmes/${created.sk_movie_id}`);
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  // A API não devolve o total, então inferimos: veio menos que o limite = última página
  const isLastPage = movies.length < LIMIT;

  return (
    <>
      <section className="page-header">
        <div>
          <h1>Catálogo</h1>
          <p className="muted">
            Gerencie os filmes e acompanhe as avaliações.
          </p>
        </div>

        <button
          type="button"
          className="button button-primary"
          onClick={() => setShowCreate(true)}
        >
          + Adicionar filme
        </button>
      </section>

      <div className="search-bar" role="search">
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          placeholder="Buscar pelo título..."
          aria-label="Buscar filmes pelo título"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        {searchInput && (
          <button
            type="button"
            className="icon-button"
            onClick={clearSearch}
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      {search && !loading && !error && (
        <p className="result-info muted">
          {movies.length === 0
            ? `Nenhum resultado para "${search}"`
            : `Resultados para "${search}"`}
        </p>
      )}

      {error ? (
        <div className="empty-state">
          <p>{error}</p>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Tentar de novo
          </button>
        </div>
      ) : loading ? (
        <div className="movie-grid" aria-busy="true">
          {Array.from({ length: LIMIT }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          {page > 1 ? (
            <>
              <p>Não há mais filmes nesta página.</p>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => goToPage(1)}
              >
                Voltar para a primeira página
              </button>
            </>
          ) : search ? (
            <>
              <p>Nenhum filme encontrado com esse título.</p>
              <button type="button" className="button button-ghost" onClick={clearSearch}>
                Limpar busca
              </button>
            </>
          ) : (
            <>
              <p>O catálogo ainda está vazio.</p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setShowCreate(true)}
              >
                Cadastrar o primeiro filme
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.sk_movie_id} movie={movie} />
          ))}
        </div>
      )}

      {!error && !loading && movies.length > 0 && !(page === 1 && isLastPage) && (
        <nav className="pagination" aria-label="Paginação">
          <button
            type="button"
            className="button button-ghost"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
            ← Anterior
          </button>
          <span className="muted">Página {page}</span>
          <button
            type="button"
            className="button button-ghost"
            disabled={isLastPage}
            onClick={() => goToPage(page + 1)}
          >
            Próxima →
          </button>
        </nav>
      )}

      <Modal
        open={showCreate}
        title="Adicionar filme"
        onClose={() => setShowCreate(false)}
      >
        <MovieForm
          submitLabel="Cadastrar filme"
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>
    </>
  );
}
