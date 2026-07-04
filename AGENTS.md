# AGENTS.md

Guidance for AI coding agents working in this repository. `CLAUDE.md` imports this file — keep this as the single source of truth.

## Overview

`fe-marketplace` — a minimal Astro + React + Tailwind CSS base template for practicing marketplace features, branded as **"Pasar Koperasi"** (a cooperative marketplace portal for member/UMKM products). Pages are prerendered static, but the app now ships a **mock REST API** under `src/pages/api/` (served via the `@astrojs/node` adapter, `prerender = false`) that returns the static example data from `src/data/`. The buyer flow calls it through the **service layer in `src/services/`** — components never call `fetch` directly. Cart and login session remain `localStorage` simulations (`src/lib/cart.ts`, `src/lib/session.ts`); orders created via `POST /api/orders` live in server memory (`src/lib/server/orders-store.ts`) with a `localStorage` copy (`src/lib/my-orders.ts`) as fallback. UI copy is in Indonesian.

The application flow design (user flows, order-status state machine, screen map — all UML/Mermaid) lives in `docs/alur-aplikasi.md`; the sibling repo `../be-marketplace` (Go/Fiber skeleton) will implement the backend for it.

Requires Node >= 22.12.0.

## Commands

```sh
npm install
npm run dev                       # dev server at localhost:4321 (pages + /api routes)
npm run build                     # build: static pages + Node server (dist/server/entry.mjs)
npm run preview                   # serve the production build (Node adapter standalone)
npx astro check                   # type-check .astro and .ts/.tsx files
```

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

There is no test runner or linter configured.

## Architecture

**Astro/React split** — Astro owns pages, layouts, and all static markup (rendered at build time); React owns all interactivity. Interactive components live in `src/components/react/` and must be given a `client:*` directive where used in `.astro` files (`client:load` for forms, `client:visible` for below-the-fold widgets) — without one they render as static HTML and never hydrate.

**Component layers** (generic → specific):

- `src/components/ui/` — generic Astro primitives (`Button`, `Card`). They accept a `class` prop merged via `cn()` so callers can override styles.
- `src/components/features/` — domain-specific Astro components composed from `ui/` (`SiteHeader` with promo bar/search/category chips, `SiteFooter`).
- `src/components/react/` — React components for anything stateful (forms, `ProductBrowser`), including shared pieces like `FormField` and `ProductCard`. `ProductCard` is also rendered server-side (no `client:` directive) on the homepage grid.

**Data flow** — pages in `src/pages/` (file-based routing) import mock data from `src/data/` and pass it down as props, including into React islands. Shared interfaces (`Product`, `Store`, `Order`, etc.) live in `src/types/index.ts`. Every page wraps its content in `layouts/Layout.astro` (takes a `title` prop, imports the global stylesheet) and renders `SiteHeader`/`SiteFooter`. Cross-island state (cart badge, session) syncs via `CustomEvent`s dispatched from `src/lib/cart.ts` / `src/lib/session.ts`; order-status labels and the 5-step tracking model live in `src/lib/order-status.ts`.

**Routes** — buyer: `/` , `/products`, `/products/[id]`, `/cart`, `/checkout`, `/orders`, `/orders/[id]` (static paths from `src/data/orders.ts`), `/orders/lacak?id=` (client-side lookup); seller: `/toko`, `/toko/buat`, `/toko/kelola`, `/toko/kelola/produk-baru`; account: `/login`, `/register`, `/profile`.

**Mock API** (`src/pages/api/`, JSON envelope `{ data }` / `{ error }`): `GET /api/products` (`?q=&kategori=&sort=termurah|termahal`), `GET /api/products/:id`, `GET /api/categories`, `GET /api/offices`, `GET /api/drop-points`, `GET /api/store`, `GET|POST /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/pay` (MENUNGGU_PEMBAYARAN → DISIAPKAN). Always consume it via `src/services/` (`http.ts` base + `product-service`, `order-service`, `master-service`, `store-service`); each service call has a local-data fallback so the UI still works if the API is unreachable.

**Styling** — Tailwind CSS 4 via the `@tailwindcss/vite` plugin; there is no `tailwind.config.js`. Design tokens live in the `@theme` block of `src/styles/global.css`: forest greens (`forest`, `forest-dark`, `forest-deep`) on a `cream` background with `amber`/`terracotta` accents and `ink`/`moss` text colors — use these tokens, not raw Tailwind palette colors. Display type (headings, prices) is Playfair Display via `font-display`; body is Plus Jakarta Sans (both loaded from Google Fonts in `Layout.astro`). Conditional/conflicting classes are resolved with `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).

**Conventions** — TypeScript strict (`astro/tsconfigs/strict`) with `react-jsx`. Prices are displayed as IDR via `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`.
