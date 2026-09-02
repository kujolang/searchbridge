# Testing plan

## Provider adapter conformance suite

`adapter test` accepts an adapter package and capability fixture set. The same suite runs for built-ins and external adapters.

1. Manifest/descriptor schema, version and capability declaration.
2. Deterministic discovery metadata and concise agent catalog projection.
3. Credential name validation and no-secret config/manifest/package scan.
4. Exact endpoint/origin/path and method validation after template expansion.
5. Fixture request encoding golden: semantic query → redacted request descriptor.
6. Fixture response parsing and normalization golden.
7. Capability row schema and shared metric-observation validation.
8. Null/missing/unknown-field behavior; no inferred values.
9. Pagination completion, row/page/call/poll/elapsed ceilings, repeated cursor and partial page.
10. Retry/status mapping, rate-limit hints, task polling and cancellation.
11. Cost class, preflight, estimated/actual units and budget rejection before transport.
12. Error and credential redaction for every auth placement.
13. Cache key stability, retention cap, replay adapter/version binding and tamper failure.
14. Offline/fixture/deterministic modes perform zero live calls.
15. Health probe is bounded, read-only and honest about unavailable credentials/entitlement.
16. Large-result JSONL streaming and total output budget.
17. External signature/package digest and trust-key failures.
18. Write capability rejection for external adapters.

The report schema includes adapter ID/version, capability, fixture hashes, passed/failed checks, budgets exercised and SearchBridge version. “Conformant” means all mandatory checks pass; it does not claim live entitlement.

## Core suites

- Registry resolution: duplicate IDs, incompatible contract versions, disabled providers, deterministic order, explicit/auto/all routing, no silent fallback.
- Cross-provider normalization: equivalent stable observations share keys only when definitions match; Moz/Ahrefs/Semrush scores must fail an attempted universal-authority comparison.
- Multi-result: stable provider order, independent envelopes, partial success, global/provider budgets and redacted errors.
- Parser: JSON, GraphQL error/result, bounded CSV quoting/newlines/UTF-8, invalid/deep/oversized payloads.
- Pagination: offset, page, cursor, bounded list and task flows using generic fixtures.
- Security: full corpus from `07-security-review.md`.
- Config: nested provider/routing blocks, secret rejection at every depth, precedence and schema drift.
- Compatibility: all existing golden documents and SDK tests remain green; existing commands produce byte-equivalent deterministic rows unless an approved additive field is expected.
- Agent metadata: catalog/token budgets and MCP schema goldens.
- Performance: startup/catalog/normalization/parser/streaming benchmarks against checked-in thresholds.

## Provider fixture minimum

Each operation ships: happy response, empty response, partial/missing fields, pagination continuation/end, provider error, rate limit, oversized synthetic response, and cost metadata. Async providers also ship pending/completed/failed/timeout sequences. Fixtures are synthetic or explicitly licensed and contain no customer identifiers, URLs, headers or credentials.

## Live tests and drift

Live tests are separate, credential-gated, lowest-cost, lowest-row reads. They record only sanitized contract evidence: provider, operation, adapter/API version, status class, response field paths/types, count, latency, cost units and fixture comparison result. They never upload raw rows or URLs. A provider can release with fixture conformance while live evidence is marked externally blocked, but built-in promotion requires a documented live proof plan and owner.

## Release gates

Run `bash scripts/validate.sh`; adapter conformance for every built-in/reference adapter; generated SDK diff check; clean install/package/platform smokes; benchmark thresholds; secret scan; provider snapshot gate; and clean-machine fixture commands. Paid live calls are never part of default validation.
