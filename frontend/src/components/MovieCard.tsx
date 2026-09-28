import { Link } from "react-router";
import type { Movie } from "../types";
import { Poster } from "./Poster";
import { Stars } from "./Stars";
import { formatRating } from "../utils/rating";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    // O card inteiro é um link: dá pra abrir em nova aba e navegar com Tab
    <Link to={`/filmes/${movie.sk_movie_id}`} className="movie-card">
      <Poster url={movie.url_poster} title={movie.titulo} />

      <div className="movie-card-info">
        <h3>{movie.titulo}</h3>

        <p className="movie-card-meta">
          {[movie.ano_lancamento, movie.diretor].filter(Boolean).join(" · ") ||
            "Sem informações"}
        </p>

        {movie.media_avaliacoes !== null ? (
          <p className="movie-card-rating">
            <Stars nota={movie.media_avaliacoes} size="sm" />
            <span>{formatRating(movie.media_avaliacoes)}</span>
          </p>
        ) : (
          <p className="movie-card-rating muted">Sem avaliações</p>
        )}
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="movie-card skeleton-card" aria-hidden="true">
      <div className="poster skeleton" />
      <div className="movie-card-info">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  );
}
