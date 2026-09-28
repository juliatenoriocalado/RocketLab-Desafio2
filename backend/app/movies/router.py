from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.movies.models import (
    DimGenre,
    DimMovie,
    DimPerson,
    MovieReview,
)
from app.movies.schemas import (
    MovieCreate,
    MovieDetail,
    MovieListItem,
    MovieUpdate,
    ReviewCreate,
    ReviewItem,
)

router = APIRouter()


def movie_to_list_item(movie: DimMovie):
    diretor = next(
        (
            person.nome_pessoa
            for person in movie.people
            if person.tipo_pessoa == "Diretor"
        ),
        None,
    )

    genero = ", ".join(
        genre.nome_genero for genre in movie.genres
    ) or None

    media = None

    if movie.reviews:
        media = sum(review.nota for review in movie.reviews) / len(
            movie.reviews
        )

    return {
        "sk_movie_id": movie.sk_movie_id,
        "id_filme": movie.id_filme,
        "titulo": movie.titulo,
        "data_lancamento": movie.data_lancamento,
        "ano_lancamento": movie.ano_lancamento,
        "url_poster": movie.url_poster,
        "diretor": diretor,
        "genero": genero,
        "media_avaliacoes": media,
    }


async def get_or_create_genre(
    nome: str,
    db: AsyncSession,
):
    nome = nome.strip()

    result = await db.execute(
        select(DimGenre).where(
            DimGenre.nome_genero == nome
        )
    )

    genre = result.scalar_one_or_none()

    if genre is None:
        genre = DimGenre(nome_genero=nome)
        db.add(genre)

    return genre


async def get_or_create_director(
    nome: str,
    db: AsyncSession,
):
    nome = nome.strip()

    result = await db.execute(
        select(DimPerson).where(
            DimPerson.nome_pessoa == nome,
            DimPerson.tipo_pessoa == "Diretor",
        )
    )

    director = result.scalar_one_or_none()

    if director is None:
        director = DimPerson(
            nome_pessoa=nome,
            tipo_pessoa="Diretor",
        )
        db.add(director)

    return director


@router.get("/", response_model=list[MovieListItem])
async def list_movies(
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(DimMovie).options(
        selectinload(DimMovie.genres),
        selectinload(DimMovie.people),
        selectinload(DimMovie.reviews),
    )

    if search:
        query = query.where(
            DimMovie.titulo.ilike(f"%{search}%")
        )

    offset = (page - 1) * limit

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    movies = result.scalars().all()

    return [
        movie_to_list_item(movie)
        for movie in movies
    ]

@router.post("/", response_model=MovieListItem)
async def create_movie(
    movie_data: MovieCreate,
    db: AsyncSession = Depends(get_db),
):
    movie = DimMovie(
        id_filme=str(uuid4()),
        titulo=movie_data.titulo,
        ano_lancamento=movie_data.ano_lancamento,
        sinopse=movie_data.sinopse,
        url_poster=movie_data.url_poster,
    )

    db.add(movie)

    if movie_data.genero:
        genre = await get_or_create_genre(
            movie_data.genero,
            db,
        )
        movie.genres.append(genre)

    if movie_data.diretor:
        director = await get_or_create_director(
            movie_data.diretor,
            db,
        )
        movie.people.append(director)

    await db.commit()

    # Busca novamente já carregando os relacionamentos
    result = await db.execute(
        select(DimMovie)
        .options(
            selectinload(DimMovie.genres),
            selectinload(DimMovie.people),
            selectinload(DimMovie.reviews),
        )
        .where(DimMovie.sk_movie_id == movie.sk_movie_id)
    )

    created_movie = result.scalar_one()

    return movie_to_list_item(created_movie)

@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movie(
    movie_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DimMovie)
        .options(
            selectinload(DimMovie.reviews),
            selectinload(DimMovie.genres),
            selectinload(DimMovie.people),
        )
        .where(DimMovie.sk_movie_id == movie_id)
    )

    movie = result.scalar_one_or_none()

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Filme não encontrado",
        )

    diretor = next(
        (
            person.nome_pessoa
            for person in movie.people
            if person.tipo_pessoa == "Diretor"
        ),
        None,
    )

    genero = ", ".join(
        genre.nome_genero for genre in movie.genres
    ) or None

    media = None

    if movie.reviews:
        media = sum(
            review.nota for review in movie.reviews
        ) / len(movie.reviews)

    return {
        "sk_movie_id": movie.sk_movie_id,
        "id_filme": movie.id_filme,
        "titulo": movie.titulo,
        "data_lancamento": movie.data_lancamento,
        "ano_lancamento": movie.ano_lancamento,
        "duracao_minutos": movie.duracao_minutos,
        "status_filme": movie.status_filme,
        "sinopse": movie.sinopse,
        "url_poster": movie.url_poster,
        "url_backdrop": movie.url_backdrop,
        "diretor": diretor,
        "genero": genero,
        "reviews": movie.reviews,
        "media_avaliacoes": media,
    }


@router.put("/{movie_id}", response_model=MovieListItem)
async def update_movie(
    movie_id: str,
    movie_data: MovieUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DimMovie)
        .options(
            selectinload(DimMovie.genres),
            selectinload(DimMovie.people),
            selectinload(DimMovie.reviews),
        )
        .where(DimMovie.sk_movie_id == movie_id)
    )

    movie = result.scalar_one_or_none()

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Filme não encontrado",
        )

    update_data = movie_data.model_dump(
        exclude_unset=True
    )

    diretor = update_data.pop("diretor", None)
    genero = update_data.pop("genero", None)

    for field, value in update_data.items():
        setattr(movie, field, value)

    if movie_data.diretor is not None:
        movie.people = [
            person
            for person in movie.people
            if person.tipo_pessoa != "Diretor"
        ]

        if diretor and diretor.strip():
            director = await get_or_create_director(
                diretor,
                db,
            )
            movie.people.append(director)

    if movie_data.genero is not None:
        movie.genres = []

        if genero and genero.strip():
            genre = await get_or_create_genre(
                genero,
                db,
            )
            movie.genres.append(genre)

    await db.commit()

    return movie_to_list_item(movie)


@router.delete("/{movie_id}")
async def delete_movie(
    movie_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DimMovie).where(
            DimMovie.sk_movie_id == movie_id
        )
    )

    movie = result.scalar_one_or_none()

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Filme não encontrado",
        )

    await db.delete(movie)
    await db.commit()

    return {
        "message": "Filme removido com sucesso"
    }


@router.post(
    "/{movie_id}/reviews",
    response_model=ReviewItem,
)
async def create_review(
    movie_id: str,
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DimMovie).where(
            DimMovie.sk_movie_id == movie_id
        )
    )

    movie = result.scalar_one_or_none()

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Filme não encontrado",
        )

    review = MovieReview(
        sk_movie_id=movie_id,
        nome=review_data.nome,
        nota=review_data.nota,
        comentario=review_data.comentario,
    )

    db.add(review)

    await db.commit()
    await db.refresh(review)

    return review