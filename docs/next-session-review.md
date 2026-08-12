# SearchBridge next-session review

This is the prioritized follow-up backlog after the 0.2.0 Kujo-native hardening
pass. Items are intentionally not marked complete; each has a concrete exit
condition for the next engineering session.

## P0 — release confidence

- [ ] Add credential-gated live contract tests for one read request per provider, using dedicated low-privilege test properties. **Done when:** scheduled CI records sanitized request/response contract evidence without making pull-request CI depend on secrets.
- [ ] Add golden cross-version compatibility fixtures for every public envelope. **Done when:** the release gate proves current readers accept all 0.2.x documents and reports intentional breaking changes before release.
- [ ] Add Linux, macOS, and Windows launcher/package smoke jobs. **Done when:** a clean machine can install Kujo, invoke SearchBridge, and complete a deterministic fixture command on every supported Kujo platform.
- [ ] Publish a signed 0.2.x release with checksums, SBOM, provenance attestation, and a reproducible release checklist. **Done when:** consumers can verify both the artifact and its build provenance without trusting the repository checkout.

## P1 — provider completeness and scale

- [ ] Implement provider pagination with explicit total-row and page-count budgets. **Done when:** GSC, GA4, Bing, and Ahrefs can retrieve more than one page without exceeding declared cost or memory bounds.
- [ ] Add a bounded batch command for independent read capabilities with partial-success output. **Done when:** one unavailable provider cannot discard healthy results and concurrency remains caller-bounded.
- [ ] Honor `Retry-After` with capped jitter and expose non-sensitive retry telemetry. **Done when:** 429 behavior follows provider guidance without synchronized retry storms or secret-bearing logs.
- [ ] Add streaming JSONL output for high-row-count evidence. **Done when:** memory use stays effectively flat while schema, row, byte, and token limits remain enforceable.
- [ ] Add optional cache/replay storage keyed by credential-independent request hashes. **Done when:** offline reruns can replay approved live evidence with retention, freshness, and redaction controls.

## P1 — extensibility and operations

- [ ] Define a provider-adapter interface and conformance suite. **Done when:** a third-party provider can implement discovery, request, normalization, cost, and write-boundary hooks without editing CLI dispatch.
- [ ] Add structured telemetry hooks for latency, retries, rows, truncation, and provider cost class. **Done when:** operators can export metrics without exporting URLs, tokens, headers, or row contents.
- [ ] Add configuration-file profiles with environment override precedence and schema validation. **Done when:** teams can version non-secret defaults while secrets remain environment-only.
- [ ] Add exit-code and degraded-health policy flags for CI. **Done when:** operators can choose whether unavailable optional capabilities are informational, warning, or failing.

## P2 — contract quality and adoption

- [ ] Publish capability-specific row schemas and canonical examples. **Done when:** downstream tools can generate types for every normalized capability.
- [ ] Add standards-complete UTF-8 query-component encoding to Kujo core and replace SearchBridge's bounded local encoder. **Done when:** all Unicode and reserved-character vectors pass an RFC 3986 test corpus without a foreign-language bridge.
- [ ] Add provider compatibility snapshots and upstream-change monitoring. **Done when:** endpoint or response-shape drift opens a reviewable issue before a release silently regresses.
- [ ] Build a minimal Kujo integration example that composes SearchBridge with an agent or CI quality gate. **Done when:** the example consumes typed evidence, handles degradation, and demonstrates why Kujo is useful beyond the standalone CLI.
