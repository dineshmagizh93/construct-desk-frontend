# ConstructDesk — CRM Frontend

Tenant-facing CRM app and marketing site for ConstructDesk, a construction/interior-design business
management platform. Built with Vite, React, TypeScript, React Router, and TanStack Query, talking to
the [ConstructDesk backend](https://github.com/dineshmagizh93/construct-desk-backend) API.

## Development

```bash
npm install
npm run dev
```

Requires `VITE_API_URL` in `.env`, pointing at a running instance of the backend.

## Build

```bash
npm run build
```

Outputs a static bundle to `dist/`. Client-side routing needs a host-level rewrite to `index.html`
for all paths (see `vercel.json`).

## Structure

- `src/features/marketing/` — public marketing site (landing, pricing, features, legal pages)
- `src/features/*` — one folder per CRM module (leads, clients, projects, tasks, etc.), each with its
  own `api.ts`, `config.tsx` (table/form field definitions), and `pages/`
- `src/components/shared/` — the generic list/detail page scaffolding (`EntityListPage`, `DataTable`,
  `DrawerForm`) that every module page is built from
- `src/lib/modules.ts` — the canonical module catalog, mirrored on the backend, used for both
  permission/plan gating and the marketing site's module counts
