# PrepPair

Weekly meal planning PWA for couples. Plan meals, manage recipes, generate grocery lists, and track your food budget — all from your phone.

## Tech Stack

- **Framework**: React Router v7 (SSR)
- **Language**: TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Linting**: Biome
- **Testing**: Vitest
- **Package Manager**: pnpm (or Bun)

## Features

- PIN-based authentication
- Recipe management (CRUD, favorites, categories, tags)
- Weekly meal planner with drag-and-drop
- Auto-generated grocery lists with ingredient aggregation
- Budget tracking with spending trends
- Installable PWA with offline support
- Mobile-first responsive design

## Prerequisites

- Node.js 20+
- pnpm (or Bun)
- PostgreSQL 16+
- Docker (optional, for local DB)

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd prep-pair
   pnpm install
   ```

2. **Start the database**

   Using Docker:
   ```bash
   docker compose up -d
   ```

   Or provide your own PostgreSQL instance.

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials:

   | Variable       | Description                        | Default                                             |
   |----------------|------------------------------------|-----------------------------------------------------|
   | `DATABASE_URL` | PostgreSQL connection string       | `postgresql://postgres:password@localhost:5432/preppair` |
   | `NODE_ENV`     | Environment (development/production) | `development`                                       |
   | `PORT`         | Server port                        | `3000`                                              |

4. **Run database migrations**

   ```bash
   pnpm db:push
   ```

5. **Seed sample data (optional)**

   ```bash
   pnpm db:seed
   ```

6. **Start the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script            | Description                        |
|-------------------|------------------------------------|
| `pnpm dev`        | Start development server           |
| `pnpm build`      | Production build                   |
| `pnpm start`      | Start production server            |
| `pnpm check`      | Lint and format check (Biome)      |
| `pnpm check:fix`  | Auto-fix lint and format issues    |
| `pnpm typecheck`  | TypeScript type checking           |
| `pnpm test`       | Run tests                          |
| `pnpm db:push`    | Push schema to database            |
| `pnpm db:generate`| Generate migrations                |
| `pnpm db:migrate` | Run migrations                     |
| `pnpm db:seed`    | Seed sample data                   |
| `pnpm db:studio`  | Open Drizzle Studio                |

## Project Structure

```
app/
  routes/          # Page routes (React Router v7 file-based routing)
  components/      # React components (ui/, planner/, recipes/, grocery/, budget/, shared/)
  lib/
    db/            # Database schema and connection
    services/      # Business logic (auth, recipe, planner, grocery, budget)
    utils/         # Utility functions (date, currency)
    validators/    # Zod validation schemas
  hooks/           # Custom React hooks
public/
  icons/           # PWA app icons
  manifest.webmanifest
  sw.js            # Service worker
tests/             # Vitest test files
```

## License

MIT
