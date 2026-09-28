import type { Review } from "../types";
import { Stars } from "./Stars";
import { formatDate } from "../utils/format";

export function ReviewCard({ review }: { review: Review }) {
  const initial = review.nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <article className="review-card">
      <div className="review-avatar" aria-hidden="true">
        {initial}
      </div>

      <div className="review-body">
        <header className="review-header">
          <strong>{review.nome}</strong>
          <Stars nota={review.nota} size="sm" />
          <time className="muted" dateTime={review.created_at}>
            {formatDate(review.created_at)}
          </time>
        </header>

        <p>{review.comentario}</p>
      </div>
    </article>
  );
}
