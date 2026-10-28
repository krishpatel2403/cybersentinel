# Product plan — CyberSentinel

## 1. Overview

Small security teams often run on spreadsheets, scanner exports, and chat threads. The result is a familiar failure mode: a long list of findings with no shared answer to **“what should we fix first?”**

CyberSentinel is a focused dashboard that turns asset context and a findings register into an explainable risk story. It is also a teaching project: every feature is small enough to read, test, and explain in an interview.

**One-line pitch:** an AI-assisted cybersecurity posture dashboard that ranks exposure, tracks remediation, and answers questions using only the data on screen.

## 2. Problem and audience

### Problem

- Findings are ranked by scanner severity alone, ignoring whether the asset is internet-facing or business-critical.
- Asset ownership and exposure live somewhere else, so triage starts with manual cross-referencing.
- Status updates and risk acceptance are not auditable.
- “AI security” demos often invent incidents, hide their reasoning, or require paid services.

### Primary personas

| Persona                                       | Needs                                                                        | Pain today                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Security analyst** (primary)                | A ranked queue, clear ownership, fast status updates, context from telemetry | Spreadsheet triage, duplicate work, weak prioritization |
| **Security lead / administrator** (secondary) | Posture trend, audit trail, confidence that access is controlled             | No single view, no evidence of who changed what         |
| **Reviewer / interviewer** (tertiary)         | A coherent, runnable project with honest tradeoffs                           | Polished demos that collapse under questioning          |

### Jobs to be done

1. “When I start my day, show me the few findings that actually matter.”
2. “When I open a finding, tell me the asset context and a sensible remediation order.”
3. “When I fix or accept something, record who did it and why.”
4. “When someone asks about posture, give me an answer I can defend with records.”

## 3. Goals and non-goals

### Goals

- A complete, locally runnable MVP with **no paid dependency required**.
- A transparent scoring model that can be explained line by line.
- Real persistence, authentication, authorization, validation, and audit logging — not mocked UI state.
- A grounded AI feature that degrades gracefully and never requires a key.
- Responsive, accessible UI with loading, empty, success, and error states.
- Tests and documentation that make the engineering visible.

### Non-goals (MVP)

- Replacing a vulnerability scanner, SIEM, SOAR, or GRC platform.
- Real-time ingestion from EDR, cloud, or identity providers.
- Multi-tenant organizations, SSO, SCIM, or fine-grained per-asset permissions.
- Compliance certification, evidence collection, or regulatory reporting.
- Production-grade distributed rate limiting or background job processing.
- Autonomous remediation or any action that changes a real environment.

## 4. MVP scope

### Must ship

| Capability          | Acceptance signal                                                              |
| ------------------- | ------------------------------------------------------------------------------ |
| Email/password auth | Sign in, sign out, session expiry, revoked sessions, generic credential errors |
| Role-based access   | Analyst cannot reach `/audit`; admin can                                       |
| Asset inventory     | List, filter, create, edit, delete with validation and ownership               |
| Findings register   | List, filter, create, edit, status transitions, detail view, CSV export        |
| Posture dashboard   | Score, grade, trend, severity mix, top assets, priority findings, MTTR         |
| Events              | Paginated event stream and a simulator that writes real rows                   |
| Threat intel        | CISA KEV fetch, CVE matching, labeled fallback, external links                 |
| Copilot             | Posture Q&A with citations, local mode, optional external mode, rate limiting  |
| Audit log           | Admin-only, records security-relevant actions                                  |
| Settings            | Profile update, password change with session revocation, active-session count  |
| Operational basics  | Health endpoint, error boundaries, 404, security headers, structured logs      |

### Should ship

- Demo-mode credentials on the login page, explicitly gated.
- Seeded data that tells a coherent story across all screens.
- Unit, integration, and E2E tests.
- CI, Dependabot, issue/PR templates.
- Threat model, architecture, deployment guide, roadmap.

### Later

- Versioned migrations and backups.
- Shared rate-limit store.
- MFA and SSO.
- Scanner/cloud integrations.
- Saved views and bulk actions.
- Nonce-based CSP.
- Score history table for an audited trend.

## 5. Experience principles

1. **Explain the number.** Every score exposes its inputs and links to the records driving it.
2. **Label simulated data.** Demo data, live vs. bundled intel, and AI mode are always visible.
3. **Fix the workflow, not just the screenshot.** Empty, loading, error, permission, and success states are part of the design.
4. **Calm density.** Dark, high-contrast, monospace accents for security context; no alarmist red everywhere.
5. **Keyboard and mobile are first-class.** Skip link, focus rings, labeled controls, Escape-to-close dialogs, responsive navigation.
6. **No fake precision.** Scores are heuristic; the UI says so.

## 6. Success metrics

Because this is a portfolio project, success is measured by demonstrable quality rather than production traffic.

