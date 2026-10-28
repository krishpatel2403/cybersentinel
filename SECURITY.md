# Security policy

CyberSentinel is an **educational portfolio project**. It is not a production security product, and it has not undergone an independent security audit or penetration test. Do not use it to protect real data without a full review and the hardening work described in [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md).

## Supported versions

| Version | Supported                      |
| ------- | ------------------------------ |
| `0.1.x` | Best-effort fixes for the demo |

## Reporting a vulnerability

Please **do not open a public issue** for a suspected vulnerability.

Once the repository is published, use GitHub's private vulnerability reporting on the repository's **Security** tab. If that is unavailable, contact the maintainer through the contact method listed on their GitHub profile and include:

- A description of the issue and its impact.
- Reproduction steps or a minimal proof of concept.
- The affected route, action, or file.
- Your environment (Node version, local SQLite or Turso, browser).
- Whether the issue also affects a deployment using demo data only.

Do not include real credentials, personal data, or destructive payloads. Allow reasonable time for a response before public disclosure.

## In scope

- Authentication and session handling (`src/lib/security/`, `src/actions/auth.ts`).
- Authorization bypasses between the `analyst` and `admin` roles.
- Injection in repository queries, CSV export, or rendered user content.
- Server-side validation gaps in asset, finding, profile, password, and copilot actions.
- Secret exposure through logs, client bundles, error messages, or API responses.
- CSRF or cookie configuration issues.
- Security header regressions.

## Out of scope

- Findings that require a compromised host, browser extension, or administrative access to the deployment platform.
- Denial of service through unrealistic volumes, except where it reveals a missing validation or rate-limit bypass.
- The known limitations listed below and in the threat model.
- Vulnerabilities in third-party services (report them upstream).
- Social engineering, physical access, or spam.

## Known limitations

These are documented design constraints, not unknown vulnerabilities:

- Rate limiting is in-memory and per process. It does not coordinate across serverless instances.
- CSP allows `'unsafe-inline'` for scripts and styles because Next.js injects bootstrap markup. A nonce-based policy is planned.
- No MFA, email verification, SSO, password history, or breached-password checks.
- Demo credentials are public by design when `NEXT_PUBLIC_DEMO_MODE=true`. Never deploy that configuration with real data.
- The CISA KEV feed is untrusted external input; it is parsed defensively and truncated, but availability depends on CISA.
- The local AI analyst is deterministic and narrow. External AI output is untrusted and must not be treated as authoritative.
- Seeded data is fictional. Threat intel entries are public advisories, not assessments of the demo environment.

## Security practices in the codebase

- `scrypt` password hashing with per-password salts and constant-time comparison.
- HMAC-SHA-256 session token hashes at rest; raw tokens only in httpOnly cookies.
- Server-side Zod validation and authorization on every write path.
- Parameterized SQL through libSQL.
- Structured logs that omit secrets and raw request bodies.
- CSV formula-injection escaping.
- Audit logging for security-relevant actions.
- Dependabot and CI checks for dependencies, types, lint, tests, and build.

## Disclosure

Please give the maintainer a reasonable window to investigate and ship a fix before publishing details. Credit is welcome if you would like it.
