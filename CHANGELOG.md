# Changelog

## 0.4.0 — 2026-09-02

- Added one canonical adapter v2 registry for built-in discovery, compatibility commands, semantic routing, and signed external packages.
- Added `fetch` with explicit, configured `auto`, and intact multi-provider `all` results without silent fallback.
- Added DataForSEO, SerpApi, Cloudflare, selected Semrush fixture support, and the signed Plausible reference adapter.
- Added six capability row contracts, provider-qualified metric observations, multi-result contracts, and regenerated TypeScript, Rust, and Go consumers.
- Added paid-call preflight, call/unit/poll/elapsed/cursor/retention bounds, fixed GraphQL, bounded CSV, endpoint validation, expanded redaction, and package digest verification.
- Added concise agent/MCP tool metadata, provider snapshots, drift/live probes, and 100,000-row atomic streaming benchmarks.
- Added aggregate multi-provider budget accounting, all-failed process status, and complete credential-free query fingerprints.
- Added run/trace/query provenance across envelopes, JSONL, encrypted replay, derived evidence, generated SDKs, and OTLP.
- Added typed external-adapter body/query templates, row mappings, bounded offset/page/cursor/async pagination, shared JSON/CSV/GraphQL parsing, behavioral fixture conformance, exact credential binding, and explicit semantic-fetch routing for signed packages.
- Replaced conformance declarations with executable empty, missing-field, partial, provider-error, rate-limit, pagination, bounds, redaction, and cost probes shared by every operation report.
- Added a scheduled drift gate over sanitized, credential-free Google Discovery method and schema shapes for GSC, GA4, PageSpeed, URL Inspection, and CrUX.
- Added per-operation retry allowlists and caps plus bounded circuit breaking; task creation and write operations are explicitly non-retryable.
- Added query-bound, expiring local task receipts so interrupted DataForSEO and external asynchronous jobs can resume bounded polling without reposting paid work.
- Added a real loopback HTTP fault server and self-signed TLS gate covering redirect denial, throttling, timeouts, malformed bodies, dropped connections, and certificate rejection.
- Added a deterministic 100,000-row load gate, 1,000-iteration soak, worker-pool/cancellation checks, and retry/circuit/pagination fault injection to every full validation.
- Added indexed SQLite spill joins with explicit input/disk/row bounds, deterministic cleanup, strategy telemetry, and nested-join parity tests.
- Added guarded cache audit, v1 encryption migration, key rotation, retention cleanup, corruption quarantine, and owner-only permission qualification.
- Added executable adapter runtime ranges, same-major compatibility enforcement, deprecation/removal rules, and migration boundary fixtures.
- Removed the unimplemented `crawl.data` row contract from the 0.4 public SDK and documentation instead of advertising a capability with no executor.
- Named the exact non-JCS signing format as `searchbridge-canonical-json/v1` and added multi-key trust rotation plus fingerprint revocation.
- Added deterministic property testing across URL normalization, endpoint rejection, JSON canonicalization, CSV bounds, signature integrity, cache hashing, and redaction.
- Added a repository threat model, security reporting policy, CODEOWNERS, Dependabot, pinned CodeQL/dependency/secret gates, and a machine-readable protected-branch policy.
- Added a runnable dependency-free stdio MCP server generated from the agent catalog with fail-closed submission confirmation.
- Upgraded the TypeScript, Rust, and Go contract types into packageable local CLI SDKs with typed errors, validators, JSONL readers, and examples.
- Added deterministic self-contained runtime bundles and clean, network-free installation smoke tests across supported CI platforms.
- Added an operator runbook for agent/CI rollout, replay, joins, external adapters, upgrades, rollback, recovery, and provider outages.
- Made the redirect-denial qualification portable across Kujo transport backends without depending on backend-specific error text.
- Added a clean-checkout release-candidate gate retaining benchmarks, SDK packages, runtime bundles, SBOM, checksums, and GitHub build attestations.
- Made the SDK validation gate bootstrap its locked TypeScript toolchain in a clean checkout.
- Added executable encrypted-replay CI and signed external-adapter starter examples and closed the completed 0.4 engineering backlog.
- Updated stdio MCP negotiation to the current stable protocol with bounded framing and included licenses in every SDK package.
- Made the HTTP fault server accept proxy-style absolute request targets and supplied the pinned runtime to the standalone Go SDK example gate.
- Isolated loopback fault qualification from runner proxy settings and made any redirect-policy failure diagnostic.
- Advanced every active CI, monitoring, live, bundle, and release pin to the exact Kujo runtime that enforces SearchBridge's network and filesystem policies.
- Made runtime checksum sidecars portable after download and required CI to verify them from the artifact directory.
- Rooted the aggregate release-candidate checksum manifest at its downloaded artifact directory and verify it before upload.
- Added a portable SHA-256 helper so bundle and SDK packaging work with GNU `sha256sum` on Windows/Linux and `shasum` on macOS.
- Normalized CRLF version files and validate semantic versions before constructing cross-platform bundle or SDK paths.
- Completed the offline production-readiness roadmap and recorded independently verified cross-platform and release-candidate evidence.
- Updated TypeScript and pinned CI/release actions to their current supported major versions.
- Aligned protected-branch review requirements with the repository's single-maintainer ownership while preserving mandatory pull requests and qualification checks.
- Added an agent-ready v1.0 readiness checklist covering live provider proof, unattended authentication, compatibility migration, distribution, security review, and release verification.
- Scoped the v1.0 execution plan to existing Google and Cloudflare access plus no-subscription IndexNow verification, with explicit cost stop conditions and fixture-only treatment for paid providers.

