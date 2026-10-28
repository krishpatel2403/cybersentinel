# Roadmap

CyberSentinel is an MVP and a learning artifact. This roadmap separates what is shipped, what is intentionally deferred, and what would be required before real-world use.

## Shipped — v0.1.x

### Product

- Public landing page and demo-gated sign-in.
- Posture dashboard with explainable score, grade, 14-day trend, severity mix, top assets, priority findings, MTTR, and analyst brief.
- Asset inventory with filtering, detail pages, create/edit/delete, tags, criticality, and exposure.
- Findings register with filters, detail pages, inline status changes, owner notes, due dates, and CSV export.
- Event stream with severity filters, pagination, and a simulator that writes real rows.
- CISA KEV threat intel with CVE matching, search, labels for live vs. bundled data, and a fallback.
- Grounded copilot with cited answers, suggested questions, rate limiting, local mode, and optional external AI with fallback.
- Finding remediation plans with a five-phase local playbook and optional AI.
- Settings: profile update, password change with session revocation, active-session count.
- Admin-only audit log with filters.

### Engineering

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4.
- libSQL/SQLite locally, optional Turso.
- Custom scrypt auth, HMAC-hashed sessions, httpOnly cookies, RBAC.
- Zod validation on all write paths; structured server-action errors.
- Audit logging, structured safe logs, CSV formula escaping, security headers.
- Responsive, accessible design system with loading/empty/error states.
- Unit and integration tests (Vitest) and E2E tests (Playwright, production build).
- GitHub Actions CI, Dependabot, issue and PR templates.
- Documentation: plan, architecture, threat model, deployment, learning path, policies.

## Next — hardening and depth

### P0 — before any real data

- [ ] Replace the in-memory rate limiter with a shared Redis/Upstash store; add per-account lockout.
- [ ] Add MFA (TOTP/WebAuthn) and email verification; recovery codes.
- [ ] Add organization/team scoping and per-asset authorization if more than one team uses it.
- [ ] Versioned database migrations with up/down paths and a backup/restore runbook.
- [ ] Nonce-based CSP; remove `unsafe-inline` for scripts.
- [ ] Automated dependency and container scanning; generate an SBOM in CI.
- [ ] Add error tracking, uptime checks, and authentication-failure alerts.
- [ ] Independent penetration test and accessibility audit.

### P1 — product depth

- [ ] Saved views and shareable filter URLs across assets/findings/events.
- [ ] Bulk finding actions (status, owner, due date) with an audit summary.
- [ ] Finding comments and an append-only activity timeline.
- [ ] Asset-to-finding quick create and richer asset metadata (business unit, environment, data classification).
- [ ] CSV/JSON import with a dry-run preview and row-level errors.
- [ ] Email or webhook notifications for critical findings and overdue items.
- [ ] Risk-acceptance workflow with an expiry date and justification.
- [ ] Score history persisted per day instead of reconstructed.
- [ ] Report export (PDF/HTML) for a weekly posture review.

### P2 — integrations

- [ ] Scanner import adapters (Trivy, Nuclei, cloud posture exports) behind a normalized finding interface.
- [ ] Cloud/identity inventory sync with explicit read-only credentials.
- [ ] SIEM/EDR event ingestion with deduplication and rate limits.
- [ ] NVD enrichment for CVSS/EPSS where available.
- [ ] SIEM export of audit logs (syslog/HTTP).

### P3 — AI quality

- [ ] Evaluation set for copilot answers: groundedness, citation accuracy, refusal behavior.
- [ ] Output filtering and structured citations to records.
- [ ] Provider allowlist and data-retention configuration.
- [ ] Cost/usage dashboard and per-organization quotas.
- [ ] Optional tool use with explicit, read-only, audited capabilities (never autonomous remediation).

## Later — scale and platform

- [ ] Multi-tenant row-level isolation and admin impersonation with audit.
- [ ] Background jobs for imports, notifications, and score snapshots.
- [ ] Read replicas / query optimization for large registers.
- [ ] Public API with scoped tokens and rate limits.
- [ ] Self-service onboarding and sample workspace.
- [ ] Internationalization and timezone-aware reporting.
- [ ] Mobile app or PWA offline view.

## Explicitly out of scope

- Becoming a scanner, SIEM, SOAR, or GRC platform.
- Autonomous exploitation, scanning, or remediation of real systems.
- Compliance certification or legal advice.
- Storing real client data in the public demo.

## How priorities are chosen

1. **Security correctness** before new surface area.
2. **Core triage loop** before integrations.
3. **Explainability** before model sophistication.
4. **A small, tested feature** before a broad, unverified one.

## Definition of done for a roadmap item

- Behavior is implemented on the server with authorization and validation.
- Empty, loading, success, and error states exist.
- Tests cover the happy path and at least one failure or boundary.
- Docs, changelog, and threat model are updated when relevant.
- The full quality gate passes locally and in CI.
- No claim of deployment or verification that did not happen.
