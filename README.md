# Sports Articles Monorepo

A full-stack sports articles application with a GraphQL backend and Next.js frontend.

## Quick Start

From the repository root:

```bash
pnpm install
docker compose up -d
pnpm --filter backend migration:run
pnpm --filter backend seed
pnpm --filter backend dev
pnpm --filter frontend dev
```

Open in browser:

- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql

## Requirements

- **Node.js**: >= 20 (tested on v22.19.0)
- **pnpm**: 10.26.0 (specified in `packageManager` field)
- **PostgreSQL**: 16
- **Docker**: For local database (recommended)

## Project Structure

```
/apps
  /backend   GraphQL API (Node.js, Apollo Server, TypeORM)
  /frontend  Next.js application (SSR, Apollo Client)
```

## Database Setup

The `docker-compose.yml` file in the repository root provides a PostgreSQL 16 container:

- **Container name**: `sports_articles_db`
- **Database name**: `sports_articles`
- **Username**: `sports`
- **Password**: `sports`
- **Port**: `5432`

Start the database:

```bash
docker compose up -d
```

To verify the container is running:

```bash
docker ps
```

## Backend

GraphQL API built with Node.js, Express, Apollo Server, TypeORM, and PostgreSQL.

### Environment Variables

Create `.env` in `apps/backend`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Required variables (defaults shown):

- `DB_HOST` - Database host (default: `localhost`)
- `DB_PORT` - Database port (default: `5432`)
- `DB_USER` - Database username (default: `sports`)
- `DB_PASSWORD` - Database password (default: `sports`)
- `DB_NAME` - Database name (default: `sports_articles`)
- `PORT` - Backend server port (default: `4000`)

### Running Migrations

From the repository root:

```bash
pnpm --filter backend migration:run
```

### Seeding the Database

From the repository root:

```bash
pnpm --filter backend seed
```

The seed script creates 150 sample articles and skips seeding if articles already exist.

### Verifying the Backend

Query the GraphQL health endpoint:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health }"}'
```

This should return `{"data":{"health":"ok"}}`.

Alternatively, open http://localhost:4000/graphql in your browser.

## Frontend

Next.js application with TypeScript, Apollo Client, and Tailwind CSS.

### Environment Variables

Create `.env.local` in `apps/frontend` to override defaults:

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### Verifying SSR

The following pages are server-side rendered:

- `/` — articles list (first 10 articles)
- `/article/[id]` — article details

To verify SSR:

- Open the page and view page source — article content should be present in the HTML
- Disable JavaScript and reload — content should still be visible

## Verifying CRUD Functionality

- **Create**: Click "Create article" button → submit form → redirected to article details page
- **Read**: Open article from list → view article details page
- **Update**: Click "Edit" on article → modify form → submit → redirected to article details with changes persisted
- **Delete**: Click "Delete" on article → confirm in dialog → article removed from list

## Useful Commands

### Backend

```bash
pnpm --filter backend lint
pnpm --filter backend test
pnpm --filter backend migration:run
pnpm --filter backend migration:revert
pnpm --filter backend seed
pnpm --filter backend dev
```

### Frontend

```bash
pnpm --filter frontend dev
```

### Code Formatting

Format code with Prettier (from repository root):

```bash
pnpm format
```

This formats all files in the monorepo according to the project's Prettier configuration.

### Testing

#### Test Database Setup

Create a separate test database. If using Docker Compose:

```bash
docker exec -i sports_articles_db createdb -U sports sports_articles_test
```

If PostgreSQL is running locally:

```bash
createdb sports_articles_test
```

#### Test Environment Configuration

Create `.env.test` in `apps/backend`:

```bash
cp apps/backend/.env.test.example apps/backend/.env.test
```

Configure test database settings in `.env.test`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=sports
DB_PASSWORD=sports
DB_NAME=sports_articles_test
```

#### Running Tests

```bash
pnpm --filter backend test
pnpm --filter backend test:watch
```

Tests run against an isolated test database and automatically:

- Run all migrations before tests
- Truncate tables between test cases

## Additional Notes

- This project is part of a monorepo using pnpm workspaces
- All commands can be run from the repository root using `pnpm --filter {app} {command}`
- The backend uses TypeORM with migrations (synchronization disabled)
- The GraphQL API is available at `/graphql` endpoint when the backend is running
- Ensure PostgreSQL is running and accessible before starting the backend