## 0.3.0 — 2026-08-12

- Added a true bounded Kujo worker pool for overlapping independent batch reads with stable ordering, cooperative cancellation, and partial-success records.
- Stream live GSC and GA4 pages directly into atomically published JSONL output without retaining the declared full row budget.
- Added integrity-checked AES-256-GCM replay storage, replay capability allowlists, and fail-closed encrypted-cache policy.
- Added detached RSA-signed external adapter manifests with explicit capability, endpoint, and credential-environment allowlists.
- Added opt-in privacy-preserving OTLP trace and metric export backed by a sensitive-input redaction corpus.
- Added a bounded Kujo-native JSONL filter/join command and the corresponding streaming `jsonl_query` runtime primitive.
- Generated and compile-tested TypeScript, Rust, and Go contract SDKs against all golden envelopes and row schemas.
- Added checkout-independent release verification for tag signatures, checksums, extraction, attestations, and exact-commit platform-smoke evidence.

## 0.2.4 — 2026-08-12

- Included the Windows Kujo source-build prerequisite and exact `x64-windows-static-md` OpenSSL triplet in the qualified release source. Earlier signed tags remain immutable; `v0.2.4` is the final qualified 0.2.x release.

## 0.2.3 — 2026-08-12

- Supplied the required stable toolchain input to every pinned Rust setup action. The signed `v0.2.2` tag remains immutable; `v0.2.3` is the qualified release.

## 0.2.2 — 2026-08-12

- Corrected the full Kujo source pin used by validation, platform, monitoring, live-contract, and release workflows. The signed `v0.2.1` tag remains immutable; `v0.2.2` is the qualified release.

## 0.2.1 — 2026-08-12

- Added bounded native pagination, partial-success batches, streaming JSONL, cache/replay, structured secret-free telemetry, and CI health policies.
- Added declarative third-party adapter contracts, non-secret configuration profiles, public row schemas/examples, golden compatibility documents, and provider snapshots.
- Replaced local query escaping with Kujo's RFC 3986 UTF-8 `encode_uri_component` builtin.
- Added cross-platform launcher/package smoke, scheduled live contract checks, upstream drift issues, and signed-release checksum/SBOM/provenance automation.

## 0.2.0 - 2026-08-12

- Replaced the Python bridge, tests, JSON validator, and benchmark with native Kujo modules.
- Moved implementation into `src/` behind the stable root entrypoint.
- Hardened submission URL validation, disabled custom submission endpoints, and expanded secret redaction.
- Added exact UTF-8 output/response accounting, bounded transient retries, deterministic transport probes, and 131 native assertions.
- Rebuilt CI around a checksum-verified, pinned Kujo v1.0.1 binary.
- Expanded operator, security, architecture, qualification, and next-session documentation.

## 0.1.0 - 2026-08-11

- Initial normalized provider capability layer with offline fixtures and explicit ACT submission controls.
- Qualified malformed provider/submission inputs, offline deterministic reruns,
  scoped partial failure, timeouts, bounded retries, 429/5xx handling, output
  budgets, fixture immutability, and explicit capability + ACT authorization.
