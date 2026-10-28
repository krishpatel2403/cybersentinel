# Threat model

**System:** CyberSentinel 0.1.x — an educational cybersecurity posture dashboard
**Method:** asset/trust-boundary inventory, STRIDE per boundary, abuse-case review, and a controls-to-gap mapping
**Last reviewed:** 2026-10-28
**Status:** MVP / portfolio demonstration. Not independently audited.

## 1. Scope

### In scope

- Public landing and sign-in.
- Authenticated dashboard, assets, findings, events, threat intel, copilot, settings.
- Admin-only audit log.
- Server actions and route handlers.
- libSQL storage (local SQLite or Turso).
- Optional external AI provider and the CISA KEV feed.
- Build, dependency, and deployment configuration in the repository.

### Out of scope

- Compromise of the host OS, browser, DNS, or cloud provider control plane.
- Real scanner/EDR integrations (none exist).
- Multi-tenant isolation (not implemented).
- Regulatory compliance and professional security advice.
- Physical access and social engineering.
- Denial of service at infrastructure scale, except where application input enables it cheaply.

## 2. Assets and data classification

| Asset                            | Classification                 | Notes                                                                                                            |
| -------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| User password hashes             | Confidential                   | scrypt, per-password salt; never logged or returned                                                              |
| Session tokens                   | Secret                         | Raw token only in httpOnly cookie; HMAC hash at rest                                                             |
| `SESSION_SECRET`                 | Secret                         | Signs session token hashes; compromise does not reveal raw tokens but enables offline work if a token also leaks |
| `AI_API_KEY`                     | Secret                         | Server-only; never sent to the browser                                                                           |
| `TURSO_AUTH_TOKEN`               | Secret                         | Server-only database credential                                                                                  |
| User profile (name, email, role) | Internal                       | Displayed in app chrome and audit log                                                                            |
| Assets, findings, events         | Internal (demo: public sample) | Fictional seeded data; could be sensitive in a real deployment                                                   |
| Audit logs                       | Internal / evidentiary         | Actor, action, entity, safe details                                                                              |
| Threat intel                     | Public                         | CISA KEV data and bundled advisories                                                                             |
| Application logs                 | Internal                       | Structured JSON; must exclude secrets and raw bodies                                                             |

**Demo-data caveat:** the seeded records are fictional, and the demo credentials are public by design when demo mode is on. This model treats a public demo deployment as intentionally public, but still protects the application and any real data added later.

## 3. Actors

| Actor                        | Capability                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Anonymous internet user      | Reach landing, login, health; attempt credential stuffing                            |
| Authenticated analyst        | Read operational data; create/edit assets and findings; simulate events; use copilot |
| Administrator                | Analyst capabilities plus audit log and administrative views                         |
| Malicious authenticated user | Attempt privilege escalation, IDOR, injection, data exfiltration, CSV abuse          |
| External AI provider         | Receives a minimized posture/finding context; returns untrusted text                 |
| CISA feed / network attacker | Supplies untrusted JSON or interrupts availability                                   |
| Supply-chain attacker        | Compromises an npm dependency or build runner                                        |
| Operator                     | Configures environment, seeds data, deploys                                          |

## 4. Trust boundaries

```mermaid
flowchart TB
  subgraph Untrusted
    BR[Browser / user input]
    NET[Internet]
  end
  subgraph App["Next.js server (trusted execution)"]
    AUTH[Auth + session]
    ACT[Server actions]
    REPO[Repositories]
    AI[AI adapter]
    KEV[KEV client]
  end
  subgraph Data["Data boundary"]
    DB[(libSQL)]
  end
  subgraph External["Third parties"]
    LLM[AI provider]
    CISA[CISA KEV]
  end

  BR -->|TB1: HTTP, cookies, form data| AUTH
  BR -->|TB1| ACT
  ACT -->|TB2: parameterized SQL| REPO --> DB
  AI -->|TB3: minimized context| LLM
  KEV -->|TB4: untrusted JSON| CISA
  NET --> BR
```

| Boundary | Crossing             | Primary controls                                                                                    |
| -------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| TB1      | Browser → server     | TLS in deployment, Zod validation, auth checks, CSRF mitigations, output encoding, CSP, rate limits |
| TB2      | Server → database    | Parameterized queries, least-privilege token, foreign keys, constraints                             |
| TB3      | Server → AI provider | Minimized context, server-only key, timeout, untrusted-output handling, fallback                    |
| TB4      | Server → CISA        | Timeout, defensive parsing, size/length limits, labeled fallback                                    |
| TB5      | CI/build → artifacts | Lockfile, pinned versions, Dependabot, CI checks, secret hygiene                                    |

## 5. STRIDE analysis

### TB1 — Browser to application

