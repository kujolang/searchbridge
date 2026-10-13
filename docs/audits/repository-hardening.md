# SearchBridge repository hardening — 2026-10-13

## Scope and provenance

- Repository: `kujolang/searchbridge`; branch: `main`.
- Starting SHA: `09c25845893008afae0f4baf333df6d47bd9c5c9` (clean tree).
- Ending implementation SHA: `4a0f64cd4ce3f158cf9ff79f299a50e67d65353f`. The subsequent documentation commit records this report; its own hash is available from `git log -1 -- docs/audits/repository-hardening.md`.
- Purpose: local Kujo CLI, SDK, and MCP gateway that fetches/normalizes provider evidence without interpreting SEO performance.
- Review covered all `src/` modules, launchers, SDK clients and generated-type pipeline, MCP catalog/server, tests/fixtures, schema contracts, verification/build/release scripts, workflows, configuration, security and operations documentation. Historical planning documents were sampled, not independently re-audited line by line.
- Integrations: Kujo native HTTP/DNS, crypto, JSON Schema subset, SQLite/JSONL and filesystem primitives; provider registry; signed external adapter packages; TypeScript/Node, Rust/serde and Go SDKs; GitHub release attestations. Read-only searches in sibling Dispatch/AI SDK source found no direct SearchBridge callsites. Published SDKs and documented agent consumers remain compatibility boundaries.
- CI-pinned runtime source: `67e880a9688dd5770d4a67311d45aa551e6a6fd6`. Initial local runtime: Kujo 1.8.1; installed PATH runtime was 1.5.0 and was not selected. Runtime source inspected read-only; no sibling repository changed.
- Security review: standard scan `d4361dbb-2d9e-41cf-aecd-f67f0122f339`, with source-backed threat-boundary review and independent validation. It retained historical cache-migration and legacy-adapter findings, both fixed below. Its coverage is explicitly partial rather than a proof of absence of vulnerabilities.

## Baseline and measurements

`bash scripts/validate.sh` failed before changes, after canonical row checks, because Kujo rejects the `maxProperties` keyword in the metric schema. The sibling debug runtime reproduced that baseline failure. The archived starting tree subsequently passed its functional checks on the CI-pinned 1.2.3 runtime, stopping only at the final Git diff check because the archive had no Git metadata; the unsupported-keyword failure is specific to the tested newer local runtime. The public schema limit was preserved and explicitly enforced in the Kujo test adapter; validation was not weakened.

Eight new cache regression assertions failed against the original implementation: body/query keyword collisions, escaped/empty credential identity, writable path traversal, required-encryption bypass, future timestamp replay, and forged migration identity/counting. Existing MCP smoke tests and SDK checks were run separately because the baseline suite stopped before reaching them.

| Measurement | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Validate the same 94 JSON documents | 94 Kujo process starts; 4.84 s real / 2.17 s user / 1.67 s sys | 1 start; 0.11 s real / 0.04 s user / 0.04 s sys | Local single paired measurement; identical documents, parser, and failure behavior. Full gate also batches TOML/workflow parsing. |
| Native contract test success receipt | 301 lines / 15,300 bytes | 1 line / 21 bytes | Same 300 assertions. Failures always print; `--verbose` restores assertion-by-assertion detail. |
| Default agent catalog | 2,925 bytes | 2,925 bytes | No discovery/context growth. Existing 4 KiB gate retained. |
| MCP tool catalog on disk | 1,504 bytes | 1,829 bytes | Necessary live-input and call-budget contract added; still below 4 KiB. |
| 1,000 normalization iterations, serialized output | 568,000 characters | 568,000 characters | Stable output volume; normalization implementation unchanged. |
| TypeScript retained child stderr | Entire stream before truncation | 65,536 bytes while draining | Deterministic resource bound, tested with 2 MiB stderr in buffered and streaming modes. |
| Cache/task record reads | No application byte preflight | 16 MiB / 64 KiB | Metadata checks precede parsing; cached response structure/bytes also checked. |
| Runtime dependency surface | Kujo; Node for MCP; serde/serde_json for Rust SDK; Go standard library | Unchanged | Release verification reuses Node and additionally requires a GitHub CLI with attestation support; no new package dependency. |

