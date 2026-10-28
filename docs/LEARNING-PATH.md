# Learning path

CyberSentinel is designed to be read as much as run. This path maps the seven delivery phases to the concepts, files, and exercises that make the project defensible in an interview.

> **How to use this:** read the short concept, open the listed files, run the app, then do the exercise. If you can explain the tradeoff without notes, you own it.

## Phase 1 — Product definition and foundation

**Concepts:** problem framing, personas, MVP scoping, stack selection, TypeScript strictness, design tokens, environment configuration.

**Read:**

- `docs/PLAN.md` — goals, non-goals, success metrics.
- `src/app/globals.css` — color, surface, focus, and motion tokens.
- `src/components/ui/` — the small primitives the whole UI reuses.
- `next.config.ts` — security headers and server external packages.
- `eslint.config.mjs`, `.prettierrc.json`, `tsconfig.json`.

**Run:**

```powershell
npm.cmd install
npm.cmd run setup
npm.cmd run dev
```

**Exercise:** add one non-goal to the plan and explain which MVP feature you would cut to protect the timeline.

**Checkpoint:** can you explain why the project uses the App Router, custom auth, and SQLite instead of the popular alternatives?

## Phase 2 — Data, auth, and domain model

**Concepts:** relational modeling, constraints, repository boundaries, password hashing, session tokens, cookie flags, RBAC, audit logging, Zod validation, server actions.

**Read:**

- `src/lib/db/schema.ts` — tables, checks, indexes, delete behavior.
- `src/lib/repositories/` — typed SQL and row parsing.
- `src/lib/security/password.ts` — scrypt, salt, dummy hash, constant-time comparison.
- `src/lib/security/session.ts` — HMAC token hashes, expiry, cookie flags, `requireUser` / `requireAdmin`.
- `src/actions/auth.ts` — rate limits, generic errors, audit, redirect.
- `src/lib/validation/schemas.ts` — every write path's contract.
- `src/actions/assets.ts`, `src/actions/findings.ts` — authorization, unique constraints, audit.

**Exercise:** add a `PUT`-style action that updates only a finding's owner. Validate the input, re-check the session, write an audit row, and add a test. Then try to call it without a session and confirm it fails.

**Checkpoint:** trace a login from form submit to cookie. Where is the raw token? Where is the hash? What happens if the DB leaks?

## Phase 3 — Risk engine and analytics

**Concepts:** weighted scoring, exponential decay, asset rollups, timeline reconstruction, MTTR, aggregation boundaries.

**Read:**

- `src/lib/risk.ts` — pure functions and constants.
- `src/lib/risk.test.ts` — edge cases and calibration guards.
- `src/lib/services/analytics.ts` — parallel queries and snapshot assembly.
- `src/app/(app)/dashboard/page.tsx` — how the snapshot becomes UI.

**Exercise:** compute the score by hand for two findings: one critical, internet-facing, criticality 5, status open, CVSS 9.8; one medium, internal, criticality 3, accepted risk, no CVSS. Then verify with a small script or test. Change one factor and explain the delta.

**Checkpoint:** why does accepted risk count at 0.35 instead of 0? What does the 14-day line actually reconstruct, and what can it not know?

## Phase 4 — Product UI and accessibility

**Concepts:** server/client boundaries, responsive layout, design system consistency, form state, optimistic vs. server-confirmed updates, focus management, loading/empty/error states.

**Read:**

- `src/app/(app)/layout.tsx` — protected shell and dynamic rendering.
- `src/components/layout/` — sidebar, mobile nav, topbar, user menu.
- `src/components/dashboard/` — composition of the overview.
- `src/components/findings/` and `src/components/assets/` — dialogs, filters, status changes.
- `src/components/ui/modal.tsx` — focus trap, Escape, backdrop behavior.
- `src/app/(app)/*/loading.tsx` — route-level skeletons.

**Exercise:** unplug the network, open a page, and observe the loading and error experience. Then navigate the entire create-finding flow with only the keyboard. Fix one focus or announcement issue you find.

**Checkpoint:** which components must be client components, and why? Where is authorization enforced?