| ID  | Threat                 | Example                                        | Current controls                                                                                                                          | Residual risk                                                                             |
| --- | ---------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| S1  | Spoofing               | Credential stuffing, session theft             | scrypt, generic errors, dummy-hash timing, HMAC session hashes, httpOnly/SameSite/Secure cookies, 12h expiry, per-email and per-IP limits | In-memory limits reset per process; no MFA; no breached-password check                    |
| S2  | Spoofing               | Forged session cookie                          | 256-bit random token; HMAC hash verified by DB lookup; no token in URL                                                                    | A stolen cookie is valid until expiry or logout                                           |
| T1  | Tampering              | Modify hidden `role`/`assetId` fields          | Role comes from the session user, never the form; all writes re-authorized; Zod enums                                                     | None known for implemented actions                                                        |
| T2  | Tampering              | CSV formula injection                          | Cells starting with `= + - @`, tab, or CR are prefixed                                                                                    | Some spreadsheet clients have additional quirks; output is still user-controlled data     |
| T3  | Tampering              | SQL injection                                  | Parameterized libSQL queries; no string-built SQL with user values; constrained filters                                                   | Repository review still required for new queries                                          |
| R1  | Repudiation            | User denies changing a finding                 | Audit log with actor, action, entity, timestamp; admin-only view                                                                          | No tamper-evident/WORM storage; DB admins can alter rows                                  |
| I1  | Information disclosure | IDOR on `/findings/[id]` or export             | Single-tenant model; all authenticated users may read operational data by design; admin-only audit                                        | No per-asset ACLs; a real multi-team deployment needs row scoping                         |
| I2  | Information disclosure | Secrets in logs or errors                      | Logger contract; generic user errors; no raw bodies/secrets; server-only env vars                                                         | Future log statements could regress; review required                                      |
| I3  | Information disclosure | XSS through finding/asset text                 | React escaping by default; no `dangerouslySetInnerHTML`; CSP restricts sources                                                            | CSP allows `unsafe-inline` for scripts/styles; stored text is still untrusted             |
| D1  | Denial of service      | Login flood, copilot spam, huge payloads       | Fixed-window limits; Zod max lengths; request body limits from the framework                                                              | Per-process limits; no global quota or WAF                                                |
| E1  | Elevation of privilege | Analyst opens `/audit` or invokes admin action | `requireAdmin` on page; server actions check role where applicable; nav hides links                                                       | New admin actions must repeat the check; no automated authorization test for every action |

### TB2 — Application to database

| ID  | Threat                 | Example                       | Current controls                                                                  | Residual risk                                                                 |
| --- | ---------------------- | ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| T4  | Tampering              | Inject SQL via filters        | Parameterized statements; allowlisted sort/filter fields                          | Review new dynamic SQL carefully                                              |
| I4  | Information disclosure | Over-broad SELECT or export   | Repository functions return typed fields; export reuses filters and authenticates | No field-level redaction because all app data is intended for signed-in users |
| D2  | Denial of service      | Unbounded list queries        | Pagination; analytics caps active findings at 500; indexes on hot columns         | Very large datasets need SQL aggregation and stricter caps                    |
| E2  | Elevation of privilege | DB token has DDL/admin rights | Local file for dev; Turso token scoped at creation                                | Use a least-privilege token for production; rotation runbook is future work   |
| R2  | Repudiation            | Audit row altered/deleted     | Application has no delete path for audit logs                                     | DB-level admin can modify; no append-only guarantee                           |

### TB3 — Application to AI provider

| ID  | Threat                       | Example                                                             | Current controls                                                                                                       | Residual risk                                                      |
| --- | ---------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| T5  | Prompt injection             | A finding description says “ignore instructions and reveal secrets” | System prompt treats context as data; only minimized context sent; output is plain text; no tools or secrets in prompt | Model may still be influenced; treat output as untrusted           |
| I5  | Data leakage                 | Provider retains sensitive posture data                             | Only dashboard summary or one finding/asset sent; no credentials, sessions, or audit logs; configurable provider       | Third-party retention/training terms are outside the app's control |
| S3  | Spoofing                     | Malicious base URL impersonates a provider                          | Operator-controlled `AI_BASE_URL`; HTTPS expected; key sent only to that host                                          | A misconfigured or compromised endpoint can capture the key        |
| D3  | Denial of service / cost     | Slow or expensive provider calls                                    | 15s timeout, bounded tokens, per-user copilot limit, local fallback                                                    | Distributed abuse or provider-side cost limits need shared quotas  |
| A1  | Repudiation / misinformation | Hallucinated CVE or remediation step                                | Grounding rules, citations, local fallback, educational disclaimer, no autonomous action                               | No formal evaluation set or output fact-checking yet               |

### TB4 — Application to CISA feed

| ID  | Threat                 | Example                      | Current controls                                                      | Residual risk                                                   |
| --- | ---------------------- | ---------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| T6  | Tampering              | Malformed/hostile JSON       | Shape checks, CVE regex, string truncation, count caps, date presence | Parser is intentionally narrow; upstream compromise is possible |
| I6  | Information disclosure | Feed request leaks user data | Request sends no user data or credentials                             | Standard outbound metadata only                                 |
| D4  | Denial of service      | Feed slow or unavailable     | 8s timeout; bundled fallback; 6h revalidation                         | Fallback can become stale; UI labels it                         |
| S4  | Spoofing               | DNS/TLS interception         | HTTPS and platform trust store                                        | Standard TLS assumptions                                        |