The initial normalization benchmark took 4,462.21 ms; an intermediate repeat took 6,615.54 ms. CSV 1,000-row parsing measured 21.30 ms initially and 42.55 ms during the runtime build. Concurrent compilation affected even unchanged normalization/discovery code. These are observations, **not** claimed provider/runtime speed improvements or stable regression thresholds. Existing 60-second qualification ceilings for 1,000 normalizations and 100,000 CSV rows remain enforced. Token limits are byte-based estimates (`bytes / 4`), not tokenizer measurements. No memory/RSS or live-provider latency claim is made.

## Changes and proof

| Problem and root cause | Implementation / affected files | Regression evidence | Compatibility and impact |
| --- | --- | --- | --- |
| `keyword`/`keywords` matched substring `key`; regex over serialized bodies mishandled escaped and empty credentials | `src/cache.kujo`: parse query fields, recursively redact credential fields, namespace request identity v2 | `tests/hardening_tests.kujo` differentiates semantic keywords and preserves credential independence for nested/escaped/empty values; existing 1,000-case property gate | Old request hashes deliberately miss; recollect evidence. No fallback to collision-prone keys. Cache v1/v2 record formats unchanged. |
| Cache maintenance trusted record-supplied paths and double-counted rewritten files | Validate lowercase SHA-256 identities and exact filename binding before writes; reuse initial file inventory; `src/cache.kujo` | Forged `../escape` migration, direct invalid hash, corrupt count, and input-file count | Invalid records are corrupt/quarantinable; valid migration and rotation retain schemas and data. One directory scan instead of two. |
| Encryption requirement could write plaintext through the library; cache replay skipped live response bounds and accepted future timestamps | Enforce encryption at writer, reject symlink/non-file reads, preflight record bytes, validate body bounds and future age; cap task-state reads | Hardening tests plus original encryption, tampering, permission, retention, migration, rotation and task identity tests | Fails closed for unsafe/oversized records. Existing good records remain readable by their explicit identity. |
| Offline replay rejected at CLI; cache options could suppress real submissions using an old receipt | `src/cli.kujo` accepts offline replay and local catalog/maintenance; `src/transport.kujo` rejects replay without directory and submission replay, bypasses submission caching | Offline parser tests, no-cache replay denial, submission receipt denial, encrypted replay example | Restores documented offline mode; every authorized live submission makes a provider call. Per-invocation `--act --yes` preserved. |
| Legacy signed adapters skipped the paid-call preflight used by v2 | `src/adapters.kujo` applies existing `cost_preflight` before credentials/transport | `tests/legacy_budget_tests.kujo`: eight signed-manifest cases covering consent, calls, units, free live calls and fixtures | Legitimate budgeted calls/fixtures preserved; unsafe legacy calls now rejected. |
| Early streaming validation allocated temporary files; publication deleted the old destination before rename; JSONL assumed every row envelope named a provider | `src/commands.kujo`, `src/cli.kujo`, `src/protocols.kujo`: defer stream creation, collision-resistant exclusive temporary creation, replace without pre-delete, atomic JSON write, optional JSONL source metadata | Output budget preserves prior file; invalid live options leave no temporary artifact; evidence-query JSONL works; existing live-page and synthetic-stream tests | Existing provider JSONL fields retained. Query JSONL now works without invented provider/capability values. Operator-controlled output directory remains required. |
| Quoted CSV headers confused delimiter/column counts; unquoted Unicode cells bypassed byte limits | `src/protocols.kujo`: count header separators outside quotes; validate UTF-8 cells; retain fast ASCII checks; compute character count once | Quoted comma/semicolon header and multibyte budget tests; existing CSV/property/100,000-row qualification | Valid quoted CSV accepted; over-budget cells rejected. No formula execution added. |
| Huge numeric `Retry-After` could overflow conversion before the cap | `src/transport.kujo`: saturate long numeric headers before converting | Real loopback `/throttle-huge` fixture in `tests/http_fault_server.rs` and `scripts/network_fault_gate.kujo`: 429 then success with zero capped delay | Ordinary backoff/retry caps unchanged; no sleeps/timeouts increased. |
| MCP could not supply live budgets or required stable-provider inputs; framing capped buffered chunks instead of individual messages; stderr accounting repeatedly traversed retained chunks | `integrations/searchbridge-mcp.mjs`, tool catalog: explicit live budgets/inputs, unknown-argument checks, per-line byte accounting, backpressure, bounded stderr counter, precise relative-path boundary | Existing MCP gate plus `scripts/mcp_hardening_gate.mjs`: budget/argument forwarding, malformed/incomplete/oversized/coalesced messages, valid contained `..evidence` path | Fixture calls unchanged. Live calls require `max_calls`; fetch/query use documented 25,000 estimated-token ceiling. No credentials/endpoints/paid overrides exposed. |
| TypeScript errors buffered unlimited stderr before slicing | `sdk/typescript/client.ts`: shared bounded diagnostic collector; build includes `client.test.ts` | Three Node tests: 2 MiB failure streams in both modes, exit 7, successful JSON/JSONL | API signatures and successful results unchanged. Error text consistently bounded. |
| Native metric validation could not run; metric regex was ambiguous across JSON/regex decoding | Public pattern uses `[.]`; `tests/metric_contract.kujo` separately enforces the canonical `maxProperties` value before native subset validation | Valid provider-qualified metric, 16/17-property boundary, wrong type, missing separator | Schema ID unchanged; public 16-property restriction retained. Generated SDK types unchanged. |
| Release verifier equated attestation presence with verification and extracted archives before signature verification | `scripts/verify_release.kujo`, bounded no-extraction `verify_release_archives.mjs`, independent workflow: exact checksum entries, signed tag then `gh attestation verify` for both archives and release workflow identity, signed-tree comparison | `scripts/release_archive_gate.mjs`: genuine Git archives and 11 malformed/path/link/content/mode/ZIP metadata cases; full repository archive comparison | Correct release archives accepted. Node and modern `gh` required for independent release verifier; normal CLI unaffected. Live signature-service invocation not claimed from old local `gh`. |
| Successful assertions flooded logs | `tests/searchbridge_tests.kujo`, README: count-only success receipt by default, opt-in `--verbose`, failures unchanged | Full 300-assertion gate and measured receipt bytes | Test-script-only flag; CLI and SDK output unchanged. |
| Validation spawned one runtime per document; environment overrides re-read all variables for each present key | `scripts/validate_document.kujo`, `scripts/validate.sh`: multi-document parse preserving single-file support; `src/cli.kujo`: read overrides once | Full gate; identical 94-file benchmark; malformed/missing document checks | Same precedence/errors and parser; reduced process/environment work, no caching/invalidation state. |

