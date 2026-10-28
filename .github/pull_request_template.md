## Summary

<!-- What changed and why? Link the issue if one exists. -->

## Type of change

- [ ] Feature
- [ ] Fix
- [ ] Security hardening
- [ ] Refactor
- [ ] Tests
- [ ] Documentation
- [ ] CI / tooling

## Verification

<!-- List the exact commands you ran and their outcomes. Do not claim checks you did not run. -->

```text
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

- [ ] Formatting
- [ ] Type check
- [ ] Lint
- [ ] Unit/integration tests
- [ ] Production build
- [ ] E2E (for UI/auth changes)
- [ ] `npm audit --audit-level=high`

## Security review

- [ ] Authorization is enforced on the server for new/changed actions.
- [ ] New inputs are validated with Zod and bounded.
- [ ] No secrets, tokens, raw form bodies, or personal data are logged.
- [ ] User-controlled text is rendered safely (no unsanitized HTML).
- [ ] New external data or AI context is treated as untrusted.
- [ ] Audit logging added where the action is security-relevant.
- [ ] Threat model updated if the trust boundary changed.

## UI / accessibility

- [ ] Empty, loading, success, and error states handled.
- [ ] Keyboard path verified; focus is managed in dialogs.
- [ ] Icon-only controls have accessible names.
- [ ] Mobile layout checked.
- [ ] Screenshots or recording attached for visual changes.

## Notes for reviewers

<!-- Tradeoffs, follow-ups, or known limitations. -->
