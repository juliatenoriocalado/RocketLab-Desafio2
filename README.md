# Sistema de Avaliação de Filmes

Projeto desenvolvido para a Atividade DEV do Visagio Rocket Lab 2026.

A aplicação consiste em um sistema de avaliação de filmes em que o usuário administrador pode gerenciar o catálogo, consultar os detalhes dos filmes, visualizar avaliações já realizadas e adicionar novas notas e resenhas.

## Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Vite
- React Router

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
- visualizar a distribuição das avaliações;
- navegar entre catálogo e página de detalhes através de rotas;
- manter busca e página atual na URL;
- utilizar a aplicação em diferentes tamanhos de tela através de uma interface responsiva;
- visualizar estados de carregamento, lista vazia e mensagens de erro;
- receber mensagens de sucesso ou erro através de notificações na interface;
- confirmar a exclusão de filmes através de modal.

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
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.tsx
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieForm.tsx
│   │   │   ├── Poster.tsx
│   │   │   ├── RatingHistogram.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   ├── StarInput.tsx
│   │   │   ├── Stars.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── CatalogPage.tsx
│   │   │   └── MovieDetailPage.tsx
│   │   │
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   ├── movieForm.ts
│   │   │   └── rating.ts
│   │   │
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── .env.example
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

Também é possível verificar se a API está funcionando através do endpoint:

```text
http://127.0.0.1:8000/health
```

A resposta esperada é:

```json
{
  "status": "ok"
}
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

Por padrão, o frontend utiliza a API em:

```text
http://127.0.0.1:8000/api/v1
```

Caso a API esteja sendo executada em outro endereço, é possível criar um arquivo `.env` a partir do `.env.example` e alterar a variável:

```text
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível normalmente em:

```text
http://localhost:5173
```

Se a porta `5173` estiver ocupada, o Vite pode tentar utilizar outra porta. Para utilizar a configuração padrão do projeto, recomenda-se encerrar o processo que estiver utilizando a `5173` e iniciar novamente o frontend.

## Validação rápida da aplicação

Com backend e frontend em execução, é possível verificar as portas no PowerShell:

```powershell
Test-NetConnection 127.0.0.1 -Port 8000
Test-NetConnection localhost -Port 5173
```

Nos dois casos, o resultado esperado é:

```text
TcpTestSucceeded : True
```

Também é possível testar diretamente os endpoints principais:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
```

e:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/movies/"
```

## Fluxo da aplicação

Na tela principal, o administrador pode visualizar os filmes cadastrados em um catálogo e navegar pelos resultados utilizando paginação.

Também é possível pesquisar filmes através da barra de busca.

A pesquisa possui uma pequena espera de aproximadamente 400 ms antes de realizar a requisição, evitando uma nova chamada à API a cada tecla digitada.

A busca e a página atual ficam armazenadas na própria URL.

Exemplo:

```text
/?q=inter&page=1
```

Isso permite manter o estado do catálogo ao navegar entre a listagem e a página de detalhes.

Ao acessar os detalhes de um filme, são apresentadas informações como:

- título;
- diretor;
- gênero;
- ano de lançamento;
- sinopse;
- média das avaliações;
- distribuição das notas;
- histórico de notas e resenhas.

A partir da tela de detalhes também é possível editar ou excluir o filme.

O administrador pode adicionar uma nova avaliação informando:

- nome;
- nota de 1 a 5 estrelas;
- resenha em texto.

## Rotas do frontend

As principais rotas da aplicação são:

```text
/                     catálogo
/filmes/:movieId      detalhes do filme
```

A rota do catálogo também aceita parâmetros de busca e paginação.

Exemplo:

```text
/?q=oppenheimer&page=1
```

## Interface

A interface foi dividida em componentes para facilitar a organização e manutenção do código.

Entre os principais recursos de interface estão:

- catálogo em grade;
- cards individuais para os filmes;
- pôster dos filmes;
- capa alternativa gerada automaticamente quando não existe um pôster válido;
- formulário de cadastro e edição reutilizável;
- modal para ações como cadastro, edição e confirmação;
- seleção de nota através de estrelas;
- visualização de estrelas nas avaliações;
- distribuição gráfica das notas;
- skeletons durante o carregamento;
- mensagens de sucesso e erro através de toast;
- estados específicos para lista vazia e falha de carregamento;
- layout responsivo para desktop, tablet e celular.

## Organização do frontend

O frontend foi separado em partes menores para reduzir a responsabilidade do `App.tsx`.

### `components/`

Contém componentes reutilizáveis da interface, como:

- `MovieCard`;
- `MovieForm`;
- `Poster`;
- `ReviewCard`;
- `ReviewForm`;
- `StarInput`;
- `Stars`;
- `Modal`;
- `Toast`;
- `RatingHistogram`.