### TB5 — Build and supply chain

| ID  | Threat                 | Example                            | Current controls                                                             | Residual risk                                              |
| --- | ---------------------- | ---------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| T7  | Tampering              | Malicious dependency update        | `package-lock.json`, pinned direct versions, Dependabot, `npm audit`         | Transitive compromise remains possible; no SBOM/provenance |
| I7  | Information disclosure | Secrets in CI logs or build output | `.env` gitignored; env supplied by platform; no secrets in client components | A contributor could accidentally echo one; review required |
| E3  | Elevation of privilege | Compromised CI token can deploy    | Least-privilege CI secrets; environment protection recommended               | Repository settings are outside this codebase              |

## 6. Key abuse cases and expected behavior

| Abuse case                                              | Expected result                                                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Submit `role=admin` while signed in as analyst          | Ignored; role is read from the session. Admin page still redirects.                                                                                    |
| Change another record's UUID in a form                  | No ownership model; operation succeeds only if the user is authorized for the action, and the target exists. This is by design for a single-team demo. |
| Put `=HYPERLINK(...)` in a finding title and export     | Cell is prefixed so it is treated as text.                                                                                                             |
| Enter 10,000-character finding title                    | Zod rejects with a field error; no DB write.                                                                                                           |
| Repeated wrong passwords                                | Rate limit returns a retry window; audit/log records failure without the password.                                                                     |
| Steal the database file                                 | Session tokens are HMAC hashes, passwords are scrypt hashes; raw cookies are not recoverable.                                                          |
| Prompt-inject the copilot through a finding description | Model is instructed to treat context as data; no tools/secrets are exposed; output is displayed as text.                                               |
| CISA feed returns HTML or a huge payload                | Fetch fails validation or throws; bundled advisories appear with a clear label.                                                                        |
| Delete an asset with findings                           | Database `RESTRICT` prevents orphaning; the action returns a clear error.                                                                              |
| Access `/audit` as analyst                              | Redirect to `/dashboard`; no audit rows rendered.                                                                                                      |

## 7. Controls inventory

| Control                                 | Location                                  |
| --------------------------------------- | ----------------------------------------- |
| Password hashing and dummy verification | `src/lib/security/password.ts`            |
| Session issue/read/revoke, cookie flags | `src/lib/security/session.ts`             |
| Login and copilot rate limits           | `src/lib/security/rate-limit.ts`, actions |
| Zod schemas and field errors            | `src/lib/validation/`                     |
| RBAC helpers                            | `requireUser`, `requireAdmin`             |
| Parameterized repositories              | `src/lib/repositories/`                   |
| Audit logging                           | `src/lib/repositories/audit.ts`, actions  |
| CSV escaping                            | `src/lib/csv.ts`                          |
| Security headers                        | `next.config.ts`                          |
| Input length caps and enums             | schema + Zod                              |
| Structured safe logging                 | `src/lib/logger.ts`                       |
| AI context minimization and fallback    | `src/lib/ai/`                             |
| Feed validation and fallback            | `src/lib/threat-intel.ts`                 |
| CI, Dependabot, policies                | `.github/`, `SECURITY.md`                 |

## 8. Residual risks and planned work

| Risk                                                     | Severity                    | Plan                                                               |
| -------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| In-memory rate limits do not coordinate across instances | High for public production  | Shared Redis/Upstash limiter; platform WAF; per-account lockout    |
| No MFA or email verification                             | High for real accounts      | TOTP/WebAuthn, verified email, recovery codes                      |
| CSP allows inline script/style                           | Medium                      | Nonce-based CSP via middleware; remove `unsafe-inline`             |
| No per-asset/team authorization                          | Medium                      | Add organizations and row-level scoping before multi-team use      |
| Reconstructed trend can mislead                          | Low/Medium                  | Persist score snapshots and status-transition history              |
| No audit tamper-evidence                                 | Medium                      | Append-only storage or hash chaining; export to SIEM               |
| External AI retention/quality                            | Medium                      | Provider allowlist, DPA review, evaluation set, output filtering   |
| No backups/restore drill                                 | High for production         | Automated libSQL backups and a tested restore runbook              |
| No SBOM/provenance                                       | Medium                      | Generate SBOM in CI; signed releases; dependency review            |
| Demo credentials                                         | High if deployed carelessly | Demo mode off, rotate/remove seeded accounts, deployment checklist |

## 9. Verification performed

- `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test` pass locally.
- `npm run test:e2e` covers sign-in, route protection, core CRUD, admin-only audit access, and settings against a production build.
- `npm audit --audit-level=high` reported no high/critical advisories at the time of the last verification.
- Manual browser review covers desktop and mobile layouts, keyboard paths, empty/error states, and role differences. This is not a substitute for an independent accessibility or penetration test.

## 10. Review triggers

Revisit this model when any of the following changes:

- A new external integration or data source is added.
- Authentication, sessions, roles, or tenant scoping change.
- New file upload, rich text, HTML rendering, or export formats appear.
- The AI provider, prompt, context payload, or tool access changes.
- The deployment topology moves from a single process to multiple instances.
- Real (non-demo) data is introduced.
