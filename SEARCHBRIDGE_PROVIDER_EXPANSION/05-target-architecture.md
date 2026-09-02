# Target architecture

## One provider model

```text
CLI / Kujo import / MCP / Dispatch
              |
       semantic fetch query
              |
  capability + routing resolver
              |
       canonical registry v2
       /                 \
built-in adapter    signed external adapter
       \                 /
 request descriptor -> policy/cost gate -> core transport
                                          |
                         bounded parser -> adapter normalizer
                                          |
                         capability envelope + provenance
```

The registry owns discovery and resolution. Adapters own provider request encoding and response decoding/normalization. Core alone owns network I/O, retries, endpoint/credential policy, response limits, cache/replay, output budgets, telemetry and mutation separation.

## Adapter runtime

Replace command-local provider branches incrementally with `adapter_contract/v2` implementations. A built-in adapter is a Kujo function bundle registered at startup. An external adapter is a signed declarative package interpreted by the bounded adapter engine. They expose the same safe description:

- ID, adapter contract/version, provider version and minimum SearchBridge version;
- capabilities and read/write class;
- credential environment names (names only);
- operation IDs with exact approved HTTPS endpoint templates and supported query fields;
- response format, pagination strategy, cost class and fixture IDs;
- capability contract versions and health probe kind.

Runtime hooks/descriptors are `describe`, `validate`, `encode`, `decode`, and `normalize_page`. External manifests express these through a limited operation/mapping DSL; they never load arbitrary native code or execute shell commands. Core validates every descriptor again after expansion.

Keep manifest metadata runtime-relevant. Human descriptions, setup guides, pricing prose and terms belong in docs/catalog source, not the agent catalog.

## Required transport extensions

- Bounded response formats: JSON first, RFC 4180-compatible delimited text for Semrush, and GraphQL JSON errors. Parsing remains Kujo-native.
- Pagination strategies: none, offset/limit, page/size, cursor/token, provider list window, and async task (`submit → bounded poll/backoff → fetch`). Each has an explicit completion predicate and max pages/polls/elapsed time.
- Credential modes: bearer/header/API-key header/basic/query/body. Each credential is bound to an exact declared HTTPS endpoint template and is redacted before hashes, errors, logs and telemetry. A dynamic path slot must be typed, bounded, slash-free, and unable to alter the scheme or authority.
- Cost preflight: none, account-balance, provider estimate endpoint, deterministic declared units, or unknown. Preflight itself declares whether it costs quota.
- Redirects: disabled unless core can revalidate every hop against the same exact policy; credentials are never forwarded across origins.
- Response/download URLs returned by providers are untrusted. A second allowlist rule must authorize them, and credentials must not be forwarded unless separately bound.

## Routing semantics

Add a provider-neutral surface while keeping existing commands as compatibility aliases:

```text
searchbridge fetch --capability serp.results --provider serpapi ...
searchbridge fetch --capability analytics --provider auto ...
searchbridge fetch --capability backlinks --provider all ...
```

- Explicit provider is the default for paid or ambiguous capabilities.
- `auto` resolves only from a configured ordered preference list, capability support, credential availability, cost policy and health policy. It returns a `routing` record naming candidates, rejected reasons and the selected provider. It does not rank by opaque quality.
- `all` runs every explicitly enabled provider for that capability within global and per-provider budgets. It returns intact per-provider results and partial failures.
- No silent fallback in the first release. Later fallback must be explicitly enabled and limited to unavailability/transient failure; exhausted paid quota or policy denial never triggers another paid provider automatically.
- Multi-provider comparison never merges proprietary metric values. Consumers join on stable semantic keys while preserving each result.

## Configuration

Extend existing TOML profiles with non-secret, bounded sections:

```toml
[defaults]
max_concurrency = 4
max_provider_calls = 8
paid_call_policy = "confirm"

[routing]
"analytics" = ["google-analytics-4", "plausible"]
"serp.results" = ["serpapi", "dataforseo"]

[providers.semrush]
enabled = true
database = "us"
max_calls = 2
max_units = 2000
cache_max_age = 2592000

[providers.cloudflare-analytics]
enabled = true
max_calls = 4
```