## Phase 5 — AI and threat intelligence

**Concepts:** grounding, context minimization, prompt injection, deterministic fallback, provider adapters, untrusted feed parsing, graceful degradation.

**Read:**

- `src/lib/ai/context.ts` — what is sent and what is deliberately excluded.
- `src/lib/ai/local-analyst.ts` — intent classification and cited answers.
- `src/lib/ai/provider.ts` — timeout, system prompt, fallback, remediation playbook.
- `src/components/copilot/copilot-chat.tsx` — mode labels, citations, rate-limit/error states.
- `src/lib/threat-intel.ts` — validation, truncation, sorting, bundled fallback.
- `src/app/(app)/intel/page.tsx` — live vs. bundled labeling and CVE matching.

**Exercise:** add a new copilot intent (“Which assets have overdue findings?”) to the local analyst, with citations and a test. Then write a malicious finding description and confirm it is treated as data, not instructions.

**Checkpoint:** what exactly leaves the server when external AI is enabled? What happens when the provider times out? How does the UI prevent fallback data from being mistaken for live data?

## Phase 6 — Verification and hardening

**Concepts:** test pyramid, integration tests with a real database, E2E isolation, production-build testing, security headers, CSV injection, rate limiting, auditability, accessibility QA.

**Read:**

- `src/lib/csv.ts` and `src/lib/csv.test.ts` — formula escaping.
- `src/lib/security/password.test.ts`, `rate-limit.test.ts` — security unit tests.
- `src/lib/db/repositories.test.ts` — temp SQLite integration coverage.
- `tests/e2e/` — setup project, storage state, accessible selectors.
- `playwright.config.ts` — production server, single worker, retries.
- `docs/THREAT-MODEL.md` — controls and residual risk.

**Run:**

```powershell
npm.cmd run format:check
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run audit
```

**Exercise:** add an E2E test for a permission boundary (analyst cannot see audit) and one for an empty state. Then deliberately break a validation rule and confirm a test fails for the right reason.

**Checkpoint:** which risks are actually mitigated, and which are only documented? Be precise; “we have tests” is not a threat-model answer.

## Phase 7 — Packaging and release

**Concepts:** developer experience, documentation as a product surface, CI, dependency hygiene, deployment topology, honest status reporting.

**Read:**

- `README.md` — the reviewer's entry point.
- `docs/ARCHITECTURE.md` — diagrams and tradeoffs.
- `docs/DEPLOYMENT.md` — local, Turso, and host guidance.
- `.github/workflows/ci.yml` — gates that must pass.
- `ROADMAP.md`, `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`.

**Exercise:** clone the repository into a fresh directory, follow the README without opening any other file, and note every point where you get stuck. Fix the docs, not just your local setup.

**Checkpoint:** can a reviewer run the app, understand the risk model, identify the security boundaries, and see the limitations in under fifteen minutes?

## Suggested study schedule

| Week | Focus      | Output                                                                  |
| ---- | ---------- | ----------------------------------------------------------------------- |
| 1    | Phases 1–2 | Run locally; trace auth and one mutation; add a validated action        |
| 2    | Phase 3    | Recompute the score; add a risk test; explain the trend                 |
| 3    | Phase 4    | Keyboard/mobile QA; fix one accessibility issue; add an empty state     |
| 4    | Phase 5    | Add a local analyst intent; test prompt-injection behavior              |
| 5    | Phase 6    | Add an integration and an E2E test; run the full gate                   |
| 6    | Phase 7    | Deploy to a free demo stack; write a short architecture decision record |

## Interview prompts to practice

1. Walk me through a login request. Where can it fail, and what does the user see?
2. Why custom auth instead of a library? What did you have to own?
3. How does the score avoid becoming a black box? Where is it weak?
4. How do you stop an analyst from reading the audit log? What if they call the action directly?
5. What happens if the AI provider is down, slow, or malicious?
6. How would you make this multi-tenant?
7. Which part of the threat model is not mitigated, and what would you do first?
8. How do you test a production Next.js app without flaky browser tests?
9. What would you change before storing real vulnerability data?
10. What did you deliberately not build, and why?
