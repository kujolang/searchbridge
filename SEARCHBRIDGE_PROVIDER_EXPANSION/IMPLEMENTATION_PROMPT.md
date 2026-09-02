# Implementation prompt

Implement the SearchBridge provider-expansion architecture described in this package. Read every file in `SEARCHBRIDGE_PROVIDER_EXPANSION/` before editing. Treat the package’s JSON matrices as proposed contracts and the Markdown as the normative decision record where they differ.

## Objective

Turn the existing adapter system into the single canonical provider runtime, preserve all SearchBridge 0.3 behavior, and deliver batch 1 in dependency-ordered vertical slices: Plausible signed reference adapter, DataForSEO, SerpApi, Cloudflare Analytics, and Semrush. Do not implement a second provider/plugin/connector framework.

## Non-negotiable boundary

SearchBridge is a provider-neutral web intelligence gateway. It collects and normalizes evidence; it does not recommend SEO actions, build dashboards, crawl the web locally, manage campaigns/projects/listings, generate content, broker credentials, or hide provider identity. SiteProbe owns local crawling. Downstream agents/workflows interpret evidence.

## Before editing

1. Run and preserve an immutable before baseline with `bash scripts/validate.sh`, the benchmark, all fixture commands and catalog/help/schema sizes.
2. Reproduce the audited zero-stdout behavior of static commands against the pinned CI runtime. If it is real, fix it as a separate small compatibility commit only after finding the cause; if environment-specific, record evidence.
3. Inspect current provider, adapter, transport, cache, config, schema, SDK, drift, benchmark and release code. Do not modify sibling repositories.

## Architecture to implement

- One v2 registry supplies discovery and execution for built-in and signed external read adapters.
- Core owns transport, exact endpoint/credential policy, retries, response bounds, parsing, cache/replay, cost policy, output budgets, telemetry and mutation separation.
- Adapters produce bounded request descriptors and normalize bounded pages. External adapters use a declarative signed package/DSL; never execute arbitrary code or shell.
- Existing commands remain compatibility aliases. Add `fetch --capability ID --provider ID|auto|all` only when the registry can execute every existing provider.
- Explicit provider is the safe default. `auto` uses only configured ordered preferences and emits resolution evidence. `all` preserves intact per-provider results. No silent fallback in this implementation.

## Contracts

- Keep `searchbridge.result/v1` compatible and old goldens readable.
- Add six capability rows: `rank.tracking`, `serp.results`, `domain.visibility`, `traffic.estimate`, `edge.analytics`, `crawl.data`.
- Add shared metric observations exactly as specified in `06-contract-design.md`. Do not create `authority`, `web.analytics`, `site.audit`, or dozens of vendor-feature capabilities.
- Add `searchbridge.multi-result/v1`; never merge proprietary metrics. Numeric comparison is permitted only when `comparison_key` matches.
- Generate and compile TypeScript, Rust and Go consumers for all new schemas.

## Provider scope

- Plausible: signed external read adapter for Stats API v2 `analytics`, including dimensions/metrics/date filters and offset paging.
- DataForSEO: built-in Google organic SERP Live/Standard task flow and a minimal keyword historical/search-volume operation. Add more only when required to prove an accepted capability.
- SerpApi: built-in Google organic `serp.results` only initially.
- Cloudflare: built-in `edge.analytics` using reviewed fixed GraphQL operation templates plus variables; never accept arbitrary GraphQL in normal fetch.
- Semrush: selected domain organic/rank, keyword and backlink reports; prefer stable v4 JSON and use bounded CSV only where required. Enforce documented one-month cache maximum. Do not ship public live support until commercial/redistribution review is recorded.
- Do not implement Moz, Similarweb, Matomo, SearchAtlas or later-tier providers in batch 1.

## Security and cost

- Preserve exact HTTPS allowlists, signatures, environment-only credentials, redacted errors and `--act --yes` on every submission.
- Signature covers canonical manifest and every package/fixture digest. Verify before reading credentials. External adapters stay read-only.
- Bind credentials to exact approved endpoint templates; reject or separately validate redirects and provider-returned download URLs. Do not replace exact endpoint allowlists with host or path-prefix wildcards.
- Support Basic/header/bearer/query/body auth without leaking credentials into cache keys, telemetry, errors or output.
- Bound calls, retries, pages, rows, cursors, polls, elapsed time, concurrency, provider bytes and output bytes/tokens. Detect repeated cursors.
- Classify costs as free/quota/metered/expensive/unknown. Paid or unknown live calls require explicit enablement and budgets; no paid call occurs in default tests. Expose estimated and actual provider units separately and never invent currency.
- Implement the full adversarial corpus in `07-security-review.md`.

## Testing and performance

Create one provider-neutral conformance suite usable by built-ins and external packages. Every operation needs synthetic happy, empty, missing-field, pagination, error, rate-limit, oversized and cost fixtures; task APIs need pending/completed/failed/timeout sequences. Fixtures contain no real customer data or secrets.

Meet every budget in `09-performance-token-budgets.md`. Agent metadata must be concise and generated from the catalog. Human documentation must not enter model context by default. Stream large JSON/CSV results page-by-page to atomic JSONL output.

## Documentation and distribution

Split provider catalog/setup, capability catalog, adapter authoring/security/signing, routing/cost, agent/MCP and examples into concise canonical docs. Do not inflate the root README. Make no marketplace, partnership, endorsement, redistribution or pricing claim without first-party evidence.

## Required verification

- `bash scripts/validate.sh`.
- Every adapter conformance report.
- Schema/examples and all existing/new goldens.
- TypeScript, Rust and Go generated SDK gates.
- Security corpus, cost/pagination/task/parser tests.
- Benchmark thresholds and agent catalog size.
- Fixture/offline clean-machine commands on Linux/macOS/Windows paths.
- Credential-gated low-row live probes only when an operator supplies credentials and explicit paid-call authorization; otherwise mark as external blocker.

Work in small meaningful commits and push each coherent slice. Never commit tokens, provider headers, private URLs, service-account files, raw live rows or unlicensed provider data. End with a clean working tree and an evidence-backed qualification record.
