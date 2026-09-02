# Current architecture

## Product boundary

SearchBridge 0.3.0 is already a provider evidence gateway. The public surface is a CLI, JSON/JSONL documents, schemas, generated TypeScript/Rust/Go types, fixtures, and compatibility goldens. It collects and normalizes evidence and explicitly does not interpret SEO performance.

### Ownership map

| Concern | Current owner | Audit result |
| --- | --- | --- |
| Entrypoint | `searchbridge.kujo`, POSIX/PowerShell launchers | Thin and stable. |
| CLI parsing and budgets | `src/cli.kujo` | All flags and provider validation are centralized but provider choices are hard-coded. |
| Capability routing | `src/cli.kujo::dispatch`, `command_capability` | Command-to-function chain; no registry-driven semantic fetch. |
| Provider registration | `src/core.kujo::providers` | Single catalog for discovery, but execution does not dispatch through it. |
| Request construction | `src/commands.kujo` | Embedded in capability commands; provider-specific branches accumulate here. |
| Transport/retry | `src/transport.kujo` | Shared JSON transport, bounded response, timeout, retry, redaction, cache and cost headers. |
| Normalization | `src/core.kujo` for GSC/GA4; `src/commands.kujo` for others | Split and duplicated; not an adapter hook boundary. |
| Pagination | `src/commands.kujo` | True paging for GSC/GA4; bounded-list simulation elsewhere. No cursor/task contract. |
| Cache/replay | `src/cache.kujo`, invoked by transport | Credential-independent hash, optional AES-GCM/HMAC, age and capability allowlists. Provider retention policy is not modeled. |
| Credentials | environment variables read by command/adapter code | No interactive OAuth or persistence; correct boundary. |
| Config profiles | `src/config.kujo` | Safe non-secret scalar defaults only; no provider blocks or routing policy. |
| External adapters | `src/adapters.kujo`, `schemas/adapter-manifest.schema.json` | Signed, read-only, allowlisted; execution is too narrow for complex providers. |
| Evidence contracts | `src/core.kujo`, `schemas/result.schema.json`, row schemas | Stable envelope and capability rows; vendor metric provenance is insufficient. |
| Telemetry | `src/telemetry.kujo` | Opt-in OTLP with a strict no-evidence/no-secret boundary. |
| Output budgets | `src/cli.kujo`, streaming helpers in `src/commands.kujo` | Byte/token limits and atomic paged JSONL for GSC/GA4. |
| Mutation | `command_submit` and submission schema | Separate path; every call requires capability plus `--act --yes`. |
| Provider health | `capability_report`, `doctor` | Credential presence and degraded capability reporting, not live health. |
| Fixtures/offline/determinism | provider fixtures and CLI flags | Strong baseline; fixtures prove mapping, not authorization or availability. |
| Batch | `command_batch`, `parallel_map` | Bounded read-only worker pool, stable order, partial success and cooperative cancel. |
| Evidence query | `src/evidence.kujo` | Bounded streaming filter/join using Kujo primitive. |
| Schemas/SDKs | `schemas/`, `scripts/generate_sdk_types.kujo`, `sdk/` | Generated types and compatibility gate cover public envelopes. |
| Drift | `fixtures/provider-contracts.json`, weekly workflow | Snapshot presence/pagination gate and credential-gated live workflow. |
| Benchmarks | `scripts/benchmark.kujo` | Normalization microbenchmark only. |
| Release | validation, platform smoke, SDK, independent verification, release workflows | Pinned actions/runtime and provenance-aware release path. |

## Existing providers

| ID | Capabilities | Auth / credential | Endpoint family | Paging | Fixture | Cost / mutations |
| --- | --- | --- | --- | --- | --- | --- |
| `google-search-console` | `search.performance`, `url.inspection` | OAuth bearer from `SEARCHBRIDGE_GSC_TOKEN` | Google Search Console REST | `startRow/rowLimit`; inspection single | GSC and inspection | provider quota; read-only |
| `google-analytics-4` | `analytics` | OAuth bearer from `SEARCHBRIDGE_GA4_TOKEN` | Analytics Data API `runReport` | `offset/limit` | yes | provider quota; read-only |
| `pagespeed-insights` | `page.performance` | optional query key | PSI v5 | none | yes | provider quota; read-only |
| `crux` | `field.performance` | API key in query | CrUX `queryRecord` | none | yes | provider quota; read-only |
| `ahrefs` | `backlinks`, `keyword.data` | bearer token | API v3 Site/Keywords Explorer | declared bounded list | two fixtures | paid units; read-only |
| `bing-webmaster` | `search.performance`, `backlinks`, `index.submission` | bearer preferred, API query key fallback | Bing Webmaster JSON methods | declared bounded list | search/backlinks | quota; submission mutation |
| `indexnow` | `index.submission` | body key | fixed IndexNow endpoint | none | receipt behavior | explicit write |