## Contracts and trust boundaries

Public Kujo/SDK function signatures, command names, output schema identifiers, configuration keys and provider environment variables are unchanged. Intentional behavior corrections are listed above. The MCP input schema adds live query fields and `max_calls`; unknown fields now fail closed. Metric ID regex semantics are corrected without changing schema version. The optional release-helper environment path is new and release-tool-only. Cache request identity changes require recollection; external consumers that copy cache filenames must account for this. JSON, JSONL, cache and task record formats otherwise remain compatible; 1.x and legacy 0.2.x reader gates remain mandatory.

Reviewed: CLI/config/environment trust, provider credential injection and exact endpoints, redirects/private-network/DNS pinning, bounded responses/retries/pagination/polling, read/write separation, adapter signatures/digests/revocation/allowlists, encrypted replay integrity and lineage, cache/task identity, parameterized SQLite joins and cleanup, stdout/stderr/telemetry privacy, subprocess argv without shell, batching/cancellation/order, schemas/SDK serialization, CI action pins, and release signing/checksums/archive handling. Provider payloads remain data; no model prompt or executable plugin source is evaluated. No new credential was requested or live paid/submission call made.

No broad rewrite, new caching layer, dependency replacement, silent truncation or removed assertion was needed. Large generated types, golden fixtures and historical compatibility files were retained because their generation/reader/release consumers are explicit. The agent catalog already provides concise progressive discovery; expanding it with endpoint inventories would be counterproductive.

## Verification ledger

Commands below ran from the repository root unless a directory is shown. Verbose local logs are in `/tmp/searchbridge-audit/`; this report preserves their durable conclusions.

