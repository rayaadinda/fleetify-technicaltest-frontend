# Fleetify Technical Test Frontend

Frontend wizard invoice/resi built with Next.js 14 Pages Router, TypeScript strict mode, Zustand, and React Query.

## Stack

- Next.js 14 (Pages Router)
- TypeScript (strict)
- Zustand (persist middleware)
- TanStack React Query v5
- Axios with JWT interceptor
- TailwindCSS

## Zero Setup Run (Docker)

1. Start container:

```bash
docker compose up --build
```

2. Open app: http://localhost:3000

3. Ensure backend API is available at http://localhost:8080.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Run dev server:

```bash
npm run dev
```

## Login Demo

- admin / admin123
- kerani / kerani123

## Implemented Requirements

- Login page with JWT handling
- Axios interceptor for `Authorization: Bearer <token>`
- Wizard 3 step with persisted state in Zustand
- Refresh-safe form state (anti-hydration trap)
- Debounced item lookup (500ms) with request cancellation (AbortController)
- Role-based payload transformation before submit
- Review page with submit and print button

## Important Notes

- For Kerani role, frontend strips price and total fields from payload.
- For Admin role, frontend sends full payload.
- Backend remains zero-trust and recalculates totals from master item DB.
