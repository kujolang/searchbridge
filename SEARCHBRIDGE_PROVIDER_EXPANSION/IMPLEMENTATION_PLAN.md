# Implementation plan

Each phase is a releasable vertical slice. Preserve existing commands and goldens throughout.

## Phase 0 — preflight and immutable baseline

- Objective: establish trustworthy before evidence and close the zero-stdout anomaly.
- Files: no intended production change; baseline artifacts under a new provider-expansion qualification directory if the repository convention requires them.
- Reuse: `scripts/validate.sh`, benchmark, goldens, SDK gate, platform workflows.
- New: fixture command/output/startup/catalog/schema baselines; reproduce static-command output using pinned CI runtime.
- Tests/docs: full validation and a short baseline record.
- Risks: runtime mismatch could invalidate performance/CLI assumptions.
- Exit: clean baseline commit/reference; static commands either emit valid documents or a separately authorized fix is committed and verified.

## Phase 1 — capability/provenance contracts

- Objective: add shared metric observations and schemas for six new capabilities plus multi-result.
- Files: `schemas/`, `examples/rows/`, `docs/row-contracts.md`, SDK generator/output, compatibility scripts.
- Reuse: v1 envelope, row schema/golden pattern, SDK gates.
- New: metric-observation definition, new row schemas/examples, `multi-result/v1`, query schema fragments.
- Tests: schema positives/negatives, incompatible metric comparison, old golden compatibility, all SDK compile tests.
- Docs: semantic definitions and exclusion rules.
- Risks: accidental claim of comparability or SDK breaking change.
- Exit: all old goldens readable; new examples validate; no universal authority field exists.

## Phase 2 — registry-driven built-in execution

- Objective: make the existing seven providers resolve through one adapter v2 registry without behavior changes.
- Files: new `src/registry.kujo`/contract module; refactor `src/core.kujo`, `src/commands.kujo`, `src/cli.kujo`, schemas and tests.
- Reuse: provider catalog, command functions, transport, cache, fixtures, telemetry.
- New: safe adapter description, registry validation, resolver, generic execute-page skeleton and compatibility aliases.
- Tests: byte/semantic regression for every fixture command, duplicate/incompatible adapters, discovery determinism, health degradation.
- Docs: internal adapter boundary.
- Risks: broad refactor and current command defaults.
- Exit: existing CLI/API/schema behavior passes unchanged; discovery is generated solely from registry.

## Phase 3 — external adapter v2 and Plausible proof

- Objective: extend—not replace—the signed adapter system and ship a useful read-only reference adapter.
- Files: `src/adapters.kujo`, manifest/conformance schemas, fixtures, adapter docs/examples, new Plausible package.
- Reuse: RSA verification, exact allowlists, core transport, fixture/deterministic modes.
- New: canonical package digests, operation/mapping DSL, offset paging, bearer auth, normalization, capability/version metadata and trust-key fingerprint.
- Tests: full conformance/adversarial suite, signature/file tamper, endpoint/credential binding, Plausible pagination/import warnings.
- Docs: authoring/signing/install/run guide.
- Risks: DSL scope creep or arbitrary-code pressure.
- Exit: Plausible fixture query runs without SearchBridge core source change; external writes remain impossible.

## Phase 4 — semantic fetch and routing

- Objective: expose `fetch --capability` with explicit, deterministic auto and all modes.
- Files: CLI, registry/resolver, config schema/parser, multi-result schema, MCP/agent metadata generator if present.
- Reuse: batch worker pool, capability health, output budgets, config precedence.
- New: typed query, provider preference tables, enablement, routing evidence, global/per-provider budgets.
- Tests: resolution reasons, partial success, stable order, no silent fallback, nested secret rejection, agent catalog budget.
- Docs: routing/config/cost examples.
- Risks: command proliferation and surprising defaults.
- Exit: existing commands are compatibility aliases; semantic fetch works fixture-first and explains every selection.

## Phase 5 — cost policy and task/cursor/parser primitives

