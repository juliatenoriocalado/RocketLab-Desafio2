import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ApiError, createReview, deleteMovie, getMovie, updateMovie } from "../api";
import type { MovieDetail, MovieFormValues, ReviewPayload } from "../types";
import { Poster } from "../components/Poster";
import { Stars } from "../components/Stars";
import { Modal } from "../components/Modal";
import { MovieForm } from "../components/MovieForm";
import { ReviewForm } from "../components/ReviewForm";
import { ReviewCard } from "../components/ReviewCard";
import { RatingHistogram } from "../components/RatingHistogram";
import { useToast } from "../components/Toast";
import { formatRating } from "../utils/rating";
import { formatDuration, isValidUrl, splitGenres } from "../utils/format";
import { buildMovieUpdatePayload, movieToFormValues } from "../utils/movieForm";

type OpenModal = "edit" | "delete" | "review" | null;

export function MovieDetailPage() {
  const { movieId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(
    null
  );
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    getMovie(movieId)
      .then((data) => {
        if (!ignore) setMovie(data);
      })
      .catch((err: ApiError) => {
        if (!ignore) setError({ message: err.message, notFound: err.status === 404 });
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [movieId]);

  // Recarrega o filme depois de editar/avaliar, sem mostrar o loading de novo
  async function refresh() {
    const data = await getMovie(movieId);
    setMovie(data);
  }

  // Se veio do catálogo, volta pra ele com a mesma busca/página.
  // Se abriu o link direto (key "default"), não há histórico: vai para "/".
  function goBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  }

  async function handleUpdate(values: MovieFormValues) {
    if (!movie) return;

    const payload = buildMovieUpdatePayload(values, movieToFormValues(movie));

    if (Object.keys(payload).length === 0) {
      setOpenModal(null);
      return;
    }

    try {
      await updateMovie(movie.sk_movie_id, payload);
      await refresh();
      setOpenModal(null);
      notify("Filme atualizado.");
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  async function handleDelete() {
    if (!movie) return;

    setDeleting(true);
    try {
      await deleteMovie(movie.sk_movie_id);
      notify(`"${movie.titulo}" foi removido do catálogo.`);
      navigate("/", { replace: true });
    } catch (err) {
      notify((err as Error).message, "error");
      setDeleting(false);
    }
  }

  async function handleReview(data: ReviewPayload) {
    if (!movie) return;

    try {
      await createReview(movie.sk_movie_id, data);
      await refresh();
      setOpenModal(null);
      notify("Avaliação publicada.");
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  if (loading) {
    return (
      <div className="detail-loading" aria-busy="true">
        <div className="poster skeleton detail-poster" />
        <div className="detail-loading-lines">
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="empty-state">
        <p>{error?.notFound ? "Filme não encontrado." : error?.message}</p>
        <Link to="/" className="button button-ghost">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const genres = splitGenres(movie.genero);
  // A API devolve as avaliações da mais antiga para a mais nova; invertemos
  const reviews = [...movie.reviews].reverse();
  const hasBackdrop = movie.url_backdrop && isValidUrl(movie.url_backdrop);

  return (
    <>
      {hasBackdrop && (
        <div
          className="backdrop"
          style={{ backgroundImage: `url("${movie.url_backdrop}")` }}
          aria-hidden="true"
        />
      )}

      <button type="button" className="back-link" onClick={goBack}>
        ← Voltar
      </button>

      <section className="detail-header">
        <Poster url={movie.url_poster} title={movie.titulo} className="detail-poster" />

        <div className="detail-info">
          <h1>
            {movie.titulo}{" "}
            {movie.ano_lancamento && (
              <span className="detail-year">{movie.ano_lancamento}</span>
            )}
          </h1>

          <p className="detail-meta">
            {movie.diretor ? (
              <>
                Dirigido por <strong>{movie.diretor}</strong>
              </>
            ) : (
              <span className="muted">Diretor não informado</span>
            )}
            {movie.duracao_minutos ? ` · ${formatDuration(movie.duracao_minutos)}` : ""}
            {movie.status_filme ? ` · ${movie.status_filme}` : ""}
          </p>

          {genres.length > 0 && (
            <ul className="chips">
              {genres.map((genre) => (
                <li key={genre} className="chip">
                  {genre}
                </li>
              ))}
            </ul>
          )}

          <p className="synopsis">
            {movie.sinopse || <span className="muted">Sinopse não informada.</span>}
          </p>

          <div className="detail-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setOpenModal("edit")}
            >
              Editar
            </button>
            <button
              type="button"
              className="button button-danger"
              onClick={() => setOpenModal("delete")}
            >
              Excluir
            </button>
          </div>
        </div>

        <aside className="rating-panel">
          <span className="rating-panel-label">Média geral</span>

          {movie.media_avaliacoes !== null ? (
            <>
              <strong className="rating-panel-value">
                {formatRating(movie.media_avaliacoes)}
              </strong>
              <Stars nota={movie.media_avaliacoes} size="lg" />
              <span className="muted">
                {movie.reviews.length}{" "}
                {movie.reviews.length === 1 ? "avaliação" : "avaliações"}
              </span>
              <RatingHistogram notas={movie.reviews.map((review) => review.nota)} />
            </>
          ) : (
            <span className="muted">Ainda sem avaliações</span>
          )}

          <button
            type="button"
            className="button button-primary button-block"
            onClick={() => setOpenModal("review")}
          >
            ★ Avaliar filme
          </button>
        </aside>
      </section>

      <section className="reviews-section">
        <h2>
          Avaliações <span className="muted">({movie.reviews.length})</span>
        </h2>

        {reviews.length === 0 ? (
          <div className="empty-state compact">
            <p>Ninguém avaliou este filme ainda.</p>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setOpenModal("review")}
            >
              Escrever a primeira avaliação
            </button>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={review.sk_movie_review_id} review={review} />
            ))}
          </div>
        )}
      </section>

      <Modal open={openModal === "edit"} title="Editar filme" onClose={() => setOpenModal(null)}>
        <MovieForm
          initialValues={movieToFormValues(movie)}
          submitLabel="Salvar alterações"
          onSubmit={handleUpdate}
          onCancel={() => setOpenModal(null)}
        />
      </Modal>

      <Modal
        open={openModal === "review"}
        title={`Avaliar "${movie.titulo}"`}
        onClose={() => setOpenModal(null)}
      >
        <ReviewForm onSubmit={handleReview} onCancel={() => setOpenModal(null)} />
      </Modal>

      <Modal
        open={openModal === "delete"}
        title="Excluir filme"
        size="sm"
        onClose={() => setOpenModal(null)}
      >
        <p>
          Tem certeza que deseja excluir <strong>{movie.titulo}</strong>?
          {movie.reviews.length === 1 && " A avaliação dele também será apagada."}
          {movie.reviews.length > 1 &&
            ` As ${movie.reviews.length} avaliações dele também serão apagadas.`}{" "}
          Essa ação não pode ser desfeita.
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setOpenModal(null)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="button button-danger-solid"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </Modal>
    </>
  );
}
