# Security review

## Trust boundaries

Providers and external adapter packages are untrusted. Operator configuration is untrusted input. Credentials, provider properties, URLs and evidence are sensitive. SearchBridge core is the policy enforcement point; adapters cannot perform I/O directly.

| Threat | Current posture | Required expansion control |
| --- | --- | --- |
| SSRF | Built-ins fixed; external exact HTTPS endpoint allowlist | Validate expanded URL after templating; reject user-info, fragments, IP/private/local destinations under strict policy, DNS rebinding and redirects. Bind each self-hosted adapter to an exact invocation endpoint template; never accept a prefix wildcard. |
| Credential forwarding | External credential env allowlist and endpoint check | Bind each credential name/mode to the exact endpoint template; revalidate every redirect/download URL; never forward by default. |
| Malicious adapter | Detached RSA signature and declarative manifest | Sign canonical package manifest plus file/fixture hashes; no arbitrary native/shell code; key fingerprint trust store; minimum version and contract allowlist. |
| Signature confusion | RSA verify of manifest text | Canonical bytes, algorithm/version field, publisher key ID, digest list, duplicate-key rejection and fail-closed parsing. |
| Response-size attack | 8 MiB provider limit | Per-operation bound cannot exceed core ceiling; stream CSV/JSONL; bound nesting, fields, string length and decompressed bytes. |
| Pagination abuse | CLI max pages/rows | Add max calls, cursors, polls, elapsed time and repeated-cursor detection; task IDs are opaque bounded strings. |
| Retry amplification | max five, transient-only | Per-provider total-call budget includes retries/polls; honor capped retry headers; never retry semantic billing/quota errors. |
| Cost amplification | class/rows reported | Paid-call policy, provider-unit ceilings, free preflight, no silent fallback, batch-wide budget, actual units in receipt. |
| Key leakage | env-only, bounded redaction | Cover Basic, header, query, body and signed parameters; sanitize cache hashes, process errors, OTLP and request fingerprints. Never show credential-bearing URLs. |
| Telemetry leakage | allowlisted fields and privacy scan | Provider additions cannot add arbitrary OTLP attributes; use ID/category fields only; zone/project/property values excluded or hashed. |
| Cache leakage | operator-owned, optional encryption/HMAC | Provider retention cap, adapter/version in key, capability allowlist, file permissions guidance, no cross-profile cache reuse by default. |
| Replay integrity | HMAC + AES-GCM option | Bind ciphertext to provider, adapter, capability contract, request fingerprint and retention policy; fail on downgrade. |
| Command/config injection | typed flags and safe TOML | Schema-enumerate nested provider options; no command templates; string templates accept typed slots only. |
| GraphQL abuse | not present | Ship reviewed persisted operation templates or AST-safe variables; users cannot inject raw GraphQL through normal fetch. Complexity/fields bounded. |
| CSV/schema abuse | JSON only today | Bounded Kujo parser; formula-like cells are data; reject duplicate/oversized headers; deterministic coercion; no spreadsheet execution. |
| Output flooding | byte/token/row limits | Enforce across multi-provider total, individual provider, error arrays and metadata; JSONL streaming with atomic publish. |
| Mutation crossover | separate submit with `--act --yes` | Adapter registry marks read/write; external v2 remains read-only; no provider “project” or webhook mutation reachable through fetch. |
| Supply-chain drift | pinned CI actions/runtime | Pin adapter trust roots and package digests; release SBOM/provenance includes built-ins; external package install remains explicit. |

## Fail-closed requirements

- Unknown adapter contract/version, auth mode, format, pagination or coercion fails before credential access.
- Unsupported capability/query field fails before transport.
- Missing cost policy for `metered`, `expensive` or `unknown` fails before transport.
- Unknown provider download origin fails even if returned by an allowlisted API.
- A provider error body is never surfaced; map status and safe provider error code only.
- Partial success is explicit. A failed provider never disappears from `all` output.
- Signature verification happens before reading any credential environment value.

## External signing assessment

The current signature/allowlist design is directionally sufficient but not yet ecosystem-grade. It authenticates one manifest but does not bind additional files, canonicalization, publisher trust policy or a capable operation DSL. Manifest v2 must add package digests and a trust-store/key fingerprint model without weakening exact runtime allowlists. Code signing does not make arbitrary code safe; keep external execution declarative.

## Required adversarial corpus

Include credentials in header/query/body/Basic forms; credential-shaped target text; malicious redirects; private/loopback/IPv6/IDN hosts; repeated cursors; decompression bombs; deeply nested JSON; huge CSV cell/header counts; CSV formulas; GraphQL error echoes; task IDs containing control characters; tampered manifests/files/signatures; duplicate JSON keys; unexpected provider fields; cost overflow; cache retention overflow; and output rows containing secrets that must remain evidence but never telemetry/error text.
