from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    nome: str
    nota: float = Field(ge=0, le=10)
    comentario: str


class ReviewItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sk_movie_review_id: str
    nome: str
    nota: float
    comentario: str
    created_at: datetime


class MovieListItem(BaseModel):
    sk_movie_id: str
    id_filme: str
    titulo: str
    data_lancamento: date | None
    ano_lancamento: int | None
    url_poster: str | None

    diretor: str | None = None
    genero: str | None = None
    media_avaliacoes: float | None = None


class MovieCreate(BaseModel):
    titulo: str
    diretor: str | None = None
    ano_lancamento: int | None = None
    genero: str | None = None
    sinopse: str | None = None
    url_poster: str | None = None


class MovieUpdate(BaseModel):
    titulo: str | None = None
    diretor: str | None = None
    ano_lancamento: int | None = None
    genero: str | None = None
    sinopse: str | None = None
    url_poster: str | None = None


class MovieDetail(BaseModel):
    sk_movie_id: str
    id_filme: str
    titulo: str
    data_lancamento: date | None
    ano_lancamento: int | None
    duracao_minutos: int | None
    status_filme: str | None
    sinopse: str | None
    url_poster: str | None
    url_backdrop: str | None

    diretor: str | None = None
    genero: str | None = None

    reviews: list[ReviewItem] = Field(default_factory=list)
    media_avaliacoes: float | None = None