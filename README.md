# OKTOO Lead Management CRM

OKTOO centralizes the leads generated from Meta (Facebook & Instagram) and Google Ads into a single, collaborative workspace. The project focuses on automating lead ingestion, enrichment, routing, and follow-up so sales teams can react in real time instead of stitching together multiple dashboards.

OKTOO lives in a Turborepo monorepo and is split between a Next.js front end, a Convex backend, and a shared design system. This repository provides the foundation for the integrations, data models, and UI flows that power the CRM.

## Highlights

- **Unified Meta & Google lead pipeline** – capture ad form submissions from both ecosystems and view them in one workspace.
- **Real-time data layer** – Convex handles storage, live queries, and server-side workflows such as webhook processing and lead scoring.
- **Modern operator experience** – React 19, Next.js App Router, and the HeroUI component kit provide responsive dashboards, auth flows, and marketing pages.
- **Shared tooling** – reusable UI components, linting, TypeScript configs, and Turbo-powered workflows keep the web and backend apps in sync.

## Repository Structure

| Path | Description |
| --- | --- |
| `apps/web` | Next.js 16 application for dashboards, auth, and marketing pages. |
| `apps/backend` | Convex project that stores data, processes provider webhooks, and orchestrates automations. |
| `packages/ui` | Shared React primitives used by the web app. |
| `packages/eslint-config`, `packages/typescript-config` | Centralized linting and TypeScript settings for every package. |

## Tech Stack

- **Frontend:** Next.js 16, React 19, HeroUI, Tailwind CSS 4, Framer Motion.
- **Backend:** Convex (TypeScript server functions and schema), Svix for webhook verification.
- **Tooling:** Bun 1.3, Turbo, TypeScript 5.9, ESLint 9, Prettier 3.

## Getting Started

### Prerequisites

- Node.js 18 or later (for tooling compatibility).
- [Bun](https://bun.com/) ≥ 1.3.0 (the repository is configured to use Bun as the package manager).
- A Convex account and the Convex CLI (`bunx convex dev`) for local development.

### Install Dependencies

```bash
bun install
```

The command above installs dependencies for every workspace (web, backend, and shared packages).

### Configure Environment Variables

1. Create `apps/web/.env.local` (if it does not already exist) and add:

   ```bash
   NEXT_PUBLIC_CONVEX_URL="https://<your-convex-deployment>.convex.cloud"
   ```

   This value is required by `ConvexClientProvider` in the Next.js app.

2. Store provider credentials and API tokens (Meta Lead Ads, Google Ads, webhook secrets, etc.) in your Convex project. Use the Convex CLI to manage secrets securely:

   ```bash
   bunx convex env set META_ACCESS_TOKEN "<token>"
   bunx convex env set GOOGLE_ADS_DEVELOPER_TOKEN "<token>"
   bunx convex env set WEBHOOK_SIGNING_SECRET "<secret>"
   ```

   Adjust the key names to match the integrations you enable.

### Run the Apps Locally

- Start every workspace (frontend + backend) with Turbo:

  ```bash
  bun run dev
  ```

  This runs `turbo run dev`, launching the Next.js development server on port `3000` and the Convex dev server with hot reloading.

- Or run services individually:

  ```bash
  # Frontend
  cd apps/web
  bun run dev

  # Convex backend
  cd apps/backend
  bun run dev
  ```

Visit `http://localhost:3000` to access the OKTOO dashboard shell.

### Quality Checks

```bash
# Type checking across workspaces
bun run check-types

# Lint with the shared ESLint configuration
bun run lint
```

## Meta & Google Lead Flow (Overview)

1. **Capture:** Meta Lead Ads and Google Lead Forms trigger webhooks that hit Convex actions in `apps/backend`.
2. **Normalize:** Convex server functions enrich the payloads, merge duplicates, and update lead status.
3. **Distribute:** Live queries push updates to the Next.js dashboard so operators see new leads instantly.
4. **Automate:** Follow-up sequences, assignments, and notifications can be orchestrated from the Convex backend.

Implementation for these steps is evolving—refer to the Convex actions and schema when extending the pipeline.

## Next Steps

- Flesh out lead schemas and ingestion actions in `apps/backend/convex`.
- Expand dashboard modules under `apps/web/src/app/(protected)` to visualize Meta/Google pipelines.
- Integrate authentication and role-based access for sales teams.

When you add features, update this README so the setup instructions stay accurate.