All provider errors pass through bounded redaction. Normalization preserves missing values as null/absent. Current normalized rows do not consistently preserve raw provider field names or metric definitions.

### Provider implementation details

Unless noted, all live reads use the shared transport: 30-second default/120-second maximum timeout, two default/five maximum retries, retries only for connection failures, 429 and transient 5xx, capped/jittered `Retry-After`, 8 MiB response ceiling, and secret-free latency/retry/byte/cache telemetry. SearchBridge has no provider-specific request scheduler today; it relies on bounded calls and 429 handling. Health means fixture readiness plus credential presence, not a live API probe.

#### Google Search Console

- Request: `POST /webmasters/v3/sites/{encoded property}/searchAnalytics/query` with validated date range, dimensions, `rowLimit` and `startRow`; URL inspection uses the official inspection endpoint and a single URL/property body.
- Response: search rows map ordered `keys` back to requested dimensions and preserve clicks, impressions, CTR, position, aggregation type and metadata. Inspection maps verdict, coverage/robots/indexing state, crawl time and canonicals.
- Pagination: true offset paging until a short page or page/row budget; live JSONL normalizes and writes each page atomically.
- Fixtures/tests/schemas: `google-search-console.json`, `google-url-inspection.json`; command, pagination, schema, golden, error/redaction and CLI tests; `search-performance` and `url-inspection` row schemas.
- Errors/telemetry/health/mutations: shared redacted errors and telemetry; bearer presence drives live health; read-only.

#### Google Analytics 4

- Request: `POST /v1beta/{property}:runReport` with validated dimensions/metrics, date range, limit and offset.
- Response: response headers determine dynamic row keys; dimension/metric string values remain uncast so the provider contract is not reinterpreted.
- Pagination: true offset/limit paging with short-page and global budgets; live JSONL streams pages atomically.
- Fixtures/tests/schemas: `google-analytics-4.json`; request/page/normalization/schema/golden/CLI tests; dynamic `analytics` row schema allows string/null values.
- Errors/telemetry/health/mutations: shared behavior; bearer presence drives health; read-only.

#### PageSpeed Insights

- Request: fixed v5 GET with validated URL, mobile/desktop strategy and four category parameters; optional API key is a query parameter.
- Response: category scores become `lab`; selected audit numeric values become `metrics`; provider loading experience remains optional `field` evidence.
- Pagination/rate/cost: single response, provider quota class; no provider-specific rate model.
- Fixtures/tests/schemas: `pagespeed-insights.json`; normalization, URL safety, schema, golden and CLI tests; `page-performance` row schema.
- Errors/telemetry/health/mutations: shared behavior; optional key means catalog health can be live-available without a credential; read-only.

#### Chrome UX Report

- Request: fixed `records:queryRecord` POST with validated URL, form factor and API key in query.
- Response: preserves record metrics and collection period under a field-performance row; it does not translate histogram values into lab scores.
- Pagination/rate/cost: single response, provider quota class; no provider-specific rate model.
- Fixtures/tests/schemas: `crux.json`; normalization/schema/golden/CLI tests; `field-performance` row schema.
- Errors/telemetry/health/mutations: shared behavior; key presence drives health; read-only.

#### Ahrefs

- Request: bearer-authenticated API v3 GETs for `site-explorer/all-backlinks` and `keywords-explorer/overview`; target/keyword/country are bounded and encoded; selected fields and row limit are explicit.
- Response: backlink fields map to source/target/anchor/seen/follow state. Keyword rows map volume, difficulty and CPC into generic estimate fields and label the envelope as third-party estimates.
- Pagination/rate/cost: a single bounded provider-list window; no cursor loop. Cost class is paid units and safe `x-api-units-*` numeric headers enter telemetry when present.
- Fixtures/tests/schemas: backlink and keyword fixtures; mapping, paid warning, schema, golden, budget, redaction and CLI tests; backlinks/keyword row schemas.
- Errors/telemetry/health/mutations: shared errors, telemetry plus provider unit headers; token presence drives health and doctor warns about units; read-only.

