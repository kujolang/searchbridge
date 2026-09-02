# SearchBridge pre-live production roadmap

SearchBridge is a local CLI/SDK for agents and CI. It is not a hosted,
multi-tenant service. Tenant isolation, hosted RBAC, a control plane, service
HA, and data-residency administration are therefore outside this release
boundary.

The objective is to finish every repository-local production requirement
before provider credentials are used. The final live phase should validate
provider behavior, not discover missing core architecture.

## 1. Core execution correctness

- [x] Enforce aggregate call, retry, provider-unit, row, byte, page, poll, and
  elapsed-time budgets across `fetch --provider all`.
- [x] Emit deterministic partial-success results and a non-zero process status
  when every selected provider fails.
- [x] Fingerprint every normalized, result-affecting query input while excluding
  credentials, output locations, and other execution-only values.
- [ ] Add safe run and provenance identifiers across results, replay records,
  evidence-query output, SDK metadata, and OTLP exports.

## 2. External adapter runtime and conformance

- [ ] Complete adapter v2 request templating, typed field mapping, JSON/CSV/
  GraphQL response handling, and bounded pagination strategies.
- [ ] Route installed external adapters through semantic `fetch` without core
  provider-specific branches.
- [ ] Prove the Plausible package through the generic engine in fixture mode.
- [ ] Replace declarative/hard-coded conformance success flags with behavioral
  operation tests for success, empty, partial, provider error, rate limiting,
  pagination, bounds, redaction, and cost metadata.
- [ ] Make drift checks compare sanitized upstream metadata or response shapes
  when a provider exposes a suitable source.

## 3. Reliability, scale, and recovery

- [ ] Add operation-specific retry/rate-limit policy and circuit breaking.
- [ ] Make asynchronous provider tasks resumable with bounded polling and
  interruption cleanup.
- [ ] Add local HTTP/TLS simulations for redirects, timeouts, malformed data,
  private destinations, throttling, and dropped connections.
- [ ] Add load, soak, cancellation, and fault-injection qualification.
- [ ] Add spillable, disk-budgeted evidence joins.
- [ ] Add cache v1 audit/migration, key rotation, retention cleanup, corruption
  recovery, and restrictive file-permission tests.

## 4. Contract and security hardening

- [ ] Establish schema/adapter compatibility ranges, deprecation rules, and
  migration fixtures.
- [ ] Decide whether `crawl.data` becomes executable or is removed from the
  advertised public contract before release.
- [ ] Complete a threat model, repository security scan, and fuzz/property tests
  for URL, JSON, CSV, canonicalization, signature, cache, and redaction paths.
- [ ] Verify RFC 8785 canonicalization or name the implemented signing format
  precisely; add trust-key rotation and revocation behavior.
- [ ] Require dependency, secret, and static-analysis checks in release gates.

## 5. Agent, SDK, and distribution readiness

- [ ] Ship a runnable local stdio MCP server if MCP is a supported integration,
  generated from the same catalog and preserving submission confirmation.
- [ ] Package usable TypeScript, Rust, and Go SDK artifacts with typed errors,
  streaming readers, validation helpers, examples, checksums, and provenance.
- [ ] Build reproducible, checksum-verified runtime bundles for every supported
  platform and test clean/offline installation.
- [ ] Publish agent, CI, replay, join, external-adapter, upgrade, rollback,
  recovery, and provider-outage guidance.

## 6. Repository and release governance

- [ ] Add `SECURITY.md`, `CODEOWNERS`, protected-branch requirements, secret
  scanning, dependency alerts, code scanning, and protected release tags.
- [ ] Run the complete suite with the exact supported Kujo runtime and retain
  cross-platform, benchmark, SBOM, checksum, signature, and provenance evidence.
- [ ] Verify the release candidate from a clean checkout/environment.

## Final provider-dependent gate

- [ ] Run every supported live operation against sanctioned least-privilege
  accounts/properties.
- [ ] Validate live normalization, pagination, empty/permission/rate-limit
  behavior, and estimated versus observed quota or provider-unit use.
- [ ] Record provider retention/usage-policy approval where required.
- [ ] Obtain consecutive clean scheduled compatibility runs.
- [ ] Tag and publish the release only after the live evidence is reviewed.

## Offline release-candidate exit criteria

Before the final gate begins, sections 1–6 must be complete; all fixture,
conformance, SDK, platform, migration, mocked-network, performance, and security
checks must pass; release artifacts must be reproducible and independently
verifiable; and the only remaining unknowns must require real provider accounts,
responses, quotas, or policy approval.