| Exact command | Result |
| --- | --- |
| `/usr/bin/time -p bash scripts/validate.sh` before edits | Failed: unsupported `maxProperties`; 12.47 s. |
| `KUJO_BIN="$PWD/../kujo/target/debug/kujo" /usr/bin/time -p bash scripts/validate.sh` before edits | Same failure; 14.44 s. |
| `../kujo/target/release/kujo run tests/hardening_tests.kujo` against original cache implementation | Eight assertions failed as recorded above. |
| `node scripts/mcp_gate.mjs` and `bash scripts/sdk_runtime_gate.sh` baseline | Passed separately. |
| `../kujo/target/release/kujo run scripts/benchmark.kujo -- --iterations 1000` before/after | Passed; constant serialized volume, timings described above. |
| `../kujo/target/release/kujo run scripts/expansion_benchmark.kujo -- --rows 1000` before/after | Passed; 2,925-byte catalog and 1,000 retained stream rows. |
| `../kujo/target/release/kujo run tests/hardening_tests.kujo` | Passed. |
| `../kujo/target/release/kujo run tests/legacy_budget_tests.kujo` | Eight cases passed in default VM. |
| `bash scripts/run_network_fault_gate.sh` | Passed real local HTTP success, redirects, malformed JSON, normal/oversized Retry-After, timeout, dropped connection and untrusted TLS cases. |
| `node scripts/mcp_hardening_gate.mjs` | Passed. |
| `node scripts/release_archive_gate.mjs` | Passed valid archives and 11 malformed cases. |
| `npm run build --prefix sdk/typescript && node --test sdk/typescript/dist/client.test.js` | Three tests passed after including the test in tsconfig. |
| `npm audit --prefix sdk/typescript --audit-level=high` | Passed; zero reported vulnerabilities. |
| `(cd sdk/rust && cargo audit --file Cargo.lock)` | Passed; 12 locked crate dependencies scanned. |
| `(cd sdk/go && govulncheck ./...)` | Passed; zero reachable vulnerabilities. Uncalled package/module advisories were reported; no reachable finding claimed. |
| `../kujo/target/release/kujo run tests/searchbridge_tests.kujo -- --verbose` | Passed all 300 assertions; full detail restored on request. |
| `node /tmp/searchbridge-audit/compare-fixtures.mjs` | 23 deterministic discovery/provider/submission envelopes matched the starting commit exactly. |
| `git diff --check` | Passed. |
| `/usr/bin/time -p bash scripts/validate.sh` final | Passed in 56.97 s; 300 existing assertions, zero failures. Includes 300 existing assertions, new regressions, structured documents, golden readers, provider snapshots/readiness, versions, HTTP/TLS faults, cache permissions, generated SDK/runtime gates, benchmarks, reliability, 1,000 security properties, governance, MCP, archive and example/CLI smokes. |
| `cargo build --release --locked --manifest-path /tmp/searchbridge-audit/kujo-pinned/Cargo.toml` | Passed; built Kujo 1.2.3 from the exact CI pin in 33 min 41 s; no sibling edits. |

| `KUJO_BIN=/tmp/searchbridge-audit/kujo-pinned/target/release/kujo /usr/bin/time -p bash scripts/validate.sh` final | Passed in 58.29 s, including all existing and added gates. |
| `bash scripts/package_sdks.sh` | Passed TypeScript, Rust and Go package verification, checksums and provenance. |

| `KUJO_BIN=/tmp/searchbridge-audit/kujo-pinned/target/release/kujo KUJO_COMMIT=67e880a9688dd5770d4a67311d45aa551e6a6fd6 bash scripts/release_candidate_gate.sh` | Passed against the ending implementation SHA: SDK packages, SBOM/provenance, reproducible macOS x64 runtime archive, checksum, clean-install version and fixture smoke. |

The first complete intermediate validation passed in 332.90 s during compilation. One subsequent run exposed a test-only VM callback issue; the retry test was moved to the existing real HTTP fault harness instead of weakening assertions or forcing a different execution engine. No claim of end-to-end speedup uses these contended full-suite timings.

## Remaining work and limitations

- **P0/P1/P2:** no known newly introduced regression or unresolved confirmed in-scope vulnerability after the listed fixes.
- **P3:** upstream Kujo support for `maxProperties` would remove the small metric test adapter; current local verification enforces the full constraint and requires no upstream change.
- **Needs more evidence:** current live-provider behavior, Windows/Linux execution, and live GitHub attestation service verification were not exercised locally. Existing credential/platform/release workflows are the appropriate gates. Existing provider promotions remain governed by the v1.1 checklist; this audit does not change their tiers or approvals.
- **Not worth changing:** replacing provider registries, generated SDK shapes, fixture/golden compatibility assets, or the existing concise discovery format for stylistic uniformity.
- **Cross-repository requirements:** none. Kujo's unsupported schema keyword is handled locally; no ecosystem API rewrite or sibling modification is required.

Same-user hostile filesystem races, operator credential distribution/rotation, provider billing semantics, and trusted executable replacement remain outside the local CLI's sandbox guarantees. The audit does not claim hosted isolation or proof against every possible race.