- Objective: safely support paid and protocol-diverse providers before adding them.
- Files: transport/cache/config/CLI, new bounded CSV and task/pagination modules, telemetry schemas.
- Reuse: retries, response/output bounds, replay, cancellation, safe cost headers.
- New: cost classes, `--allow-paid`, call/unit/poll/elapsed budgets, provider retention cap, CSV, cursor repetition guard, async task state machine, GraphQL error mapping.
- Tests: budget rejection before transport, retry/poll amplification, CSV adversarial corpus, retention cap, query credential redaction, GraphQL variable safety.
- Docs: operator cost/security policy.
- Risks: paid-call amplification and URL-credential leakage.
- Exit: generic synthetic adapters prove every new primitive with zero live calls.

## Phase 6 — DataForSEO and SerpApi

- Objective: implement `serp.results`, `keyword.data` and selected DataForSEO evidence on mature primitives.
- Files: built-in provider modules, fixtures/snapshots, schemas/examples, live-contract script.
- Reuse: Basic/query auth modes, task/live strategies, cost preflight, metric observations.
- New: minimal operations—DataForSEO Google organic SERP Live/Standard plus keyword historical/search-volume; SerpApi Google organic search. Do not implement the vendors’ whole catalogs.
- Tests: conformance, task sequences, location/language/device, account cost metadata, URL credential redaction.
- Docs: setup, supported operations, paid-call warnings.
- Risks: excessive provider breadth and billable verification.
- Exit: synthetic fixture coverage complete; one approved low-cost live proof per provider when credentials are supplied externally.

## Phase 7 — Cloudflare Analytics

- Objective: implement `edge.analytics` with fixed GraphQL templates and variables.
- Files: adapter, schema/example/fixture/snapshot, config options, live contract.
- Reuse: bearer auth, registry, cost/row budgets.
- New: zone/account resource scope, dataset capability discovery, persisted query templates, node-limit errors.
- Tests: raw GraphQL rejection, scope/field/time bounds, no zone/property telemetry, partial dataset availability.
- Docs: distinction from analytics and billing.
- Risks: plan/dataset variance and query complexity.
- Exit: fixture and approved zone live probe validate one HTTP request dataset; output never labels requests as visits.

## Phase 8 — Semrush

- Objective: add selected domain organic/rank, keyword and backlink reads.
- Files: adapter, bounded CSV parser use, fixtures/snapshots, retention/cost metadata, live contract.
- Reuse: metric observations, paid policy, registry and CSV primitive.
- New: v4 JSON where stable; v3 CSV only where required; per-line unit accounting and one-month replay ceiling.
- Tests: quoted/delimited/missing columns, unit exhaustion/partial lines, retention, historical cost difference, source metric identity.
- Docs: supported reports, licensing stop condition, setup.
- Risks: commercial terms, costly historical rows and response differences.
- Exit: only reviewed reports ship; public distribution is blocked until external-user/redistribution terms are recorded.

## Phase 9 — agent/MCP/WebOps surfaces

- Objective: generate small semantic integration surfaces from the same catalog.
- Files: examples/docs and MCP/Agent integration modules in SearchBridge only; no sibling changes.
- Reuse: JSON/JSONL, generated SDKs, evidence-query, Dispatch-compatible envelopes.
- New: catalog/fetch/query/submit tool schemas and fixture workflows.
- Tests: token-size gates, submit approval, tool schema goldens, offline examples.
- Docs: agent, MCP and WebOps guides.
- Risks: vendor endpoint leakage and context bloat.
- Exit: agents ask for capabilities; resolved provider remains visible; submit cannot be invoked without explicit mutation fields.

## Phase 10 — qualification and release

- Objective: prove clean-machine, cross-platform, compatibility, security and performance acceptance.
- Files: validation/workflows, provider snapshots, release qualification docs, changelog/version only when release is authorized.
- Reuse: all existing CI/release gates.
- New: adapter conformance matrix, provider drift jobs and benchmark thresholds.
- Tests: `bash scripts/validate.sh`, all conformance, SDKs, platforms, package install, secret scan, clean checkout fixtures.
- Risks: external accounts unavailable; do not fake live proof.
- Exit: every acceptance criterion is evidenced; working tree clean; small commits pushed.
