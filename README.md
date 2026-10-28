# CyberSentinel

**An AI-assisted cybersecurity posture dashboard for small security teams.**

CyberSentinel is a portfolio-grade, full-stack demo that turns a scattered security backlog into an explainable posture story: inventory assets, rank findings by real exposure, read simulated telemetry, cross-reference CISA advisories, and ask a grounded analyst copilot what to fix first.

It is built to be **run locally with no paid services**. Every screen is backed by a real database, typed server actions, validation, authorization, and tests. The data is seeded and clearly labeled; the security engineering is deliberate.

> Educational portfolio project. Not a production security product, scanner, SIEM, or source of professional advice.

---

## What it demonstrates

| Area                  | Implementation                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk model**        | Transparent score weighting severity, CVSS, finding status, internet exposure, and asset criticality. No black-box numbers.              |
| **Findings workflow** | Create, edit, filter, triage, resolve, accept risk, and export findings as CSV with formula-injection protection.                        |
| **Asset inventory**   | Ten asset types, criticality, exposure, ownership, tags, and per-asset risk rollups.                                                     |
| **AI copilot**        | Deterministic local analyst by default; optional OpenAI-compatible provider with automatic fallback. Answers cite dashboard records.     |
| **Threat intel**      | Live CISA KEV catalog cross-referenced with CVEs in the register, plus a labeled bundled fallback.                                       |
| **Telemetry**         | Simulated EDR, firewall, identity, and WAF events for operational context.                                                               |
| **Security**          | Scrypt hashing, HMAC-hashed session tokens, httpOnly cookies, RBAC, Zod validation, audit logging, rate limits, CSP and related headers. |
| **Quality**           | TypeScript strict mode, ESLint, Prettier, Vitest unit/integration tests, Playwright E2E, GitHub Actions CI.                              |
| **Accessibility**     | Semantic landmarks, skip link, labeled controls, keyboard-operable dialogs, visible focus, reduced-motion support, live regions.         |
| **Responsive UI**     | Desktop sidebar and mobile navigation, fluid grids, dark high-contrast design system.                                                    |

### Route map

| Route                  | Access    | Purpose                                                              |
| ---------------------- | --------- | -------------------------------------------------------------------- |
| `/`                    | Public    | Product landing page                                                 |
| `/login`               | Public    | Sign in with demo or assigned credentials                            |
| `/dashboard`           | Signed in | Posture score, trend, severity mix, priority findings, analyst brief |
| `/assets`              | Signed in | Asset list, filters, create/edit/delete                              |
| `/assets/[id]`         | Signed in | Asset detail with linked findings                                    |
| `/findings`            | Signed in | Filterable findings register, CSV export                             |
| `/findings/[id]`       | Signed in | Finding detail, status changes, remediation plan                     |
| `/events`              | Signed in | Event stream and telemetry simulator                                 |
| `/intel`               | Signed in | CISA KEV advisories matched to registered CVEs                       |
| `/copilot`             | Signed in | Grounded posture Q&A with citations                                  |
| `/audit`               | Admin     | Audit log of security-relevant actions                               |
| `/settings`            | Signed in | Profile, password, active sessions                                   |
| `/api/health`          | Public    | Database/application health probe                                    |
| `/api/findings/export` | Signed in | Authenticated CSV export                                             |

---

## Stack

| Layer      | Choice                                  | Why                                                                                          |
| ---------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Framework  | **Next.js 16.4** App Router             | Server components, server actions, route handlers, and streaming in one deployable unit.     |
| UI         | **React 19.3**, **Tailwind CSS 4.3**    | Fast composition with a small, consistent design system; no component library lock-in.       |
| Language   | **TypeScript 5.9** (strict)             | Shared types from database rows through server actions to UI.                                |
| Database   | **libSQL / SQLite**, optional **Turso** | Zero-setup local development; a free hosted libSQL option for demos.                         |
| Validation | **Zod 4.6**                             | One schema per write path, server-side, with field-level errors.                             |
| Auth       | Custom sessions                         | Demonstrates password hashing, token storage, cookie flags, and session revocation directly. |
| AI         | Local engine + OpenAI-compatible API    | Works offline; an optional free-tier provider (for example Groq) adds a real model.          |
| Tests      | **Vitest 5**, **Playwright 1.64**       | Fast unit/integration feedback plus real browser coverage against a production build.        |

Node **20.9+** is required by Next.js. This project was developed and verified on Node **24.19** and npm **11.17**.

---

## Quick start

