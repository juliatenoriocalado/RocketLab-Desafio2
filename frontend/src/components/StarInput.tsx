import { useState } from "react";

type StarInputProps = {
  value: number; // 1 a 5
  onChange: (value: number) => void;
};

const LABELS = ["Ruim", "Fraco", "Bom", "Muito bom", "Excelente"];

// Radios nativos por baixo: teclado (setas) e leitor de tela funcionam sozinhos
export function StarInput({ value, onChange }: StarInputProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset className="star-input">
      <legend>Nota</legend>

      <div
        className="star-input-row"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            className={star <= shown ? "star-option active" : "star-option"}
            onMouseEnter={() => setHover(star)}
          >
            <input
              type="radio"
              name="nota"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
            />
            <span aria-hidden="true">★</span>
            <span className="sr-only">
              {star} {star === 1 ? "estrela" : "estrelas"}
            </span>
          </label>
        ))}

        <span className="star-input-label">{LABELS[shown - 1]}</span>
      </div>
    </fieldset>
  );
}
