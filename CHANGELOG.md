# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Planned

- Shared-store rate limiting, MFA, organization scoping, versioned migrations, nonce-based CSP. See [ROADMAP.md](ROADMAP.md).

## [0.1.0] — 2026-10-28

First portfolio MVP. Local-first with seeded demo data, deployed as a public demo on Vercel with Turso; CI passing.

### Added

- Next.js 16 App Router application with TypeScript strict mode, React 19, and Tailwind CSS 4.
- Public landing page, demo-gated login, authenticated app shell, 404, error, and global error boundaries.
- Custom email/password authentication using scrypt, HMAC-hashed session tokens, httpOnly/SameSite cookies, 12-hour expiry, and logout revocation.
- Role-based access for administrators and analysts, including an admin-only audit log.
- libSQL/SQLite persistence with an idempotent schema, indexes, constraints, and optional Turso support.
- Repositories for users, sessions, assets, findings, events, and audit logs.
- Seed, migrate, reset, and setup scripts with a coherent 10-asset / 17-finding demo data set.
- Explainable risk engine: severity, status, CVSS, exposure, and criticality weighting; organization and asset scores; grade; 14-day trend reconstruction; MTTR.
- Dashboard with score, trend, severity distribution, top assets, priority findings, recent events, and a local analyst brief.
- Asset inventory with search, filters, detail pages, and create/edit/delete flows.
- Findings register with filters, detail pages, create/edit, inline status changes, remediation notes, due dates, and authenticated CSV export.
- CSV formula-injection protection.
- Event stream with filters, pagination, and a telemetry simulator.
- CISA KEV threat-intel integration with defensive parsing, CVE matching, search, a 6-hour revalidation window, and a labeled bundled fallback.
- Grounded copilot with deterministic local answers, citations, suggested questions, per-user rate limiting, and optional OpenAI-compatible provider with automatic fallback.
- Finding remediation plans from a structured local playbook, optionally enhanced by the configured provider.
- Admin audit log with action filters and safe detail rendering.
- Settings for profile updates, password changes (with session revocation), and active-session count.
- Health endpoint and authenticated export route handler.
- Structured, secret-safe logging.
- Security headers: CSP, nosniff, frame denial, referrer policy, permissions policy.
- Design system with focus states, skip link, reduced-motion support, responsive sidebar/mobile navigation, and accessible dialogs.
- Loading, empty, success, and error states across the main routes.
- Vitest unit tests for risk, CSV, validation, password hashing, rate limiting, and the local analyst.
- Vitest integration tests for repositories against temporary SQLite databases.
- Playwright E2E suite covering authentication, route protection, dashboard, assets, findings, events, threat intel, copilot, audit access, and settings, with a production server and authenticated storage state.
- ESLint flat config, Prettier with Tailwind sorting, and npm scripts for every quality gate.
- README, product plan, architecture, threat model, deployment guide, learning path, roadmap, contribution guide, and security policy.
- GitHub Actions CI, Dependabot, issue templates, and a pull request template.
- Public demo at <https://cybersentinel-eta.vercel.app>, backed by Turso libSQL.

### Changed

- Calibrated the risk decay constant for a believable small-team score.
- MTTR ignores invalid or reversed resolution timestamps instead of counting them.
- Login and export flows return structured, user-safe errors.

### Fixed

- Type errors across enum imports, asset criticality types, roles, and fallback templates.
- Node 24 typing issues in the scrypt wrapper.
- Next.js dynamic-usage handling in `getCurrentUser`.
- E2E selector ambiguity caused by the password visibility button, Next route announcer, and required-field markers.
- `.auth/` Playwright storage state is gitignored.

### Known limitations

- In-memory rate limiting is per process.
- No MFA, email verification, password reset, or SSO.
- Single-tenant authorization; no per-asset ACLs.
- CSP permits `'unsafe-inline'` for Next.js bootstrap scripts.
- The 14-day trend is reconstructed, not an audited score history.
- The CISA feed exceeds Next's 2 MB data-cache limit, producing a non-fatal warning.
- No independent security or accessibility audit has been performed.
- The public demo uses seeded credentials and an in-memory rate limiter; it is not suitable for real security data.

[Unreleased]: https://github.com/krishpatel2403/cybersentinel/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/krishpatel2403/cybersentinel/releases/tag/v0.1.0