### Windows PowerShell

```powershell
git clone <your-repo-url> cybersentinel
cd cybersentinel
npm.cmd install
npm.cmd run setup
npm.cmd run dev
```

### macOS / Linux

```bash
git clone <your-repo-url> cybersentinel
cd cybersentinel
npm install
npm run setup
npm run dev
```

Open <http://localhost:3000>. `npm run setup` creates `.env` with a generated `SESSION_SECRET`, applies the schema, and seeds demo data. It is safe to re-run: it never overwrites an existing `.env`, and seeding refuses to overwrite a populated database.

### Demo accounts

Shown on the login screen only when `NEXT_PUBLIC_DEMO_MODE=true`:

| Role             | Email                       | Password           |
| ---------------- | --------------------------- | ------------------ |
| Administrator    | `admin@cybersentinel.dev`   | `DemoAdmin!2026`   |
| Security analyst | `analyst@cybersentinel.dev` | `DemoAnalyst!2026` |

**Change or remove these before any public deployment.** The analyst can use the operational views; only the administrator can open the audit log and manage users' elevated actions.

### Reset the demo data

```powershell
npm.cmd run db:reset    # requires typing the confirmation phrase
```

---

## How the risk score works

The score is intentionally explainable. Each active finding contributes:

```text
weight = severityWeight × statusFactor × cvssFactor × exposureFactor × criticalityFactor
```

| Input              | Values                                                     |
| ------------------ | ---------------------------------------------------------- |
| Severity weight    | critical 10, high 5.5, medium 2.5, low 0.8, info 0.2       |
| Status factor      | open 1.0, in progress 0.65, accepted risk 0.35, resolved 0 |
| CVSS factor        | `0.75 + (CVSS / 10) × 0.55`; 1.0 when CVSS is absent       |
| Exposure factor    | internet 1.35, internal 1.0, isolated 0.7                  |
| Criticality factor | `0.7 + criticality × 0.1` for criticality 1–5              |

The organization score is:

```text
securityScore = round(100 × e^(−totalWeightedRisk / 280))
```

Asset risk uses the same weighted findings with a tighter decay constant (`18`) and is expressed as a 0–100 risk percentage. The 14-day trend reconstructs the score from finding creation and resolution timestamps; it is an approximation because status changes are not historized. Mean time to resolve ignores missing or invalid timestamps.

Why an exponential curve? It is monotonic, never exceeds 100, and has diminishing impact per additional finding. The constants are calibrated for a small-team backlog, not measured against a real environment. `src/lib/risk.test.ts` pins the behavior.

---

## AI modes

**Local mode (default).** `src/lib/ai/local-analyst.ts` parses intent from the question and composes an answer from the current posture snapshot. It is deterministic, free, offline-capable, and returns citations to the records it used. Remediation plans come from a structured five-phase playbook.

**External mode (optional).** Set all three variables to route copilot and remediation requests to any OpenAI-compatible chat-completions endpoint:

```dotenv
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=your-key
AI_MODEL=llama-3.3-70b-versatile
```

Only the posture summary visible in the dashboard, or the single finding/asset record being remediated, is sent. Prompts explicitly treat context and user input as untrusted data. If the provider errors, times out, or returns an unusable response, the local engine answers instead and the UI says so. No API key ever reaches the browser.

---

## Security engineering

