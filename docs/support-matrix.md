# SearchBridge v1 support matrix

This matrix is the authoritative v1 support boundary. SearchBridge fetches and normalizes evidence; it does not interpret SEO performance. The `providers`, `capabilities`, `doctor`, and `agent-catalog` commands expose the same provider tier and reason.

## Runtime and distribution

| Surface | v1 support |
| --- | --- |
| SearchBridge | 1.0.x contracts and release assets |
| Kujo | 1.2.3, source commit `67e880a9688dd5770d4a67311d45aa551e6a6fd6` |
| Linux | x86_64 self-contained bundle, built and exercised on `ubuntu-latest` |
| macOS | x86_64 bundle on `macos-15-intel`; arm64 bundle on `macos-15` |
| Windows | x86_64 bundle on `windows-latest` |
| TypeScript SDK | Node.js 22, GitHub release `.tgz` |
| Go SDK | Go 1.23, GitHub release source archive |
| Rust SDK | Rust 2021 edition on stable, GitHub release `.crate` |
| MCP | Local stdio server, protocol `2025-11-25` with `2025-06-18` fallback |

GitHub release assets are the only supported v1 distribution channel. npm, crates.io, package-manager, and marketplace publication are not claimed.

## Provider tiers

| Provider | Capabilities | Tier | Authentication | Cost boundary |
| --- | --- | --- | --- | --- |
| Google Search Console | `search.performance`, `url.inspection` | `stable-live` | Short-lived OAuth bearer token | Existing API quota |
| Google Analytics 4 | `analytics` | `stable-live` | Short-lived OAuth bearer token | Standard-property Data API quota |
| PageSpeed Insights | `page.performance` | `stable-live` | Optional restricted API key | Keyless or existing quota |
| Chrome UX Report | `field.performance` | `stable-live` | Restricted API key | Existing no-charge API quota |
| Cloudflare | `edge.analytics` | `fixture-only` | Read-only API token plus zone ID | Promotion requires the existing plan to expose the exact dataset and fields |
| IndexNow | `index.submission` | `fixture-only` | Same-host key | Promotion requires one explicitly approved `--act --yes` submission |
| Bing Webmaster | search, backlinks, submission | `fixture-only` | API key or bearer token | Excluded from no-extra-cost live qualification |
| Ahrefs | backlinks, keyword evidence | `fixture-only` | Bearer token | Paid units are excluded |
| DataForSEO | SERP, keyword, rank evidence | `fixture-only` | Basic credentials | Metered calls are excluded |
| SerpApi | SERP evidence | `fixture-only` | API key | Metered calls are excluded |
| Plausible | `analytics` | `external-reference` | Bearer token | Signed example package, not a stable built-in |
| Semrush | five evidence capabilities | `disabled` | API key | Commercial, retention, caching, and redistribution review required |

Fixtures remain supported for every listed provider. Automatic live routing considers only `stable-live`. Direct live execution of any other tier requires `--allow-unverified-live`; paid cost classes still require `--allow-paid`, `--max-calls`, and `--max-provider-units`. Writes always remain separate and require `--act --yes`.

## Compatibility policy

Public `searchbridge.* /v1` envelopes, schemas, normalized row contracts, CLI exit semantics, SDK readers, and MCP confirmation boundaries are stable through 1.x. Additive optional fields and new opt-in capabilities may ship in a minor release. Removing or changing required fields, meanings, normalized units, mutation confirmation, redaction, or budget behavior requires 2.0.

Security updates are maintained on the current 1.x minor line. Provider removal requires a documented deprecation in one minor release when safety permits; emergency removal is allowed when continued operation risks credential exposure, unbounded cost, or policy violation. The signed Plausible 0.4-compatible reference adapter remains accepted during the 1.0 transition; other pre-1.0 adapter ranges are not implicitly accepted. The immutable 0.2.x goldens remain reader-compatibility fixtures, while `fixtures/golden/1.0` defines the v1 producer contract.
