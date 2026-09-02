# SearchBridge

[![Version](https://img.shields.io/badge/version-0.4.0-black)](VERSION)
[![CI](https://github.com/kujolang/searchbridge/actions/workflows/validate.yml/badge.svg)](https://github.com/kujolang/searchbridge/actions/workflows/validate.yml)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)
[![built with Kujo](https://img.shields.io/badge/built%20with-Kujo-white.svg)](https://github.com/kujolang/kujo)

SearchBridge is a Kujo-native gateway for collecting normalized search,
analytics, performance, backlink, and indexing evidence from multiple
providers. It preserves measurements and provenance without interpreting SEO
performance, so CLIs, agents, CI jobs, and data pipelines can consume one
stable contract without coupling themselves to every provider API.

Version 0.4.0 is dependency-light: the application, provider adapters,
normalizers, test suite, contract gates, release metadata generator, and
benchmark are written in Kujo. Portable POSIX and PowerShell launchers remain
small operating-system integration boundaries.

## Quick start

SearchBridge 0.4.0 requires the prepared Kujo v1.0.2 runtime at commit
`3bc5b4f1634d9883a789a0c2a0e6a266f72b77b2`. CI pins that source commit until the release is explicitly
authorized and published; after publication it will use the checksum-verified
runtime archive. Then:

```bash
git clone https://github.com/kujolang/searchbridge.git
cd searchbridge
./searchbridge doctor
./searchbridge search-performance --fixture --offline --deterministic
./searchbridge batch --fixture --offline --commands pagespeed,crux
```

The launcher uses `KUJO_BIN` when set, a sibling Kujo release build during
ecosystem development, or `kujo` from `PATH`.

## Commands

```bash
./searchbridge doctor
./searchbridge capabilities --deterministic
./searchbridge providers
./searchbridge agent-catalog
./searchbridge fetch --capability serp.results --provider serpapi --fixture --offline
./searchbridge search-performance --fixture
./searchbridge analytics --fixture
./searchbridge inspect-url --fixture
./searchbridge pagespeed --fixture --strategy mobile
./searchbridge crux --fixture --form-factor PHONE
./searchbridge backlinks --fixture --provider ahrefs
./searchbridge keyword-data --fixture --keyword "search observability"
./searchbridge submit --fixture --provider indexnow \
  --url https://example.com/page \
  --capability index.submission --act --yes
```

For Bing submission, `--property` can identify the verified URL-prefix
property; otherwise SearchBridge derives the scheme and host from the first
submitted URL.

Evidence commands support `--fixture`, `--offline`, `--deterministic`, `--out`,
`--timeout`, `--retries`, `--limit`, `--max-output-bytes`, and
`--max-output-tokens`. (`--limit` remains a compatibility alias for bounded
single-window normalization.) Scale and operations controls include `--page-size`,
`--max-pages`, `--max-total-rows`, `--format jsonl`, `--cache-dir`, `--replay`,
`--config`, `--profile`, `--health-policy`, `--degraded-exit-code`,
`--cancel-file`, `--task-state-dir`, `--resume-task`, and opt-in
`--otel-endpoint`. Run
`./searchbridge --help` for the command list.

## Scale, replay, and CI health

GSC and GA4 use their native page mechanisms; providers that expose only a
bounded list use a declared `provider-list-window` strategy. Every result
reports page/row budgets and secret-free telemetry for latency, retries,
response bytes, row count, truncation, cache state, and cost class. A capped,
jittered retry honors numeric `Retry-After` values.

```bash
./searchbridge analytics --property 123 --page-size 1000 \
  --max-pages 5 --max-total-rows 5000 --format jsonl --out analytics.jsonl
./searchbridge pagespeed --url https://example.com --cache-dir .cache/searchbridge
./searchbridge pagespeed --url https://example.com --cache-dir .cache/searchbridge \
  --replay --offline
./searchbridge doctor --health-policy fail \
  --require-capabilities analytics,page.performance --degraded-exit-code 7
./searchbridge fetch --capability rank.tracking --provider dataforseo \
  --task-state-dir .state/searchbridge --resume-task \
  --allow-paid --max-calls 2 --max-provider-units 2
```

Cache keys are hashes of credential-redacted method, URL, and body material;
records have explicit timestamps and caller-controlled freshness. Cache files
still contain provider evidence and belong only in access-controlled,
retention-managed directories. They are never included in releases.

The bounded `batch` worker pool overlaps independent reads up to
`--max-concurrency`, preserves request ordering, cooperatively observes
`--cancel-file` before dispatch and between retries, and returns
`searchbridge.batch/v1` partial-success records. Mutation commands cannot enter
a batch. Live GSC and GA4 JSONL exports normalize each page and append it to a
temporary artifact before atomically publishing the output, so the declared
full row budget is never retained in memory.

Asynchronous tasks can persist a credential-free, query-bound task identifier
in an explicit state directory. An interrupted run can continue polling with
`--resume-task`; completed and expired receipts are removed, while a bounded
polling failure retains the receipt for a later run.

## Protected replay and external adapters

Replay storage can be authenticated and encrypted at rest with Kujo's
AES-256-GCM and HMAC primitives. Operators can restrict which capabilities may
enter replay storage.

```bash
export SEARCHBRIDGE_REPLAY_KEY='use-a-secret-manager-value'
./searchbridge analytics --cache-dir .cache/searchbridge \
  --cache-encryption-key-env SEARCHBRIDGE_REPLAY_KEY \
  --cache-require-encryption --replay-capabilities analytics
```

`adapter-run` loads third-party read adapters without source edits. Manifests
must have a detached RSA-SHA256 signature, and the invocation must allowlist
every capability, exact HTTPS endpoint, and credential environment variable.

## Evidence queries and observability

The `evidence-query` command uses Kujo's bounded streaming JSONL reader. It can
filter dotted fields and perform a small nested join or an indexed SQLite spill
join with explicit row and disk budgets. Spill databases are temporary and are
removed on success or failure.

```bash
./searchbridge evidence-query --evidence-path analytics.jsonl \
  --filter-field provider --filter-equals google-analytics-4 \
  --max-total-rows 500
./searchbridge evidence-query --evidence-path left.jsonl --join-path right.jsonl \
  --left-field row.url --right-field url --join-strategy spill \
  --join-temp-dir .state/searchbridge-joins --max-join-disk-bytes 67108864
```

OpenTelemetry export is disabled unless `--otel-endpoint` is provided. It emits
OTLP JSON traces and metrics containing only command, schema, capability,
provider, timing, retry, byte, count, truncation, cache, and cost-class fields.
URLs, headers, tokens, bodies, and rows never enter the payload. `file:PATH`
provides a local collector fixture path.

## Configuration profiles

Non-secret defaults can be versioned as TOML using
[`config/searchbridge.example.toml`](config/searchbridge.example.toml).
Precedence is defaults, selected profile, `SEARCHBRIDGE_*` option variables,
then explicit CLI flags. Token, secret, credential, and key fields are rejected
from config files; provider credentials remain environment-only.

## Provider capabilities

| Capability | Providers | Live credential |
| --- | --- | --- |
| `search.performance` | Google Search Console, Bing Webmaster | `SEARCHBRIDGE_GSC_TOKEN`, or `SEARCHBRIDGE_BING_TOKEN` / `SEARCHBRIDGE_BING_KEY` |
| `analytics` | Google Analytics 4; Plausible signed reference adapter | `SEARCHBRIDGE_GA4_TOKEN`; `SEARCHBRIDGE_PLAUSIBLE_TOKEN` |
| `url.inspection` | Google Search Console | `SEARCHBRIDGE_GSC_TOKEN` |
| `page.performance` | PageSpeed Insights | Optional `SEARCHBRIDGE_PAGESPEED_KEY` |
| `field.performance` | Chrome UX Report | `SEARCHBRIDGE_CRUX_KEY` |
| `backlinks` | Ahrefs, Bing Webmaster; Semrush fixture support | Provider-specific environment credential |
| `keyword.data` | Ahrefs, DataForSEO; Semrush fixture support | Provider-specific environment credential |
| `serp.results` | DataForSEO, SerpApi | Provider-specific environment credential |
| `rank.tracking` | DataForSEO; Semrush fixture support | Provider-specific environment credential |
| `domain.visibility`, `traffic.estimate` | Semrush fixture support | Live support blocked pending commercial review |
| `edge.analytics` | Cloudflare | `SEARCHBRIDGE_CLOUDFLARE_TOKEN`, `SEARCHBRIDGE_CLOUDFLARE_ZONE_ID` |
| `index.submission` | IndexNow, Bing Webmaster | `SEARCHBRIDGE_INDEXNOW_KEY`, or `SEARCHBRIDGE_BING_TOKEN` / `SEARCHBRIDGE_BING_KEY` |

`capabilities` reports each provider independently. A missing analytics token,
for example, never prevents PageSpeed or fixture work. SearchBridge accepts
short-lived bearer tokens and API keys from environment variables; it does not
perform interactive login, refresh OAuth credentials, or persist secrets.

## Stable contracts

Evidence uses `searchbridge.result/v1`; submissions use
`searchbridge.submission/v1`. Every evidence envelope identifies its
capability, provider, mode, retrieval time, and normalized rows. Missing source
fields remain `null` and are never inferred. JSON Schemas live in
[`schemas/`](schemas/), and deterministic fixtures live in
[`fixtures/providers/`](fixtures/providers/).
Capability-specific row schemas and canonical examples are indexed in
[`docs/row-contracts.md`](docs/row-contracts.md). Immutable 0.2.x golden
documents protect every public envelope in the compatibility release gate.
Generated consumer types live in [`sdk/`](sdk/) for TypeScript, Rust, and Go;
CI regenerates them and compiles consumers against every golden envelope and
row schema.

```json
{
  "schema": "searchbridge.result/v1",
  "capability": "search.performance",
  "provider": "google-search-console",
  "mode": "fixture",
  "retrieved_at": "1970-01-01T00:00:00Z",
  "rows": []
}
```

## Safety model

- Read operations and provider mutations are separate commands.
- Every submission requires the exact capability plus `--act --yes`, including fixtures.
- Submission batches are limited to 1,000 HTTP(S) URLs on one validated host; fragments and user-info are rejected.
- Custom submission endpoints are disabled, closing an SSRF and credential-forwarding surface.
- Protected replay records authenticate encrypted evidence and enforce caller capability allowlists.
- External adapter manifests require detached RSA signatures plus exact capability, endpoint, and credential-environment allowlists.
- Opt-in OpenTelemetry export is tested against a sensitive-input corpus and excludes URLs, headers, credentials, bodies, and rows.
- Live requests use bounded timeouts, response sizes, retry counts, row counts, and output budgets.
- Only 429 and transient 5xx responses retry; `Retry-After` is capped and jittered, while provider bodies, URLs, request headers, and row contents are excluded from telemetry and errors.
- Ahrefs calls may consume paid units. SearchBridge reports the cost class but never estimates SEO outcomes.
- A submission receipt means accepted or received; it never claims that a URL was indexed.

Use Kujo's `--deny-private-net` runtime policy in strict environments. Treat
provider properties and exported measurements as sensitive operational data,
and write artifacts only to operator-controlled locations.

## Architecture

```text
searchbridge.kujo        stable entrypoint
src/cli.kujo             argument, budget, and output boundary
src/commands.kujo        capability routing and provider normalization
src/transport.kujo       bounded HTTP, retry, and redaction behavior
src/cache.kujo           credential-independent cache/replay records
src/config.kujo          non-secret TOML profiles and environment precedence
src/adapters.kujo        signed third-party adapter loading and conformance
src/registry.kujo        canonical adapter v2 discovery and routing registry
src/provider_runtime.kujo batch-one provider normalization and execution
src/protocols.kujo       cost, cursor, task, CSV, GraphQL, and endpoint bounds
src/evidence.kujo        bounded streaming JSONL filters and joins
src/telemetry.kujo       privacy-preserving opt-in OTLP traces and metrics
src/core.kujo            contracts, catalog, fixtures, and URL safety
```

The root keeps only conventional project, launcher, and entrypoint files.
Implementation code lives under `src/`; test and benchmark tooling invoke Kujo
directly.

## Development and verification

```bash
bash scripts/validate.sh
./searchbridge search-performance --fixture --offline --deterministic
"${KUJO_BIN:-../kujo/target/release/kujo}" run scripts/benchmark.kujo -- --iterations 100
"${KUJO_BIN:-../kujo/target/release/kujo}" run examples/ci_quality_gate.kujo
```

The validation gate runs the native contract assertions, validates emitted
documents and capability rows, proves every 0.2.x golden envelope remains
readable, checks provider snapshots, executes CLI and benchmark smokes, rejects
Python runtime dependencies, and checks the diff. CI builds the pinned Kujo
commit. Separate jobs cover Linux, macOS, Windows, scheduled low-privilege live
reads, provider drift issue creation, and signed-tag release artifacts.

See [security boundaries](docs/security.md), the [output contract](docs/output-contract.md),
[providers and capabilities](docs/providers-and-capabilities.md), [routing and cost](docs/routing-and-cost.md),
[adapter authoring](docs/adapter-authoring.md), [agent and MCP integration](docs/agent-mcp.md),
[provider research](docs/provider-research.md), the [0.2.4 qualification](docs/release-qualification-0.2.4.md),
the [reproducible release checklist](docs/release-checklist-0.2.x.md), and the
[next-session backlog](docs/next-session-review-0.3.md).
