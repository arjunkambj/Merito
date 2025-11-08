# Repository Guidelines for Merito

## Project Structure & Module Organization
This Turborepo keeps workspaces focused: the Next.js 16 frontend lives in `apps/web` with the App Router under `src/app` and supporting modules in `src/components`, `src/hooks`, and `src/store`. Convex functions are grouped in `apps/backend/convex`, and Bun powers their local runner. Reusable React primitives ship from `packages/ui/src` through the `@repo/ui` export. Shared lint and TypeScript baselines remain in `packages/eslint-config` and `packages/typescript-config`; adjust rules in those sources so every workspace inherits the change.

## Build, Test, and Development Commands
Use Bun so lockfile resolution stays consistent. `bun run dev` orchestrates every `dev` task via Turbo; pass `-- --filter=web` or `--filter=backend` to limit scope. `bun run build` prepares all deployables, while `bun run lint`, `bun run check-types`, and `bun run format` enforce quality gates. In workspace roots, scripts defer to local tooling (`bun convex dev` in `apps/backend`, `next dev --turbopack` in `apps/web`).

## Coding Style & Naming Conventions
TypeScript is mandatory. Prettier (`bun run format`) enforces two-space indentation, double quotes, and trailing commas—avoid manual overrides. ESLint extends the shared config; add rule changes centrally rather than per app. Export React components with PascalCase identifiers, keep props interfaces near their component, and organize files by feature (`apps/web/src/components/dashboard`, `packages/ui/src/button.tsx`). Co-locate styling or helper files within the same folder when relevant.

## Testing Guidelines
No automated harness exists yet. When introducing tests, use `*.test.ts[x]` naming beside the source file and register a `test` script so adoption is easy (`bun run test` in the root or per workspace). For Convex logic, favor integration tests that stub environment variables. Until coverage thresholds are formalized, document expectations in PR descriptions and keep new test commands mirrored in Turbo pipelines.

## Commit & Pull Request Guidelines
Git history currently holds a single entry (`first commit`), showing concise lowercase summaries. Keep commit subjects short, imperative, and optionally scoped (`feat(web): add account slice`), with supporting detail in the body for linked issues, migrations, or env changes. PRs should outline the problem, highlight testing done, and attach before/after visuals for UI changes. Request at least one teammate review and wait for CI to finish before merging.

## Environment & Secrets Management
Store secrets in `.env.local` files ignored by Git. Turbo promotes `NEXT_PUBLIC_CONVEX_URL`, so document required variables without committing values. Use `bun convex env` or team vault tooling to share sensitive values and rotate keys whenever Convex deployments change.