Schema-enumerate allowed provider options. Reject any secret-shaped key everywhere, including nested tables. Credential values remain environment/Kujo-auth backed; catalog metadata declares only environment names. Self-hosted adapter endpoints are supplied separately and must match the exact invocation allowlist.

## Cost controls

Every operation has `cost_class`: `free`, `quota`, `metered`, `expensive`, or `unknown`. The request policy contains max provider calls, rows, pages, polls, elapsed time, concurrency and provider units when the provider reports or deterministically prices them.

- Fixture/offline/replay perform no paid network call.
- `metered`, `expensive`, or `unknown` live operations require enabled provider and policy. Above a configured zero/default threshold they require an explicit `--allow-paid` plus a numeric/request budget; mutations still additionally require `--act --yes`.
- Use provider preflight endpoints where free and documented (Similarweb batch validate, account credit endpoints, DataForSEO user data, Semrush unit balance). Do not pretend a preflight is exact when parameters can change billing.
- Record estimated and actual units separately with provider unit name and source. Never fabricate currency.
- Provider retention constraints cap cache age. Semrush’s documented one-month ceiling is a hard maximum unless the operator records separate permission.

## Agent, MCP and WebOps integration

Agent-facing catalog entries stay under 160 tokens per capability and 80 tokens per provider. Expose:

1. `searchbridge.catalog` — capabilities, enabled providers, cost class and required query fields;
2. `searchbridge.fetch` — semantic capability query with explicit/auto/all routing;
3. `searchbridge.query` — bounded filter/join over existing evidence artifacts;
4. `searchbridge.submit` — separate mutating tool, never auto-invoked, requiring capability plus `act` and confirmation.

MCP schemas are generated from the capability catalog, not handwritten vendor endpoints. Direct Kujo imports expose the same resolver/execute functions. Agents SDK tools wrap these four operations. Dispatch orchestrates multi-step reads and persists routing evidence. ContentGraph consumes compatible results. SiteProbe supplies local crawl facts. Eval provides fixture-backed assertions. WebOps packs combine evidence outside SearchBridge; recommendations remain workflow/agent responsibility.

## Cross-provider intelligence boundary

Normalization enables evidence joins without moving interpretation into core. A workflow can distinguish organic decline caused by lower verified impressions, weaker tracked ranks, indexing failures, field-performance regressions, backlink loss, or falling conversions. It can also find pages with high analytics traffic, ranks 4–15, poor field metrics, and few observed backlinks. SearchBridge returns the independent rows, join keys, periods, provider identity, metric definitions, and partial failures. The agent or workflow chooses the diagnosis and recommendation.

Joins require explicit keys and time windows. URL canonicalization is reported, not silently assumed. Query strings, domains, pages, dates, locale, engine and device remain part of the join contract so a convenient join cannot erase material differences.

## Provider drift

- Store one immutable contract snapshot per provider operation: API version, docs URL/checked date, endpoint, auth mode, format, pagination, fixture hash and capability contract.
- Weekly static gate detects snapshot/catalog mismatch and documentation availability/version changes.
- Credential-gated low-row live probes validate request and response contracts without storing raw private evidence.
- Schema differences produce sanitized field-path summaries and a deduplicated issue; they do not auto-update mappings.
- Record deprecations in provider catalog with `deprecated_at`, `replacement`, and minimum removal release. Preserve at least one minor compatibility window unless upstream removal forces earlier failure.
- Webhooks may announce provider freshness but never replace periodic verification or execute implicit retrieval.

## Documentation structure

Keep the root README to installation, core commands, safety and links. Add canonical documents for the capability catalog, provider catalog, one setup page per provider, routing/configuration, cost controls, adapter authoring, adapter security/signing, compatibility/drift, agent/MCP use, and WebOps examples. Generate compact provider/capability tables from the registry so docs and machine discovery share IDs without embedding full human prose in runtime metadata.

## Authoring workflow

Add `searchbridge adapter new ID --capability X` only after manifest v2 and conformance are stable. It generates a manifest, synthetic fixture, mapping skeleton, contract test and README—never credentials or production URLs. `adapter validate`, `adapter test`, `adapter benchmark`, and `adapter sign` may be subcommands of the existing adapter surface. Signing covers the manifest, fixture hashes and package files. `adapter-run` remains the explicit execution command until registry installation has a safe trust store.
