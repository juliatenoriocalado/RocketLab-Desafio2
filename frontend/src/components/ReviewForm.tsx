import { useState } from "react";
import { StarInput } from "./StarInput";
import type { ReviewPayload } from "../types";
import { toTenScale } from "../utils/rating";

type ReviewFormProps = {
  onSubmit: (data: ReviewPayload) => Promise<void>;
  onCancel: () => void;
};

export function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const [nome, setNome] = useState("");
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = nome.trim() && estrelas > 0 && comentario.trim() && !saving;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        nota: toTenScale(estrelas), // 1-5 estrelas -> 2-10 no banco
        comentario: comentario.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <StarInput value={estrelas} onChange={setEstrelas} />

      <label className="field">
        <span className="field-label">Nome</span>
        <input
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          maxLength={120}
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field-label">Resenha</span>
        <textarea
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
          placeholder="O que você achou do filme?"
          maxLength={4000}
          rows={5}
        />
        <span className="field-hint">{comentario.length}/4000</span>
      </label>

      <div className="form-actions">
        <button type="button" className="button button-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="button button-primary" disabled={!canSubmit}>
          {saving ? "Publicando..." : "Publicar avaliação"}
        </button>
      </div>
    </form>
  );
}
