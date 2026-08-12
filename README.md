# SearchBridge

[![Version](https://img.shields.io/badge/version-0.2.0-black)](VERSION)
[![CI](https://github.com/kujolang/searchbridge/actions/workflows/validate.yml/badge.svg)](https://github.com/kujolang/searchbridge/actions/workflows/validate.yml)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)
[![built with Kujo](https://img.shields.io/badge/built%20with-Kujo-white.svg)](https://github.com/kujolang/kujo)

SearchBridge is a Kujo-native gateway for collecting normalized search,
analytics, performance, backlink, and indexing evidence from multiple
providers. It preserves measurements and provenance without interpreting SEO
performance, so CLIs, agents, CI jobs, and data pipelines can consume one
stable contract without coupling themselves to every provider API.

Version 0.2 is dependency-light: the application, provider adapters,
normalizers, test suite, JSON validation, and benchmark are written in Kujo.
Only the portable shell launcher and validation orchestrator remain outside the
language.

## Quick start

Install [Kujo v1.0.1 or newer](https://github.com/kujolang/kujo#install), then:

```bash
git clone https://github.com/kujolang/searchbridge.git
cd searchbridge
./searchbridge doctor
./searchbridge search-performance --fixture --offline --deterministic
```

The launcher uses `KUJO_BIN` when set, a sibling Kujo release build during
ecosystem development, or `kujo` from `PATH`.

## Commands

```bash
./searchbridge doctor
./searchbridge capabilities --deterministic
./searchbridge providers
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
`--max-output-tokens`. Run `./searchbridge --help` for the command list.

## Provider capabilities

| Capability | Providers | Live credential |
| --- | --- | --- |
| `search.performance` | Google Search Console, Bing Webmaster | `SEARCHBRIDGE_GSC_TOKEN`, or `SEARCHBRIDGE_BING_TOKEN` / `SEARCHBRIDGE_BING_KEY` |
| `analytics` | Google Analytics 4 | `SEARCHBRIDGE_GA4_TOKEN` |
| `url.inspection` | Google Search Console | `SEARCHBRIDGE_GSC_TOKEN` |
| `page.performance` | PageSpeed Insights | Optional `SEARCHBRIDGE_PAGESPEED_KEY` |
| `field.performance` | Chrome UX Report | `SEARCHBRIDGE_CRUX_KEY` |
| `backlinks` | Ahrefs, Bing Webmaster | `SEARCHBRIDGE_AHREFS_TOKEN`, or `SEARCHBRIDGE_BING_TOKEN` / `SEARCHBRIDGE_BING_KEY` |
| `keyword.data` | Ahrefs | `SEARCHBRIDGE_AHREFS_TOKEN` |
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
- Live requests use bounded timeouts, response sizes, retry counts, row counts, and output budgets.
- Only 429 and transient 5xx responses retry; provider bodies and request headers are never included in errors.
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
```

The validation gate runs 131 native contract assertions, validates emitted
documents against public schemas, parses every fixture
and schema, executes CLI smoke tests, runs a benchmark smoke, checks for Python
runtime dependencies, and checks the diff. CI downloads a checksum-verified,
pinned Kujo release binary before running the same gate.

See [security boundaries](docs/security.md), the [output contract](docs/output-contract.md),
[provider research](docs/provider-research.md), the [0.2.0 qualification](docs/release-qualification-0.2.0.md),
and the [next-session backlog](docs/next-session-review.md).
