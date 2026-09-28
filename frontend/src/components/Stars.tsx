import { roundToHalf, toFiveScale } from "../utils/rating";

type StarsProps = {
  nota: number; // escala 0 a 10, como vem da API
  size?: "sm" | "md" | "lg";
};

// Mostra 5 estrelas com preenchimento proporcional (aceita meia estrela)
export function Stars({ nota, size = "md" }: StarsProps) {
  const value = roundToHalf(toFiveScale(nota));
  const percent = (value / 5) * 100;

  return (
    <span
      className={`stars stars-${size}`}
      style={{ "--fill": `${percent}%` } as React.CSSProperties}
      role="img"
      aria-label={`${value.toString().replace(".", ",")} de 5 estrelas`}
    >
      ★★★★★
    </span>
  );
}