### `pages/`

Contém as páginas principais:

- `CatalogPage.tsx`;
- `MovieDetailPage.tsx`.

### `api.ts`

Centraliza as chamadas HTTP realizadas para o backend.

A URL base da API pode ser configurada através da variável:

```text
VITE_API_URL
```

Caso ela não seja definida, o frontend utiliza:

```text
http://127.0.0.1:8000/api/v1
```

### `types.ts`

Contém os tipos TypeScript utilizados para representar filmes, avaliações e demais dados recebidos da API.

### `utils/`

Contém funções auxiliares utilizadas na aplicação, incluindo:

- formatação de dados;
- validação e preparação dos formulários;
- conversão das avaliações entre as escalas utilizadas no backend e no frontend.

## Avaliações

A modelagem original disponibilizada no projeto utiliza notas em uma escala de 0 a 10.

Para manter compatibilidade com essa modelagem e, ao mesmo tempo, apresentar uma interface baseada em estrelas, o frontend converte as avaliações para uma escala de 1 a 5 estrelas.

A conversão utilizada é:

```text
10 no banco = 5 estrelas
8 no banco  = 4 estrelas
6 no banco  = 3 estrelas
4 no banco  = 2 estrelas
2 no banco  = 1 estrela
```

Ao cadastrar uma avaliação, a nota escolhida em estrelas é convertida novamente para a escala de 0 a 10 utilizada pelo backend.

Exemplo:

```text
5 estrelas = nota 10
4 estrelas = nota 8
3 estrelas = nota 6
2 estrelas = nota 4
1 estrela  = nota 2
```

A média recebida da API também é convertida para a escala de 1 a 5 antes de ser apresentada na interface.

Para a exibição da média, a interface também pode representar valores intermediários utilizando meia estrela.

## Banco de dados

O projeto utiliza SQLite.

A estrutura das tabelas foi definida utilizando SQLAlchemy ORM e as migrações são gerenciadas pelo Alembic.

Foram utilizadas as relações existentes na modelagem fornecida para associar:

- filmes;
- gêneros;
- diretores;
- avaliações.

Os registros cadastrados localmente ficam armazenados no banco SQLite utilizado pela aplicação.

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

### Listagem de filmes

```text
GET /api/v1/movies/
```

O endpoint suporta paginação e pesquisa por título.

Exemplo:

```text
GET /api/v1/movies/?page=1&limit=6&search=Interestelar
```

### Cadastro de filme

```text
POST /api/v1/movies/
```

Permite cadastrar informações como:

- título;
- diretor;
- gênero;
- ano de lançamento;
- sinopse;
- URL do pôster.

### Detalhes de filme

```text
GET /api/v1/movies/{movie_id}
```

Retorna os dados completos de um filme, incluindo suas avaliações.

### Atualização de filme

```text
PUT /api/v1/movies/{movie_id}
```

Permite atualizar as informações de um filme.

No frontend atual, a edição envia apenas os campos que foram modificados.

### Exclusão de filme

```text
DELETE /api/v1/movies/{movie_id}
```

Remove o filme selecionado.

### Cadastro de avaliação

```text
POST /api/v1/movies/{movie_id}/reviews
```

Permite cadastrar uma nova nota e resenha para um filme.

## Documentação da API

Com o backend em execução, o FastAPI disponibiliza automaticamente a documentação Swagger em:

```text
http://127.0.0.1:8000/docs
```

Nessa página é possível visualizar e testar os endpoints da aplicação.

## Dados iniciais

O enunciado da atividade menciona arquivos `.csv` para a população inicial das tabelas.

Esses arquivos não estavam presentes no repositório base utilizado durante o desenvolvimento.

Por esse motivo, os testes da aplicação foram realizados utilizando registros cadastrados através da própria interface e da API.

## Build do frontend

Também é possível validar a compilação do frontend através de:

```bash
cd frontend
npm run build
```

Esse comando executa a verificação do TypeScript e gera a versão de produção através do Vite.

## Repositório base

O desenvolvimento foi realizado a partir da estrutura base disponibilizada para a atividade:

https://github.com/Sophia-15/rocketlab2026-2

A estrutura original fornecia, entre outros elementos:

- configuração inicial do FastAPI;
- modelagem SQLAlchemy;
- banco de dados SQLite;
- configuração do Alembic.

A partir dessa base foram implementados os endpoints necessários e o frontend da aplicação utilizando React e TypeScript.

## Repositório do projeto

Este repositório contém a implementação completa desenvolvida para a atividade, incluindo:

- backend FastAPI;
- integração com SQLite;
- endpoints de gerenciamento de filmes;
- sistema de avaliações;
- frontend React;
- navegação entre catálogo e detalhes;
- busca e paginação;
- interface baseada em estrelas;
- organização do frontend em componentes e páginas.
