# SearchBridge next-session review — 0.3

The 0.2.4 production pass closes the previous backlog. These are deliberately
new, evidence-driven opportunities for the next session.

## P0 — operational proof

- [ ] Provision dedicated low-privilege provider test properties and GitHub environment secrets. **External activation:** the workflow and sanitized evidence contract are complete; dedicated provider accounts/properties and secrets are not available in the repository session.
- [ ] Promote Kujo's URI encoder into the next tagged Kujo release. **Release-policy blocked:** Kujo v1.0.2 is prepared and verified at commit `4463678d1badeb4ccff3f6cca8d052b9360f40c0`, but Kujo release policy requires an explicit `UNBLOCK_V1_RELEASE` directive before tagging or publication.
- [x] Provision an independent release-verification runner. **Evidence:** `.github/workflows/independent-release-verification.yml` runs without a build checkout and `scripts/verify_release.kujo` verifies the `v0.2.4` signature, checksums, attestation, archive, and exact-commit platform smoke.

## P1 — scale and extension

- [x] Add a Kujo bounded worker-pool primitive to batch execution. **Evidence:** `parallel_map`-backed batch tests prove wall-clock overlap, stable ordering, cooperative cancellation, bounds, and partial-success shape.
- [x] Add provider page iterators into the JSONL writer. **Evidence:** injected live GSC/GA4 transports prove page-by-page normalized atomic output with no accumulated rows.
- [x] Add signed/encrypted replay-store backends. **Evidence:** AES-256-GCM/HMAC tests prove confidentiality, integrity, tamper rejection, TTL behavior, and replay capability denial.
- [x] Load external declarative adapters from signed manifests. **Evidence:** an RSA-signed third-party fixture executes under exact capability, endpoint, and credential-environment allowlists without dispatch edits.

## P2 — adoption and insight

- [x] Publish generated SDK types for TypeScript, Rust, and Go. **Evidence:** Kujo generation plus `sdk-compatibility` CI compile all three consumers and enumerate every golden envelope and row schema.
- [x] Add OpenTelemetry export behind an explicit opt-in. **Evidence:** OTLP JSON traces/metrics exclude URL, token, header, body, and row inputs across `fixtures/security/otel-redaction.json`.
- [x] Add a local evidence query command. **Evidence:** `evidence-query` uses Kujo's bounded streaming `jsonl_query` primitive for dotted-field filters and constant-memory nested joins.