| Dimension               | Target                                                                            |
| ----------------------- | --------------------------------------------------------------------------------- |
| Functional completeness | Every MVP route works against a seeded database                                   |
| Quality gates           | Format, typecheck, lint, unit/integration, build, and E2E pass locally and in CI  |
| Security                | No high/critical npm advisories; all mutating actions authorized and validated    |
| Accessibility           | No critical axe issues on core routes; full keyboard path for primary flows       |
| Performance             | Dashboard usable on a mid-range laptop; production build, no dev-only assumptions |
| Explainability          | A reviewer can trace score → findings → asset context without reading the source  |
| Honesty                 | README and docs distinguish verified behavior from limitations and future work    |

## 7. Delivery phases

### Phase 1 — Product definition and foundation

Define the problem, personas, scope, stack, and repository conventions. Establish TypeScript, Tailwind, linting, formatting, environment validation, and the design system.

**Exit:** the app runs, the shell renders, and the decisions are written down.

### Phase 2 — Data, auth, and domain model

Design the schema, repositories, seed data, password hashing, sessions, RBAC, audit logging, and validation. Server actions become the only write path.

**Exit:** a user can sign in, see seeded data, and every mutation is validated and attributed.

### Phase 3 — Risk engine and analytics

Implement weighted scoring, asset risk, timeline reconstruction, MTTR, severity counts, and overdue tracking. Pin behavior with unit tests.

**Exit:** dashboard numbers can be derived by hand from the data.

### Phase 4 — Product UI

Build the shell, dashboard, asset and finding workflows, events, settings, and all state handling. Add responsive navigation and accessibility affordances.

**Exit:** the full workflow is usable with keyboard and on mobile.

### Phase 5 — AI and threat intelligence

Build the local analyst, context builder, provider adapter with fallback, remediation playbook, copilot UI, CISA KEV client, matching, and labeled fallback.

**Exit:** copilot answers are grounded and cited; no key is required; failures degrade visibly.

### Phase 6 — Verification and hardening

Add unit, integration, and E2E coverage. Run typecheck, lint, format, build, audit, and browser QA. Fix defects and document residual risk.

**Exit:** all gates pass and the limitations are explicit.

### Phase 7 — Portfolio packaging and release

Write README, architecture, threat model, deployment guide, roadmap, changelog, contribution and security policies, CI, and templates. Commit locally with a clean tree.

**Exit:** a reviewer can clone, run, understand, and evaluate the project without a call.

## 8. Key decisions

| Decision               | Alternative              | Rationale                                                                               |
| ---------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| Next.js App Router     | Separate SPA + API       | One deployable, server-rendered auth boundaries, server actions, fewer moving parts.    |
| Custom auth            | NextAuth/Auth.js         | The project is a security portfolio; owning the primitives makes the tradeoffs visible. |
| libSQL/SQLite          | Postgres                 | Zero-setup local development; Turso provides a free hosted path.                        |
| Local analyst first    | LLM-only                 | Demo must work offline and without cost; deterministic answers are testable.            |
| CISA KEV with fallback | Paid threat-intel API    | Public, credible, free; fallback keeps the page useful offline.                         |
| Single schema file     | Full migration framework | Appropriate for an MVP; versioned migrations are an explicit roadmap item.              |
| In-memory rate limits  | Redis/Upstash            | No extra service for local demo; documented as a production gap.                        |

## 9. Risks and mitigations

| Risk                                       | Impact                              | Mitigation                                                                    |
| ------------------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------- |
| Scope creep into SIEM/GRC territory        | MVP never ships                     | Non-goals are explicit; features must support the core triage loop.           |
| Demo credentials leak into a public deploy | Account takeover of demo            | `NEXT_PUBLIC_DEMO_MODE`, deployment checklist, seed password rotation.        |
| AI hallucination undermines trust          | Bad remediation advice              | Grounded context, local fallback, citations, educational disclaimer.          |
| Score feels arbitrary                      | Reviewer discounts the project      | Documented formula, calibration notes, unit tests, drill-down links.          |
| E2E flakiness                              | CI noise                            | Production server, single worker, setup project, stable accessible selectors. |
| In-memory limits fail at scale             | Brute-force exposure                | Documented; shared-store migration on the roadmap.                            |
| External feed outage/size                  | Intel page failure or cache warning | Timeout, validation, bundled fallback, labeled source.                        |

## 10. Definition of done for the MVP

- [x] All MVP routes implemented and backed by the database.
- [x] Auth, RBAC, validation, and audit logging on write paths.
- [x] Risk engine and analytics with unit tests.
- [x] Local AI analyst plus optional provider with fallback.
- [x] CISA KEV integration with fallback.
- [x] Responsive shell, loading/empty/error states, accessible controls.
- [x] Unit/integration and E2E suites.
- [x] Format, typecheck, lint, build, and audit gates.
- [x] Plan, architecture, threat model, deployment, roadmap, and policies.
- [x] CI and repository templates.
- [ ] Independent accessibility and penetration test (future work).
- [ ] Production hardening items in the roadmap (not claimed as done).
