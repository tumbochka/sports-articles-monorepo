# Sports Articles Monorepo

This monorepo contains the Sports Articles application. This document covers setup and usage for the backend and frontend applications.

## Backend

Backend application for the Sports Articles monorepo. This is a GraphQL API built with Node.js, Express, Apollo Server, TypeORM, and PostgreSQL. The backend provides pagination, soft deletes, database migrations, seeding capabilities, and comprehensive test coverage.

### Setup

#### Required Software

- **Node.js**: Version 22.x (tested with Node.js v22.19.0)
- **pnpm**: Version 10.26.0 (specified in `packageManager` field)
- **PostgreSQL**: Version 16 (database used by the backend)

#### Installing Dependencies

From the repository root, install dependencies using pnpm:

```bash
pnpm install
```

#### Environment Variables

Create a `.env` file in the `apps/backend` directory. You can copy from `.env.example` if it exists:

```bash
cp apps/backend/.env.example apps/backend/.env
```

The following environment variables are used by the backend:

- `DB_HOST` - Database host (default: `localhost`)
- `DB_PORT` - Database port (default: `5432`)
- `DB_USER` - Database username (default: `sports`)
- `DB_PASSWORD` - Database password (default: `sports`)
- `DB_NAME` - Database name (default: `sports_articles`)
- `PORT` - Backend server port (default: `4000`)

The backend uses sensible defaults if environment variables are not set, but you should configure these values for your local setup.

### Running the Backend

#### Development Mode

To start the backend in development mode with hot reloading, from the repository root:

```bash
pnpm --filter backend dev
```

#### Port

The backend runs on port **4000** by default (configurable via the `PORT` environment variable).

#### Verifying the Backend is Running

You can verify the backend is running by querying the GraphQL health endpoint:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health }"}'
```

This should return `{"data":{"health":"ok"}}`.

Alternatively, you can open the GraphQL endpoint at `http://localhost:4000/graphql` in your browser or use a GraphQL client.

### Database Setup

#### Creating the Local Development Database

The repository includes a `docker-compose.yml` file, which is the recommended way to run PostgreSQL locally. Start the database using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL 16 container with:
- Database name: `sports_articles`
- Username: `sports`
- Password: `sports`
- Port: `5432`

Alternatively, create the database manually using PostgreSQL:

```bash
createdb sports_articles
```

#### Running Database Migrations

After the database is created, run migrations to set up the schema from the repository root:

```bash
pnpm --filter backend migration:run
```

This will execute all pending migrations from the `src/migrations` directory.

#### Rolling Back Migrations

TypeORM migrations support both up and down directions. To revert the last applied migration, from the repository root:

```bash
pnpm --filter backend migration:revert
```

This will execute the `down` method of the most recently applied migration. Migration rollback is available but should be used cautiously, as reverting migrations in shared development or production environments can cause issues. Forward migrations are preferred in most workflows.

### Seed Instructions

#### Running the Seed Script

To seed the database with initial/test data, from the repository root:

```bash
pnpm --filter backend seed
```

The seed script will:
- Create 15 sample sports articles
- Skip seeding if articles already exist in the database

#### When to Use Seeding

Seed the database when:
- Setting up a new development environment
- Testing with sample data
- Resetting the database to a known state (after dropping and recreating the database)

### Testing

#### Creating the Test Database

Create a separate PostgreSQL database for tests. If using Docker Compose for the database:

```bash
docker exec -i sports_articles_db createdb -U sports sports_articles_test
```

Alternatively, if PostgreSQL is running locally (not in Docker):

```bash
createdb sports_articles_test
```

#### Test Environment Configuration

Tests use the `.env.test` file located in the `apps/backend` directory. You can copy from `.env.test.example` if it exists:

```bash
cp apps/backend/.env.test.example apps/backend/.env.test
```

Then configure the test database settings in `.env.test`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=sports
DB_PASSWORD=sports
DB_NAME=sports_articles_test
```

#### Running Tests

To run backend tests, from the repository root:

```bash
pnpm --filter backend test
```

To run tests in watch mode:

```bash
pnpm --filter backend test:watch
```

#### Test Database Isolation

Tests run against an isolated test database (`sports_articles_test`). The test setup automatically:
- Runs all migrations before tests
- Truncates tables between test cases
- Ensures a clean state for each test

### Linting

The backend uses ESLint with TypeScript support to enforce code quality and style conventions.

#### Running the Linter

To check for linting errors, from the repository root:

```bash
pnpm --filter backend lint
```

The linter checks TypeScript files for code quality issues, enforces consistent code style, and validates import ordering.

- This project is part of a monorepo using pnpm workspaces. The backend is located in the `apps/backend` directory.
- All backend commands can be run from the repository root using `pnpm --filter backend {command}`.
- The backend uses TypeORM for database management with migrations. Database synchronization is disabled (`synchronize: false`), so migrations must be run manually.
- The GraphQL API is available at `/graphql` endpoint when the backend is running.
- Make sure PostgreSQL is running and accessible before starting the backend.

## Frontend

The frontend is a Next.js + TypeScript application using Apollo Client for GraphQL and Tailwind CSS for styling.

### Setup

From the repository root, install dependencies using pnpm (if not already done):

```bash
pnpm install
```

### Running the Frontend

To start the frontend development server:

```bash
pnpm --filter frontend dev
```

By default the frontend runs on port **3000**. Open `http://localhost:3000` in your browser.

### Environment Variables

The frontend uses the following environment variable:

- `NEXT_PUBLIC_GRAPHQL_URL` - URL of the GraphQL backend (default: `http://localhost:4000/graphql`)

You can create an `.env.local` file in `apps/frontend` to override the default:

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### Node.js Version

Use **Node.js >= 20** (same as the monorepo root `engines` field). The project has been tested with Node.js 22.x.
