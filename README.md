# SearchBridge

[![Version](https://img.shields.io/badge/version-0.1.0-black)](VERSION)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)
[![built with Kujo](https://img.shields.io/badge/built%20with-Kujo-white.svg)](https://github.com/kujolang/kujo)

SearchBridge is the normalized external-data layer for Kujo WebOps. Provider
credentials become scoped capabilities; a missing analytics credential never
prevents PageSpeed or fixture work. SearchBridge preserves measurements and
provenance but leaves interpretation to agents.

## Commands

```bash
./searchbridge doctor
./searchbridge capabilities
./searchbridge providers
./searchbridge search-performance --fixture
./searchbridge analytics --fixture
./searchbridge inspect-url --fixture
./searchbridge pagespeed --fixture
./searchbridge crux --fixture
./searchbridge backlinks --fixture --provider ahrefs
./searchbridge submit --provider indexnow --url https://example.com/page --capability index.submission --act --yes
```

All evidence commands accept `--fixture`, `--offline`, `--deterministic`,
explicit timeout/retry/row/output-byte/output-token budgets, `--out`, and provider-appropriate
inputs. JSON output uses `searchbridge.result/v1` and records provider,
capability, retrieved time, fixture/live mode, property/target, and normalized
rows. Submission is a separate ACT-only command and never implies indexing.

## Capability families

- `search.performance`: Google Search Console and Bing Webmaster.
- `analytics`: Google Analytics 4 Data API.
- `url.inspection`: Google Search Console URL Inspection fixture/live REST contract.
- `page.performance`: PageSpeed Insights.
- `field.performance`: CrUX.
- `backlinks` and `keyword.data`: Ahrefs API v3, optional and cost-bearing.
- `index.submission`: IndexNow and Bing submission; explicit ACT only.

## Authentication

The bridge accepts short-lived bearer tokens or API keys through environment
variables listed by `providers`; it never performs interactive login, stores a
token, or writes credentials to artifacts. Service-account or OAuth refresh
flows should produce a short-lived token outside SearchBridge. Scheduled runs
skip unavailable capabilities instead of prompting indefinitely.

## Maturity boundary

Version 0.1 has deterministic offline normalization for every declared
provider and bounded live REST adapters. GSC, GA4, PageSpeed, CrUX, IndexNow,
Bing Webmaster, and Ahrefs are optional. Ahrefs requests consume provider
units; live use must set an explicit row limit. Google Indexing API is not a
general WebOps submission adapter because official scope is limited to
`JobPosting` and livestream `BroadcastEvent` pages.

See [provider research](docs/provider-research.md), [security](docs/security.md), and [output contract](docs/output-contract.md).

## Verification

```bash
bash scripts/validate.sh
python3 scripts/benchmark.py --iterations 100
```

See [the 0.1.0 release qualification](docs/release-qualification-0.1.0.md).
