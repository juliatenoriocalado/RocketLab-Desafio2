# Sistema de Avaliação de Filmes

Projeto desenvolvido para a Atividade DEV do Visagio Rocket Lab 2026.

A aplicação consiste em um sistema de avaliação de filmes em que o usuário administrador pode gerenciar o catálogo, consultar os detalhes dos filmes, visualizar avaliações já realizadas e adicionar novas notas e resenhas.

## Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Vite

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic

### Banco de dados

- SQLite

## Funcionalidades

A aplicação permite:

- cadastrar novos filmes;
- editar filmes existentes;
- excluir filmes;
- visualizar um catálogo paginado;
- pesquisar filmes por título;
- acessar os detalhes de cada filme;
- cadastrar informações como título, diretor, gênero, ano de lançamento e sinopse;
- visualizar o histórico de avaliações de cada filme;
- adicionar novas avaliações e resenhas;
- calcular e exibir a média das avaliações;
- apresentar as notas na interface em uma escala de 1 a 5 estrelas;
- utilizar a aplicação em diferentes tamanhos de tela através de uma interface responsiva.

## Estrutura do projeto

```text
RocketLab-Desafio2/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   └── movies/
│   │       ├── models.py
│   │       ├── router.py
│   │       └── schemas.py
│   │
│   ├── alembic/
│   ├── alembic.ini
│   └── pyproject.toml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Python;
- Node.js;
- npm;
- Git.

## Como executar o projeto

O backend e o frontend devem ser executados em terminais separados.

### 1. Backend

Entre na pasta do backend:

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

No Windows, ative o ambiente virtual:

```powershell
.\.venv\Scripts\Activate.ps1
```

Crie o arquivo `.env` a partir do arquivo de exemplo:

```powershell
Copy-Item .env.example .env
```

Instale as dependências:

```bash
pip install -e ".[dev]"
```

Caso seja necessário instalar o suporte assíncrono utilizado pelo SQLAlchemy:

```bash
pip install "sqlalchemy[asyncio]"
```

Execute as migrações do banco de dados:

```bash
alembic upgrade head
```

Inicie a API:

```bash
uvicorn app.main:app --reload
```

O backend ficará disponível em:

```text
http://127.0.0.1:8000
```

A documentação automática do FastAPI pode ser acessada em:

```text
http://127.0.0.1:8000/docs
```

### 2. Frontend

Abra outro terminal e, a partir da raiz do projeto, entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Fluxo da aplicação

Na tela principal, o administrador pode visualizar os filmes cadastrados e navegar pelo catálogo utilizando a paginação.

Também é possível pesquisar filmes através da barra de busca.

Ao acessar os detalhes de um filme, são apresentadas informações como:

- título;
- diretor;
- gênero;
- ano de lançamento;
- sinopse;
- média das avaliações;
- histórico de notas e resenhas.

A partir da tela de detalhes também é possível editar ou excluir o filme.

O administrador pode adicionar uma nova avaliação informando um nome, uma nota de 1 a 5 estrelas e uma resenha em texto.

## Avaliações

A modelagem original disponibilizada no projeto utiliza notas em uma escala de 0 a 10.

Para manter compatibilidade com essa modelagem e, ao mesmo tempo, apresentar uma interface baseada em estrelas, o frontend converte as avaliações para uma escala de 1 a 5 estrelas.

Exemplos:

```text
10 no banco = 5 estrelas
8 no banco  = 4 estrelas
6 no banco  = 3 estrelas
4 no banco  = 2 estrelas
2 no banco  = 1 estrela
```

A média exibida na interface também é convertida para a escala de 1 a 5.

## Banco de dados

O projeto utiliza SQLite.

A estrutura das tabelas foi definida utilizando SQLAlchemy ORM e as migrações são gerenciadas pelo Alembic.

Foram utilizadas as relações existentes na modelagem fornecida para associar filmes a gêneros, diretores e avaliações.

## API

Os principais endpoints utilizados pela aplicação são:

```text
GET    /api/v1/movies/
POST   /api/v1/movies/

GET    /api/v1/movies/{movie_id}
PUT    /api/v1/movies/{movie_id}
DELETE /api/v1/movies/{movie_id}

POST   /api/v1/movies/{movie_id}/reviews
```

O endpoint de listagem também suporta paginação e pesquisa por título.

Exemplo:

```text
GET /api/v1/movies/?page=1&limit=6&search=Interestelar
```

## Dados iniciais

O enunciado da atividade menciona arquivos `.csv` para a população inicial das tabelas.

Esses arquivos não estavam presentes no repositório base utilizado durante o desenvolvimento. Por esse motivo, os testes da aplicação foram realizados com registros cadastrados através da própria interface e da API.

## Repositório base

O desenvolvimento foi realizado a partir da estrutura base disponibilizada para a atividade:

```text
https://github.com/Sophia-15/rocketlab2026-2
```

A estrutura original fornecia, entre outros elementos:

- configuração inicial do FastAPI;
- modelagem SQLAlchemy;
- banco de dados SQLite;
- configuração do Alembic.

A partir dessa base foram implementados os endpoints necessários e o frontend da aplicação utilizando React e TypeScript.
