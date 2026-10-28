# Contributing to CyberSentinel

Thanks for taking the time to improve the project. This is a portfolio demonstration, but it follows the same workflow as a small production team: small changes, tests, and an honest description of what was verified.

## Before you start

- Node.js **20.9+** (Node 24 is used in CI) and npm 10+.
- Read [README.md](README.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md).
- For security issues, **do not open a public issue**. Follow [SECURITY.md](SECURITY.md).

## Local setup

```bash
npm install
npm run setup
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution is disabled:

```powershell
npm.cmd install
npm.cmd run setup
npm.cmd run dev
```

Never commit `.env`, `data/*.db`, `.auth/`, Playwright artifacts, or provider keys.

## Making a change

1. Create a focused branch: `feat/finding-bulk-actions`, `fix/login-focus`, `docs/threat-model`.
2. If behavior changes, add or update a test first where practical.
3. Keep server-only logic out of client components. Validate every new write path with Zod and re-check authorization in the action.
4. Update documentation when you change configuration, behavior, or limitations.
5. Run the checks relevant to the change, then the full suite before opening a pull request.

## Quality gates

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

For UI or auth changes, also run:

```bash
npm run test:e2e
```

`test:e2e` performs a production build and starts `next start`; it requires a seeded database and a valid `SESSION_SECRET`.

If you changed formatting intentionally, run `npm run format` and review the diff rather than committing unrelated formatting churn.

## Coding conventions

- TypeScript strict mode; prefer explicit types at module boundaries and inference locally.
- Server actions live in `src/actions/`, return the shared `ActionState` shape, and must not leak stack traces or secrets.
- Database access goes through `src/lib/repositories/`; do not query the client directly from components.
- Use existing UI primitives (`Field`, `Input`, `Button`, `Modal`, `EmptyState`, badges) before adding new patterns.
- User-facing copy is plain English, sentence case, and honest about demo data.
- Every new icon-only control needs an accessible name. Every interactive dialog needs focus management and Escape handling.
- Log structured events through `logger`; never log passwords, tokens, raw form bodies, or API keys.
- Add a `data-testid` only when a stable accessible selector is not practical.

## Commit messages

Use short imperative subjects, optionally with a conventional prefix:

```text
feat: add finding bulk status updates
fix: keep table filters when paging
docs: document Turso deployment
test: cover CSV formula escaping
```

One logical change per commit. Explain **why** in the body when the diff is not self-explanatory.

## Pull requests

Include:

- What changed and why.
- Screenshots or a short recording for visual changes.
- The exact commands you ran and their results.
- Known limitations or follow-up work.
- Security impact, if any.

Do not claim tests, deployment, or a push you did not actually perform. A reviewer should be able to reproduce your verification steps.

## Review checklist

- [ ] Authorization checked on the server, not only hidden in the UI.
- [ ] Inputs validated with Zod and length/format limits.
- [ ] Errors are useful without exposing internals.
- [ ] Empty, loading, and error states handled.
- [ ] Keyboard and mobile behavior checked for UI changes.
- [ ] Tests added or updated.
- [ ] Docs and changelog updated when behavior changes.
- [ ] No secrets or generated data committed.
