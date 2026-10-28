# Deployment guide

This guide covers a local run, a hosted demo on Vercel with Turso, and the hardening steps required before exposing the app.

**Current demo:** <https://cybersentinel-eta.vercel.app> runs on Vercel with a Turso libSQL database. GitHub Actions CI passes on `master`. The commands below remain reproducible guidance; verify them against your own accounts rather than assuming they match this deployment.

## 1. Choose a target

| Target                        | Database        | Best for                      | Caveats                                                 |
| ----------------------------- | --------------- | ----------------------------- | ------------------------------------------------------- |
| Local                         | SQLite file     | Development, demos, learning  | Not reachable from the internet                         |
| Vercel (or similar Node host) | Turso libSQL    | A public portfolio demo       | Requires secret management and rate-limit hardening     |
| Container / VM                | SQLite or Turso | Full control, persistent disk | You own patching, backups, TLS, and process supervision |

The app needs a **Node.js runtime**, not Edge, because password hashing uses `node:crypto` scrypt and the libSQL client is a server external package.

## 2. Prerequisites

- Node.js 20.9+ (24.x recommended), npm 10+.
- A Turso account and CLI for hosted deployment: <https://turso.tech>.
- A Vercel account (or another Node host) for the app.
- No AI key is required. External AI is optional.

## 3. Local deployment

```powershell
npm.cmd install
npm.cmd run setup
npm.cmd run build
npm.cmd start
```

Open <http://localhost:3000>. For development, use `npm.cmd run dev` instead of build/start.

The database lives at `data/cybersentinel.db` by default. `DATABASE_FILE` can point elsewhere. Back up the file before resetting; `npm run db:reset` deletes demo data after a typed confirmation.

### Local production-mode checks

```powershell
$env:NODE_ENV = "production"
npm.cmd run build
npm.cmd start
```

A production start requires a valid `SESSION_SECRET` of at least 32 characters. The development fallback is rejected in production.

## 4. Hosted demo: Turso + Vercel

### 4.1 Create the database

```bash
turso auth login
turso db create cybersentinel
turso db show cybersentinel --url
turso db tokens create cybersentinel
```

Store the URL and token in a password manager. Do not paste the token into a commit, issue, screenshot, or chat.

### 4.2 Apply the schema and seed demo data

Run these from the repository with the Turso variables present in your shell. The scripts use the same environment loader as the app.

PowerShell:

```powershell
$env:TURSO_DATABASE_URL = "libsql://<db>-<org>.turso.io"
$env:TURSO_AUTH_TOKEN = "<token>"
npm.cmd run db:migrate
npm.cmd run db:seed
```

macOS/Linux:

```bash
export TURSO_DATABASE_URL="libsql://<db>-<org>.turso.io"
export TURSO_AUTH_TOKEN="<token>"
npm run db:migrate
npm run db:seed
```

Seeding refuses to run against a database that already has users. Use it only for a fresh demo database. **Never seed default credentials into a deployment that will hold real data.**

### 4.3 Configure the host

Set these environment variables in the hosting platform (Production and Preview as appropriate):

