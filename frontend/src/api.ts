import type {
  Movie,
  MovieDetail,
  MoviePayload,
  Review,
  ReviewPayload,
} from "./types";

// A URL vem do .env do front (VITE_API_URL). Se não existir, usa o padrão local.
const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

const MOVIES_URL = `${BASE_URL}/movies/`;

// Erro com a mensagem que o FastAPI devolve no campo "detail"
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch só lança erro quando nem chega no servidor (API desligada, CORS...)
    throw new ApiError(
      "Não foi possível conectar à API. Verifique se o backend está rodando.",
      0
    );
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`;

    try {
      const body = await response.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        // Erro de validação do Pydantic (422)
        message = "Dados inválidos. Revise os campos do formulário.";
      }
    } catch {
      // resposta sem JSON, mantém a mensagem padrão
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function listMovies(page: number, limit: number, search: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.append("search", search.trim());
  }

  return request<Movie[]>(`${MOVIES_URL}?${params.toString()}`);
}

export function getMovie(movieId: string) {
  return request<MovieDetail>(`${MOVIES_URL}${movieId}`);
}

export function createMovie(data: MoviePayload) {
  return request<Movie>(MOVIES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMovie(movieId: string, data: MoviePayload) {
  return request<Movie>(`${MOVIES_URL}${movieId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteMovie(movieId: string) {
  return request<{ message: string }>(`${MOVIES_URL}${movieId}`, {
    method: "DELETE",
  });
}

export function createReview(movieId: string, data: ReviewPayload) {
  return request<Review>(`${MOVIES_URL}${movieId}/reviews`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
