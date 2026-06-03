# Accounting Asset Maintain

Enterprise-style Next.js application for accounting asset maintenance, following the architecture defined in `Skill.md`.

## Architecture

```
src/
├── app/              # Routes, API handlers (thin layer)
├── modules/          # Feature domains (import-job, auth)
├── infrastructure/   # Database, Redis, logging
├── shared/           # Reusable UI, HTTP client, errors
├── configs/          # Environment validation (Zod)
├── providers/
├── utils/
└── hooks/
```

**Flow:** UI → API Route → Validation → Service → Repository / Client → Database / External API

## Features

- CSV / XLSX asset import with header validation
- Batch row persistence and progress tracking
- BullMQ background processing with retries and exponential backoff
- Structured JSON logging
- External API client with timeout, retry, and error normalization

## Prerequisites

- Node.js 20+
- Redis (for queue processing)

## Setup

```bash
cp .env.example .env
npm install
npm run db:push
```

Start the web app and worker in separate terminals:

```bash
npm run dev
npm run worker
```

Open [http://localhost:3000](http://localhost:3000) and go to **Import Jobs** (`/import-jobs`).

## Sample file

`public/samples/asset-import-sample.csv`

Required columns: `assetCode`, `assetName`, `category`, `acquisitionDate`, `cost`, `location`, `department`

## Troubleshooting (Turbopack panic / 404)

If you see **FATAL: An unexpected Turbopack error** or `app_dir must be a directory`:

1. Stop every running `npm run dev` terminal (Ctrl+C).
2. Clear the cache: `npm run clean`
3. Start again: `npm run dev` (uses **webpack**, not Turbopack).

Use `npm run dev:turbo` only if you explicitly want Turbopack.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (webpack) |
| `npm run clean` | Delete `.next` cache |
| `npm run dev:turbo` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run worker` | BullMQ import processor |
| `npm run db:push` | Sync Prisma schema to SQLite |
| `npm run test` | Unit tests (Zod schemas) |

## Environment

See `.env.example`. Set `EXTERNAL_API_BASE_URL` when you want rows posted to an external asset API. Without it, rows validate locally and complete without HTTP calls.
