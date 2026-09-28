import { useState } from "react";
import type { MovieFormValues } from "../types";
import { Poster } from "./Poster";
import {
  EMPTY_MOVIE_FORM,
  validateMovieForm,
  type MovieFormErrors,
} from "../utils/movieForm";

type MovieFormProps = {
  initialValues?: MovieFormValues;
  submitLabel: string;
  onSubmit: (values: MovieFormValues) => Promise<void>;
  onCancel: () => void;
};

// Mesmo formulário para cadastrar e editar (antes eram dois blocos duplicados)
export function MovieForm({
  initialValues = EMPTY_MOVIE_FORM,
  submitLabel,
  onSubmit,
  onCancel,
}: MovieFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<MovieFormErrors>({});
  const [saving, setSaving] = useState(false);

  function updateField(field: keyof MovieFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // limpa o erro do campo assim que a pessoa começa a corrigir
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validateMovieForm(values, initialValues);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-with-preview">
        <div className="form-fields">
          <Field label="Título *" error={errors.titulo}>
            <input
              type="text"
              value={values.titulo}
              onChange={(event) => updateField("titulo", event.target.value)}
              autoFocus
              maxLength={500}
            />
          </Field>

          <div className="form-row">
            <Field label="Diretor" error={errors.diretor}>
              <input
                type="text"
                value={values.diretor}
                onChange={(event) => updateField("diretor", event.target.value)}
                maxLength={255}
              />
            </Field>

            <Field label="Ano" error={errors.ano_lancamento} small>
              <input
                type="number"
                inputMode="numeric"
                value={values.ano_lancamento}
                onChange={(event) =>
                  updateField("ano_lancamento", event.target.value)
                }
              />
            </Field>
          </div>

          <Field label="Gênero" error={errors.genero}>
            <input
              type="text"
              placeholder="Ex.: Drama"
              value={values.genero}
              onChange={(event) => updateField("genero", event.target.value)}
              maxLength={50}
            />
          </Field>

          <Field label="URL do pôster" error={errors.url_poster}>
            <input
              type="url"
              placeholder="https://..."
              value={values.url_poster}
              onChange={(event) => updateField("url_poster", event.target.value)}
            />
          </Field>
        </div>

        <div className="form-preview" aria-hidden="true">
          <Poster
            url={values.url_poster.trim() || null}
            title={values.titulo.trim() || "Seu filme"}
          />
        </div>
      </div>

      <Field label="Sinopse" error={errors.sinopse}>
        <textarea
          value={values.sinopse}
          onChange={(event) => updateField("sinopse", event.target.value)}
          maxLength={4000}
          rows={4}
        />
      </Field>

      <div className="form-actions">
        <button type="button" className="button button-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  small?: boolean;
  children: React.ReactNode;
};

function Field({ label, error, small, children }: FieldProps) {
  return (
    <label className={small ? "field field-small" : "field"}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