- **Passwords:** Node `scrypt` with per-password salt and constant-time verification; a dummy hash keeps unknown-email timing similar to known-email timing.
- **Sessions:** 256-bit random tokens; only an HMAC-SHA-256 hash is stored. Cookies are `httpOnly`, `SameSite=Lax`, `Secure` in production, and expire after 12 hours. Logout revokes the row.
- **Authorization:** `requireUser` / `requireAdmin` on protected pages; every mutating server action re-checks the session and role. Admin-only audit log.
- **Validation:** Zod schemas on every write path, including enums, lengths, hostname/IP formats, CVSS range, CVE format, and date shape. Errors are structured, not stack traces.
- **Database:** Parameterized libSQL queries; foreign keys enabled; unique hostname/email constraints handled explicitly.
- **Headers:** CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY`, referrer policy, and a restrictive permissions policy.
- **Audit:** Logins, logouts, asset/finding changes, profile/password changes, copilot use, and exports are recorded with actor, action, entity, and safe details.
- **CSV export:** Cells beginning with `=`, `+`, `-`, `@`, tab, or carriage return are prefixed to block spreadsheet formula injection.
- **Rate limiting:** Login is limited per email and per IP; copilot is limited per user. Rate-limit keys and logs never contain passwords or raw tokens.

Known limitations are documented honestly in [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md), including the in-memory rate limiter, CSP `unsafe-inline`, lack of MFA/email verification, and the demo threat-intel feed cache warning.

---

## Quality gates

```powershell
npm.cmd run format:check   # Prettier
npm.cmd run typecheck      # tsc --noEmit
npm.cmd run lint           # ESLint (Next.js flat config)
npm.cmd run test           # Vitest unit + integration
npm.cmd run test:coverage  # V8 coverage report
npm.cmd run build          # production build
npm.cmd run audit          # npm audit, high severity and above
npm.cmd run test:e2e       # build + Playwright against `next start`
```

`npm run check` runs formatting, type checking, linting, unit/integration tests, and the production build in sequence.

Tests cover the risk engine, validation schemas, CSV escaping, password hashing, rate limiting, the local analyst, and database repositories against a temporary SQLite database. Playwright covers sign-in, route protection, dashboard, assets, findings, events, threat intel, copilot, audit access, and settings.

The E2E suite uses a setup project that signs in once and stores the authenticated state in `.auth/` (gitignored). It runs against a production server to avoid per-route development compilation.

---

## Project structure

```text
src/
  actions/            Server actions (auth, assets, findings, events, copilot, profile)
  app/
    (app)/            Authenticated route group and app shell
    api/              Health check and CSV export route handlers
    login/            Public sign-in page
  components/         Dashboard, forms, dialogs, layout, and UI primitives
  lib/
    ai/               Local analyst, context builder, provider adapter
    db/               libSQL client, schema, row parsers
    repositories/     Typed data access
    security/         Password, session, and rate-limit primitives
    services/         Posture analytics
    validation/       Zod schemas and action error helpers
    risk.ts           Scoring, timeline, MTTR
    threat-intel.ts   CISA KEV client with fallback
scripts/              setup, migrate, seed, reset
tests/e2e/            Playwright specs and auth setup
docs/                 Plan, architecture, threat model, deployment, learning path
```

---

## Configuration

Copy `.env.example` to `.env` and review the comments. The important variables:

| Variable                                | Required   | Notes                                                         |
| --------------------------------------- | ---------- | ------------------------------------------------------------- |
| `SESSION_SECRET`                        | Production | At least 32 characters; `setup` generates one.                |
| `NEXT_PUBLIC_DEMO_MODE`                 | No         | `true` shows demo credentials on login. Set `false` publicly. |
| `TURSO_DATABASE_URL`                    | No         | Switches from local SQLite to hosted libSQL.                  |
| `TURSO_AUTH_TOKEN`                      | With Turso | Required when the URL is set.                                 |
| `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | No         | All three enable external AI.                                 |
| `SEED_ADMIN_*`, `SEED_ANALYST_*`        | No         | Credentials used by the seed script only.                     |

Secrets belong in the host's environment settings, never in the repository. `.env` is gitignored.

---

## Documentation

- [docs/PLAN.md](docs/PLAN.md) — product plan, personas, scope, and success criteria
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design, data model, request flows, tradeoffs
- [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md) — assets, trust boundaries, STRIDE analysis, mitigations, limitations
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — local, Turso, and Vercel deployment guidance
- [docs/LEARNING-PATH.md](docs/LEARNING-PATH.md) — the seven phases and what each one teaches
- [ROADMAP.md](ROADMAP.md) — shipped scope and prioritized backlog
- [CHANGELOG.md](CHANGELOG.md) — release notes
- [CONTRIBUTING.md](CONTRIBUTING.md) — development workflow and review expectations
- [SECURITY.md](SECURITY.md) — disclosure policy and security scope

---

## Limitations

This is a demonstration, not a hardened production service:

- Seeded/simulated data only; no scanner integrations.
- In-memory rate limiting is per process and unsuitable for multi-instance serverless deployments.
- No MFA, email verification, SSO, password history, or account lockout beyond rate limits.
- No versioned migration runner yet; the schema is idempotent and created at startup.
- CSP allows `unsafe-inline` for Next.js bootstrap scripts; a nonce-based policy is on the roadmap.
- The trend line is reconstructed, not an audited score history.
- External AI quality depends on the provider; the local analyst is intentionally narrow.

See [ROADMAP.md](ROADMAP.md) for the path beyond the MVP.

---

## License

[MIT](LICENSE). Use it, learn from it, and ship your own version.
