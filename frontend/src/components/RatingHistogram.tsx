import { ratingDistribution } from "../utils/rating";

// Barrinhas com quantas avaliações cada nota recebeu (estilo Letterboxd)
export function RatingHistogram({ notas }: { notas: number[] }) {
  const counts = ratingDistribution(notas);
  const max = Math.max(...counts, 1);

  return (
    <div className="histogram" aria-label="Distribuição das notas">
      {counts.map((count, index) => (
        <div
          key={index}
          className="histogram-col"
          title={`${index + 1} ★: ${count} ${count === 1 ? "avaliação" : "avaliações"}`}
        >
          <div className="histogram-bar-area">
            <div
              className="histogram-bar"
              style={{ height: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="histogram-label">{index + 1}★</span>
        </div>
      ))}
    </div>
  );
}