#### Bing Webmaster

- Request: bearer token prefers `www.bing.com`; API-key fallback uses the fixed SSL endpoint with an encoded query key. Methods cover rank/traffic, link detail and per-URL submission.
- Response: provider `d`/rows are mapped into search-performance or backlink fields. Submission returns only a received/accepted receipt.
- Pagination/rate/cost: declared provider-list window rather than verified cursor paging; provider quota class; no provider-specific rate model.
- Fixtures/tests/schemas: Bing search and backlink fixtures plus submission fixture behavior; auth fallback, mapping, submission safety, schema/golden and error tests.
- Errors/telemetry/health/mutations: shared behavior; either token or key makes live capability available. Submission is the only write and still requires capability plus `--act --yes`.

#### IndexNow

- Request: fixed HTTPS batch endpoint, same-host normalized HTTP(S) URLs, key in body and optional same-host key location; custom endpoints are rejected.
- Response: status becomes a receipt with `received`; `indexed` is always false because acceptance cannot prove indexing.
- Pagination/rate/cost: one batch of at most 1,000 URLs; write cost class; no retry semantics beyond shared transient policy.
- Fixtures/tests/schemas: fixture receipt path; URL/host/port/user-info/fragment/batch/mutation confirmation, schema and golden tests; submission and index-submission schemas.
- Errors/telemetry/health/mutations: shared redaction; key presence drives health; explicit write boundary on every invocation.

## What is generic versus provider-specific

Generic today:

- result/submission envelopes, discovery schemas, mode and deterministic timestamps;
- timeout/retry/response bounds, cache/replay, safe cost headers, error cleaning;
- output byte/token limits, JSONL rendering, batch concurrency and cancellation;
- fixture loading, capability health, telemetry privacy, schema/SDK/release gates;
- external signature plus capability/endpoint/credential allowlists.

Provider-specific today:

- credential selection, URL/body/header construction, authentication placement;
- date/property/target validation and provider parameter naming;
- pagination loops and completion tests;
- response parsing and row mapping;
- cost semantics and response-unit headers;
- command/provider compatibility lists.

Duplication that should remain explicit includes provider auth, endpoint families, pagination completion rules, cost units, and source metric definitions. Duplication that should be removed is the repeated execution skeleton and registry data split across `core`, `cli`, `commands`, schemas, fixtures, and docs.

## External adapter audit

The v1 external system has the right security posture: detached RSA-SHA256 signature, declarative JSON, read-only write boundary, exact invocation allowlists, environment-only credentials, and core transport. It cannot yet be the broad ecosystem runtime because it supports only:

- one static HTTPS endpoint and GET/POST method;
- one optional header credential;
- one static body;
- JSON responses only;
- a single `rows_field` passthrough with no field mapping;
- no query/path templates, cursor/offset/task pagination, GraphQL, CSV, provider error mapping, cost preflight, or source metric metadata;
- no adapter contract/minimum SearchBridge version or signed fixture/package digest.

Therefore extend this system to v2; do not replace it.

## Neighboring Kujo patterns to reuse

- AI SDK keeps transport, security, budgets and normalized contracts in core while provider drivers encode/decode bounded descriptors. SearchBridge should adopt that separation, not its model fallback semantics.
- Agents SDK expects provider logic behind integration contracts and favors small capability/tool descriptions.
- Dispatch provides inspectable routing and bounded parallel execution patterns.
- ContentGraph already consumes `searchbridge.result/v1` and preserves provider/retrieved-at fields, so envelope compatibility matters.
- SiteProbe owns local crawling and site evidence. SearchBridge should expose provider crawl reports, not build a competing crawler.

## Confirmed audit anomaly

On 2026-09-02, `./searchbridge version`, `providers --deterministic`, `capabilities --deterministic`, and `analytics --fixture --offline --deterministic` each exited 0 but emitted zero stdout bytes. `--help` emitted 772 bytes and direct function/normalization tests passed. The result reproduced with a clean archive build of the repository-pinned Kujo commit `3bc5b4f1634d9883a789a0c2a0e6a266f72b77b2`, so it is not explained by the dirty sibling checkout. This task intentionally did not patch unrelated runtime behavior. The implementation preflight must diagnose and close the anomaly before using CLI output-size baselines or claiming the CLI produces evidence.