| Variable                                                    | Value                                                                              |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `SESSION_SECRET`                                            | 48+ random bytes, base64url. Generate separately per environment.                  |
| `APP_URL`                                                   | `https://your-domain.example`                                                      |
| `NEXT_PUBLIC_DEMO_MODE`                                     | `false` for a hardened deployment; `true` only for a public demo with no real data |
| `TURSO_DATABASE_URL`                                        | The `libsql://` URL                                                                |
| `TURSO_AUTH_TOKEN`                                          | A token with the minimum required scope                                            |
| `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`                     | Optional; set all three or none                                                    |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ANALYST_*` | Only needed when running the seed script, not at runtime                           |

Generate a secret without logging it:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

The app creates missing tables at startup for convenience, but run `db:migrate` explicitly during provisioning so schema failures are visible before traffic arrives. There is no automatic seed in production.

### 4.4 Deploy

**Git-connected Vercel project:**

1. Push the repository to GitHub (after reviewing `git status` and secrets).
2. Import the repository in Vercel.
3. Framework preset: **Next.js**. Build command: `npm run build`. Output: default `.next`.
4. Add the environment variables above before the first production build.
5. Deploy. `NEXT_PUBLIC_DEMO_MODE` is read at build/runtime for server rendering; changing it requires a redeploy.
6. Open `/api/health` and confirm `status: "ok"` and `database: "turso"`.
7. Sign in with a rotated account, not the public demo credentials.

**Vercel CLI alternative:**

```bash
npm i -g vercel
vercel link
vercel env add SESSION_SECRET production
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel --prod
```

Use the CLI prompts rather than pasting secrets into a shell history where possible.

### 4.5 Post-deploy verification

- [ ] `/api/health` returns 200 and reports the expected database mode.
- [ ] Landing page and login render over HTTPS.
- [ ] Sign-in works; cookies show `HttpOnly`, `Secure`, `SameSite=Lax`.
- [ ] Analyst cannot open `/audit`; admin can.
- [ ] Create, edit, and resolve a finding; confirm the audit entry.
- [ ] Export CSV and open it in a spreadsheet; confirm formula-like cells are inert.
- [ ] Copilot answers with citations; the mode label is correct.
- [ ] Threat intel shows **Live** or **Bundled** honestly.
- [ ] 404, error, and loading states render.
- [ ] Mobile navigation and keyboard focus work.
- [ ] `npm audit --audit-level=high` is clean in CI.
- [ ] Backups are configured and a restore has been tested.

## 5. Required hardening before real data

The demo is intentionally honest about what is missing. Before storing real security data:

1. **Disable demo mode** and remove or rotate seeded accounts.
2. **Replace the in-memory rate limiter** with a shared store (Redis/Upstash) or a platform WAF. The current limiter is per process.
3. **Add MFA** and email verification for accounts.
4. **Scope access** by organization/team if more than one team will use it. The current model is single-tenant.
5. **Adopt versioned migrations** and automated backups with a tested restore.
6. **Tighten CSP** with nonces and remove `unsafe-inline`.
7. **Review AI data handling** with the provider: retention, training, region, and a data-processing agreement.
8. **Add monitoring**: error tracking, uptime checks, authentication failure alerts, and database saturation.
9. **Run an independent penetration test and accessibility audit.**
10. **Set a least-privilege Turso token** and document rotation.

## 6. Operations

### Health checks

`GET /api/health` returns:

```json
{
  "status": "ok",
  "database": "turso",
  "version": "0.1.0",
  "timestamp": "2026-10-28T00:00:00.000Z"
}
```

Use it for platform liveness/readiness. It is public and intentionally reveals only coarse status.

### Logs

Production logs are structured JSON on stdout. Useful events include `auth.login_succeeded`, `auth.login_failed`, `auth.login_rate_limited`, `db.ready`, `threat_intel.fetch_failed`, and `ai.*`. Never log passwords, cookies, authorization headers, or API keys.

### Backups

Local: copy `data/cybersentinel.db` while the app is stopped, or use SQLite's backup mechanism. Turso: use the platform's backup/point-in-time features; verify a restore into a separate database before relying on it.

### Rollback

- Application: redeploy the previous known-good build in the host.
- Database: schema changes are additive/idempotent in the MVP, but there is no down-migration. Restore from backup if a destructive change ships.
- Rotate `SESSION_SECRET` to invalidate all sessions after a suspected compromise (this logs everyone out because token hashes no longer match).

## 7. Troubleshooting

| Symptom                                       | Check                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `SESSION_SECRET must be set...` in production | Set a 32+ character secret in the host, then redeploy.                                                              |
| `TURSO_AUTH_TOKEN is required`                | Set both Turso variables; the URL alone is not enough.                                                              |
| Login redirects back to `/login`              | Check cookies over HTTPS, `Secure` flag, clock skew, and that the session row exists.                               |
| `UNIQUE constraint failed` on seed            | The database already has users. Use a fresh DB or `db:reset` locally.                                               |
| CISA feed logs a cache-size warning           | Non-fatal; the feed exceeds Next's 2 MB data-cache limit. The app still renders live or bundled data.               |
| E2E cannot start                              | Ensure a production build exists, port 3000 is free, and the DB is seeded. `npm run test:e2e` builds automatically. |
| Native module error for libSQL                | Use the Node runtime, not Edge; reinstall dependencies on the target platform.                                      |
